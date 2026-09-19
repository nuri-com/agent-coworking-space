#!/bin/bash
# Send personal outreach emails via himalaya (gmail)
set -euo pipefail
cd "$(dirname "$0")"
python3 - <<'PYEOF'
import csv, subprocess, sys, time, os
rows=list(csv.DictReader(open('personal-outreach.csv')))
tpl=open('template-personal.md').read()
sent_log='sent-personal.log'
done=set()
if os.path.exists(sent_log):
    done=set(l.strip() for l in open(sent_log))
ok=fail=0
for i,r in enumerate(rows,1):
    if r['Email'] in done:
        print(f"skip {i}/{len(rows)} {r['Company']} (already sent)"); continue
    body=tpl.replace('{first}',r['FirstName']).replace('{company}',r['Company']).replace('{why}',r['Why']).replace('{email}',r['Email']).replace('{subject}',r['Subject'])
    msg=f"From: Emin Mahrt <eminhenri@gmail.com>\nTo: {r['Email']}\nSubject: {r['Subject']}\n\n{body}"
    try:
        p=subprocess.run(['himalaya','template','send'],input=msg.encode(),capture_output=True,timeout=120)
        if p.returncode==0:
            with open(sent_log,'a') as f: f.write(r['Email']+'\n')
            ok+=1; print(f"OK   {i}/{len(rows)} {r['Company']} <{r['Email']}>")
        else:
            fail+=1; print(f"FAIL {i}/{len(rows)} {r['Company']}: {p.stderr.decode()[:200]}")
    except Exception as e:
        fail+=1; print(f"ERR  {i}/{len(rows)} {r['Company']}: {e}")
    time.sleep(2.5)
print(f"\nDONE: sent={ok} fail={fail} total={len(rows)}")
PYEOF
