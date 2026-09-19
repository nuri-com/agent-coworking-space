# WICHTIG: banking.nuri.com MCP — v2 statt v1

## Stand 2026-09-11
- **NUR v2 verwenden:** `https://banking.nuri.com/v2/mcp`
- **v1 (ohne /v2) ist veraltet** — wurde fälschlich genutzt (Config zeigte v1)
- Beide URLs antworten 200, aber v2 ist die aktuelle Version

## Was zu tun ist (einmalig, Nutzer)
`~/.hermes/config.yaml` → `nuri-banking.url`:
```yaml
nuri-banking:
  enabled: true
  url: https://banking.nuri.com/v2/mcp   # statt /mcp
```
Agent darf die Config nicht selbst editieren (Sicherheits-Sperre). Backup liegt unter `~/.hermes/config.yaml.bak`.

## Zahlungs-Flow (v2)
1. `wirex_session_start` → 1. Passkey-Sign (approval_url an Nutzer)
2. `wirex_session_result` → Session-Token (1h gültig)
3. `wirex_status` → Karten + IBAN + Wallet-Adresse (für Karten-Calls DIESE nutzen!)
4. `wirex_card_details_start` → 2. Passkey-Sign (zweiter Browser-Umweg)
5. `wirex_card_details_result` → PAN/CVV

## Fallstricke
- `wirex_wallet` liefert eine ANDERE Adresse als `wirex_status` — für Karten die aus `status`
- Kein `pay`-Tool: Zahlungen (z.B. Stripe-Topup) manuell im Browser mit Kartendaten
- Session-Token hat kein `expires_in`-Feld — selbst tracken
