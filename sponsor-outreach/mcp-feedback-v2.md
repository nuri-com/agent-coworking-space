# Feedback: banking.nuri.com/v2/mcp — Agent-Erfahrung

Stand: 2026-09-11 · Getestet mit: treg-Topup ($10) über Wirex-Karte, Session + Kartendetails + Zahlung

## Kontext

Ziel: Mit dem v2-MCP eine Kartenzahlung (Stripe-Checkout, $10) end-to-end abwickeln.
Getestet: Connect (Passkey) → Account-Status → Karten → Kartendetails → 3DS-Check → Aktivität.

---

## Alle Calls, die ich machen musste (chronologisch)

| # | Call | Ergebnis | Sign nötig? |
|---|------|----------|-------------|
| 1 | `initialize` (Probe) | serverInfo „wallet-connection" 0.65.0, protokoll 2025-11-25 | – |
| 2 | `tools/list` | 7 Tools: connect_wallet, create_account, get_account_status, provision_virtual_card_and_bank_account, cards, bank, payouts | – |
| 3 | `connect_wallet {}` | approval_required + request_id + session + short approval_url | – |
| 4 | Shortlink auflösen: `POST /v2/s {"token": …}` | → bridge-URL (direkt) | – |
| 5 | `connect_wallet {signer:"passkey_prf"}` | ❌ connection_signer_invalid | – |
| 6 | `connect_wallet {signer:"webauthn"}` | ❌ connection_signer_invalid | – |
| 7 | `connect_wallet {signer:"passkey"}` | ✅ approval_required | – |
| 8 | `connect_wallet {request_id}` (Poll) | ✅ connected · account_exists: true · smart_account_address 0x9A4b…327A · expires_at + hint | – |
| 9 | `get_account_status {session, wait_seconds:10}` | ✅ status ready · KYC Approved · capabilities[] (EUR IBAN Active, GBP NotAvailable „Country is not supported") | – |
| 10 | `cards {action:"list"}` | ✅ 4 Karten inkl. Limits/Usage | – |
| 11 | `bank {action:"balances"}` | ✅ Kontostände + token_balances (WEUR/WUSD aktiv) | – |
| 12 | `cards {action:"get", card_id}` | 🔐 approval_required → 2. Passkey-Sign | Sign #2 |
| 13 | `cards {action:"get", card_id}` (Poll) | ✅ card_number, cvv, name_on_card, profile, residence_address | – |
| 14 | `cards {action:"3ds_pending", card_id}` | ✅ {"challenges": []} | – |
| 15 | `bank {action:"activity", filter:"card"}` | ✅ Transaktionsliste inkl. Status + Steps | – |

Ergebnis der Zahlung: Karte abgelehnt (**insufficient funds**, Wallet hatte ~€12 bei $10-Charge) — kein MCP-Fehler, aber der 3DS-Pfad wurde dadurch nie live durchlaufen.

---

## ✅ Was v2 besser macht als v1

1. **7 Tools statt ~50.** Kein Tool-Wildwuchs mehr; cards/bank/payouts bündeln Aktionen sauber (ein `action`-Enum statt Dutzende Einzeltools).
2. **Ein Connect = eine Session.** Nach dem einen Passkey-Sign funktionieren ALLE Reads (Status, Karten, Balances, Aktivität) ohne weitere Signaturen.
3. **`cards 3ds_approve` / `3ds_decline`** — der Agent kann Kauf-Bestätigungen beantworten. Das war die größte v1-Lücke (nur lesen, nicht zustimmen) und ist jetzt gelöst.
4. **`bank pay` mit x402/mpp** — Agent kann URLs bezahlen; klarer, zukunftsfähiger Pfad.
5. **Klare Sprache + Labels.** „Your account's own wallet. Your money and your card are kept here…" — hilft dem Agenten, nichts zu verwechseln.
6. **Gute Fehlermeldungen.** connection_signer_invalid, session_not_found, „send only the fields this step needs" — alle präzise und handlungsleitend.
7. **expires_at + expires_hint** direkt im Connect-Result — Session-Lebensdauer ist planbar.
8. **Security-Design:** Secrets (PAN/CVV) nur nach separatem Sign; alles andere ohne. Richtig so.

---

## ⚠️ Was verwirrend war (mit konkretem Fix)

1. **`signer`-Wert inkonsistent v1↔v2.**
   v1: `signer_adapter: "passkey_prf"` — v2 akzeptiert `"passkey"`, `"passkey_prf"` wird mit `connection_signer_invalid` abgelehnt.
   **Fix:** `passkey_prf` als Alias akzeptieren ODER im Fehler die gültigen Werte listen („Try: passkey"). Ich habe 3 Versuche gebraucht.

2. **Shortlink `/v2/s#token` ist fragil.**
   Bei mir „link geht nicht" beim Nutzer; ich musste den Shortlink manuell per `POST /v2/s {"token"}` zur bridge-URL auflösen. Vermutung: Fragment wird unterwegs abgeschnitten (Chat-Preview, Weiterleitung) — ohne Fragment ist der Link tot („This link is incomplete"-Muster).
   **Fix:** Im Connect-Result BEIDE URLs zurückgeben (short + direct bridge) und/oder im Fehlerfall der /s-Seite eine Fallback-Anzeige bieten („Link unvollständig — kopiere die komplette URL inkl. #teil").

3. **Zweiter Sign für Kartendetails.**
   `cards get` → approval_required → erneuter Passkey-Sign. Für eine Bezahlung also 2 Unterbrechungen.
   **Fix-Optionen:** (a) im Connect-Dialog vorab „Kartendetails anzeigen" mit-zustimmen, (b) ein zeitlich begrenzter Details-Grant pro Session, (c) explizit im Connect-Text ankündigen, dass Details einen zweiten Sign brauchen. (b) wäre am angenehmsten, (c) am einfachsten.

4. **Session-Secret nur einmal sichtbar — ohne Recovery.**
   Wenn der Agent das `session`-Feld (format `<id>.<secret>`) nicht speichert, ist die Verbindung verloren; ein erneutes `connect_wallet {request_id}` liefert nur Status, nicht das Secret. Ich musste den Nutzer NOCHMAL signieren lassen.
   **Fix:** Entweder beim Poll das Secret erneut ausgeben (wenn noch nicht abgelaufen), oder im Text deutlicher: „speichere das Secret jetzt — es wird nicht erneut angezeigt".

5. **3DS-Pfad nicht testbar ohne echten Kauf.** `3ds_pending` gibt `challenges: []` — korrekt, aber mir fehlte ein Weg zu verifizieren, dass `3ds_approve` mit einem echten Challenge-Objekt funktioniert (Sandbox?). Für Agenten wäre ein `sandbox`-Hinweis oder ein Test-Merchant im Doku-Text hilfreich.

6. **„country is not supported" ohne Liste.** GBP-Rail: „Country is not supported" — welches Land? Für den Nutzer (DE) ok, aber nicht selbsterklärend.

7. **Kleinigkeit:** `3ds_pending` ohne `card_id` → Fehler. Der Schema-Text sagt card_id „leave out when listing" — korrekt, aber ein „required for this action"-Hinweis direkt am Feld würde den Fehlversuch sparen.

---

## 🎯 Prioritäten (was ich als Nächstes fixen würde)

1. **Passkey-Kompat:** `passkey_prf`-Alias + gültige Werte in der Fehlermeldung.
2. **Ein Sign pro Bezahlvorgang** (oder Details-Grant pro Session) — 2 Unterbrechungen pro Payment sind zu viel.
3. **Shortlink robust** oder immer beide URLs (short + bridge) ausliefern.
4. **Session-Recovery** beim Poll oder deutlichere Warnung.
5. **3DS-Sandbox** für echte End-to-End-Tests des Approval-Flows.

## Fazit

v2 ist ein deutlicher Qualitätssprung für Agenten: konsolidierte Tools, sauberes Session-Modell, und mit `3ds_approve` + `bank pay` endlich Aktionen statt nur Reads. Die größten Reibungspunkte sind Passkey-Nomenklatur (3 Rateversuche), der fragile Shortlink und der zweite Sign für Details — alle drei gut lösbar.
