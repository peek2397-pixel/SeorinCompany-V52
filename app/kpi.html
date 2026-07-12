<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>B2C 직원 KPI 관리 프로그램</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
:root{--nav:#0e4b78;--nav2:#1d6c9d;--bg:#f3f7fb;--line:#d5deea;--head:#e6f0fb;--btn:#0d4775;--soft:#fff7ed}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);font-family:Arial,"Noto Sans KR",sans-serif;color:#0f172a}
header{height:60px;background:linear-gradient(90deg,var(--nav),var(--nav2));color:#fff;display:flex;align-items:center;padding:0 22px;font-size:24px;font-weight:900}
.wrap{padding:16px 22px;max-width:1800px;margin:0 auto}
.tabs{display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap}
button{border:1px solid var(--line);background:#fff;border-radius:8px;padding:10px 15px;font-weight:800;cursor:pointer}
button.active,.primary{background:var(--btn);color:#fff;border-color:var(--btn)}
.danger{background:#b42318;color:#fff;border-color:#b42318}.small{font-size:12px;padding:6px 8px}
.section{display:none}.section.active{display:block}
.notice{background:var(--soft);border:1px solid #fdc98b;border-radius:8px;padding:12px;margin-bottom:12px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.card{background:#fff;border:1px solid var(--line);border-radius:12px;padding:14px;margin-bottom:12px;box-shadow:0 2px 6px rgba(0,0,0,.04)}
.card.tall{min-height:560px}
h3{margin:10px 0 16px;font-size:19px}
.toolbar{display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap}.toolbar>*{max-width:280px}
input,select,textarea{width:100%;height:34px;border:1px solid #cbd5e1;border-radius:6px;padding:6px 9px;background:#fff}
textarea{height:58px}
table{width:100%;border-collapse:collapse;background:#fff}
th,td{border:1px solid var(--line);padding:8px;text-align:center;font-size:13px}
th{background:var(--head);font-weight:900}
th.left,td.left{text-align:left}
.form th{width:120px;text-align:left;background:var(--head)}
.form td{text-align:left;background:#fff}
.people{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.person{height:54px;border:1px solid #d4dce8;border-radius:8px;display:flex;align-items:center;gap:8px;padding:0 10px;background:#fff}
.person input{width:16px;height:16px;margin:0}
.cards{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}
.metric{background:#fff;border:1px solid var(--line);border-radius:10px;padding:14px}.metric b{font-size:28px}
.pill{display:inline-block;border-radius:999px;padding:4px 9px;font-weight:900}.S{background:#f5d0fe}.A{background:#bbf7d0}.B{background:#dbeafe}.C{background:#fef08a}.D{background:#fed7aa}.E{background:#fecaca}.N{background:#e5e7eb}
.detailBtn{background:#eef6ff;border:1px solid #9cc7ee;color:#0d4775;border-radius:6px;padding:5px 8px;font-weight:800}
.detailBox{margin-top:10px;background:#f8fbff;border:1px solid var(--line);border-radius:10px;padding:10px}
.autoCell{background:#f8fbff;font-weight:800}
.allocCellBox{display:flex;gap:6px;align-items:center;justify-content:center}
.allocMiniBtn{height:32px;padding:5px 8px;border-radius:6px;background:#0d4775;color:white;border:1px solid #0d4775;font-size:12px}
.allocPanel{display:none;margin-top:6px;padding:8px;background:#f8fbff;border:1px solid #cbd5e1;border-radius:8px;text-align:left;min-width:260px}
.allocPanel.active{display:block}
.allocPanel .miniGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:5px;margin:6px 0}
.allocPanel label{display:flex;align-items:center;gap:5px;font-size:12px}
.allocPanel input[type='checkbox']{width:14px;height:14px;margin:0}
@media(max-width:1000px){.grid{grid-template-columns:1fr}.people{grid-template-columns:repeat(2,1fr)}.cards{grid-template-columns:repeat(2,1fr)}}
</style>
</head>
<body>
<header>B2C 직원 KPI 관리 프로그램</header>
<div class="wrap">
  <div class="tabs">
    <button class="active" onclick="show('dash',this)">대시보드</button>
    <button onclick="show('personal',this)">개인 일일수량</button>
    <button onclick="show('joint',this)">공동작업</button>
    <button onclick="show('monthly',this)">월별평가</button>
    <button onclick="show('half',this)">기간 종합평가</button>
    <button onclick="show('staff',this)">직원관리</button>
    <button onclick="show('criteria',this)">평가기준</button>
    <button onclick="show('export',this)">엑셀/백업</button>
  </div>

  <section id="dash" class="section active">
    <div class="toolbar">
      <input id="yearInput" type="number" min="2020" max="2100" onchange="changePeriod()" style="max-width:120px">
      <select id="periodSelect" onchange="changePeriod()" style="max-width:130px"><option value="H1">상반기</option><option value="H2">하반기</option></select>
      <select id="dashMonth" onchange="renderAll()"></select>
      <select id="allocStaff" onchange="renderSupportDetail()"></select>
    </div>
    <div class="cards">
      <div class="metric">직원 수<br><b id="mStaff">0</b></div>
      <div class="metric">월 총 작업량<br><b id="mQty">0</b></div>
      <div class="metric">지원분배 건수<br><b id="mSupport">0</b></div>
      <div class="metric">평가 완료<br><b id="mRated">0</b></div>
      <div class="metric">기간 S/A<br><b id="mTop">0</b></div>
    </div><br>
    <div class="card"><h3>지원분배 상세</h3><div id="supportDetail"></div></div>
    <div class="card"><h3>직원별 월 집계</h3><div id="dashTable"></div></div>
    <div class="card"><h3>기간 종합 요약</h3><div id="halfSummary"></div></div>
  </section>

  <section id="personal" class="section">
    <div class="notice">개인 일일수량은 그날 나온 포장수량입니다. 인원이 남아 도와준 경우, 해당 날짜의 지원분배 칸에서 직원 여러 명을 체크하면 입력수량이 본인 포함 인원수대로 자동 분배됩니다.</div>
    <div class="toolbar">
      <select id="pMonth" onchange="renderPersonal()"></select>
      <select id="pStaff" onchange="renderPersonal()"></select>
      <button class="primary" onclick="savePersonal()">개인수량 저장</button>
    </div>
    <div class="card">
      <h3>개인 일일수량 입력</h3>
      <div id="personalSummary"></div>
      <div id="personalSupportDetail" class="detailBox"></div><br>
      <div id="personalTable"></div>
    </div>
  </section>

  <section id="joint" class="section">
    <div class="notice">공동작업은 별도 작업입니다. 행사물량, 대량포장처럼 따로 관리해야 하는 작업만 이곳에 입력합니다.</div>
    <div class="grid">
      <div class="card tall">
        <h3>공동작업 입력</h3>
        <div class="toolbar"><select id="jMonth" onchange="setJointDate();renderJointList();"></select><input id="jDate" type="date"></div>
        <table class="form">
          <tr><th>작업명</th><td><input id="jName" placeholder="예: 공동 출고 / 대량 포장 / 행사물량"></td></tr>
          <tr><th>작업구분</th><td><select id="jType"><option>단포</option><option>합포</option><option>단포+합포</option><option>B2B 택배</option></select></td></tr>
          <tr><th>총 작업수량</th><td><input id="jQty" type="number" min="0" placeholder="전체 수량"></td></tr>
          <tr><th>잔업 유무</th><td><select id="jOt"><option value="false">없음</option><option value="true">있음</option></select></td></tr>
          <tr><th>잔업시간</th><td><input id="jOtHours" type="number" min="0" step="0.5" placeholder="예: 2"></td></tr>
          <tr><th>참여 직원</th><td><div id="people" class="people"></div></td></tr>
          <tr><th>메모</th><td><textarea id="jMemo"></textarea></td></tr>
        </table>
        <br><button class="primary" onclick="addJoint()">공동작업 추가</button>
      </div>
      <div class="card tall"><h3>월 공동작업 내역</h3><div id="jointList"></div></div>
    </div>
  </section>

  <section id="monthly" class="section">
    <div class="notice">월별 KPI 점수는 100점 만점입니다. 작업성과 50점(정확도 25 + 생산성 25)과 태도/품질/협업 50점으로 구성됩니다.</div>
    <div class="toolbar"><select id="scoreMonth" onchange="renderMonthly()"></select><select id="scoreStaff" onchange="renderMonthly()"></select><button class="primary" onclick="saveMonthlyScore()">월별평가 저장</button><button onclick="clearMonthlyScore()">초기화</button></div>
    <div class="card"><h3>월별 KPI 평가 입력</h3><div id="monthlyForm"></div></div>
  </section>

  <section id="half" class="section">
    <div class="notice">기간 최종점수 = 선택한 6개월 월별 KPI 각 15점 환산(총 90점) + 기간 종합평가 10점입니다.</div>
    <div class="card"><h3>기간 종합평가 입력</h3><div id="halfInput"></div></div>
    <div class="card"><h3>기간 종합평가 결과</h3><div id="halfResult"></div></div>
  </section>

  <section id="staff" class="section"><div class="card"><h3>직원관리</h3><button class="primary" onclick="addStaff()">직원 추가</button><br><br><div id="staffTable"></div></div></section>
  <section id="criteria" class="section"><div class="card"><h3>평가기준</h3><div id="criteriaTable"></div></div></section>
  <section id="export" class="section"><div class="card"><h3>엑셀/백업</h3><button class="primary" onclick="exportExcel()">엑셀 파일로 저장</button> <button onclick="exportCSV()">CSV 저장</button> <button onclick="backup()">백업 저장</button> <input type="file" accept=".json" onchange="restore(event)" style="max-width:300px"></div></section>
</div>

<script>
let selectedYear = Number(localStorage.getItem("b2cKpiYear") || new Date().getFullYear());
let selectedPeriod = localStorage.getItem("b2cKpiPeriod") || "H2";
function monthsFor(){const nums=selectedPeriod==="H1"?[1,2,3,4,5,6]:[7,8,9,10,11,12];return nums.map(m=>`${selectedYear}-${String(m).padStart(2,"0")}`)}
function periodLabel(){return `${selectedYear}년 ${selectedPeriod==="H1"?"상반기":"하반기"}`}
let months=monthsFor();
const defaultStaff=[
{name:"여윤태",title:"대리",role:"관리 및 B2B 택배"},
{name:"김지섭",title:"대리",role:"관리 및 B2B 택배"},
{name:"김상주",title:"과장",role:"출고/포장"},
{name:"마유미",title:"사원",role:"출고/포장"},
{name:"이미옥",title:"사원",role:"출고/포장"},
{name:"정효선",title:"사원",role:"출고/포장"},
{name:"김미영",title:"사원",role:"출고/포장"},
{name:"지정구",title:"사원",role:"출고/포장"}
];
const criteria=[
{cat:"출고 정확도",key:"accuracy",max:25,desc:"오출고, 누락, 송장 오류 기준. 오류가 적을수록 고득점"},
{cat:"작업 생산성",key:"productivity",max:25,desc:"개인수량 + 지원분배 + 공동작업 배분 기준. 월 작업량 달성도 중심"},
{cat:"근태 및 책임감",key:"attendance",max:15,desc:"지각, 결근, 무단이탈, 보고 누락, 책임감 기준"},
{cat:"작업 품질",key:"quality",max:10,desc:"포장상태, 파손, 검수 준수, 작업 마감 품질 기준"},
{cat:"협업 및 지원",key:"teamwork",max:10,desc:"지원분배 참여, 타 직원 지원, 협조, 인수인계 기준"},
{cat:"정리정돈 및 5S",key:"fiveS",max:5,desc:"작업장 정리, 부자재 정리, 통로 확보, 안전수칙 기준"},
{cat:"개선활동",key:"improve",max:5,desc:"오류 감소, 동선 개선, 작업 개선 제안 및 실행 기준"},
{cat:"팀장 종합평가",key:"leader",max:5,desc:"책임감, 신뢰도, 현장 기여도, 종합 판단 기준"}
];
let db=load();
function load(){let d=localStorage.getItem("b2cKpiRebuildV11");return d?JSON.parse(d):{staff:defaultStaff,personal:{},joints:[],scores:{},half:{}}}
function save(){localStorage.setItem("b2cKpiRebuildV11",JSON.stringify(db))}
function q(id){return document.getElementById(id)}
function r1(n){return Math.round(n*10)/10}
function show(id,btn){document.querySelectorAll(".section").forEach(s=>s.classList.remove("active"));q(id).classList.add("active");document.querySelectorAll(".tabs button").forEach(b=>b.classList.remove("active"));btn.classList.add("active");renderAll()}
function changePeriod(){selectedYear=Number(q("yearInput").value||selectedYear);selectedPeriod=q("periodSelect").value||selectedPeriod;localStorage.setItem("b2cKpiYear",selectedYear);localStorage.setItem("b2cKpiPeriod",selectedPeriod);months=monthsFor();renderAll()}
function initSelects(){q("yearInput").value=selectedYear;q("periodSelect").value=selectedPeriod;["dashMonth","pMonth","jMonth","scoreMonth"].forEach(id=>{q(id).innerHTML=months.map(m=>`<option>${m}</option>`).join("")});["pStaff","scoreStaff","allocStaff"].forEach(id=>{q(id).innerHTML=db.staff.map((s,i)=>`<option value="${i}">${s.name}</option>`).join("")});if(!q("jDate").value)q("jDate").value=q("jMonth").value+"-01"}
function setJointDate(){q("jDate").value=q("jMonth").value+"-01"}
function daysInMonth(m){let [y,mo]=m.split("-").map(Number);return new Date(y,mo,0).getDate()}
function personalKey(date,idx){return date+"|"+idx}
function getPersonal(date,idx){let k=personalKey(date,idx);if(!db.personal[k])db.personal[k]={type:"단포",qty:"",helpers:[],ot:false,otHours:"",memo:""};if(!db.personal[k].helpers)db.personal[k].helpers=[];return db.personal[k]}
function renderPeople(){q("people").innerHTML=db.staff.map((s,i)=>`<label class="person"><input type="checkbox" value="${i}"><span>${s.name}</span></label>`).join("")}
function supportMembers(ownerIdx,p){return [ownerIdx,...(p.helpers||[]).filter(i=>i!==ownerIdx)]}
function supportEntries(date,idx){let rows=[];db.staff.forEach((s,owner)=>{let p=getPersonal(date,owner), qty=Number(p.qty)||0;if(!qty)return;let members=supportMembers(owner,p);if(members.includes(idx)){let per=r1(qty/members.length);rows.push({date,owner,name:s.name,type:p.type,qty,count:members.length,per,people:members.map(i=>db.staff[i]?.name||"").join(", "),memo:p.memo||""})}});return rows}
function supportDay(date,idx){return r1(supportEntries(date,idx).reduce((a,r)=>a+r.per,0))}
function supportMonth(month,idx){let total=0;for(let d=1;d<=daysInMonth(month);d++)total+=supportDay(`${month}-${String(d).padStart(2,"0")}`,idx);return r1(total)}
function supportCell(date,ownerIdx){
  let p=getPersonal(date,ownerIdx), helpers=p.helpers||[], members=supportMembers(ownerIdx,p), qty=Number(p.qty)||0, per=qty&&members.length?r1(qty/members.length):0;
  let panelId="support_"+date.replaceAll("-","_")+"_"+ownerIdx;
  let label=helpers.length?`${members.length}명/${per}`:"직원선택";
  let people=db.staff.map((s,i)=>i===ownerIdx?"":`<label><input type="checkbox" value="${i}"${helpers.includes(i)?" checked":""}><span>${s.name}</span></label>`).join("");
  return `<div class="allocCellBox"><button type="button" class="allocMiniBtn" onclick="togglePanel('${panelId}')">${label}</button></div>
  <div id="${panelId}" class="allocPanel">
    <b>지원 직원 선택</b>
    <div class="miniGrid">${people}</div>
    <button type="button" class="primary small" onclick="saveSupportHelpers('${date}',${ownerIdx},'${panelId}')">분배적용</button>
  </div>`;
}
function togglePanel(id){document.querySelectorAll(".allocPanel").forEach(p=>{if(p.id!==id)p.classList.remove("active")});q(id)?.classList.toggle("active")}
function saveSupportHelpers(date,ownerIdx,panelId){
  let p=getPersonal(date,ownerIdx);

  // 개인수량 저장 버튼을 누르기 전이라도 현재 화면 입력값을 먼저 반영
  const qtyInput=document.querySelector(`#personalTable input[data-date="${date}"][data-f="qty"]`);
  const typeInput=document.querySelector(`#personalTable select[data-date="${date}"][data-f="type"]`);
  const otInput=document.querySelector(`#personalTable select[data-date="${date}"][data-f="ot"]`);
  const otHoursInput=document.querySelector(`#personalTable input[data-date="${date}"][data-f="otHours"]`);
  const memoInput=document.querySelector(`#personalTable input[data-date="${date}"][data-f="memo"]`);

  if(qtyInput) p.qty=qtyInput.value;
  if(typeInput) p.type=typeInput.value;
  if(otInput) p.ot=otInput.value==="true";
  if(otHoursInput) p.otHours=otHoursInput.value;
  if(memoInput) p.memo=memoInput.value;

  p.helpers=[...q(panelId).querySelectorAll("input[type='checkbox']:checked")].map(x=>Number(x.value));

  const qty=Number(p.qty)||0;
  const cnt=supportMembers(ownerIdx,p).length;
  const per=cnt ? r1(qty/cnt) : 0;

  save();
  renderAll();
  alert(`지원분배 적용: ${qty} ÷ ${cnt}명 = ${per}`);
}
function jointDay(date,idx){let total=0;db.joints.filter(j=>j.date===date&&j.members.includes(idx)).forEach(j=>total+=j.qty/j.members.length);return r1(total)}
function addJoint(){let members=[...document.querySelectorAll("#people input:checked")].map(x=>Number(x.value));let qty=Number(q("jQty").value)||0;if(!q("jName").value||!qty||members.length===0){alert("작업명, 수량, 참여 직원을 입력하세요.");return}db.joints.push({date:q("jDate").value,name:q("jName").value,type:q("jType").value,qty,ot:q("jOt").value==="true",otHours:Number(q("jOtHours").value)||0,members,memo:q("jMemo").value});save();q("jName").value="";q("jQty").value="";q("jOtHours").value="";q("jMemo").value="";document.querySelectorAll("#people input").forEach(x=>x.checked=false);renderAll()}
function delJoint(i){if(confirm("삭제할까요?")){db.joints.splice(i,1);save();renderAll()}}
function renderJointList(){let m=q("jMonth").value;let rows=db.joints.map((j,i)=>({...j,i})).filter(j=>j.date.startsWith(m));let html=`<table><tr><th>일자</th><th>작업명</th><th>구분</th><th>총수량</th><th>참여자</th><th>인원</th><th>1인 배분</th><th>잔업</th><th>메모</th><th>삭제</th></tr>`;rows.forEach(j=>{let per=j.members.length?r1(j.qty/j.members.length):0;html+=`<tr><td>${j.date}</td><td class="left">${j.name}</td><td>${j.type}</td><td>${j.qty.toLocaleString()}</td><td class="left">${j.members.map(i=>db.staff[i]?.name||"").join(", ")}</td><td>${j.members.length}</td><td><b>${per}</b></td><td>${j.ot?"있음":"없음"} ${j.otHours||""}</td><td class="left">${j.memo||""}</td><td><button class="danger small" onclick="delJoint(${j.i})">삭제</button></td></tr>`});q("jointList").innerHTML=html+"</table>"}
function supportDetails(month,idx){let rows=[];for(let d=1;d<=daysInMonth(month);d++){let date=`${month}-${String(d).padStart(2,"0")}`;rows.push(...supportEntries(date,idx))}return rows}
function renderSupportDetail(){let m=q("dashMonth").value,idx=Number(q("allocStaff").value||0),rows=supportDetails(m,idx),total=rows.reduce((a,r)=>a+r.per,0);let html=`<table><tr><th>직원명</th><td>${db.staff[idx]?.name||""}</td><th>월</th><td>${m}</td><th>지원분배 합계</th><td><b>${r1(total)}</b></td></tr></table><br>`;html+=`<table><tr><th>일자</th><th>입력자</th><th>구분</th><th>총수량</th><th>분배인원</th><th>참여자</th><th>본인배분</th></tr>`;if(!rows.length)html+=`<tr><td colspan="7">지원분배 내역이 없습니다.</td></tr>`;else rows.forEach(r=>html+=`<tr><td>${r.date}</td><td>${r.name}</td><td>${r.type}</td><td>${r.qty}</td><td>${r.count}</td><td class="left">${r.people}</td><td><b>${r.per}</b></td></tr>`);q("supportDetail").innerHTML=html+"</table>"}
function renderPersonalSupportDetail(month,idx){let rows=supportDetails(month,idx),total=rows.reduce((a,r)=>a+r.per,0);let html=`<b>지원분배 상세</b> / 합계: <b>${r1(total)}</b><table style="margin-top:8px"><tr><th>일자</th><th>입력자</th><th>구분</th><th>총수량</th><th>분배인원</th><th>본인배분</th><th>참여자</th></tr>`;if(!rows.length)html+=`<tr><td colspan="7">지원분배 내역이 없습니다.</td></tr>`;else rows.forEach(r=>html+=`<tr><td>${r.date}</td><td>${r.name}</td><td>${r.type}</td><td>${r.qty}</td><td>${r.count}</td><td><b>${r.per}</b></td><td class="left">${r.people}</td></tr>`);q("personalSupportDetail").innerHTML=html+"</table>"}
function renderPersonal(){let m=q("pMonth").value,idx=Number(q("pStaff").value),days=daysInMonth(m),st=monthStats(m,idx);q("personalSummary").innerHTML=`<table><tr><th>직원명</th><td>${db.staff[idx]?.name}</td><th>지원분배 후 개인수량</th><td>${st.support}</td><th>공동작업배분</th><td>${st.joint}</td><th>합계</th><td><b>${st.total}</b></td></tr></table>`;renderPersonalSupportDetail(m,idx);let html=`<table><tr><th>일자</th><th>요일</th><th>작업구분</th><th>개인 작업수량</th><th>지원분배</th><th>지원 후 수량</th><th>공동작업배분</th><th>일 합계</th><th>잔업</th><th>잔업시간</th><th>메모</th></tr>`;const week=["일","월","화","수","목","금","토"];for(let d=1;d<=days;d++){let date=`${m}-${String(d).padStart(2,"0")}`,p=getPersonal(date,idx),sup=supportDay(date,idx),joint=jointDay(date,idx);html+=`<tr><td>${date}</td><td>${week[new Date(date).getDay()]}</td><td><select data-date="${date}" data-f="type"><option${p.type==="단포"?" selected":""}>단포</option><option${p.type==="합포"?" selected":""}>합포</option><option${p.type==="단포+합포"?" selected":""}>단포+합포</option><option${p.type==="B2B 택배"?" selected":""}>B2B 택배</option></select></td><td><input data-date="${date}" data-f="qty" type="number" value="${p.qty||""}"></td><td>${supportCell(date,idx)}</td><td class="autoCell">${sup}</td><td class="autoCell">${joint}</td><td><b>${r1(sup+joint)}</b></td><td><select data-date="${date}" data-f="ot"><option value="false"${!p.ot?" selected":""}>없음</option><option value="true"${p.ot?" selected":""}>있음</option></select></td><td><input data-date="${date}" data-f="otHours" type="number" step="0.5" value="${p.otHours||""}"></td><td><input data-date="${date}" data-f="memo" value="${p.memo||""}"></td></tr>`}q("personalTable").innerHTML=html+"</table>"}
function savePersonal(){let idx=Number(q("pStaff").value);document.querySelectorAll("#personalTable [data-date]").forEach(el=>{let p=getPersonal(el.dataset.date,idx),f=el.dataset.f;if(f==="ot")p[f]=el.value==="true";else p[f]=el.value});save();renderAll();alert("저장되었습니다.")}
function monthStats(month,idx){let support=0,joint=0,dan=0,hap=0,b2b=0,jointCnt=0,ot=0;for(let d=1;d<=daysInMonth(month);d++){let date=`${month}-${String(d).padStart(2,"0")}`;support+=supportDay(date,idx);let p=getPersonal(date,idx);if(p.ot)ot+=Number(p.otHours)||0}db.staff.forEach((s,owner)=>{for(let d=1;d<=daysInMonth(month);d++){let date=`${month}-${String(d).padStart(2,"0")}`,p=getPersonal(date,owner),qty=Number(p.qty)||0;if(!qty)continue;let members=supportMembers(owner,p);if(members.includes(idx)){let per=qty/members.length;if(p.type==="단포")dan+=per;else if(p.type==="합포")hap+=per;else if(p.type==="B2B 택배")b2b+=per;else{dan+=per/2;hap+=per/2}}}});db.joints.filter(j=>j.date.startsWith(month)&&j.members.includes(idx)).forEach(j=>{let per=j.qty/j.members.length;joint+=per;jointCnt++;if(j.ot)ot+=j.otHours/j.members.length;if(j.type==="단포")dan+=per;else if(j.type==="합포")hap+=per;else if(j.type==="B2B 택배")b2b+=per;else{dan+=per/2;hap+=per/2}});return{support:r1(support),joint:r1(joint),total:r1(support+joint),dan:r1(dan),hap:r1(hap),b2b:r1(b2b),jointCnt,ot:r1(ot)}}
function grade(s){if(s===""||s==null)return"N";if(s>=95)return"S";if(s>=90)return"A";if(s>=80)return"B";if(s>=70)return"C";if(s>=60)return"D";return"E"}
function scoreKey(m,idx){return m+"|"+idx}
function getScore(m,idx){let k=scoreKey(m,idx);if(!db.scores[k]){let o={memo:""};criteria.forEach(c=>o[c.key]="");db.scores[k]=o}else{criteria.forEach(c=>{if(!(c.key in db.scores[k]))db.scores[k][c.key]=""});}return db.scores[k]}
function scoreTotal(o){let has=criteria.some(c=>o[c.key]!==""&&o[c.key]!=null);return has?criteria.reduce((a,c)=>a+(Number(o[c.key])||0),0):""}
function renderMonthly(){let m=q("scoreMonth").value,idx=Number(q("scoreStaff").value),s=db.staff[idx],st=monthStats(m,idx),o=getScore(m,idx),total=scoreTotal(o),g=grade(total);let html=`<table><tr><th>직원명</th><td>${s.name}</td><th>월</th><td>${m}</td><th>작업량</th><td>${st.total}</td><th>총점</th><td><b id="liveTotal">${total!==""?total:"-"}</b></td><th>등급</th><td><span id="liveGrade" class="pill ${g}">${g==="N"?"미평가":g}</span></td></tr></table><br><table><tr><th>항목</th><th>만점</th><th>점수입력</th><th>기준</th></tr>`;criteria.forEach(c=>html+=`<tr><td>${c.cat}</td><td>${c.max}</td><td><input data-score="${c.key}" type="number" min="0" max="${c.max}" value="${o[c.key]||""}" oninput="liveScore()"></td><td class="left">${c.desc}</td></tr>`);html+=`</table><br><table><tr><th>메모</th><td><textarea id="scoreMemo">${o.memo||""}</textarea></td></tr></table>`;q("monthlyForm").innerHTML=html}
function liveScore(){let temp={};criteria.forEach(c=>temp[c.key]=document.querySelector(`[data-score="${c.key}"]`)?.value||"");let t=scoreTotal(temp),g=grade(t);q("liveTotal").textContent=t!==""?t:"-";q("liveGrade").textContent=g==="N"?"미평가":g;q("liveGrade").className="pill "+g}
function saveMonthlyScore(){let m=q("scoreMonth").value,idx=Number(q("scoreStaff").value),o=getScore(m,idx);criteria.forEach(c=>o[c.key]=document.querySelector(`[data-score="${c.key}"]`).value);o.memo=q("scoreMemo").value;save();renderAll();alert("저장되었습니다.")}
function clearMonthlyScore(){let k=scoreKey(q("scoreMonth").value,Number(q("scoreStaff").value));delete db.scores[k];save();renderAll()}
function halfStats(idx){let ms=months.map(m=>scoreTotal(getScore(m,idx))),part=ms.reduce((a,s)=>a+(s===""?0:s*0.15),0),h=db.half[periodLabel()+"|"+idx]||{summary:"",memo:""},final=(ms.filter(s=>s!=="").length===6&&h.summary!=="")?r1(part+Number(h.summary)):"";let work={total:0,dan:0,hap:0,b2b:0,jointCnt:0,ot:0};months.forEach(m=>{let st=monthStats(m,idx);work.total+=st.total;work.dan+=st.dan;work.hap+=st.hap;work.b2b+=st.b2b;work.jointCnt+=st.jointCnt;work.ot+=st.ot});return{ms,part:r1(part),summary:h.summary,final,work}}
function halfRows(){let rows=db.staff.map((s,i)=>({s,i,hs:halfStats(i)}));let ranked=rows.filter(r=>r.hs.final!=="").sort((a,b)=>b.hs.final-a.hs.final);ranked.forEach((r,i)=>r.rank=i+1);rows.forEach(r=>{let f=ranked.find(x=>x.i===r.i);r.rank=f?f.rank:""});return rows}
function renderHalf(){let input=`<table><tr><th>직원명</th>${months.map(m=>`<th>${Number(m.slice(5))}월</th>`).join("")}<th>월별환산/90</th><th>종합/10</th><th>메모</th><th>저장</th></tr>`;halfRows().forEach(r=>{let h=db.half[periodLabel()+"|"+r.i]||{summary:"",memo:""};input+=`<tr><td>${r.s.name}</td>${r.hs.ms.map(s=>`<td>${s!==""?s:"-"}</td>`).join("")}<td>${r.hs.part}</td><td><input id="h_${r.i}" type="number" max="10" min="0" step="0.1" value="${h.summary||""}"></td><td><input id="hm_${r.i}" value="${h.memo||""}"></td><td><button class="primary small" onclick="saveHalf(${r.i})">저장</button></td></tr>`});q("halfInput").innerHTML=input+"</table>";let result=`<table><tr><th>순위</th><th>직원명</th><th>기간작업량</th><th>단포</th><th>합포</th><th>B2B</th><th>공동참여</th><th>잔업</th><th>최종</th><th>등급</th></tr>`;halfRows().sort((a,b)=>(a.rank||999)-(b.rank||999)).forEach(r=>{let g=grade(r.hs.final),w=r.hs.work;result+=`<tr><td>${r.rank||"-"}</td><td>${r.s.name}</td><td>${r1(w.total)}</td><td>${r1(w.dan)}</td><td>${r1(w.hap)}</td><td>${r1(w.b2b)}</td><td>${w.jointCnt}</td><td>${r1(w.ot)}</td><td><b>${r.hs.final!==""?r.hs.final:"-"}</b></td><td><span class="pill ${g}">${g==="N"?"미평가":g}</span></td></tr>`});q("halfResult").innerHTML=result+"</table>";q("halfSummary").innerHTML=result+"</table>"}
function saveHalf(i){let v=q("h_"+i).value;if(v!==""&&Number(v)>10)v=10;db.half[periodLabel()+"|"+i]={summary:v,memo:q("hm_"+i).value};save();renderAll()}
function renderDash(){let m=q("dashMonth").value;q("mStaff").textContent=db.staff.length;q("mSupport").textContent=db.staff.reduce((a,_,i)=>a+supportDetails(m,i).length,0);q("mQty").textContent=db.staff.reduce((a,_,i)=>a+monthStats(m,i).total,0).toLocaleString();q("mRated").textContent=db.staff.filter((_,i)=>scoreTotal(getScore(m,i))!=="").length;q("mTop").textContent=halfRows().filter(r=>["S","A"].includes(grade(r.hs.final))).length;let html=`<table><tr><th>직원명</th><th>담당</th><th>단포</th><th>합포</th><th>B2B</th><th>지원분배</th><th>공동작업</th><th>합계</th><th>공동참여</th><th>잔업</th><th>월점수</th><th>등급</th></tr>`;db.staff.forEach((s,i)=>{let st=monthStats(m,i),sc=scoreTotal(getScore(m,i)),g=grade(sc);html+=`<tr><td>${s.name}</td><td class="left">${s.role}</td><td>${st.dan}</td><td>${st.hap}</td><td>${st.b2b}</td><td><button class="detailBtn" onclick="q('allocStaff').value=${i};renderSupportDetail()">${st.support}</button></td><td>${st.joint}</td><td><b>${st.total}</b></td><td>${st.jointCnt}</td><td>${st.ot}</td><td>${sc!==""?sc:"-"}</td><td><span class="pill ${g}">${g==="N"?"미평가":g}</span></td></tr>`});q("dashTable").innerHTML=html+"</table>";renderSupportDetail()}
function renderStaff(){let html=`<table><tr><th>번호</th><th>직원명</th><th>직급</th><th>담당업무</th><th>삭제</th></tr>`;db.staff.forEach((s,i)=>html+=`<tr><td>${i+1}</td><td><input value="${s.name}" onchange="db.staff[${i}].name=this.value;save();renderAll()"></td><td><input value="${s.title}" onchange="db.staff[${i}].title=this.value;save()"></td><td><input value="${s.role}" onchange="db.staff[${i}].role=this.value;save()"></td><td><button class="danger small" onclick="delStaff(${i})">삭제</button></td></tr>`);q("staffTable").innerHTML=html+"</table>"}
function addStaff(){db.staff.push({name:"신규 직원",title:"",role:""});save();renderAll()}
function delStaff(i){if(confirm("삭제할까요?")){db.staff.splice(i,1);save();renderAll()}}
function renderCriteria(){
  let html=`<table><tr><th>항목</th><th>배점</th><th>평가기준</th><th>세부 기준</th></tr>`;
  html+=`<tr><td>출고 정확도</td><td>25</td><td class="left">오출고, 누락, 송장 오류</td><td class="left">오류 0건 25점 / 1건 20점 / 2건 15점 / 3건 10점 / 4건 이상 5점 이하</td></tr>`;
  html+=`<tr><td>작업 생산성</td><td>25</td><td class="left">개인수량 + 지원분배 + 공동작업 배분</td><td class="left">월 목표 대비 120% 이상 25점 / 110~119% 23점 / 100~109% 21점 / 90~99% 18점 / 80~89% 15점 / 70~79% 10점 / 70% 미만 5점</td></tr>`;
  html+=`<tr><td>근태 및 책임감</td><td>15</td><td class="left">지각, 결근, 무단이탈, 보고 누락</td><td class="left">문제 없음 15점 / 경미 1회 13점 / 반복 2회 10점 / 잦은 문제 7점 이하</td></tr>`;
  html+=`<tr><td>작업 품질</td><td>10</td><td class="left">포장상태, 파손, 검수 준수</td><td class="left">우수 10점 / 보통 8점 / 미흡 6점 / 반복 문제 4점 이하</td></tr>`;
  html+=`<tr><td>협업 및 지원</td><td>10</td><td class="left">지원분배 참여, 타 직원 지원, 인수인계</td><td class="left">적극 지원 10점 / 보통 8점 / 소극적 6점 / 비협조 4점 이하</td></tr>`;
  html+=`<tr><td>정리정돈 및 5S</td><td>5</td><td class="left">작업장 정리, 부자재 정리, 안전</td><td class="left">우수 5점 / 보통 4점 / 미흡 3점 / 반복 미흡 2점 이하</td></tr>`;
  html+=`<tr><td>개선활동</td><td>5</td><td class="left">오류 감소, 동선 개선, 개선 제안</td><td class="left">실행 5점 / 제안 4점 / 참여 3점 / 없음 1점</td></tr>`;
  html+=`<tr><td>팀장 종합평가</td><td>5</td><td class="left">책임감, 신뢰도, 현장 기여도</td><td class="left">우수 5점 / 보통 4점 / 미흡 3점 이하. 사유 메모 권장</td></tr>`;
  html+=`<tr><th>합계</th><th>100</th><th colspan="2" class="left">작업성과 50점 + 태도/품질/협업 50점 구조</th></tr>`;
  q("criteriaTable").innerHTML=html+"</table>";
}function exportExcel(){let content=`<html><meta charset="utf-8"><body><h2>B2C 직원 KPI 관리 프로그램</h2><h3>대시보드</h3>${q("dashTable").innerHTML}<h3>지원분배 상세</h3>${q("supportDetail").innerHTML}<h3>공동작업</h3>${q("jointList").innerHTML}<h3>기간평가</h3>${q("halfResult").innerHTML}</body></html>`;let a=document.createElement("a");a.href=URL.createObjectURL(new Blob([content],{type:"application/vnd.ms-excel;charset=utf-8"}));a.download="B2C_KPI.xls";a.click()}
function exportCSV(){let rows=[["월","직원명","단포","합포","B2B","지원분배","공동작업","합계"]];months.forEach(m=>db.staff.forEach((s,i)=>{let st=monthStats(m,i);rows.push([m,s.name,st.dan,st.hap,st.b2b,st.support,st.joint,st.total])}));download("B2C_KPI.csv",rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(",")).join("\n"))}
function backup(){download("b2c_kpi_backup.json",JSON.stringify(db,null,2))}
function restore(e){let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=()=>{db=JSON.parse(r.result);save();renderAll()};r.readAsText(f)}
function download(name,text){let a=document.createElement("a");a.href=URL.createObjectURL(new Blob([text],{type:"text/plain;charset=utf-8"}));a.download=name;a.click()}
function renderAll(){initSelects();renderPeople();renderJointList();renderPersonal();renderMonthly();renderHalf();renderDash();renderStaff();renderCriteria()}
renderAll();
</script>
</body>
</html>