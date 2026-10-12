"""Build a weekly offline page from Sheet1. Usage: python build-week.py INPUT.xlsx YYYY-MM-DD OUTPUT.html"""
import sys,json,zipfile,hashlib,datetime,xml.etree.ElementTree as E
from pathlib import Path
root=Path(__file__).resolve().parent
source,start,out=sys.argv[1:];date=datetime.date.fromisoformat(start)
if date.weekday()!=6: raise SystemExit('Week start must be Sunday.')
n={'m':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'};relkey='{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id'
# Resolve the first worksheet through workbook relationships; preserve embedded hyperlinks.
with zipfile.ZipFile(source) as z:
 shared=[''.join(x.itertext()) for x in E.fromstring(z.read('xl/sharedStrings.xml'))] if 'xl/sharedStrings.xml' in z.namelist() else []
 wb=E.fromstring(z.read('xl/workbook.xml'));rs={x.get('Id'):x.get('Target') for x in E.fromstring(z.read('xl/_rels/workbook.xml.rels'))};first=wb.find('m:sheets',n)[0];target=rs[first.get(relkey)];sheetpath=target.lstrip('/') if target.startswith('/') else 'xl/'+target;sheet=E.fromstring(z.read(sheetpath));rp=str(Path(sheetpath).parent/'_rels'/(Path(sheetpath).name+'.rels'));rels={x.get('Id'):x.get('Target') for x in E.fromstring(z.read(rp))} if rp in z.namelist() else {};hyper=sheet.find('m:hyperlinks',n);links={x.get('ref'):rels.get(x.get(relkey),'') for x in hyper} if hyper is not None else {};tasks=[];subject='Other';ids=set()
 known=json.loads((root/'weekly-tasks-2026-10-11.json').read_text());artmap={t['link'].split('?')[0]:t['art'] for t in known}
 for row in sheet.findall('.//m:row',n):
  vals={}
  for c in row.findall('m:c',n):
   v=c.find('m:v',n);val=v.text if v is not None else ''
   if c.get('t')=='s':val=shared[int(val)]
   elif c.get('t')=='inlineStr':val=''.join(c.find('m:is',n).itertext())
   vals[''.join(ch for ch in c.get('r') if ch.isalpha())]=val
  if not vals.get('B'):subject=vals.get('A') or subject;continue
  url=links.get('C'+row.get('r'),'')
  if not url.startswith(('https://','http://')):raise SystemExit('Missing assignment link in C'+row.get('r'))
  canonical=url.split('?')[0];id='a-'+hashlib.sha256(canonical.encode()).hexdigest()[:16]
  if id in ids:raise SystemExit('Two rows share an assignment link. Review their identity before generating: '+url)
  day='unplanned'
  extra=vals.get('D','')
  if 'Schedule For' in extra:
   for i,name in enumerate(['Sun','Mon','Tue','Wed','Thur','Fri','Sat']):
    if name in extra:day=str(i);break
  art=artmap.get(canonical,'generic')
  if 'Energy’s Path Through' in vals['B']:art='energy-path'
  elif 'Energy Path Quiz' in vals['B']:art='energy-quiz'
  elif 'Reading Log' in vals['B']:art='reading-log'
  elif 'MYPATH' in vals['B']:art='reading-path'
  ids.add(id);tasks.append(dict(id=id,subject=subject,note=vals.get('A',''),title=vals['B'],link=url,kind=vals.get('C',''),extra=vals.get('D',''),defaultDay=day,art=art,legacyId='r'+row.get('r') if start=='2026-10-11' else ''))
label=f'{date.strftime("%B")} {date.day}–{(date+datetime.timedelta(days=6)).strftime("%B")} {(date+datetime.timedelta(days=6)).day}, {(date+datetime.timedelta(days=6)).year}'
h=(root/'weekly-template.html').read_text().replace('__WEEK_LABEL__',label).replace('__WEEK_START__',json.dumps(start)).replace('__TASKS__',json.dumps(tasks,ensure_ascii=False).replace('</','<\\/'))
Path(out).write_text(h);(root/'dist/weeks').mkdir(exist_ok=True);(root/'dist/weeks'/f'{start}.html').write_text(h);(root/'dist/index.html').write_text(h)
print(f'Built week {start}: {len(tasks)} assignments. Preserve IDs and week key on every update.')
