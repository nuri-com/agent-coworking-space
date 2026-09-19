#!/bin/bash
# Send sponsor outreach emails via himalaya (gmail)
set -euo pipefail
cd "$(dirname "$0")"
LIMIT=${1:-66}
START=${2:-0}
python3 - "$LIMIT" "$START" <<'PYEOF'
import csv, subprocess, sys, time, os
limit=int(sys.argv[1]); start=int(sys.argv[2])
rows=list(csv.DictReader(open('outreach.csv')))
batch=rows[start:start+limit]
tpl=open('template.md').read()
sent_log='sent.log'
done=set()
if os.path.exists(sent_log):
    done=set(l.strip() for l in open(sent_log))
ok=fail=0
for i,r in enumerate(batch,1):
    if r['Email'] in done:
        print(f"skip {i}/{len(batch)} {r['Company']} (already sent)"); continue
    body=tpl.replace('{company}',r['Company']).replace('{email}',r['Email']).replace('{subject}',r['Subject']).replace('{why}',r['Why'])
    msg=f"From: Emin Mahrt <eminhenri@gmail.com>\nTo: {r['Email']}\nSubject: {r['Subject']}\n\n{body}"
    try:
        p=subprocess.run(['himalaya','template','send'],input=msg.encode(),capture_output=True,timeout=120)
        if p.returncode==0:
            with open(sent_log,'a') as f: f.write(r['Email']+'\n')
            ok+=1; print(f"OK   {i}/{len(batch)} {r['Company']} <{r['Email']}>")
        else:
            fail+=1; print(f"FAIL {i}/{len(batch)} {r['Company']}: {p.stderr.decode()[:200]}")
    except Exception as e:
        fail+=1; print(f"ERR  {i}/{len(batch)} {r['Company']}: {e}")
    time.sleep(2.5)
print(f"\nDONE: sent={ok} fail={fail} batch={start}-{start+len(batch)}")
PYEOF
