# 서린 물류 포털 로컬 자동 백업
# 외부 패키지 없이 Python 표준 라이브러리만 사용합니다.
import json, os, sys, urllib.request, urllib.parse, datetime, zipfile, html, time
from pathlib import Path
from xml.sax.saxutils import escape

BASE=Path(__file__).resolve().parent
CFG=json.loads((BASE/"backup_config.json").read_text(encoding="utf-8"))
URL=CFG["supabase_url"].rstrip("/")
KEY=CFG["service_role_key"]
OUT=Path(CFG["backup_folder"])
STAMP=datetime.datetime.now().strftime("%Y-%m-%d")
DAY=OUT/STAMP
DAY.mkdir(parents=True,exist_ok=True)

if not KEY or "여기에_" in KEY:
    raise SystemExit("backup_config.json에 service_role_key를 입력하세요. 이 키는 외부에 공유하지 마세요.")

HEAD={"apikey":KEY,"Authorization":"Bearer "+KEY}

def request_json(url,method="GET",body=None,headers=None):
    h=dict(HEAD);h.update(headers or {})
    data=None
    if body is not None:
        data=json.dumps(body,ensure_ascii=False).encode("utf-8")
        h["Content-Type"]="application/json"
    req=urllib.request.Request(url,data=data,headers=h,method=method)
    with urllib.request.urlopen(req,timeout=120) as r:
        raw=r.read()
        return json.loads(raw.decode("utf-8")) if raw else None

def excel_col(n):
    s=""
    while n:
        n,rem=divmod(n-1,26);s=chr(65+rem)+s
    return s

def write_xlsx(path,sheets):
    # Minimal valid XLSX using standard zip/xml.
    with zipfile.ZipFile(path,"w",zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml",'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'+''.join(f'<Override PartName="/xl/worksheets/sheet{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' for i in range(1,len(sheets)+1))+'</Types>')
        z.writestr("_rels/.rels",'<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>')
        z.writestr("xl/workbook.xml",'<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>'+''.join(f'<sheet name="{escape(name[:31])}" sheetId="{i}" r:id="rId{i}"/>' for i,(name,_) in enumerate(sheets,1))+'</sheets></workbook>')
        z.writestr("xl/_rels/workbook.xml.rels",'<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+''.join(f'<Relationship Id="rId{i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet{i}.xml"/>' for i in range(1,len(sheets)+1))+'</Relationships>')
        for si,(name,rows) in enumerate(sheets,1):
            xml=['<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>']
            for ri,row in enumerate(rows,1):
                xml.append(f'<row r="{ri}">')
                for ci,val in enumerate(row,1):
                    ref=f"{excel_col(ci)}{ri}"
                    if isinstance(val,(int,float)) and not isinstance(val,bool):
                        xml.append(f'<c r="{ref}"><v>{val}</v></c>')
                    else:
                        text="" if val is None else str(val)
                        xml.append(f'<c r="{ref}" t="inlineStr"><is><t>{escape(text)}</t></is></c>')
                xml.append("</row>")
            xml.append("</sheetData></worksheet>")
            z.writestr(f"xl/worksheets/sheet{si}.xml","".join(xml))

def fetch_table(table):
    return request_json(f"{URL}/rest/v1/{urllib.parse.quote(table)}?select=*")

sheets=[]
manifest={"backup_time":datetime.datetime.now().isoformat(),"tables":{},"storage":{}}
for table in CFG["tables"]:
    try:
        rows=fetch_table(table) or []
        keys=[]
        for r in rows:
            for k in r:
                if k not in keys:keys.append(k)
        sheet=[keys]+[[r.get(k,"") if not isinstance(r.get(k), (dict,list)) else json.dumps(r.get(k),ensure_ascii=False) for k in keys] for r in rows]
        sheets.append((table,sheet or [["no data"]]))
        (DAY/f"{table}.json").write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding="utf-8")
        manifest["tables"][table]=len(rows)
    except Exception as e:
        manifest["tables"][table]="ERROR: "+str(e)

write_xlsx(DAY/f"서린포털_전체백업_{STAMP}.xlsx",sheets)

# Storage objects download (receipts)
for bucket in CFG.get("storage_buckets",[]):
    count=0
    target=DAY/"storage"/bucket
    target.mkdir(parents=True,exist_ok=True)
    try:
        stack=[""]
        while stack:
            prefix=stack.pop()
            objects=request_json(f"{URL}/storage/v1/object/list/{bucket}","POST",{"prefix":prefix,"limit":1000,"offset":0,"sortBy":{"column":"name","order":"asc"}}) or []
            for obj in objects:
                name=obj.get("name","")
                full=(prefix+"/"+name).strip("/")
                if obj.get("id") is None:
                    stack.append(full);continue
                local=target/full
                local.parent.mkdir(parents=True,exist_ok=True)
                req=urllib.request.Request(f"{URL}/storage/v1/object/{bucket}/{urllib.parse.quote(full,safe='/')}",headers=HEAD)
                with urllib.request.urlopen(req,timeout=120) as r:local.write_bytes(r.read())
                count+=1
        manifest["storage"][bucket]=count
    except Exception as e:
        manifest["storage"][bucket]="ERROR: "+str(e)

(DAY/"backup_manifest.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding="utf-8")
print("백업 완료:",DAY)
