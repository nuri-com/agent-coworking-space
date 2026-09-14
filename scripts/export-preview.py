"""Export the local site as a single offline review file, without publishing it."""
from pathlib import Path
import base64
import re

root = Path(__file__).resolve().parents[1]
html = (root / 'index.html').read_text()
css = (root / 'styles.css').read_text()
js = (root / 'booking.mjs').read_text().replace('export ', '') + '\n' + re.sub(r'^import[^\n]+\n', '', (root / 'app.mjs').read_text(), count=1)
html = html.replace('<link rel="stylesheet" href="styles.css">', '<style>' + css + '</style>')
html = html.replace('<script type="module" src="app.mjs"></script>', '<script type="module">' + js + '</script>')

def embed(match):
    path = root / match.group(0)
    mime = 'font/ttf' if path.suffix == '.ttf' else 'image/webp'
    return 'data:' + mime + ';base64,' + base64.b64encode(path.read_bytes()).decode()

html = re.sub(r'assets/[\w-]+\.(?:webp|ttf)', embed, html)
assert 'src="app.mjs"' not in html and 'href="styles.css"' not in html
assert not re.search(r'assets/[\w-]+\.(?:webp|ttf)', html)
out = root / 'artifacts' / 'agent-coworking-accelerator-preview.html'
out.parent.mkdir(exist_ok=True)
out.write_text(html)
print(out)
