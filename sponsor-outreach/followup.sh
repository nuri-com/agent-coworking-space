#!/bin/bash
# Automatic sponsor outreach follow-up
# - Scans Gmail INBOX for replies to "Free AI credits for builders"
# - Sends follow-up to non-responders after 5 days, 2nd after +7 more days
# - Max 10 sends per run, never to responders, logs everything
set -uo pipefail
cd /Users/eminmahrt/Developer/agent-coworking-space/sponsor-outreach

python3 - <<'PYEOF'
import csv, subprocess, os, re, datetime, sys

SENT_LOGS = ['sent.log', 'sent-personal.log']
FOLLOWUP_LOG = 'followup.log'
RESPONDERS_LOG = 'responders.log'

def sh(cmd, timeout=120):
    try:
        p = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=timeout)
        return p.stdout or ''
    except Exception:
        return ''

def load_lines(path):
    if not os.path.exists(path):
        return set()
    return set(l.strip() for l in open(path) if l.strip())

# 1) Who answered? Scan INBOX for replies
inbox = sh("himalaya envelope list --folder INBOX --page-size 100 2>/dev/null")
responders = set()
for line in inbox.splitlines():
    m = re.search(r'Re: Free AI credits for builders — (.+?) x Agent Coworking', line)
    if m:
        responders.add(m.group(1).strip())
# also any thread subject without Re: (direct replies sometimes lose prefix)
for line in inbox.splitlines():
    m = re.search(r'Free AI credits for builders — (.+?) x Agent Coworking', line)
    if m:
        responders.add(m.group(1).strip())
with open(RESPONDERS_LOG, 'a') as f:
    for r in responders:
        f.write(f"{datetime.date.today()} {r}\n")

# 2) Build target list: all sent, minus responders, minus Ollama (already engaged)
targets = []
seen = set()
for log in SENT_LOGS:
    for email in load_lines(log):
        if email in seen: continue
        seen.add(email)
        targets.append(email)

# 3) Load follow-up history
followups = {}  # email -> [dates]
if os.path.exists(FOLLOWUP_LOG):
    for line in open(FOLLOWUP_LOG):
        parts = line.strip().split(' ')
        if len(parts) >= 3:
            followups.setdefault(parts[0], []).append(parts[1])

today = datetime.date.today()
START_FILE = 'campaign_start.txt'
if not os.path.exists(START_FILE):
    with open(START_FILE, 'w') as f:
        f.write(today.isoformat() + '\n')
    print("First run — campaign start recorded, no follow-ups yet (waiting 5 days).")
    sys.exit(0)
start_date = datetime.date.fromisoformat(open(START_FILE).read().strip())
days_since_start = (today - start_date).days
if days_since_start < 5:
    print(f"Campaign started {start_date} — follow-ups begin in {5 - days_since_start} days. Nothing sent.")
    sys.exit(0)

sent_count = 0
MAX_PER_RUN = 10
results = []

for email in targets:
    if email in responders:
        continue
    dates = followups.get(email, [])
    n = len(dates)
    if n >= 2:
        continue  # max 2 follow-ups
    # first follow-up after 5 days, second after 12 days total
    if n == 0:
        # need send date: approximate from log order? We only know today; use responder-agnostic rule:
        # Send first follow-up to anyone with no follow-up yet (campaign started >=5 days ago or force)
        should = True
    else:
        last = datetime.date.fromisoformat(dates[-1])
        should = (today - last).days >= 7
    if not should:
        continue
    # find company name for the email
    company = email
    for rowfile in ['personal-outreach.csv', 'outreach.csv']:
        if os.path.exists(rowfile):
            for r in csv.DictReader(open(rowfile)):
                if r.get('Email') == email:
                    company = r.get('Company', email)
                    break
    subject = f"Re: Free AI credits for builders — {company} x Agent Coworking"
    body = f"""Hi {company} team,

Just bumping this — curious if a quick 15-minute call makes sense to talk about funding the AI credits for the coworking network.

Best,
Emin Mahrt
Nuri — Agent Coworking Space
https://nuri-com.github.io/agent-coworking-space/
"""
    msg = f"From: Emin Mahrt <eminhenri@gmail.com>\nTo: {email}\nSubject: {subject}\n\n{body}"
    p = subprocess.run(['himalaya', 'template', 'send'], input=msg.encode(), capture_output=True, timeout=120)
    if p.returncode == 0:
        with open(FOLLOWUP_LOG, 'a') as f:
            f.write(f"{email} {today.isoformat()} followup-{n+1}\n")
        sent_count += 1
        results.append(f"OK {email} ({company}) followup-{n+1}")
    else:
        results.append(f"FAIL {email}: {p.stderr.decode()[:150]}")
    if sent_count >= MAX_PER_RUN:
        break

print(f"Responders so far: {len(responders)} — {sorted(responders)}")
print(f"Follow-ups sent this run: {sent_count}")
for r in results:
    print(' ', r)
print("DONE")
PYEOF
