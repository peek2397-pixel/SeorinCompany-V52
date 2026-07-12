const C = window.SEORIN_CONFIG;
const configured = C.SUPABASE_URL && !C.SUPABASE_URL.includes("YOUR_");
const supabaseClient = configured ? window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY) : null;

const pageInfo = {
  dashboard:["대시보드","오늘의 업무 현황을 한눈에 확인합니다."],
  notices:["공지사항","직원 공지와 자료를 관리합니다."],
  organization:["조직도","부서와 직원 정보를 확인합니다."],
  community:["일반 소통방","직원 간 업무 소통 공간입니다."],
  private:["1:1 비밀소통","작성자와 지정 권한자만 볼 수 있습니다."],
  corporateCard:["법인카드","사용내역 등록, 정산 및 엑셀 다운로드"],
  inventory:["물품관리","요소수 등 물류 소모품 재고관리"],
  purchase:["구매관리","구매요청과 승인 상태 관리"],
  b2b:["B2B 작업 통계","일일작업, 상세내역, 월별·반기 성과평가를 관리합니다."],
  calendar:["근무·휴무 달력","연차, 반차, 반반차, 주말근무와 대체휴일을 관리합니다."],
  contractors:["외주 업체 인력관리","날짜별 외주 출근·식사 인원과 점심 주문 수량을 관리합니다."],
  events:["회사 일정·B2C 행사","전 직원이 함께 확인하는 행사와 회사 일정을 관리합니다."],
  meetings:["회의실 예약","회의실 일정과 미팅 정보를 예약하고 확인합니다."],
  vehicles:["차량관리","차량 기본정보, 운행일지, 정비·수리 이력을 관리합니다."],
  account:["내 정보·비밀번호","내 정보 확인과 비밀번호 변경"],
  kpi:["KPI 관리","평가 권한자만 점수와 순위를 볼 수 있습니다."],
  employees:["직원관리","직원·부서·직급 정보를 관리합니다."],
  permissions:["권한관리","직원별로 보이는 화면과 기능을 지정합니다."]
};
const menus = [
  ["dashboard","대시보드","dashboard_view"],["notices","공지사항","notices_view"],["organization","조직도·비상연락망","organization_view"],
  ["community","일반 소통방","community_view"],["private","1:1 비밀소통","private_messages_use"],
  ["corporateCard","법인카드","card_use"],["inventory","물품관리","inventory_view"],["purchase","구매관리","purchase_view"],
  ["b2b","B2B 작업 통계","b2b_view"],["calendar","근무·휴무 달력","calendar_use"],["events","회사 일정·B2C 행사","calendar_use"],["meetings","회의실 예약","calendar_use"],["contractors","외주 업체 인력관리","calendar_manage"],["vehicles","차량관리","dashboard_view"],["account","내 정보·비밀번호","dashboard_view"],
  ["kpi","B2C KPI 관리","kpi_manage"],["employees","직원관리","employees_manage"],["permissions","권한관리","permissions_manage"]
];
let state = { user:null, profile:null, permissions:{}, cards:[], items:[], notices:[], employees:[], employeeRegistry:[], orgTeams:[], privateMessages:[], chatMessages:[], messengerRooms:[], messengerMembers:[], selectedMessengerRoom:"global", calendarEntries:[], leaveAdjustments:[], purchaseRequests:[], contractorWorkforce:[], editingContractorId:null, companyEvents:[], meetingBookings:[], vehicles:[], vehicleTrips:[], vehicleMaintenance:[], selectedVehicleId:null, editingVehicleId:null, editingTripId:null, editingMaintenanceId:null, selectedPermissionUser:null, chatChannel:null, calendarDate:new Date(), orgEditMode:false };

const $ = id => document.getElementById(id);

window.addEventListener("error",e=>{
  console.error("화면 스크립트 오류",e.error||e.message);
  const t=document.getElementById("toast");
  if(t){t.textContent="화면 오류: "+(e.message||"알 수 없는 오류");t.classList.add("show");}
});
window.addEventListener("unhandledrejection",e=>{
  console.error("비동기 처리 오류",e.reason);
  const msg=e.reason?.message||String(e.reason||"알 수 없는 오류");
  const t=document.getElementById("toast");
  if(t){t.textContent="처리 오류: "+msg;t.classList.add("show");}
});

const sleep = ms => new Promise(resolve=>setTimeout(resolve,ms));

function makeTemporaryAuthClient(){
  return window.supabase.createClient(C.SUPABASE_URL,C.SUPABASE_ANON_KEY,{
    auth:{
      persistSession:false,
      autoRefreshToken:false,
      detectSessionInUrl:false
    }
  });
}


function employeeLoginEmail(empNo){
  const normalized=String(empNo||"")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g,"");
  return `seorin.portal.${normalized}@gmail.com`;
}

function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1800)}
function toggle(id){$(id).classList.toggle("hidden")}
function money(v){return Number(v||0).toLocaleString("ko-KR")+"원"}
function escapeHtml(v=""){return String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function has(key){return !!(state.profile?.is_super_admin || state.permissions?.[key])}

const PERMISSION_DEFS=[
  ["dashboard_view","대시보드"],
  ["notices_view","공지 보기"],
  ["notices_manage","공지 관리"],
  ["organization_view","조직도"],
  ["emergency_contacts_view","비상 연락망"],
  ["community_view","일반 소통방"],
  ["private_messages_use","1:1 비밀소통"],
  ["card_use","법인카드 등록"],
  ["card_manage","법인카드 전체관리"],
  ["card_export","법인카드 엑셀"],
  ["inventory_view","물품 조회"],
  ["inventory_manage","물품·재고 관리"],
  ["inventory_export","재고 엑셀"],
  ["purchase_view","구매요청"],
  ["purchase_approve","구매 검토·발주"],
  ["purchase_final_approve","구매 최종 승인"],
  ["calendar_use","근무·휴무 달력"],
  ["calendar_manage","전체 직원 달력 조회"],
  ["b2b_view","B2B 작업통계 보기"],
  ["b2b_manage","B2B 전체관리·평가"],
  ["b2b_export","B2B 엑셀·백업"],
  ["kpi_view","B2C KPI 메뉴"],
  ["kpi_manage","B2C KPI 평가"],
  ["kpi_export","B2C KPI 엑셀"],
  ["employees_manage","직원관리"],
  ["permissions_manage","권한관리"]
];

const BASIC_PERMISSIONS=new Set([
  "dashboard_view",
  "notices_view",
  "organization_view",
  "community_view",
  "private_messages_use",
  "calendar_use"
]);

window.goPage = goPage; window.toggle = toggle;

function showApp(){
  $("loginView").classList.add("hidden"); $("appView").classList.remove("hidden");
  $("userName").textContent=state.profile?.name||"직원";
  $("userMeta").textContent=[state.profile?.department,state.profile?.position].filter(Boolean).join(" · ")||"서린컴퍼니";
  $("avatar").textContent=(state.profile?.name||"직").slice(0,1);
  renderMenu(); goPage("dashboard"); refreshAll();
}
function renderMenu(){
  $("menu").innerHTML=menus.filter(m=>has(m[2])).map(([id,label])=>`<button class="nav-btn" data-page="${id}" onclick="goPage('${id}')">${label}</button>`).join("");
}
function goPage(id){
  if(id==="kpi"&&!has("kpi_manage")){
    toast("B2C KPI는 관리자만 볼 수 있습니다.");
    return;
  }
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  $(`${id}Page`)?.classList.add("active");
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.page===id));
  $("pageTitle").textContent=pageInfo[id]?.[0]||id; $("pageSub").textContent=pageInfo[id]?.[1]||"";
  if(id==="permissions") renderPermissions();
}

function openSignup(){$("signupForm").classList.remove("hidden");$("signupMsg").textContent="";}
function closeSignup(){$("signupForm").classList.add("hidden");}
async function signup(){
  if(!configured){
    $("signupMsg").textContent="Supabase 연결 설정을 확인하세요.";
    return;
  }

  const empNo=$("signupEmpNo").value.trim();
  const name=$("signupName").value.trim();
  const password=$("signupPassword").value;
  const password2=$("signupPassword2").value;

  if(!empNo||!name||!password){
    $("signupMsg").textContent="사원번호, 이름, 비밀번호를 모두 입력하세요.";
    return;
  }
  if(!/^[A-Za-z0-9._-]+$/.test(empNo)){
    $("signupMsg").textContent="사원번호에는 숫자·영문·하이픈만 사용할 수 있습니다.";
    return;
  }
  if(password.length<6){
    $("signupMsg").textContent="비밀번호는 6자 이상이어야 합니다.";
    return;
  }
  if(password!==password2){
    $("signupMsg").textContent="비밀번호가 서로 다릅니다.";
    return;
  }

  $("signupMsg").textContent="사원정보 확인 중...";

  const {data:check,error:checkError}=await supabaseClient.rpc(
    "check_employee_signup",
    {p_emp_no:empNo,p_name:name}
  );

  if(checkError){
    $("signupMsg").textContent="가입 확인 실패: "+checkError.message;
    return;
  }
  if(!check?.allowed){
    $("signupMsg").textContent=check?.message||"등록되지 않은 사원번호 또는 이름입니다.";
    return;
  }

  const internalEmail=employeeLoginEmail(empNo);
  $("signupMsg").textContent="가입 처리 중...";

  const {error}=await supabaseClient.auth.signUp({
    email:internalEmail,
    password,
    options:{data:{emp_no:empNo,name}}
  });

  if(error){
    $("signupMsg").textContent="가입 실패: "+error.message;
    return;
  }

  $("signupMsg").textContent="가입이 완료되었습니다. 사원번호로 로그인하세요.";
  $("loginEmpNo").value=empNo;
  $("signupPassword").value="";
  $("signupPassword2").value="";
}
async function login(){
  const empNo=$("loginEmpNo").value.trim();
  const password=$("loginPassword").value;

  if(!configured){
    $("loginMsg").textContent="Supabase 연결 설정을 확인하세요.";
    return;
  }
  if(!empNo||!password){
    $("loginMsg").textContent="사원번호와 비밀번호를 입력하세요.";
    return;
  }

  $("loginMsg").textContent="로그인 중...";

  const normalized=empNo.toLowerCase();
  const candidates=[
    employeeLoginEmail(empNo),
    `${normalized}@seorin-portal.com`,
    `${normalized}@seorin.local`,
    `${normalized}@${C.EMPLOYEE_EMAIL_DOMAIN||"seorin.local"}`
  ].filter((v,i,a)=>v&&a.indexOf(v)===i);

  let lastError=null;
  for(const email of candidates){
    const {data,error}=await supabaseClient.auth.signInWithPassword({email,password});
    if(!error){
      state.user=data.user;
      await loadProfile();
      $("loginMsg").textContent="";
      showApp();
      return;
    }
    lastError=error;
  }

  $("loginMsg").textContent="로그인 실패: 사원번호 또는 비밀번호를 확인하세요.";
  console.error(lastError);
}
async function loadProfile(){
  const {data:profile,error}=await supabaseClient.from("profiles").select("*").eq("id",state.user.id).single();
  if(error) throw error;
  state.profile=profile;
  const {data:permissions}=await supabaseClient.from("user_permissions").select("*").eq("user_id",state.user.id).maybeSingle();
  state.permissions=permissions||{};
}
async function logout(){if(supabaseClient)await supabaseClient.auth.signOut();location.reload()}

async function refreshAll(){
  await Promise.all([loadCards(),loadItems(),loadNotices(),loadEmployees(),loadEmployeeRegistry(),loadOrgTeams(),loadPrivateMessages(),loadMessengerRooms(),loadChatMessages(),loadCalendarEntries(),loadContractorWorkforce(),loadCompanyEvents(),loadMeetingBookings(),loadVehicles(),loadVehicleTrips(),loadVehicleMaintenance(),loadLeaveAdjustments(),loadPurchaseRequests()]);
  renderDashboard(); renderCards(); renderInventory(); renderNotices(); renderEmployees(); renderEmployeeRegistry(); renderOrg(); renderOrgManagement(); renderPrivate(); renderMessengerRooms(); renderChat(); setupChatRealtime(); renderCalendar(); renderContractors(); renderCompanyEvents(); renderMeetings(); renderVehicles(); renderPurchases(); renderMyProfile();
}
async function loadCards(){
  if(!has("card_use"))return;
  let q=supabaseClient.from("corporate_card_expenses").select("*").order("used_date",{ascending:false}).limit(500);
  const {data,error}=await q;if(!error)state.cards=data||[];
}
async function loadItems(){
  if(!has("inventory_view"))return;
  const {data,error}=await supabaseClient.from("inventory_items").select("*").order("name");
  if(!error)state.items=data||[];
}
async function loadPurchaseRequests(){
  if(!has("purchase_view"))return;
  const {data,error}=await supabaseClient
    .from("purchase_requests")
    .select("*")
    .order("created_at",{ascending:false})
    .limit(500);
  if(error){
    console.error("purchase_requests load error",error);
    if($("purchaseTable"))$("purchaseTable").innerHTML=`<div class="empty">구매관리 SQL을 먼저 실행하세요.<br>${escapeHtml(error.message)}</div>`;
    return;
  }
  state.purchaseRequests=data||[];
}
async function loadNotices(){
  if(!has("notices_view"))return;
  const {data,error}=await supabaseClient.from("notices").select("*").order("created_at",{ascending:false}).limit(100);
  if(!error)state.notices=data||[];
}
async function loadEmployees(){
  if(!has("organization_view")&&!has("employees_manage")&&!has("permissions_manage"))return;
  const {data,error}=await supabaseClient.from("profiles").select("*").eq("is_active",true).order("sort_order").order("name");
  if(!error)state.employees=data||[];
}

async function loadEmployeeRegistry(){
  if(!has("organization_view")&&!has("employees_manage")&&!has("permissions_manage"))return;
  const {data,error}=await supabaseClient
    .from("employee_registry")
    .select("*")
    .eq("is_active",true)
    .order("team")
    .order("sort_order")
    .order("name");
  if(error){
    console.error("employee_registry load error",error);
    toast("직원 명부를 불러오지 못했습니다: "+error.message);
    return;
  }
  state.employeeRegistry=data||[];
}
async function loadCalendarEntries(){
  if(!has("calendar_use"))return;
  const {data,error}=await supabaseClient.from("work_calendar_entries")
    .select("*,profiles!work_calendar_entries_employee_id_fkey(name,team,position,annual_leave_granted)")
    .order("start_date",{ascending:true});
  if(!error)state.calendarEntries=data||[];
}


async function loadContractorWorkforce(){
  if(!has("dashboard_view")&&!has("calendar_manage"))return;
  const start=new Date();
  start.setMonth(start.getMonth()-2,1);
  const end=new Date();
  end.setMonth(end.getMonth()+3,0);
  const {data,error}=await supabaseClient
    .from("contractor_workforce")
    .select("*")
    .gte("work_date",start.toISOString().slice(0,10))
    .lte("work_date",end.toISOString().slice(0,10))
    .order("work_date",{ascending:false})
    .order("company_name");
  if(error){
    console.warn("외주 인력 조회 실패",error);
    state.contractorWorkforce=[];
    return;
  }
  state.contractorWorkforce=data||[];
}

function activeEmployeeList(){
  return (state.employees||[]).filter(e=>e.is_active!==false);
}

function employeeLunchCountForDate(date){
  const active=activeEmployeeList();
  const absentTypes=new Set(["off","annual","comp_used"]);
  let absent=0;
  for(const emp of active){
    const isAbsent=state.calendarEntries.some(x=>
      x.employee_id===emp.id &&
      date>=x.start_date &&
      date<=x.end_date &&
      absentTypes.has(x.event_type)
    );
    if(isAbsent)absent++;
  }
  return Math.max(0,active.length-absent);
}

function contractorTotalsForDate(date){
  const rows=(state.contractorWorkforce||[]).filter(x=>x.work_date===date);
  return {
    rows,
    headcount:rows.reduce((sum,x)=>sum+Number(x.headcount||0),0),
    meals:rows.reduce((sum,x)=>sum+Number(x.meal_count||0),0)
  };
}

function todayLunchStats(date=new Date().toISOString().slice(0,10)){
  const internal=employeeLunchCountForDate(date);
  const ext=contractorTotalsForDate(date);
  return {
    date,
    internal,
    externalWorkers:ext.headcount,
    externalMeals:ext.meals,
    total:internal+ext.meals,
    externalRows:ext.rows
  };
}

async function loadLeaveAdjustments(){
  if(!has("employees_manage")&&!has("calendar_manage"))return;
  const {data,error}=await supabaseClient.rpc("admin_leave_adjustment_list");
  if(error){
    console.warn("V42 연차·대휴 이력 조회 실패",error);
    state.leaveAdjustments=[];
    return;
  }
  state.leaveAdjustments=data||[];
}

function employeeLeaveStats(employeeId,grantedOverride=null){
  const emp=state.employees.find(x=>x.id===employeeId);
  const granted=grantedOverride===null?Number(emp?.annual_leave_granted||0):Number(grantedOverride||0);
  const entries=state.calendarEntries.filter(x=>x.employee_id===employeeId);
  const annualUsed=entries.filter(x=>["annual","half","quarter"].includes(x.event_type)).reduce((a,x)=>a+Number(x.days||0),0);
  const weekendCredit=entries.filter(x=>x.event_type==="weekend_work").reduce((a,x)=>a+Number(x.days||0)*1.5,0);
  const compUsed=entries.filter(x=>x.event_type==="comp_used").reduce((a,x)=>a+Number(x.days||0),0);
  const adjustments=state.leaveAdjustments.filter(x=>x.employee_id===employeeId);
  const annualAdjustment=adjustments.filter(x=>x.leave_type==="annual").reduce((a,x)=>a+Number(x.amount||0),0);
  const compAdjustment=adjustments.filter(x=>x.leave_type==="comp").reduce((a,x)=>a+Number(x.amount||0),0);
  return {
    granted,annualUsed,annualAdjustment,
    annualBalance:granted+annualAdjustment-annualUsed,
    weekendCredit,compUsed,compAdjustment,
    compGranted:weekendCredit+compAdjustment,
    compBalance:weekendCredit+compAdjustment-compUsed
  };
}


async function loadOrgTeams(){
  if(!has("organization_view"))return;
  const {data,error}=await supabaseClient.from("organization_teams").select("*").order("sort_order").order("name");
  if(!error)state.orgTeams=data||[];
}

async function loadPrivateMessages(){
  if(!has("private_messages_use"))return;
  const {data,error}=await supabaseClient.from("private_messages").select("*").order("created_at",{ascending:false}).limit(100);
  if(!error)state.privateMessages=data||[];
}


async function loadMessengerRooms(){
  if(!has("community_view"))return;
  const {data,error}=await supabaseClient.rpc("messenger_my_rooms");
  if(error){
    console.warn("V41 메신저 방 조회 실패",error);
    state.messengerRooms=[];
    return;
  }
  state.messengerRooms=data||[];
  const selected=state.selectedMessengerRoom;
  if(selected!=="global"&&!state.messengerRooms.some(x=>x.room_id===selected)){
    state.selectedMessengerRoom="global";
  }
}

async function loadChatMessages(){
  if(!has("community_view"))return;
  if((state.selectedMessengerRoom||"global")==="global"){
    const {data,error}=await supabaseClient
      .from("chat_messages")
      .select("id,content,created_at,sender_id,profiles!chat_messages_sender_id_fkey(name,team,position)")
      .order("created_at",{ascending:true})
      .limit(300);
    if(!error)state.chatMessages=data||[];
    return;
  }

  const {data,error}=await supabaseClient
    .from("messenger_messages")
    .select("id,room_id,content,created_at,sender_id,profiles!messenger_messages_sender_id_fkey(name,team,position)")
    .eq("room_id",state.selectedMessengerRoom)
    .order("created_at",{ascending:true})
    .limit(500);
  if(error){
    toast("대화 내용을 불러오지 못했습니다: "+error.message);
    state.chatMessages=[];
    return;
  }
  state.chatMessages=data||[];
  await supabaseClient.rpc("messenger_mark_read",{p_room_id:state.selectedMessengerRoom});
}

function currentMessengerRoom(){
  return state.messengerRooms.find(x=>x.room_id===state.selectedMessengerRoom)||null;
}
function formatChatTime(value){
  const d=new Date(value);
  return d.toLocaleString("ko-KR",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"});
}
function renderMessengerRooms(){
  const list=$("messengerRoomList");
  if(!list)return;
  const selected=state.selectedMessengerRoom||"global";
  const globalButton=`<button class="chat-room ${selected==="global"?"active":""}" data-room-id="global">
    <b>📢 전체 소통방</b>
    <small>모든 직원이 함께 대화합니다.</small>
  </button>`;
  const rooms=state.messengerRooms.map(r=>{
    const isDirect=r.room_type==="direct";
    const unread=Number(r.unread_count||0);
    return `<button class="chat-room ${selected===r.room_id?"active":""}" data-room-id="${r.room_id}">
      <b class="messenger-room-meta"><span>${isDirect?"👤":"👥"} ${escapeHtml(r.display_name||"대화방")}</span>${unread?`<span class="messenger-unread">${unread>99?"99+":unread}</span>`:""}</b>
      <small>${r.member_count||0}명 · ${r.last_message?escapeHtml(String(r.last_message).slice(0,34)):"새 대화방"}</small>
    </button>`;
  }).join("");
  list.innerHTML=globalButton+rooms;
  list.querySelectorAll("[data-room-id]").forEach(btn=>{
    btn.onclick=()=>selectMessengerRoom(btn.dataset.roomId);
  });
  updateMessengerHeader();
}
function updateMessengerHeader(){
  const room=currentMessengerRoom();
  const global=(state.selectedMessengerRoom||"global")==="global";
  $("messengerRoomTitle").textContent=global?"전체 소통방":(room?.display_name||"메신저");
  $("messengerRoomSubtitle").textContent=global?"업무 공유, 질문, 자유로운 대화":
    `${room?.room_type==="direct"?"1:1 대화":"그룹 대화"} · ${room?.member_count||0}명 참여`;
  $("messengerMembersBtn").classList.toggle("hidden",global);
}
async function selectMessengerRoom(roomId){
  state.selectedMessengerRoom=roomId||"global";
  renderMessengerRooms();
  $("chatMessages").innerHTML=`<div class="empty">메시지를 불러오는 중입니다.</div>`;
  await loadChatMessages();
  renderChat();
}
function renderChat(){
  const box=$("chatMessages");
  if(!box)return;
  if(!state.chatMessages.length){
    box.innerHTML=`<div class="empty">첫 메시지를 남겨보세요.</div>`;
    return;
  }
  box.innerHTML=state.chatMessages.map(m=>{
    const mine=m.sender_id===state.user?.id;
    const p=m.profiles||{};
    return `<div class="chat-line ${mine?"mine":""}">
      <div class="chat-avatar">${escapeHtml((p.name||"?").slice(0,1))}</div>
      <div class="chat-bubble-wrap">
        <div class="chat-meta">
          <b>${escapeHtml(p.name||"직원")}</b>
          <span>${escapeHtml([p.team,p.position].filter(Boolean).join(" · "))}</span>
          <time>${formatChatTime(m.created_at)}</time>
        </div>
        <div class="chat-bubble">${escapeHtml(m.content).replace(/\n/g,"<br>")}</div>
      </div>
    </div>`;
  }).join("");
  box.scrollTop=box.scrollHeight;
}
async function sendChat(){
  const content=$("chatInput").value.trim();
  if(!content)return;
  if(content.length>2000){toast("메시지는 2000자까지 입력할 수 있습니다.");return}
  $("sendChatBtn").disabled=true;
  let error;
  if((state.selectedMessengerRoom||"global")==="global"){
    ({error}=await supabaseClient.from("chat_messages").insert({sender_id:state.user.id,content}));
  }else{
    ({error}=await supabaseClient.from("messenger_messages").insert({
      room_id:state.selectedMessengerRoom,
      sender_id:state.user.id,
      content
    }));
  }
  $("sendChatBtn").disabled=false;
  if(error){toast("메시지 전송 실패: "+error.message);return}
  $("chatInput").value="";
  await Promise.all([loadChatMessages(),loadMessengerRooms()]);
  renderMessengerRooms();
  renderChat();
}
function setupChatRealtime(){
  if(!has("community_view")||state.chatChannel)return;
  const channel=supabaseClient
    .channel("seorin-messenger-v41")
    .on("postgres_changes",{event:"INSERT",schema:"public",table:"chat_messages"},async payload=>{
      if((state.selectedMessengerRoom||"global")==="global"){
        await loadChatMessages();renderChat();
      }
    })
    .on("postgres_changes",{event:"INSERT",schema:"public",table:"messenger_messages"},async payload=>{
      await loadMessengerRooms();
      renderMessengerRooms();
      if(payload.new?.room_id===state.selectedMessengerRoom){
        await loadChatMessages();renderChat();
      }
    })
    .subscribe(status=>{
      const el=$("chatConnectionText");
      if(el)el.textContent=status==="SUBSCRIBED"?"실시간 연결됨":"연결 중";
    });
  state.chatChannel=channel;
}

function openMessengerRoomModal(){
  $("messengerRoomModal").classList.remove("hidden");
  $("messengerRoomType").value="direct";
  $("messengerRoomName").value="";
  $("messengerEmployeeSearch").value="";
  renderMessengerEmployeePicker();
  updateMessengerRoomType();
}
function closeMessengerRoomModal(){$("messengerRoomModal").classList.add("hidden")}
function updateMessengerRoomType(){
  const group=$("messengerRoomType").value==="group";
  $("messengerRoomNameWrap").classList.toggle("hidden",!group);
  document.querySelectorAll("[name='messengerEmployee']").forEach(x=>x.checked=false);
  renderMessengerEmployeePicker();
}
function messengerAvailableEmployees(){
  return (state.employees||[])
    .filter(x=>x.id!==state.user?.id&&x.is_active!==false)
    .sort((a,b)=>String(a.name||"").localeCompare(String(b.name||""),"ko"));
}
function renderMessengerEmployeePicker(){
  const box=$("messengerEmployeePicker");
  if(!box)return;
  const q=($("messengerEmployeeSearch")?.value||"").trim().toLowerCase();
  const type=$("messengerRoomType")?.value||"direct";
  const oldSelected=new Set([...document.querySelectorAll("[name='messengerEmployee']:checked")].map(x=>x.value));
  const rows=messengerAvailableEmployees().filter(e=>
    !q||[e.name,e.team,e.department,e.position,e.emp_no].some(v=>String(v||"").toLowerCase().includes(q))
  );
  box.innerHTML=rows.map(e=>`<label class="messenger-employee-row">
    <input type="${type==="direct"?"radio":"checkbox"}" name="messengerEmployee" value="${e.id}" ${oldSelected.has(e.id)?"checked":""}>
    <span class="messenger-employee-avatar">${escapeHtml((e.name||"?").slice(0,1))}</span>
    <span class="messenger-employee-info"><b>${escapeHtml(e.name||"직원")}</b><small>${escapeHtml([e.team||e.department,e.position,e.emp_no].filter(Boolean).join(" · "))}</small></span>
  </label>`).join("")||`<div class="empty">검색된 직원이 없습니다.</div>`;
  box.querySelectorAll("[name='messengerEmployee']").forEach(x=>x.onchange=()=>{
    updateMessengerSelectedCount();
  });
  updateMessengerSelectedCount();
}
function updateMessengerSelectedCount(){
  const n=document.querySelectorAll("[name='messengerEmployee']:checked").length;
  $("messengerSelectedCount").textContent=`${n}명 선택`;
}
async function createMessengerRoom(){
  const type=$("messengerRoomType").value;
  const ids=[...document.querySelectorAll("[name='messengerEmployee']:checked")].map(x=>x.value);
  if(type==="direct"&&ids.length!==1){toast("1:1 대화할 직원 한 명을 선택하세요.");return}
  if(type==="group"&&ids.length<1){toast("그룹 대화에 참여할 직원을 선택하세요.");return}
  const name=type==="group"?$("messengerRoomName").value.trim():"";
  if(type==="group"&&!name){toast("그룹 대화방 이름을 입력하세요.");return}
  $("createMessengerRoomBtn").disabled=true;
  const {data,error}=await supabaseClient.rpc("messenger_create_room",{
    p_room_type:type,
    p_title:name||null,
    p_member_ids:ids
  });
  $("createMessengerRoomBtn").disabled=false;
  if(error){toast("대화방 생성 실패: "+error.message);return}
  closeMessengerRoomModal();
  await loadMessengerRooms();
  state.selectedMessengerRoom=data;
  renderMessengerRooms();
  await loadChatMessages();
  renderChat();
  toast(type==="direct"?"1:1 대화를 시작했습니다.":"그룹 대화방을 만들었습니다.");
}
async function showMessengerMembers(){
  if((state.selectedMessengerRoom||"global")==="global")return;
  const {data,error}=await supabaseClient.rpc("messenger_room_members",{p_room_id:state.selectedMessengerRoom});
  if(error){toast("참여자를 불러오지 못했습니다.");return}
  $("messengerMembersList").innerHTML=(data||[]).map(e=>`<div class="list-item"><b>${escapeHtml(e.name||"직원")}</b><small>${escapeHtml([e.team,e.position,e.emp_no].filter(Boolean).join(" · "))}</small></div>`).join("");
  $("messengerMembersModal").classList.remove("hidden");
}


const calendarLabels={off:"휴무",annual:"연차",half:"반차",quarter:"반반차",weekend_work:"주말근무",comp_used:"대체휴일 사용",other:"기타"};
function monthKey(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`}
function formatDays(v){return Number(v||0).toLocaleString("ko-KR",{maximumFractionDigits:2})}
function renderCalendarEmployeeFilter(){
  const sel=$("calendarEmployeeFilter");
  const wrap=$("calendarEmployeeFilterWrap");
  if(!sel)return;

  const canManage=has("calendar_manage");
  const old=sel.value;

  if(canManage){
    wrap?.classList.remove("hidden");
    const options=[
      `<option value="all">전체 직원</option>`,
      ...state.employees.map(e=>`<option value="${e.id}">${escapeHtml(e.name)} · ${escapeHtml(e.team||"")} · ${escapeHtml(e.position||"")}</option>`)
    ];
    sel.innerHTML=options.join("");
    sel.value=[...sel.options].some(o=>o.value===old)?old:"all";
  }else{
    sel.innerHTML=`<option value="${state.user.id}">내 일정</option>`;
    sel.value=state.user.id;
    wrap?.classList.add("hidden");
  }

  const target=$("calendarTargetEmployee");
  const targetRow=$("calendarTargetRow");
  if(target){
    if(canManage){
      targetRow?.classList.remove("hidden");
      target.innerHTML=state.employees.map(e=>`<option value="${e.id}">${escapeHtml(e.name)} · ${escapeHtml(e.team||"")}</option>`).join("");
      const selected=sel.value==="all"?state.user.id:sel.value;
      if([...target.options].some(o=>o.value===selected))target.value=selected;
    }else{
      target.innerHTML=`<option value="${state.user.id}">${escapeHtml(state.profile?.name||"내 일정")}</option>`;
      target.value=state.user.id;
      targetRow?.classList.add("hidden");
    }
  }

  const btn=$("openCalendarFormBtn");
  if(btn)btn.textContent=canManage?"직원 일정 등록":"내 일정 등록";
}
function visibleCalendarEntries(){
  const filter=$("calendarEmployeeFilter")?.value||state.user?.id;
  return state.calendarEntries.filter(x=>filter==="all"||x.employee_id===filter);
}
function renderCalendar(){
  if(!$("workCalendar")||!has("calendar_use"))return;

  renderCalendarEmployeeFilter();

  const d=state.calendarDate;
  const first=new Date(d.getFullYear(),d.getMonth(),1);
  const last=new Date(d.getFullYear(),d.getMonth()+1,0);
  $("calendarTitle").textContent=`${d.getFullYear()}년 ${d.getMonth()+1}월 근무·휴무 달력`;

  const filter=$("calendarEmployeeFilter")?.value||state.user.id;
  const entries=visibleCalendarEntries();

  let html=`<div class="calendar-week">${["일","월","화","수","목","금","토"].map((w,i)=>`<div class="${i===0?"sun":i===6?"sat":""}">${w}</div>`).join("")}</div><div class="calendar-grid">`;

  for(let i=0;i<first.getDay();i++){
    html+=`<div class="calendar-cell muted"></div>`;
  }

  for(let day=1;day<=last.getDate();day++){
    const date=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    const dayEntries=entries
      .filter(x=>date>=x.start_date&&date<=x.end_date)
      .sort((a,b)=>String(a.profiles?.name||"").localeCompare(String(b.profiles?.name||""),"ko"));
    const contractorDay=contractorTotalsForDate(date);

    html+=`<div class="calendar-cell">
      <div class="calendar-day">${day}</div>
      <div class="calendar-events">
        ${dayEntries.map(x=>{
          const showName=filter==="all";
          return `<div class="calendar-event type-${x.event_type}" title="${escapeHtml(x.memo||"")}">
            ${showName?`<b>${escapeHtml(x.profiles?.name||"직원")}</b> · `:""}${calendarLabels[x.event_type]||x.event_type}
            <span>${formatDays(x.days)}일</span>
          </div>`;
        }).join("")}
        ${has("calendar_manage")&&contractorDay.headcount?`<div class="calendar-event contractor-event"><b>외주 ${contractorDay.headcount}명</b> · 식사 ${contractorDay.meals}명</div>`:""}
        ${(state.companyEvents||[]).filter(e=>date>=e.start_date&&date<=e.end_date).map(e=>`<div class="calendar-event company-event"><b>${eventTypeLabel(e.event_type)}</b> · ${escapeHtml(e.title)}</div>`).join("")}
        ${(state.meetingBookings||[]).filter(m=>m.meeting_date===date).map(m=>`<div class="calendar-event meeting-event"><b>${String(m.start_time).slice(0,5)} 회의</b> · ${escapeHtml(m.title)}</div>`).join("")}
      </div>
    </div>`;
  }

  $("workCalendar").innerHTML=html+`</div>`;

  // 전체 직원 선택 시 요약카드는 전체 합계, 개인 선택 시 해당 직원 잔액
  if(filter==="all"&&has("calendar_manage")){
    const annualGrantedTotal=state.employees.reduce((sum,e)=>sum+Number(e.annual_leave_granted||0),0);
    const annualUsedTotal=entries.filter(x=>["annual","half","quarter"].includes(x.event_type)).reduce((a,x)=>a+Number(x.days||0),0);
    const weekendCreditTotal=entries.filter(x=>x.event_type==="weekend_work").reduce((a,x)=>a+Number(x.days||0)*1.5,0);
    const compUsedTotal=entries.filter(x=>x.event_type==="comp_used").reduce((a,x)=>a+Number(x.days||0),0);

    $("annualGranted").textContent=formatDays(annualGrantedTotal)+"일";
    $("annualUsed").textContent=formatDays(annualUsedTotal)+"일";
    $("annualBalance").textContent=formatDays(annualGrantedTotal-annualUsedTotal)+"일";
    $("weekendCredit").textContent=formatDays(weekendCreditTotal)+"일";
    $("compUsed").textContent=formatDays(compUsedTotal)+"일";
    $("compBalance").textContent=formatDays(weekendCreditTotal-compUsedTotal)+"일";
  }else{
    const selectedId=filter==="all"?state.user.id:filter;
    const mine=state.calendarEntries.filter(x=>x.employee_id===selectedId);
    const employee=state.employees.find(e=>e.id===selectedId)||state.profile;
    const granted=Number(employee?.annual_leave_granted||0);
    const annualUsed=mine.filter(x=>["annual","half","quarter"].includes(x.event_type)).reduce((a,x)=>a+Number(x.days||0),0);
    const weekendCredit=mine.filter(x=>x.event_type==="weekend_work").reduce((a,x)=>a+Number(x.days||0)*1.5,0);
    const compUsed=mine.filter(x=>x.event_type==="comp_used").reduce((a,x)=>a+Number(x.days||0),0);

    $("annualGranted").textContent=formatDays(granted)+"일";
    $("annualUsed").textContent=formatDays(annualUsed)+"일";
    $("annualBalance").textContent=formatDays(granted-annualUsed)+"일";
    $("weekendCredit").textContent=formatDays(weekendCredit)+"일";
    $("compUsed").textContent=formatDays(compUsed)+"일";
    $("compBalance").textContent=formatDays(weekendCredit-compUsed)+"일";
  }

  $("calendarHistory").innerHTML=table(
    ["직원","시작일","종료일","구분","입력일수","환산/차감","메모"],
    entries.slice().reverse().map(x=>[
      x.profiles?.name||state.profile?.name||"",
      x.start_date,
      x.end_date,
      calendarLabels[x.event_type]||x.event_type,
      formatDays(x.days),
      x.event_type==="weekend_work"?formatDays(Number(x.days)*1.5)+"일 적립":formatDays(x.days)+"일",
      x.memo
    ])
  );
}
async function saveCalendarEntry(){
  const type=$("calType").value;
  let days=Number($("calDays").value||1);
  if(type==="annual")days=1;
  if(type==="half")days=0.5;
  if(type==="quarter")days=0.25;

  const canManage=has("calendar_manage");
  const targetEmployeeId=canManage
    ? ($("calendarTargetEmployee")?.value||state.user.id)
    : state.user.id;

  const row={
    employee_id:targetEmployeeId,
    event_type:type,
    start_date:$("calStart").value,
    end_date:$("calEnd").value||$("calStart").value,
    days,
    memo:$("calMemo").value.trim(),
    created_by:state.user.id
  };

  if(!row.start_date){toast("시작일을 입력하세요.");return}
  if(row.end_date<row.start_date){toast("종료일을 확인하세요.");return}

  const targetEntries=state.calendarEntries.filter(x=>x.employee_id===targetEmployeeId);
  const targetEmployee=state.employees.find(e=>e.id===targetEmployeeId)||state.profile;

  if(["annual","half","quarter"].includes(type)){
    const used=targetEntries.filter(x=>["annual","half","quarter"].includes(x.event_type)).reduce((a,x)=>a+Number(x.days||0),0);
    const granted=Number(targetEmployee?.annual_leave_granted||0);
    if(used+days>granted){
      toast(`연차 잔여가 부족합니다. 현재 잔여 ${formatDays(granted-used)}일`);
      return;
    }
  }

  if(type==="comp_used"){
    const earned=targetEntries.filter(x=>x.event_type==="weekend_work").reduce((a,x)=>a+Number(x.days||0)*1.5,0);
    const used=targetEntries.filter(x=>x.event_type==="comp_used").reduce((a,x)=>a+Number(x.days||0),0);
    if(used+days>earned){
      toast(`대체휴일 잔여가 부족합니다. 현재 잔여 ${formatDays(earned-used)}일`);
      return;
    }
  }

  const {error}=await supabaseClient.from("work_calendar_entries").insert(row);
  if(error){
    toast("일정 저장 실패: "+error.message);
    return;
  }

  const targetName=targetEmployee?.name||"직원";
  toast(type==="weekend_work"
    ? `${targetName} 주말근무 ${formatDays(days)}일, 대체휴일 ${formatDays(days*1.5)}일 적립`
    : `${targetName} 일정을 저장했습니다.`);

  $("calendarForm").classList.add("hidden");
  await loadCalendarEntries();

  if(canManage&&$("calendarEmployeeFilter")){
    $("calendarEmployeeFilter").value="all";
  }
  renderCalendar();
}
function moveCalendarMonth(delta){state.calendarDate=new Date(state.calendarDate.getFullYear(),state.calendarDate.getMonth()+delta,1);renderCalendar()}
function renderMyProfile(){
  if(!$("myProfileCard")||!state.profile)return;
  $("myProfileCard").innerHTML=`<table><tbody>
    <tr><th>사원번호</th><td>${escapeHtml(state.profile.emp_no||"")}</td></tr>
    <tr><th>이름</th><td>${escapeHtml(state.profile.name||"")}</td></tr>
    <tr><th>팀</th><td>${escapeHtml(state.profile.team||"")}</td></tr>
    <tr><th>직급</th><td>${escapeHtml(state.profile.position||"")}</td></tr>
    <tr><th>연차 부여</th><td>${formatDays(state.profile.annual_leave_granted||0)}일</td></tr>
  </tbody></table>`;
}
async function changePassword(){
  const current=$("currentPassword").value;
  const newPw=$("newPassword").value;
  const newPw2=$("newPassword2").value;

  if(!current||!newPw){
    toast("현재 비밀번호와 새 비밀번호를 입력하세요.");
    return;
  }
  if(newPw.length<6){
    toast("새 비밀번호는 6자 이상이어야 합니다.");
    return;
  }
  if(newPw!==newPw2){
    toast("새 비밀번호 확인이 일치하지 않습니다.");
    return;
  }

  const empNo=String(state.profile.emp_no||"").trim();
  const normalized=empNo.toLowerCase();
  const candidates=[
    employeeLoginEmail(empNo),
    `${normalized}@seorin-portal.com`,
    `${normalized}@seorin.local`,
    `${normalized}@${C.EMPLOYEE_EMAIL_DOMAIN||"seorin.local"}`
  ].filter((v,i,a)=>v&&a.indexOf(v)===i);

  let verified=false;
  for(const email of candidates){
    const {error}=await supabaseClient.auth.signInWithPassword({email,password:current});
    if(!error){
      verified=true;
      break;
    }
  }

  if(!verified){
    toast("현재 비밀번호가 맞지 않습니다.");
    return;
  }

  const {error}=await supabaseClient.auth.updateUser({password:newPw});
  if(error){
    toast("비밀번호 변경 실패: "+error.message);
    return;
  }

  $("currentPassword").value="";
  $("newPassword").value="";
  $("newPassword2").value="";
  toast("비밀번호를 변경했습니다.");
}
function renderDashboard(){
  const now=new Date(), ym=now.toISOString().slice(0,7);
  const monthCards=state.cards.filter(x=>String(x.used_date||"").startsWith(ym));
  $("cardTotal").textContent=money(monthCards.reduce((a,x)=>a+Number(x.amount||0),0));
  $("cardCount").textContent=`${monthCards.length}건`;
  $("missingReceipt").textContent=`${monthCards.filter(x=>x.receipt_status==="미첨부").length}건`;
  const lunch=todayLunchStats(isoDateOffset(1));
  $("lunchTotal").textContent=`${lunch.total}명`;
  $("lunchBreakdown").textContent=`직원 ${lunch.internal}명 + 외주 ${lunch.externalMeals}명`;
  const purchasePending=getDashboardPurchaseItems();
  $("pendingPurchase").textContent=`${purchasePending.length}건`;
  $("privatePending").textContent=`${state.privateMessages.filter(x=>!x.is_answered).length}건`; $("kpiDone").textContent="0명";
  renderDashboardPurchases();
  renderCardChart(); renderRecentCards();
  $("recentNotices").innerHTML=state.notices.slice(0,5).map(n=>`<div class="list-item"><b>${escapeHtml(n.title)}</b><small>${new Date(n.created_at).toLocaleDateString("ko-KR")}</small></div>`).join("")||`<div class="empty">공지 없음</div>`;
  $("lunchDashboardDetail").innerHTML=`
    <div class="lunch-total-box">
      <span>오늘 주문 권장 수량</span><b>${lunch.total}개</b>
    </div>
    <div class="lunch-split">
      <div><span>직원 출근·식사</span><b>${lunch.internal}명</b></div>
      <div><span>외주 출근</span><b>${lunch.externalWorkers}명</b></div>
      <div><span>외주 식사</span><b>${lunch.externalMeals}명</b></div>
    </div>
    ${lunch.externalRows.length?`<div class="lunch-company-list">${lunch.externalRows.map(x=>`<div><b>${escapeHtml(x.company_name)}</b><span>출근 ${x.headcount}명 · 식사 ${x.meal_count}명</span></div>`).join("")}</div>`:`<div class="empty">내일 등록된 외주 인력이 없습니다.</div>`}
  `;

  renderDashboardSchedule();
  const kpiShortcut=$("dashboardKpiShortcut");
  if(kpiShortcut)kpiShortcut.classList.toggle("hidden",!has("kpi_manage"));
}


function selectedContractorDate(){
  return $("contractorWorkDate")?.value||new Date().toISOString().slice(0,10);
}

function clearContractorForm(){
  state.editingContractorId=null;
  $("contractorWorkDate").value=new Date().toISOString().slice(0,10);
  $("contractorCompany").value="";
  $("contractorWorkArea").value="";
  $("contractorHeadcount").value="0";
  $("contractorMealCount").value="0";
  $("contractorMemo").value="";
  $("saveContractorBtn").textContent="외주 인력 저장";
  renderContractorSummary();
}

function renderContractorSummary(){
  if(!$("contractorInternalMeals"))return;
  const date=selectedContractorDate();
  const stats=todayLunchStats(date);
  $("contractorInternalMeals").textContent=`${stats.internal}명`;
  $("contractorExternalWorkers").textContent=`${stats.externalWorkers}명`;
  $("contractorExternalMeals").textContent=`${stats.externalMeals}명`;
  $("contractorTotalMeals").textContent=`${stats.total}명`;
}

function renderContractors(){
  if(!$("contractorTable"))return;
  const month=$("contractorMonthFilter")?.value||new Date().toISOString().slice(0,7);
  const rows=(state.contractorWorkforce||[]).filter(x=>String(x.work_date||"").startsWith(month));
  $("contractorTable").innerHTML=tableHtml(
    ["근무일","업체명","작업 구역","출근","식사","메모","관리"],
    rows.map(x=>[
      x.work_date,
      x.company_name,
      x.work_area||"",
      `${x.headcount||0}명`,
      `${x.meal_count||0}명`,
      x.memo||"",
      `<div class="table-actions"><button class="btn small" onclick="editContractor('${x.id}')">수정</button><button class="btn small danger" onclick="deleteContractor('${x.id}')">삭제</button></div>`
    ])
  );
  renderContractorSummary();
}

async function saveContractor(){
  if(!has("calendar_manage")){toast("외주 인력관리는 달력 관리자만 사용할 수 있습니다.");return}
  const row={
    work_date:$("contractorWorkDate").value,
    company_name:$("contractorCompany").value.trim(),
    work_area:$("contractorWorkArea").value.trim(),
    headcount:Number($("contractorHeadcount").value||0),
    meal_count:Number($("contractorMealCount").value||0),
    memo:$("contractorMemo").value.trim(),
    created_by:state.user.id,
    updated_at:new Date().toISOString()
  };
  if(!row.work_date){toast("근무일을 선택하세요.");return}
  if(!row.company_name){toast("외주 업체명을 입력하세요.");return}
  if(row.headcount<0||row.meal_count<0){toast("인원은 0명 이상이어야 합니다.");return}
  if(row.meal_count>row.headcount){
    if(!confirm("식사 인원이 출근 인원보다 많습니다. 그대로 저장할까요?"))return;
  }

  let error;
  if(state.editingContractorId){
    ({error}=await supabaseClient.from("contractor_workforce").update(row).eq("id",state.editingContractorId));
  }else{
    ({error}=await supabaseClient.from("contractor_workforce").insert(row));
  }
  if(error){toast("외주 인력 저장 실패: "+error.message);return}
  toast(state.editingContractorId?"외주 인력 내역을 수정했습니다.":"외주 인력을 등록했습니다.");
  await loadContractorWorkforce();
  clearContractorForm();
  renderContractors();
  renderCalendar();
  renderDashboard();
}

window.editContractor=function(id){
  const x=state.contractorWorkforce.find(r=>r.id===id);
  if(!x)return;
  state.editingContractorId=id;
  $("contractorWorkDate").value=x.work_date;
  $("contractorCompany").value=x.company_name||"";
  $("contractorWorkArea").value=x.work_area||"";
  $("contractorHeadcount").value=x.headcount||0;
  $("contractorMealCount").value=x.meal_count||0;
  $("contractorMemo").value=x.memo||"";
  $("saveContractorBtn").textContent="외주 인력 수정 저장";
  renderContractorSummary();
  window.scrollTo({top:0,behavior:"smooth"});
};

window.deleteContractor=async function(id){
  if(!confirm("이 외주 인력 내역을 삭제할까요?"))return;
  const {error}=await supabaseClient.from("contractor_workforce").delete().eq("id",id);
  if(error){toast("삭제 실패: "+error.message);return}
  await loadContractorWorkforce();
  renderContractors();
  renderCalendar();
  renderDashboard();
  toast("외주 인력 내역을 삭제했습니다.");
};

function getDashboardPurchaseItems(){
  const all=state.purchaseRequests||[];
  if(isFinalPurchaseApprover()) return all.filter(x=>x.status==="review_complete");
  if(isPurchaseManager()) return all.filter(x=>["requested","reviewing","approved","ordered","received"].includes(x.status));
  const myId=state.user?.id;
  return all.filter(x=>x.requester_id===myId && !["completed","rejected"].includes(x.status));
}
function renderDashboardPurchases(){
  const panel=$("dashboardPurchasePanel");
  if(!panel)return;
  const canView=has("purchase_view");
  panel.classList.toggle("hidden",!canView);
  if(!canView)return;
  const items=getDashboardPurchaseItems();
  const title=$("dashboardPurchaseTitle"), guide=$("dashboardPurchaseGuide");
  if(isFinalPurchaseApprover()){
    title.textContent="구매 최종 승인 대기";
    guide.textContent="김헌정 검토가 끝난 구매 신청입니다. 승인 또는 반려가 필요합니다.";
  }else if(isPurchaseManager()){
    title.textContent="구매 처리 업무";
    guide.textContent="신청 검토부터 발주·입고·구매완료까지 처리할 항목입니다.";
  }else{
    title.textContent="내 구매 신청 진행 현황";
    guide.textContent="내가 신청한 구매 건의 현재 처리 상태입니다.";
  }
  const statusCounts={};
  items.forEach(x=>statusCounts[x.status]=(statusCounts[x.status]||0)+1);
  $("dashboardPurchaseSummary").innerHTML=Object.entries(statusCounts).length
    ? Object.entries(statusCounts).map(([status,count])=>`<button class="dashboard-status-chip" onclick="goPage('purchase')"><span>${purchaseStatusLabel(status)}</span><b>${count}건</b></button>`).join("")
    : `<div class="empty compact">현재 처리할 구매 건이 없습니다.</div>`;
  const shown=items.slice(0,6);
  $("dashboardPurchaseList").innerHTML=shown.length?`<div class="table-wrap"><table><thead><tr><th>신청일</th><th>신청자</th><th>품목</th><th>수량</th><th>희망일</th><th>상태</th><th>바로 처리</th></tr></thead><tbody>${shown.map(x=>`<tr class="${x.is_urgent?'urgent-row':''}">
    <td>${formatDateTime(x.created_at)}${x.is_urgent?'<br><span class="badge danger">긴급</span>':''}</td>
    <td>${escapeHtml(x.requester_name||"")}<br><small>${escapeHtml(x.requester_emp_no||"")}</small></td>
    <td><b>${escapeHtml(x.item_name||"")}</b></td>
    <td>${Number(x.quantity||0).toLocaleString("ko-KR")} ${escapeHtml(x.unit||"")}</td>
    <td>${escapeHtml(x.needed_date||"-")}</td>
    <td><span class="status-badge status-${escapeHtml(x.status)}">${purchaseStatusLabel(x.status)}</span></td>
    <td><div class="inline-actions">${purchaseActions(x)}</div></td>
  </tr>`).join("")}</tbody></table></div>`:`<div class="empty">현재 표시할 구매 신청이 없습니다.</div>`;
}

function renderCardChart(){
  const sums={};state.cards.forEach(x=>{const m=String(x.used_date||"").slice(5,7);sums[m]=(sums[m]||0)+Number(x.amount||0)});
  const max=Math.max(1,...Object.values(sums));
  $("cardChart").innerHTML=Array.from({length:12},(_,i)=>String(i+1).padStart(2,"0")).map(m=>`<div class="bar" style="height:${Math.max(4,(sums[m]||0)/max*170)}px"><em>${sums[m]?Math.round(sums[m]/10000)+"만":""}</em><span>${Number(m)}월</span></div>`).join("");
}
function renderRecentCards(){
  $("recentCards").innerHTML=table(["사용일","카드소유자","실사용자","사용처","금액","증빙"],state.cards.slice(0,7).map(x=>[x.used_date,x.card_owner,x.actual_user,x.vendor,money(x.amount),x.receipt_status]));
}
function table(head,rows){
  return `<div class="table-wrap"><table><thead><tr>${head.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.length?rows.map(r=>`<tr>${r.map((c,i)=>`<td class="${i===3?"left":""}">${escapeHtml(c??"")}</td>`).join("")}</tr>`).join(""):`<tr><td colspan="${head.length}">등록된 내역이 없습니다.</td></tr>`}</tbody></table></div>`;
}
async function uploadReceipt(file){
  if(!file)return null;
  const ext=(file.name.split(".").pop()||"jpg").toLowerCase();
  const safeExt=["jpg","jpeg","png","webp","heic"].includes(ext)?ext:"jpg";
  const path=`${state.user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${safeExt}`;
  const {error}=await supabaseClient.storage.from("receipts").upload(path,file,{
    cacheControl:"3600",
    upsert:false,
    contentType:file.type||undefined
  });
  if(error)throw error;
  return path;
}
async function saveCard(){
  const file=$("cardReceiptFile")?.files?.[0]||null;
  let receiptPath=null;
  try{
    if(file)receiptPath=await uploadReceipt(file);
  }catch(err){
    toast("영수증 업로드 실패: "+err.message);
    return;
  }
  const row={
    used_date:$("cardDate").value,
    card_owner:$("cardOwner").value.trim(),
    actual_user:$("cardUser").value.trim(),
    account_category:$("cardAccount").value,
    vendor:$("cardVendor").value.trim(),
    item_description:$("cardItem").value.trim(),
    amount:Number($("cardAmount").value||0),
    receipt_status:file?"첨부":$("cardReceipt").value,
    receipt_url:receiptPath,
    memo:$("cardMemo").value.trim(),
    created_by:state.user.id
  };
  if(!row.used_date||!row.card_owner||!row.amount){toast("사용날짜, 카드소유자, 금액을 입력하세요.");return}
  const {error}=await supabaseClient.from("corporate_card_expenses").insert(row);
  if(error){
    if(receiptPath)await supabaseClient.storage.from("receipts").remove([receiptPath]);
    toast(error.message);return
  }
  toast("법인카드 내역을 저장했습니다.");
  if($("cardReceiptFile"))$("cardReceiptFile").value="";
  $("receiptPreviewWrap")?.classList.add("hidden");
  await loadCards();renderCards();renderDashboard();
}
function renderCards(){
  if(!$("cardTable"))return;
  const month=$("cardMonthFilter").value, s=$("cardSearch").value.trim().toLowerCase();
  const rows=state.cards.filter(x=>(!month||String(x.used_date).startsWith(month))&&(!s||[x.card_owner,x.actual_user,x.vendor,x.item_description].join(" ").toLowerCase().includes(s)));
  $("cardTable").innerHTML=`<div class="table-wrap"><table><thead><tr>
    <th>사용날짜</th><th>카드소유자</th><th>실사용자</th><th>계정과목</th><th>사용처</th><th>적요/품목</th><th>사용금액</th><th>증빙</th><th>영수증</th><th>비고</th>
  </tr></thead><tbody>${
    rows.length?rows.map(x=>`<tr>
      <td>${escapeHtml(x.used_date||"")}</td>
      <td>${escapeHtml(x.card_owner||"")}</td>
      <td>${escapeHtml(x.actual_user||"")}</td>
      <td>${escapeHtml(x.account_category||"")}</td>
      <td>${escapeHtml(x.vendor||"")}</td>
      <td>${escapeHtml(x.item_description||"")}</td>
      <td>${money(x.amount)}</td>
      <td>${escapeHtml(x.receipt_status||"")}</td>
      <td>${x.receipt_url?`<button class="btn small" onclick="openReceipt('${encodeURIComponent(x.receipt_url)}')">사진 보기</button>`:"-"}</td>
      <td>${escapeHtml(x.memo||"")}</td>
    </tr>`).join(""):`<tr><td colspan="10">등록된 내역이 없습니다.</td></tr>`
  }</tbody></table></div>`;
}
window.openReceipt=async function(encodedPath){
  const path=decodeURIComponent(encodedPath);
  const {data,error}=await supabaseClient.storage.from("receipts").createSignedUrl(path,60);
  if(error){toast("영수증을 열 수 없습니다: "+error.message);return}
  window.open(data.signedUrl,"_blank","noopener");
}
function exportCards(){
  const data=state.cards.map(x=>({"사용날짜":x.used_date,"카드소유자":x.card_owner,"실사용자":x.actual_user,"계정과목":x.account_category,"사용처":x.vendor,"적요/품목":x.item_description,"사용금액":Number(x.amount),"증빙":x.receipt_status,"영수증저장경로":x.receipt_url||"","비고":x.memo}));
  exportXlsx(data,"서린_법인카드_사용내역.xlsx","법인카드");
}
async function saveItem(){
  const row={name:$("itemName").value.trim(),category:$("itemCategory").value.trim(),specification:$("itemSpec").value.trim(),unit:$("itemUnit").value.trim(),current_stock:Number($("itemStock").value||0),minimum_stock:Number($("itemMinStock").value||0),storage_location:$("itemLocation").value.trim(),vendor:$("itemVendor").value.trim(),unit_price:Number($("itemPrice").value||0),created_by:state.user.id};
  if(!row.name){toast("품목명을 입력하세요.");return}
  const {error}=await supabaseClient.from("inventory_items").insert(row);if(error){toast(error.message);return}
  toast("물품을 등록했습니다.");await loadItems();renderInventory();renderDashboard();
}
async function saveTx(){
  const itemId=$("txItem").value,type=$("txType").value,qty=Number($("txQty").value||0);
  if(!itemId||!qty){toast("품목과 수량을 입력하세요.");return}
  const {data:item}=await supabaseClient.from("inventory_items").select("*").eq("id",itemId).single();
  let stock=Number(item.current_stock||0);
  if(type==="in")stock+=qty; else if(type==="out"||type==="discard")stock-=qty; else stock=qty;
  if(stock<0){toast("재고보다 많은 수량을 사용할 수 없습니다.");return}
  const {error:e1}=await supabaseClient.from("inventory_transactions").insert({item_id:itemId,transaction_type:type,quantity:qty,person_name:$("txPerson").value.trim(),memo:$("txMemo").value.trim(),created_by:state.user.id});
  const {error:e2}=await supabaseClient.from("inventory_items").update({current_stock:stock}).eq("id",itemId);
  if(e1||e2){toast((e1||e2).message);return}
  toast("재고를 반영했습니다.");await loadItems();renderInventory();renderDashboard();
}
function renderInventory(){
  $("txItem").innerHTML=state.items.map(x=>`<option value="${x.id}">${escapeHtml(x.name)} (${x.current_stock}${x.unit||""})</option>`).join("");
  $("inventoryTable").innerHTML=table(["품목명","분류","규격","단위","현재재고","최소재고","상태","보관위치","거래처","단가"],state.items.map(x=>[x.name,x.category,x.specification,x.unit,x.current_stock,x.minimum_stock,Number(x.current_stock)<=Number(x.minimum_stock)?"부족":"정상",x.storage_location,x.vendor,money(x.unit_price)]));
}
function exportInventory(){
  exportXlsx(state.items.map(x=>({"품목명":x.name,"분류":x.category,"규격":x.specification,"단위":x.unit,"현재재고":x.current_stock,"최소재고":x.minimum_stock,"보관위치":x.storage_location,"거래처":x.vendor,"단가":x.unit_price})),"서린_물류물품_재고.xlsx","재고현황");
}
const PURCHASE_STATUS={
  requested:"신청", reviewing:"검토중", review_complete:"승인대기", approved:"승인완료",
  ordered:"발주완료", received:"입고완료", completed:"구매완료", rejected:"반려"
};
function purchaseStatusLabel(v){return PURCHASE_STATUS[v]||v||"-"}
function isPurchaseManager(){return has("purchase_approve")}
function isFinalPurchaseApprover(){return has("purchase_final_approve")}
function formatDateTime(v){return v?new Date(v).toLocaleString("ko-KR",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}):"-"}
async function savePurchase(){
  const row={
    item_name:$("purchaseItemName").value.trim(),
    quantity:Number($("purchaseQuantity").value||0),
    unit:$("purchaseUnit").value.trim(),
    needed_date:$("purchaseNeededDate").value||null,
    is_urgent:$("purchaseUrgent").value==="true",
    estimated_amount:Number($("purchaseEstimatedAmount").value||0)||null,
    purpose:$("purchasePurpose").value.trim(),
    memo:$("purchaseMemo").value.trim(),
    requester_id:state.user.id,
    requester_emp_no:state.profile?.emp_no||"",
    requester_name:state.profile?.name||""
  };
  if(!row.item_name||row.quantity<=0||!row.purpose){toast("품목명, 수량, 사용 목적을 입력하세요.");return}
  const {error}=await supabaseClient.from("purchase_requests").insert(row);
  if(error){toast("구매 신청 실패: "+error.message);return}
  ["purchaseItemName","purchaseUnit","purchasePurpose","purchaseMemo","purchaseEstimatedAmount"].forEach(id=>$(id).value="");
  $("purchaseQuantity").value="1";$("purchaseUrgent").value="false";$("purchaseNeededDate").value="";
  toast("구매 신청이 등록되었습니다.");
  await loadPurchaseRequests();renderPurchases();renderDashboard();
}
function usageDayCount(x){
  if(!x.completed_at)return null;
  const start=new Date(x.completed_at);
  const end=x.usage_completed_at?new Date(x.usage_completed_at):new Date();
  const startDay=new Date(start.getFullYear(),start.getMonth(),start.getDate());
  const endDay=new Date(end.getFullYear(),end.getMonth(),end.getDate());
  return Math.max(0,Math.floor((endDay-startDay)/86400000));
}
function purchaseUsageText(x){
  if(x.status!=="completed")return "-";
  const days=usageDayCount(x);
  if(x.usage_completed_at){
    return `<span class="status-badge status-completed">사용완료 ${days}일</span><br><small>${formatDateTime(x.usage_completed_at)}${x.usage_completed_by_name?` · ${escapeHtml(x.usage_completed_by_name)}`:""}${x.usage_note?`<br>${escapeHtml(x.usage_note)}`:""}</small>`;
  }
  return `<span class="status-badge status-ordered">사용 중 ${days}일째</span><br><small>구매완료일 ${formatDateTime(x.completed_at)}</small>`;
}
function purchaseActions(x){
  const buttons=[];
  if(isPurchaseManager()&&!isFinalPurchaseApprover()){
    if(x.status==="requested")buttons.push(`<button class="btn small" onclick="changePurchaseStatus('${x.id}','reviewing')">검토 시작</button>`);
    if(["requested","reviewing"].includes(x.status))buttons.push(`<button class="btn small primary" onclick="changePurchaseStatus('${x.id}','review_complete')">검토 완료</button>`);
    if(x.status==="approved")buttons.push(`<button class="btn small primary" onclick="changePurchaseStatus('${x.id}','ordered')">발주 완료</button>`);
    if(x.status==="ordered")buttons.push(`<button class="btn small primary" onclick="changePurchaseStatus('${x.id}','received')">입고 완료</button>`);
    if(x.status==="received")buttons.push(`<button class="btn small primary" onclick="changePurchaseStatus('${x.id}','completed')">구매 완료</button>`);
    if(x.status==="completed"&&!x.usage_completed_at)buttons.push(`<button class="btn small primary" onclick="completePurchaseUsage('${x.id}')">사용완료</button>`);
    if(["requested","reviewing","review_complete","approved"].includes(x.status))buttons.push(`<button class="btn small danger" onclick="rejectPurchase('${x.id}')">반려</button>`);
  }
  if(isFinalPurchaseApprover()){
    if(x.status==="review_complete"){
      buttons.push(`<button class="btn small primary" onclick="changePurchaseStatus('${x.id}','approved')">승인</button>`);
      buttons.push(`<button class="btn small danger" onclick="rejectPurchase('${x.id}')">반려</button>`);
    }
  }
  return buttons.join(" ")||"-";
}
function renderPurchases(){
  if(!$("purchaseTable"))return;
  const filter=$("purchaseStatusFilter")?.value||"all";
  const rows=state.purchaseRequests.filter(x=>filter==="all"||x.status===filter);
  const counts={requested:0,review:0,progress:0,done:0};
  state.purchaseRequests.forEach(x=>{
    if(x.status==="requested")counts.requested++;
    if(["reviewing","review_complete","approved"].includes(x.status))counts.review++;
    if(["ordered","received"].includes(x.status))counts.progress++;
    if(x.status==="completed")counts.done++;
  });
  $("purchaseCountRequested").textContent=counts.requested+"건";
  $("purchaseCountReview").textContent=counts.review+"건";
  $("purchaseCountProgress").textContent=counts.progress+"건";
  $("purchaseCountDone").textContent=counts.done+"건";
  $("purchaseListTitle").textContent=(isPurchaseManager()||isFinalPurchaseApprover())?"전체 구매 신청 내역":"내 구매 신청 내역";
  $("purchaseTable").innerHTML=`<div class="table-wrap"><table><thead><tr>
    <th>신청일</th><th>신청자</th><th>품목</th><th>수량</th><th>목적</th><th>희망일</th><th>예상금액</th><th>상태</th><th>처리정보</th><th>사용기간</th><th>관리</th>
  </tr></thead><tbody>${rows.length?rows.map(x=>`<tr class="${x.is_urgent?'urgent-row':''}">
    <td>${formatDateTime(x.created_at)}${x.is_urgent?'<br><span class="badge danger">긴급</span>':''}</td>
    <td>${escapeHtml(x.requester_name||"")}<br><small>${escapeHtml(x.requester_emp_no||"")}</small></td>
    <td><b>${escapeHtml(x.item_name||"")}</b>${x.memo?`<br><small>${escapeHtml(x.memo)}</small>`:""}</td>
    <td>${Number(x.quantity||0).toLocaleString("ko-KR")} ${escapeHtml(x.unit||"")}</td>
    <td>${escapeHtml(x.purpose||"")}</td>
    <td>${escapeHtml(x.needed_date||"-")}</td>
    <td>${x.estimated_amount?money(x.estimated_amount):"-"}</td>
    <td><span class="status-badge status-${escapeHtml(x.status)}">${purchaseStatusLabel(x.status)}</span>${x.reject_reason?`<br><small class="text-danger">${escapeHtml(x.reject_reason)}</small>`:""}</td>
    <td><small>검토: ${escapeHtml(x.reviewer_name||"-")} ${x.reviewed_at?`<br>${formatDateTime(x.reviewed_at)}`:""}<br>승인: ${escapeHtml(x.approver_name||"-")} ${x.approved_at?`<br>${formatDateTime(x.approved_at)}`:""}</small></td>
    <td>${purchaseUsageText(x)}</td>
    <td><div class="inline-actions">${purchaseActions(x)}</div></td>
  </tr>`).join(""):`<tr><td colspan="11">구매 신청 내역이 없습니다.</td></tr>`}</tbody></table></div>`;
}
window.changePurchaseStatus=async function(id,status){
  const label=purchaseStatusLabel(status);
  if(!confirm(`이 구매 건을 '${label}' 상태로 변경할까요?`))return;
  const {error}=await supabaseClient.rpc("update_purchase_request_status",{p_request_id:id,p_status:status,p_reason:null});
  if(error){toast("상태 변경 실패: "+error.message);return}
  toast(label+" 처리되었습니다.");await loadPurchaseRequests();renderPurchases();renderDashboard();
};
window.rejectPurchase=async function(id){
  const reason=prompt("반려 사유를 입력하세요.");
  if(reason===null)return;
  if(!reason.trim()){toast("반려 사유를 입력하세요.");return}
  const {error}=await supabaseClient.rpc("update_purchase_request_status",{p_request_id:id,p_status:"rejected",p_reason:reason.trim()});
  if(error){toast("반려 처리 실패: "+error.message);return}
  toast("반려 처리되었습니다.");await loadPurchaseRequests();renderPurchases();renderDashboard();
};
window.completePurchaseUsage=async function(id){
  const target=(state.purchaseRequests||[]).find(x=>String(x.id)===String(id));
  if(!target){toast("구매 기록을 찾을 수 없습니다.");return}
  const today=new Date().toISOString().slice(0,10);
  const usageDate=prompt(`'${target.item_name||"구매 물품"}' 사용완료일을 입력하세요.\n형식: YYYY-MM-DD`,today);
  if(usageDate===null)return;
  if(!/^\d{4}-\d{2}-\d{2}$/.test(usageDate.trim())){toast("사용완료일을 YYYY-MM-DD 형식으로 입력하세요.");return}
  const note=prompt("사용 관련 비고가 있으면 입력하세요. (선택)","");
  if(note===null)return;
  if(!confirm(`사용완료일 ${usageDate.trim()}로 기록할까요?`))return;
  const {error}=await supabaseClient.rpc("complete_purchase_usage",{
    p_request_id:Number(id),
    p_usage_date:usageDate.trim(),
    p_note:note.trim()||null
  });
  if(error){toast("사용완료 처리 실패: "+error.message);return}
  toast("사용완료 처리되었습니다. 사용기간이 자동 계산됩니다.");
  await loadPurchaseRequests();renderPurchases();renderDashboard();
};
function exportXlsx(data,filename,sheet){
  if(!window.XLSX){toast("엑셀 모듈을 불러오지 못했습니다.");return}
  const ws=XLSX.utils.json_to_sheet(data),wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,sheet);XLSX.writeFile(wb,filename);
}
function renderNotices(){
  const canManage=has("notices_manage");
  $("newNoticeBtn").classList.toggle("hidden",!canManage);

  const headers=["작성일","제목","내용"];
  if(canManage)headers.push("관리");

  const rows=state.notices.map(x=>{
    const row=[
      new Date(x.created_at).toLocaleDateString("ko-KR"),
      x.title,
      x.content
    ];
    if(canManage){
      row.push(`<button class="btn small danger" onclick="deleteNotice('${x.id}')">삭제</button>`);
    }
    return row;
  });

  $("noticeTable").innerHTML=tableHtml(headers,rows);
}

window.deleteNotice=async function(id){
  if(!has("notices_manage")){
    toast("공지 삭제 권한이 없습니다.");
    return;
  }
  const notice=state.notices.find(x=>String(x.id)===String(id));
  if(!confirm(`공지사항 "${notice?.title||""}"을 삭제할까요?`))return;

  const {error}=await supabaseClient.rpc("delete_notice_admin",{p_notice_id:id});
  if(error){
    console.error(error);
    toast("공지 삭제 실패: "+error.message);
    return;
  }

  await loadNotices();
  renderNotices();
  renderDashboard();
  toast("공지사항을 삭제했습니다.");
}
async function saveNotice(){
  const title=$("noticeTitle").value.trim(),content=$("noticeContent").value.trim();if(!title){toast("제목을 입력하세요.");return}
  const {error}=await supabaseClient.from("notices").insert({title,content,created_by:state.user.id});if(error){toast(error.message);return}
  toggle("noticeForm");await loadNotices();renderNotices();renderDashboard();toast("공지사항을 등록했습니다.");
}
function getOrganizationPeople(){
  const joinedByEmpNo=new Map(state.employees.map(e=>[String(e.emp_no),e]));
  const people=[];

  state.employeeRegistry.forEach(r=>{
    const joined=joinedByEmpNo.get(String(r.emp_no));
    const resolvedName=joined?.name||r.name;
    const resolvedEmpNo=String(r.emp_no||"");
    const resolvedPosition=(resolvedEmpNo==="202605261"||resolvedName==="임태희")
      ?"사원"
      :(joined?.position||r.position||"사원");
    people.push({
      id:joined?.id||null,
      registry_id:r.emp_no,
      emp_no:r.emp_no,
      name:resolvedName,
      department:joined?.department||r.department||"물류본부",
      team:joined?.team||r.team||"소속 미지정",
      position:resolvedPosition,
      sort_order:joined?.sort_order??r.sort_order??999,
      org_level:joined?.org_level??r.org_level??4,
      manager_emp_no:joined?.manager_emp_no??r.manager_emp_no??null,
      pending_approval:joined?.pending_approval??r.pending_approval??false,
      move_planned:joined?.move_planned??r.move_planned??false,
      joined:!!joined,
      phone:joined?.phone||"",
      emergency_contact_name:joined?.emergency_contact_name||"",
      emergency_contact_relation:joined?.emergency_contact_relation||"",
      emergency_contact_phone:joined?.emergency_contact_phone||""
    });
  });

  state.employees.forEach(e=>{
    if(!state.employeeRegistry.some(r=>String(r.emp_no)===String(e.emp_no))){
      const corrected=(String(e.emp_no)==="202605261"||e.name==="임태희")
        ?{...e,position:"사원"}
        :e;
      people.push({...corrected,joined:true,registry_id:e.emp_no});
    }
  });

  return people;
}
function positionRank(position){
  const p=String(position||"").trim();
  if(/대표|사장/.test(p))return 0;
  if(/이사|본부장|총괄/.test(p))return 1;
  if(/부장/.test(p))return 2;
  if(/차장/.test(p))return 3;
  if(/과장/.test(p))return 4;
  if(/대리/.test(p))return 5;
  if(/주임/.test(p))return 6;
  if(/사원/.test(p))return 7;
  return 8;
}
function organizationMemberCompare(a,b){
  return positionRank(a.position)-positionRank(b.position)
    || Number(a.sort_order??999)-Number(b.sort_order??999)
    || String(a.name||"").localeCompare(String(b.name||""),"ko");
}

function getOrgHead(people){
  return people.find(p=>Number(p.org_level)===1)
    || people.find(p=>/이사|본부장|총괄|대표/.test(String(p.position||"")))
    || people.find(p=>String(p.emp_no).toUpperCase()==="EMP001")
    || people[0];
}

function getTeamLeader(teamName,members){
  const fixedLeaders={
    "발주팀":"장수범",
    "국내팀":"이찬규",
    "해외팀":"김일신",
    "B2C":"정해림"
  };
  const fixedName=fixedLeaders[teamName];
  return members.find(p=>p.name===fixedName)
    || members.find(p=>/팀장/.test(String(p.position||"")))
    || members.find(p=>Number(p.org_level)===2)
    || members[0];
}

function renderOrg(){
  const people=getOrganizationPeople().map(p=>({
    ...p,
    org_level:Number(p.org_level||positionRank(p.position))
  }));

  if(!people.length){
    $("orgChart").innerHTML=`<div class="empty">조직도에 표시할 직원이 없습니다.</div>`;
    return;
  }

  const head=getOrgHead(people);
  const teamOrder=new Map(state.orgTeams.map((t,i)=>[t.name,Number(t.sort_order??i)]));

  const preferredTeams=["발주팀","해외팀","국내팀","B2C","물류지원팀"];
  const allTeams=[...new Set(
    people
      .filter(p=>p.emp_no!==head?.emp_no)
      .map(p=>p.team||"소속 미지정")
  )];

  const teamNames=[
    ...preferredTeams.filter(t=>allTeams.includes(t)),
    ...allTeams.filter(t=>!preferredTeams.includes(t))
  ].sort((a,b)=>{
    const ai=preferredTeams.indexOf(a);
    const bi=preferredTeams.indexOf(b);
    if(ai!==-1||bi!==-1){
      return (ai===-1?999:ai)-(bi===-1?999:bi);
    }
    const ao=teamOrder.has(a)?teamOrder.get(a):9999;
    const bo=teamOrder.has(b)?teamOrder.get(b):9999;
    return ao-bo||a.localeCompare(b,"ko");
  });

  let html=`<div class="org-board org-one-screen">`;

  html+=`<section class="org-head-section compact-head">
    <div class="org-head-card" onclick="openOrgPerson('${escapeHtml(head?.emp_no||"EMP001")}')">
      <div class="org-head-title">물류팀</div>
      <div class="org-head-role">물류총괄</div>
      <div class="org-head-name">${escapeHtml(head?.name||"손동오")} <span class="org-head-position">${escapeHtml(head?.position||"이사")}</span></div>
      ${state.orgEditMode&&head?`<button class="btn small org-edit-button" onclick="selectOrgPerson('${escapeHtml(head.emp_no)}')">수정</button>`:""}
    </div>
    <div class="org-main-connector"></div>
  </section>`;

  html+=`<section class="org-team-grid single-row">`;

  teamNames.forEach(teamName=>{
    const members=people
      .filter(p=>(p.team||"소속 미지정")===teamName && p.emp_no!==head?.emp_no);

    const leader=getTeamLeader(teamName,members);
    const otherMembers=members
      .filter(p=>p.emp_no!==leader?.emp_no)
      .sort(organizationMemberCompare);

    html+=`<article class="org-dept-card compact-card">
      <header class="org-dept-header">
        <div class="org-dept-name-row">
          <div class="org-dept-name">${escapeHtml(teamName)}</div>
          ${state.orgEditMode?(()=>{
            const teamRow=state.orgTeams.find(t=>t.name===teamName);
            return teamRow?`<button class="org-team-rename-btn" onclick="editOrgTeam(${teamRow.id})">팀명 변경</button>`:"";
          })():""}
        </div>
        <div class="org-dept-count">${members.length}명</div>
      </header>

      <div class="org-team-leader" ${leader?`onclick="openOrgPerson('${escapeHtml(leader.emp_no)}')"`:""}>
        ${leader?`
          <div class="leader-badge">팀장</div>
          <div class="leader-name">${escapeHtml(leader.name)}</div>
          <div class="leader-position">${escapeHtml(/팀장/.test(String(leader.position||""))?leader.position:"팀장")}</div>
          ${state.orgEditMode?`<button class="btn small" onclick="selectOrgPerson('${escapeHtml(leader.emp_no)}')">수정</button>`:""}
        `:`<div class="empty compact-empty">팀장 미지정</div>`}
      </div>

      <div class="org-member-list compact-list">`;

    otherMembers.forEach(member=>{
      const statusClass=member.pending_approval?"pending":member.move_planned?"moving":"";
      html+=`<div class="org-member ${statusClass}" onclick="openOrgPerson('${escapeHtml(member.emp_no)}')">
        <div class="org-member-main">
          <span class="org-member-name">${escapeHtml(member.name)}</span>
          <span class="org-member-position">${escapeHtml(member.position||"사원")}</span>
        </div>
        ${state.orgEditMode?`<button class="btn small" onclick="selectOrgPerson('${escapeHtml(member.emp_no)}')">수정</button>`:""}
      </div>`;
    });

    html+=`</div></article>`;
  });

  html+=`</section></div>`;
  $("orgChart").innerHTML=html;

  const canManage=has("employees_manage");
  $("toggleOrgEditBtn")?.classList.toggle("hidden",!canManage);
  $("orgEditPanel")?.classList.toggle("hidden",!(canManage&&state.orgEditMode));

  const canEmergency=has("emergency_contacts_view");
  $("emergencyPanel")?.classList.toggle("hidden",!canEmergency);
  if(canEmergency)renderEmergencyContacts();
}
window.selectOrgPerson=function(empNo){
  const joined=state.employees.find(x=>String(x.emp_no)===String(empNo));
  if(joined){
    selectOrgEmployee(joined.id);
    return;
  }
  const r=state.employeeRegistry.find(x=>String(x.emp_no)===String(empNo));
  if(!r)return;
  $("orgEmployeeSelect").value=`registry:${r.emp_no}`;
  $("orgDepartmentInput").value=r.department||"물류본부";
  if(![...$("orgTeamSelect").options].some(o=>o.value===r.team)){
    $("orgTeamSelect").insertAdjacentHTML("beforeend",`<option value="${escapeHtml(r.team||"")}">${escapeHtml(r.team||"")}</option>`);
  }
  $("orgTeamSelect").value=r.team||"";
  $("orgPositionInput").value=r.position||"사원";
  $("orgLevelInput").value=String(r.org_level||positionRank(r.position));
  $("orgManagerInput").value=r.manager_emp_no||"";
  $("orgSortOrderInput").value=r.sort_order??999;
  $("orgPendingInput").value=String(!!r.pending_approval);
  $("orgMoveInput").value=String(!!r.move_planned);
}
function renderEmergencyContacts(){
  const box=$("emergencyTable");
  if(!box)return;
  const query=($("emergencySearch")?.value||"").trim().toLowerCase();
  const rows=(state.employees||[])
    .filter(e=>{
      if(!query)return true;
      return [e.name,e.department,e.team,e.position,e.phone,e.emergency_contact_name,e.emergency_contact_relation,e.emergency_contact_phone]
        .some(v=>String(v||"").toLowerCase().includes(query));
    })
    .sort((a,b)=>String(a.team||"").localeCompare(String(b.team||""),"ko")||String(a.name||"").localeCompare(String(b.name||""),"ko"));

  box.innerHTML=rows.length?tableHtml(
    ["이름","부서·팀","직급","본인 전화번호","가족 비상연락처","관계"],
    rows.map(e=>[
      escapeHtml(e.name||""),
      escapeHtml([e.department,e.team].filter(Boolean).join(" · ")),
      escapeHtml(e.position||""),
      escapeHtml(e.phone||"미등록"),
      escapeHtml(e.emergency_contact_phone||"미등록"),
      escapeHtml(e.emergency_contact_relation||"미등록")
    ])
  ):`<div class="empty">표시할 비상연락처가 없습니다.</div>`;
}

function renderOrgManagement(){
  if(!has("employees_manage"))return;

  $("orgTeamTable").innerHTML=tableHtml(
    ["팀명","표시순서","수정","삭제"],
    state.orgTeams.map(t=>[
      t.name,t.sort_order,
      `<button class="btn small" onclick="editOrgTeam(${t.id})">수정</button>`,
      `<button class="btn small" onclick="deleteOrgTeam(${t.id})">삭제</button>`
    ])
  );

  const people=getOrganizationPeople();
  $("orgEmployeeSelect").innerHTML=people.map(e=>{
    const value=e.joined?e.id:`registry:${e.emp_no}`;
    return `<option value="${value}">${escapeHtml(e.name)} · ${escapeHtml(e.team||"")} · ${e.joined?"가입완료":"가입대기"}</option>`;
  }).join("");

  $("orgTeamSelect").innerHTML=state.orgTeams.map(t=>`<option value="${escapeHtml(t.name)}">${escapeHtml(t.name)}</option>`).join("");
  $("orgManagerInput").innerHTML=`<option value="">상위 관리자 없음</option>`+
    people.map(p=>`<option value="${escapeHtml(p.emp_no)}">${escapeHtml(p.name)} · ${escapeHtml(p.position||"")}</option>`).join("");

  if(people[0])selectOrgPerson(people[0].emp_no);
}
window.selectOrgEmployee=function(id){
  const e=state.employees.find(x=>x.id===id);if(!e)return;
  $("orgEmployeeSelect").value=e.id;
  $("orgDepartmentInput").value=e.department||"물류본부";
  if(![...$("orgTeamSelect").options].some(o=>o.value===e.team)){
    $("orgTeamSelect").insertAdjacentHTML("beforeend",`<option value="${escapeHtml(e.team||"")}">${escapeHtml(e.team||"")}</option>`);
  }
  $("orgTeamSelect").value=e.team||"";
  $("orgPositionInput").value=e.position||"";
  $("orgLevelInput").value=String(e.org_level||positionRank(e.position));
  $("orgManagerInput").value=e.manager_emp_no||"";
  $("orgSortOrderInput").value=e.sort_order??999;
  $("orgPendingInput").value=String(!!e.pending_approval);
  $("orgMoveInput").value=String(!!e.move_planned);
}
async function saveOrgEmployee(){
  const value=$("orgEmployeeSelect").value;
  if(!value){
    toast("직원을 선택하세요.");
    return;
  }

  const isRegistry=value.startsWith("registry:");
  const empNo=isRegistry
    ? value.replace("registry:","")
    : (state.employees.find(e=>e.id===value)?.emp_no||"");

  if(!empNo){
    toast("사원번호를 찾을 수 없습니다.");
    return;
  }

  const payload={
    p_emp_no:empNo,
    p_department:$("orgDepartmentInput").value.trim()||"물류본부",
    p_team:$("orgTeamSelect").value,
    p_position:$("orgPositionInput").value.trim()||"사원",
    p_org_level:Number($("orgLevelInput").value||4),
    p_manager_emp_no:$("orgManagerInput").value||null,
    p_sort_order:Number($("orgSortOrderInput").value||999),
    p_pending_approval:$("orgPendingInput").value==="true",
    p_move_planned:$("orgMoveInput").value==="true"
  };

  $("saveOrgEmployeeBtn").disabled=true;
  $("saveOrgEmployeeBtn").textContent="저장 중...";

  const {data,error}=await supabaseClient.rpc("save_organization_employee",payload);

  $("saveOrgEmployeeBtn").disabled=false;
  $("saveOrgEmployeeBtn").textContent="직원 조직정보 저장";

  if(error){
    console.error(error);
    toast("조직정보 저장 실패: "+error.message);
    return;
  }

  await Promise.all([loadEmployees(),loadEmployeeRegistry(),loadOrgTeams()]);
  renderOrg();
  renderOrgManagement();
  toast("조직도 수정 내용을 저장했습니다.");
}
async function addOrgTeam(){
  const name=$("newOrgTeamName").value.trim();
  const sortOrder=Number($("newOrgTeamOrder").value||99);
  if(!name){toast("팀명을 입력하세요.");return}

  const {error}=await supabaseClient.rpc("manage_organization_team",{
    p_action:"insert",
    p_id:null,
    p_name:name,
    p_sort_order:sortOrder
  });
  if(error){toast("팀 추가 실패: "+error.message);return}

  $("newOrgTeamName").value="";
  $("newOrgTeamOrder").value="99";
  await loadOrgTeams();
  renderOrg();
  renderOrgManagement();
  toast("팀을 추가했습니다.");
}

window.editOrgTeam=async function(id){
  const t=state.orgTeams.find(x=>x.id===id);if(!t)return;
  const name=prompt("팀명을 입력하세요.",t.name);if(name===null)return;
  const orderText=prompt("표시순서를 입력하세요.",String(t.sort_order??99));if(orderText===null)return;

  const {error}=await supabaseClient.rpc("manage_organization_team",{
    p_action:"update",
    p_id:id,
    p_name:name.trim(),
    p_sort_order:Number(orderText||99)
  });
  if(error){toast("팀 수정 실패: "+error.message);return}

  await loadOrgTeams();
  renderOrg();
  renderOrgManagement();
  toast("팀 정보를 수정했습니다.");
}

window.deleteOrgTeam=async function(id){
  const t=state.orgTeams.find(x=>x.id===id);if(!t)return;
  if(!confirm(`${t.name} 팀을 삭제할까요?`))return;

  const {error}=await supabaseClient.rpc("manage_organization_team",{
    p_action:"delete",
    p_id:id,
    p_name:t.name,
    p_sort_order:Number(t.sort_order||99)
  });
  if(error){toast("팀 삭제 실패: "+error.message);return}

  await loadOrgTeams();
  renderOrg();
  renderOrgManagement();
  toast("팀을 삭제했습니다.");
}



function closeOrgEdit(){
  state.orgEditMode=false;
  $("toggleOrgEditBtn").textContent="조직도 수정";
  $("orgEditPanel").classList.add("hidden");
  document.body.classList.remove("modal-open");
  renderOrg();
}

function toggleOrgEdit(){
  if(!has("employees_manage")){
    toast("조직도 수정 권한이 없습니다.");
    return;
  }
  state.orgEditMode=!state.orgEditMode;
  $("toggleOrgEditBtn").textContent=state.orgEditMode?"수정창 닫기":"조직도 수정";

  if(state.orgEditMode){
    renderOrgManagement();
    $("orgEditPanel").classList.remove("hidden");
    document.body.classList.add("modal-open");
  }else{
    closeOrgEdit();
  }
  renderOrg();
}


function renderEmployeeRegistry(){
  const box=$("employeeRegistryTable");
  if(!box)return;

  const rows=state.employeeRegistry.map(x=>[
    x.emp_no,
    x.name,
    x.department||"",
    x.team||"",
    x.position||"",
    Number(x.annual_leave_granted||0),
    x.auth_user_id?"계정 생성 완료":"계정 미생성"
  ]);

  box.innerHTML=tableHtml(
    ["사원번호","이름","부서","팀","직급","연차","계정상태"],
    rows
  );
}

async function addRegistryEmployee(){
  if(!has("employees_manage")){
    toast("직원 추가 권한이 없습니다.");
    return;
  }

  const row={
    emp_no:$("regEmpNo").value.trim(),
    name:$("regName").value.trim(),
    department:$("regDepartment").value.trim()||"물류본부",
    team:$("regTeam").value,
    position:$("regPosition").value.trim()||"사원",
    annual_leave_granted:Number($("regAnnualLeave").value||15),
    sort_order:999,
    org_level:positionRank($("regPosition").value.trim()||"사원"),
    is_active:true
  };

  if(!row.emp_no||!row.name){
    toast("사원번호와 이름을 입력하세요.");
    return;
  }
  if(!/^[A-Za-z0-9._-]+$/.test(row.emp_no)){
    toast("사원번호는 숫자·영문·하이픈만 사용할 수 있습니다.");
    return;
  }

  const existing=state.employeeRegistry.find(x=>String(x.emp_no)===row.emp_no);
  if(existing?.auth_user_id){
    toast("이미 계정이 생성된 사원번호입니다.");
    return;
  }

  $("addRegistryEmployeeBtn").disabled=true;
  $("addRegistryEmployeeBtn").textContent="계정 생성 중...";

  try{
    // 1) 직원 명부에 먼저 저장
    const {error:registryError}=await supabaseClient
      .from("employee_registry")
      .upsert(row,{onConflict:"emp_no"});

    if(registryError)throw registryError;

    // 2) 별도 임시 클라이언트로 인증계정 생성
    // 관리자 로그인 세션은 유지됨
    const tempClient=makeTemporaryAuthClient();
    const email=employeeLoginEmail(row.emp_no);

    const {data:signupData,error:signupError}=await tempClient.auth.signUp({
      email,
      password:"123456",
      options:{
        data:{
          emp_no:row.emp_no,
          name:row.name
        }
      }
    });

    if(signupError)throw signupError;

    await tempClient.auth.signOut().catch(()=>{});

    // 트리거 반영 대기
    await sleep(700);

    // 트리거가 늦거나 누락돼도 명부는 조직도에 즉시 표시
    await Promise.all([loadEmployeeRegistry(),loadEmployees()]);
    renderEmployeeRegistry();
    renderEmployees();
    renderOrg();
    renderOrgManagement();

    $("regEmpNo").value="";
    $("regName").value="";
    $("regPosition").value="";
    $("regAnnualLeave").value="15";

    toast(`${row.name} 직원 계정을 만들었습니다. 초기 비밀번호는 123456입니다.`);
  }catch(err){
    console.error(err);
    toast("직원 추가 실패: "+(err.message||String(err)));
  }finally{
    $("addRegistryEmployeeBtn").disabled=false;
    $("addRegistryEmployeeBtn").textContent="직원 추가";
  }
}

function getAllManagedEmployees(){
  const joinedByEmpNo=new Map(state.employees.map(e=>[String(e.emp_no),e]));
  const rows=state.employeeRegistry.map(r=>{
    const joined=joinedByEmpNo.get(String(r.emp_no));
    return joined?{...r,...joined,registry_only:false,account_status:"가입 완료"}:{...r,id:null,registry_only:true,account_status:"가입 전"};
  });
  state.employees.forEach(e=>{
    if(!state.employeeRegistry.some(r=>String(r.emp_no)===String(e.emp_no))) rows.push({...e,registry_only:false,account_status:"가입 완료"});
  });
  return rows.sort((a,b)=>(Number(a.sort_order||999)-Number(b.sort_order||999))||String(a.team||"").localeCompare(String(b.team||""))||String(a.name||"").localeCompare(String(b.name||"")));
}
function renderEmployees(){
  const all=getAllManagedEmployees();
  const rows=all.map(x=>{
    const s=x.id?employeeLeaveStats(x.id):{annualBalance:Number(x.annual_leave_granted||0),compBalance:0};
    return [
      `<button class="btn small" onclick="selectEmployeeByEmpNo('${escapeHtml(String(x.emp_no||""))}')">수정</button>`,
      x.emp_no,x.name,x.department||"",x.team||"",x.position||"",
      formatDays(s.annualBalance),formatDays(s.compBalance),x.account_status,x.is_active===false?"비활성":"재직"
    ];
  });
  const box=$("employeeTable");
  if(box)box.innerHTML=tableHtml(["수정","직원번호","이름","부서","팀","직급","연차잔여","대휴잔여","계정","상태"],rows);
}
function tableHtml(head,rows){
  const cell=value=>{
    const text=String(value??"");
    return /^\s*<(button|a|span|div|input|select)\b/i.test(text)?text:escapeHtml(text);
  };
  return `<div class="table-wrap"><table><thead><tr>${head.map(h=>`<th>${escapeHtml(h)}</th>`).join("")}</tr></thead><tbody>${rows.length?rows.map(r=>`<tr>${r.map(c=>`<td>${cell(c)}</td>`).join("")}</tr>`).join(""):`<tr><td colspan="${head.length}">등록된 내용이 없습니다.</td></tr>`}</tbody></table></div>`;
}
window.selectEmployeeByEmpNo=function(empNo){
  const e=getAllManagedEmployees().find(x=>String(x.emp_no)===String(empNo));
  if(!e)return;
  showEmployeeMode("edit");
  $("employeeEditEmpty").classList.add("hidden");$("employeeEditForm").classList.remove("hidden");
  $("editEmployeeId").value=e.id||"";$("editRegistryOnly").value=String(!!e.registry_only);$("editOriginalEmpNo").value=e.emp_no||"";
  $("editEmpNo").value=e.emp_no||"";$("editName").value=e.name||"";
  $("editDepartment").value=e.department||"";$("editTeam").value=e.team||"";$("editPosition").value=e.position||"";
  $("editPhone").value=e.phone||"";$("editAnnualLeave").value=Number(e.annual_leave_granted??0);$("editEmergencyName").value=e.emergency_contact_name||"";$("editEmergencyRelation").value=e.emergency_contact_relation||"";$("editEmergencyPhone").value=e.emergency_contact_phone||"";$("editSortOrder").value=e.sort_order??999;
  $("editActive").value=String(e.is_active!==false);$("editSuperAdmin").value=String(!!e.is_super_admin);
  $("editPrivateReceiver").value=String(!!e.can_receive_private);
  $("editSelectedEmployeeName").textContent=`${e.name||""} (${e.emp_no||""})`;
  $("editSelectedEmployeeAccount").textContent=e.account_status||"";
  document.querySelectorAll(".joined-only-field").forEach(el=>el.classList.toggle("hidden",!!e.registry_only));
  updateEmployeeLeavePreview();
  renderEmployeeLeaveHistory();
}
window.selectEmployee=function(id){
  const e=state.employees.find(x=>x.id===id);if(e)selectEmployeeByEmpNo(e.emp_no);
}
function updateEmployeeLeavePreview(){
  const id=$("editEmployeeId")?.value;
  const granted=Number($("editAnnualLeave")?.value||0);
  const s=id?employeeLeaveStats(id,granted):{granted,annualAdjustment:0,annualUsed:0,annualBalance:granted,compGranted:0,compBalance:0};
  if($("editLeaveGrantedPreview"))$("editLeaveGrantedPreview").textContent=formatDays(s.granted)+"일";
  if($("editAnnualAdjustmentPreview"))$("editAnnualAdjustmentPreview").textContent=(s.annualAdjustment>=0?"+":"")+formatDays(s.annualAdjustment)+"일";
  if($("editLeaveUsedPreview"))$("editLeaveUsedPreview").textContent=formatDays(s.annualUsed)+"일";
  if($("editLeaveBalancePreview"))$("editLeaveBalancePreview").textContent=formatDays(s.annualBalance)+"일";
  if($("editCompGrantedPreview"))$("editCompGrantedPreview").textContent=formatDays(s.compGranted)+"일";
  if($("editCompBalancePreview"))$("editCompBalancePreview").textContent=formatDays(s.compBalance)+"일";
  if($("editAnnualBalanceTarget")&&document.activeElement!==$("editAnnualBalanceTarget"))$("editAnnualBalanceTarget").value=formatDays(s.annualBalance);
  if($("editCompBalanceTarget")&&document.activeElement!==$("editCompBalanceTarget"))$("editCompBalanceTarget").value=formatDays(s.compBalance);
}

function renderEmployeeLeaveHistory(){
  const box=$("employeeLeaveHistory");if(!box)return;
  const id=$("editEmployeeId")?.value;
  if(!id){box.innerHTML=`<div class="empty compact">가입 완료 직원을 선택하세요.</div>`;return}
  const rows=state.leaveAdjustments.filter(x=>x.employee_id===id).slice(0,50);
  box.innerHTML=rows.length?rows.map(x=>{
    const amount=Number(x.amount||0);
    return `<div class="leave-history-row"><span>${new Date(x.created_at).toLocaleDateString("ko-KR")}</span><b>${x.leave_type==="annual"?"연차":"대휴"}</b><span class="${amount>=0?"plus":"minus"}">${amount>=0?"+":""}${formatDays(amount)}일</span><span>${escapeHtml(x.reason||"")}<br><small>${escapeHtml(x.created_by_name||"관리자")}</small></span></div>`;
  }).join(""):`<div class="empty compact">변경 이력이 없습니다.</div>`;
}

async function addLeaveAdjustment(leaveType,amount,reason){
  const employeeId=$("editEmployeeId").value;
  if(!employeeId){toast("가입 완료 직원을 선택하세요.");return false}
  const {error}=await supabaseClient.rpc("admin_adjust_employee_leave",{
    p_employee_id:employeeId,p_leave_type:leaveType,p_amount:Number(amount),p_reason:reason
  });
  if(error){toast("연차·대휴 수정 실패: "+error.message);return false}
  return true;
}

async function saveLeaveBalances(){
  const employeeId=$("editEmployeeId").value;
  if(!employeeId){toast("가입 완료 직원을 선택하세요.");return}
  const reason=$("editLeaveAdjustmentReason").value.trim();
  if(!reason){toast("수정 사유를 입력하세요.");$("editLeaveAdjustmentReason").focus();return}
  const current=employeeLeaveStats(employeeId,Number($("editAnnualLeave").value||0));
  const annualTarget=Number($("editAnnualBalanceTarget").value);
  const compTarget=Number($("editCompBalanceTarget").value);
  if(!Number.isFinite(annualTarget)||annualTarget<0||!Number.isFinite(compTarget)||compTarget<0){
    toast("연차와 대휴 잔여일수를 올바르게 입력하세요.");return;
  }
  const annualDelta=Number((annualTarget-current.annualBalance).toFixed(2));
  const compDelta=Number((compTarget-current.compBalance).toFixed(2));
  if(Math.abs(annualDelta)<0.001&&Math.abs(compDelta)<0.001){toast("변경된 잔여일수가 없습니다.");return}

  $("saveLeaveBalancesBtn").disabled=true;
  $("saveLeaveBalancesBtn").textContent="저장 중...";
  try{
    const {error}=await supabaseClient.rpc("admin_set_employee_leave_balances",{
      p_employee_id:employeeId,
      p_annual_delta:annualDelta,
      p_comp_delta:compDelta,
      p_reason:reason
    });
    if(error){
      const message="연차·대휴 저장 실패: "+error.message+"\n\nSupabase에서 V44 SQL을 먼저 실행했는지 확인하세요.";
      toast(message);
      alert(message);
      return;
    }
    await Promise.all([loadLeaveAdjustments(),loadCalendarEntries(),loadEmployees()]);
    updateEmployeeLeavePreview();
    renderEmployeeLeaveHistory();
    renderEmployees();
    $("editLeaveAdjustmentReason").value="";
    toast("연차·대휴 잔여일수를 저장했습니다.");
    alert("연차·대휴 잔여일수가 정상적으로 저장되었습니다.");
  }finally{
    $("saveLeaveBalancesBtn").disabled=false;
    $("saveLeaveBalancesBtn").textContent="연차·대휴 잔여일수 저장";
  }
}

async function quickLeaveAdjustment(type,delta){
  const employeeId=$("editEmployeeId").value;
  if(!employeeId){toast("가입 완료 직원을 선택하세요.");return}
  const reason=$("editLeaveAdjustmentReason").value.trim();
  if(!reason){toast("먼저 수정 사유를 입력하세요.");$("editLeaveAdjustmentReason").focus();return}
  const {error}=await supabaseClient.rpc("admin_set_employee_leave_balances",{
    p_employee_id:employeeId,
    p_annual_delta:type==="annual"?Number(delta):0,
    p_comp_delta:type==="comp"?Number(delta):0,
    p_reason:reason
  });
  if(error){
    const message="연차·대휴 수정 실패: "+error.message+"\n\nSupabase에서 V44 SQL을 먼저 실행했는지 확인하세요.";
    toast(message);alert(message);return;
  }
  await loadLeaveAdjustments();
  updateEmployeeLeavePreview();renderEmployeeLeaveHistory();renderEmployees();
  $("editLeaveAdjustmentReason").value="";
  toast(`${type==="annual"?"연차":"대휴"} ${delta>0?"+":""}${formatDays(delta)}일을 반영했습니다.`);
}
function showEmployeeMode(mode){
  const edit=mode!=="add";
  $("employeeEditPanel")?.classList.toggle("hidden",!edit);
  $("employeeAddPanel")?.classList.toggle("hidden",edit);
  $("showEmployeeEditBtn")?.classList.toggle("primary",edit);
  $("showEmployeeAddBtn")?.classList.toggle("primary",!edit);
}
async function saveEmployee(){
  const id=$("editEmployeeId").value;
  const registryOnly=$("editRegistryOnly").value==="true";
  const original=getAllManagedEmployees().find(x=>String(x.emp_no)===String($("editOriginalEmpNo").value)) || getAllManagedEmployees().find(x=>x.id===id);
  if(!original){toast("직원을 선택하세요.");return;}

  const payload={
    p_user_id:id,
    p_emp_no:$("editEmpNo").value.trim(),
    p_name:$("editName").value.trim(),
    p_department:$("editDepartment").value.trim()||"물류본부",
    p_team:$("editTeam").value.trim(),
    p_position:$("editPosition").value.trim()||"사원",
    p_phone:$("editPhone").value.trim(),
    p_annual_leave_granted:Number($("editAnnualLeave").value||0),
    p_emergency_contact_name:$("editEmergencyName").value.trim(),
    p_emergency_contact_relation:$("editEmergencyRelation").value.trim(),
    p_emergency_contact_phone:$("editEmergencyPhone").value.trim(),
    p_sort_order:Number($("editSortOrder").value||999),
    p_is_active:$("editActive").value==="true",
    p_is_super_admin:$("editSuperAdmin").value==="true",
    p_can_receive_private:$("editPrivateReceiver").value==="true"
  };

  if(!payload.p_emp_no||!payload.p_name){
    toast("사원번호와 이름은 필수입니다.");
    return;
  }

  $("saveEmployeeBtn").disabled=true;
  $("saveEmployeeBtn").textContent="저장 중...";

  try{
    let result;
    if(registryOnly){
      result=await supabaseClient.rpc("save_employee_registry_admin",{
        p_old_emp_no:original.emp_no,
        p_emp_no:payload.p_emp_no,
        p_name:payload.p_name,
        p_department:payload.p_department,
        p_team:payload.p_team,
        p_position:payload.p_position,
        p_annual_leave_granted:payload.p_annual_leave_granted,
        p_sort_order:payload.p_sort_order,
        p_is_active:payload.p_is_active
      });
    }else{
      result=await supabaseClient.rpc("save_employee_admin",payload);
    }
    if(result.error)throw result.error;

    await Promise.all([
      loadEmployees(),
      loadEmployeeRegistry(),
      loadOrgTeams(),
      loadCalendarEntries(),
      loadLeaveAdjustments()
    ]);

    renderEmployees();
    renderEmployeeRegistry();
    renderOrg();
    renderOrgManagement();

    selectEmployeeByEmpNo(payload.p_emp_no);

    toast("직원정보와 조직도를 저장했습니다.");
  }catch(err){
    console.error("saveEmployee error",err);
    toast("직원정보 저장 실패: "+(err.message||String(err)));
  }finally{
    $("saveEmployeeBtn").disabled=false;
    $("saveEmployeeBtn").textContent="직원정보 저장";
  }
}
function openSelectedPermission(){
  const id=$("editEmployeeId").value;if(!id){toast("직원을 선택하세요.");return}
  state.selectedPermissionUser=id;goPage("permissions");renderPermissions();
}
function findDirectorProfile(){
  return state.employees.find(x=>String(x.emp_no||"").toUpperCase()==="EMP001")
    || state.employees.find(x=>x.name==="손동오")
    || state.employees.find(x=>x.is_super_admin);
}
async function sendPrivate(){
  const director=findDirectorProfile();
  const recipient=director?.id||"";
  const title=$("privateTitle").value.trim(),content=$("privateContent").value.trim();
  if(!recipient){toast("손동오 이사 계정을 찾지 못했습니다. V52.1 SQL을 먼저 실행하세요.");return}
  if(!title||!content){toast("제목과 내용을 입력하세요.");return}
  const {error}=await supabaseClient.from("private_messages").insert({sender_id:state.user.id,recipient_id:recipient,title,content});
  if(error){toast("비밀소통 전송 실패: "+error.message);return}
  $("privateTitle").value="";$("privateContent").value="";
  toast("손동오 이사에게 비공개로 보냈습니다.");await loadPrivateMessages();renderPrivate();
}
function renderPrivate(){
  const director=findDirectorProfile();
  if($("privateRecipient"))$("privateRecipient").value=director?.id||"";
  if($("privateRecipientName"))$("privateRecipientName").value=director?`${director.name||"손동오"} ${director.position||"이사"}`:"손동오 이사";
  $("privateList").innerHTML=state.privateMessages.map(x=>`<div class="list-item"><b>${escapeHtml(x.title)}</b><small>${new Date(x.created_at).toLocaleString("ko-KR")} · ${x.is_answered?"답변완료":"확인중"}</small><p>${escapeHtml(x.content)}</p></div>`).join("")||`<div class="empty">비밀소통 내역 없음</div>`;
}
async function renderPermissions(){
  if(!has("permissions_manage"))return;

  if(!state.selectedPermissionUser&&state.employees[0]){
    state.selectedPermissionUser=state.employees[0].id;
  }

  $("permissionUsers").innerHTML=state.employees.map(x=>`
    <div class="permission-user ${state.selectedPermissionUser===x.id?"active":""}"
         onclick="selectPermissionUser('${x.id}')">
      ${escapeHtml(x.name)}
      <small>${escapeHtml(x.position||"")}</small>
    </div>`).join("");

  const selected=state.employees.find(x=>x.id===state.selectedPermissionUser);
  if(!selected)return;

  const isSuper=!!selected.is_super_admin;

  const {data,error}=await supabaseClient
    .from("user_permissions")
    .select("*")
    .eq("user_id",state.selectedPermissionUser)
    .maybeSingle();

  if(error){
    toast("권한 불러오기 실패: "+error.message);
    return;
  }

  const p=data||{};

  $("permissionNotice").innerHTML=isSuper
    ? `<b>${escapeHtml(selected.name)}</b>님은 최고관리자입니다. 최고관리자는 시스템 보호를 위해 항상 모든 권한을 가집니다.`
    : `<b>${escapeHtml(selected.name)}</b>님의 권한을 세부적으로 설정할 수 있습니다. 체크하지 않은 메뉴는 로그인 후 보이지 않습니다.`;

  $("permissionChecks").innerHTML=PERMISSION_DEFS.map(([k,l])=>`
    <div class="perm">
      <label>
        <input type="checkbox"
               data-perm="${k}"
               ${isSuper||p[k]?"checked":""}
               ${isSuper?"disabled":""}>
        ${l}
      </label>
    </div>`).join("");

  $("savePermissionBtn").disabled=isSuper;
  $("basicPermissionBtn").disabled=isSuper;
  $("clearPermissionBtn").disabled=isSuper;
  $("allPermissionBtn").disabled=isSuper;
}

window.selectPermissionUser=async id=>{
  state.selectedPermissionUser=id;
  await renderPermissions();
};

function setPermissionPreset(mode){
  const selected=state.employees.find(x=>x.id===state.selectedPermissionUser);
  if(!selected||selected.is_super_admin)return;

  document.querySelectorAll("[data-perm]").forEach(box=>{
    if(mode==="all")box.checked=true;
    else if(mode==="none")box.checked=false;
    else if(mode==="basic")box.checked=BASIC_PERMISSIONS.has(box.dataset.perm);
  });
}

async function savePermissions(){
  const selected=state.employees.find(x=>x.id===state.selectedPermissionUser);
  if(!selected){
    toast("직원을 선택하세요.");
    return;
  }
  if(selected.is_super_admin){
    toast("최고관리자는 항상 모든 권한을 가집니다.");
    return;
  }

  const obj={user_id:state.selectedPermissionUser};
  document.querySelectorAll("[data-perm]").forEach(x=>{
    obj[x.dataset.perm]=x.checked;
  });

  const {error}=await supabaseClient
    .from("user_permissions")
    .upsert(obj,{onConflict:"user_id"});

  if(error){
    toast("권한 저장 실패: "+error.message);
    return;
  }

  toast(`${selected.name}님의 권한을 저장했습니다.`);
  await renderPermissions();
}

$("loginBtn").onclick=login;$("logoutBtn").onclick=logout;
$("openSignupBtn").onclick=openSignup;$("closeSignupBtn").onclick=closeSignup;$("signupBtn").onclick=signup;
$("newNoticeBtn").onclick=()=>toggle("noticeForm");$("saveNoticeBtn").onclick=saveNotice;
$("saveCardBtn").onclick=saveCard;$("exportCardBtn").onclick=exportCards;$("cardMonthFilter").onchange=renderCards;$("cardSearch").oninput=renderCards;
$("cardReceiptFile").onchange=e=>{
  const file=e.target.files?.[0];
  if(!file){$("receiptPreviewWrap").classList.add("hidden");return}
  $("receiptPreview").src=URL.createObjectURL(file);
  $("receiptPreviewWrap").classList.remove("hidden");
  $("cardReceipt").value="첨부";
};
$("saveItemBtn").onclick=saveItem;$("saveTxBtn").onclick=saveTx;$("exportInventoryBtn").onclick=exportInventory;
$("savePurchaseBtn").onclick=savePurchase;$("purchaseStatusFilter").onchange=renderPurchases;$("refreshPurchaseBtn").onclick=async()=>{await loadPurchaseRequests();renderPurchases();toast("구매 내역을 새로고침했습니다.")};
$("sendPrivateBtn").onclick=sendPrivate;
$("savePermissionBtn").onclick=savePermissions;
$("basicPermissionBtn").onclick=()=>setPermissionPreset("basic");
$("clearPermissionBtn").onclick=()=>setPermissionPreset("none");
$("allPermissionBtn").onclick=()=>setPermissionPreset("all");
$("addRegistryEmployeeBtn").onclick=addRegistryEmployee;
$("openCalendarFormBtn").onclick=()=>{$("calendarForm").classList.remove("hidden")};
$("closeCalendarFormBtn").onclick=()=>{$("calendarForm").classList.add("hidden")};
$("saveCalendarBtn").onclick=saveCalendarEntry;
$("prevMonthBtn").onclick=()=>moveCalendarMonth(-1);$("nextMonthBtn").onclick=()=>moveCalendarMonth(1);
$("todayBtn").onclick=()=>{state.calendarDate=new Date();renderCalendar()};
$("calendarEmployeeFilter").onchange=()=>{
  const selected=$("calendarEmployeeFilter").value;
  if(has("calendar_manage")&&selected!=="all"&&$("calendarTargetEmployee")){
    $("calendarTargetEmployee").value=selected;
  }
  renderCalendar();
};

$("saveContractorBtn").onclick=saveContractor;
$("clearContractorBtn").onclick=clearContractorForm;
$("refreshContractorBtn").onclick=async()=>{await Promise.all([loadContractorWorkforce(),loadCalendarEntries(),loadEmployees()]);renderContractors();renderCalendar();renderDashboard();toast("외주 인력과 식사 인원을 새로고침했습니다.")};
$("contractorWorkDate").onchange=renderContractorSummary;
$("contractorMonthFilter").onchange=renderContractors;
$("todayContractorBtn").onclick=()=>{
  const today=new Date().toISOString().slice(0,10);
  $("contractorWorkDate").value=today;
  $("contractorMonthFilter").value=today.slice(0,7);
  renderContractors();
};


function isoDateOffset(days){const d=new Date();d.setDate(d.getDate()+days);return d.toISOString().slice(0,10)}
async function loadCompanyEvents(){const {data}=await supabaseClient.from("company_events").select("*").order("start_date");state.companyEvents=data||[]}
async function loadMeetingBookings(){const {data}=await supabaseClient.from("meeting_room_bookings").select("*").order("meeting_date").order("start_time");state.meetingBookings=data||[]}
async function loadVehicles(){const {data}=await supabaseClient.from("fleet_vehicles").select("*").order("vehicle_name");state.vehicles=data||[];if(!state.selectedVehicleId&&state.vehicles[0])state.selectedVehicleId=state.vehicles[0].id}
async function loadVehicleTrips(){const {data}=await supabaseClient.from("vehicle_trip_logs").select("*").order("trip_date",{ascending:false}).limit(1000);state.vehicleTrips=data||[]}
async function loadVehicleMaintenance(){const {data}=await supabaseClient.from("vehicle_maintenance").select("*").order("maintenance_date",{ascending:false}).limit(1000);state.vehicleMaintenance=data||[]}

function renderCompanyEvents(){if(!$("companyEventTable"))return;const month=$("eventMonthFilter").value||isoDateOffset(0).slice(0,7);const rows=state.companyEvents.filter(x=>String(x.start_date).startsWith(month));$("companyEventTable").innerHTML=tableHtml(["구분","행사명","기간","시간","담당","인원","장소","관리"],rows.map(x=>[eventTypeLabel(x.event_type),x.title,`${x.start_date}${x.end_date!==x.start_date?` ~ ${x.end_date}`:""}`,x.event_time||"",x.manager_name||"",`${x.participant_count||0}명`,x.location||"",has("calendar_manage")?`<button class="btn small danger" onclick="deleteCompanyEvent('${x.id}')">삭제</button>`:""]));const today=isoDateOffset(0);$("eventUpcomingList").innerHTML=state.companyEvents.filter(x=>x.end_date>=today).slice(0,8).map(x=>`<div class="list-item"><b>${eventTypeLabel(x.event_type)} · ${escapeHtml(x.title)}</b><small>${x.start_date} ${escapeHtml(x.event_time||"")} · ${escapeHtml(x.location||"")}</small></div>`).join("")||`<div class="empty">예정된 일정이 없습니다.</div>`}
function eventTypeLabel(t){return ({b2c:"B2C 행사",company:"회사 일정",education:"교육",cleanup:"창고 정리",dinner:"회식",other:"기타"})[t]||t}
async function saveCompanyEvent(){if(!has("calendar_manage")){toast("달력 관리자만 등록할 수 있습니다.");return}const row={event_type:$("eventType").value,title:$("eventTitle").value.trim(),start_date:$("eventStartDate").value,end_date:$("eventEndDate").value||$("eventStartDate").value,event_time:$("eventTime").value.trim(),manager_name:$("eventManager").value.trim(),participant_count:Number($("eventParticipants").value||0),location:$("eventLocation").value.trim(),memo:$("eventMemo").value.trim(),created_by:state.user.id};if(!row.title||!row.start_date){toast("행사명과 시작일을 입력하세요.");return}const {error}=await supabaseClient.from("company_events").insert(row);if(error){toast("일정 저장 실패: "+error.message);return}await loadCompanyEvents();clearCompanyEvent();renderCompanyEvents();renderCalendar();renderDashboard();toast("회사 일정을 저장했습니다.")}
function clearCompanyEvent(){["eventTitle","eventTime","eventManager","eventLocation","eventMemo"].forEach(id=>$(id).value="");$("eventParticipants").value=0;$("eventStartDate").value=isoDateOffset(0);$("eventEndDate").value=isoDateOffset(0)}
window.deleteCompanyEvent=async id=>{if(!confirm("이 일정을 삭제할까요?"))return;await supabaseClient.from("company_events").delete().eq("id",id);await loadCompanyEvents();renderCompanyEvents();renderCalendar();renderDashboard()}

function renderMeetings(){if(!$("meetingTable"))return;const month=$("meetingMonthFilter").value||isoDateOffset(0).slice(0,7);const rows=state.meetingBookings.filter(x=>String(x.meeting_date).startsWith(month));$("meetingTable").innerHTML=tableHtml(["날짜","시간","미팅명","예약자","누구와","참석자","관리"],rows.map(x=>[x.meeting_date,`${String(x.start_time).slice(0,5)}~${String(x.end_time).slice(0,5)}`,x.title,x.organizer_name||"",x.meeting_with||"",x.attendees||"",(x.created_by===state.user.id||has("calendar_manage"))?`<button class="btn small danger" onclick="deleteMeeting('${x.id}')">취소</button>`:""]));const end=isoDateOffset(1);$("meetingTodayList").innerHTML=state.meetingBookings.filter(x=>x.meeting_date>=isoDateOffset(0)&&x.meeting_date<=end).map(x=>`<div class="list-item"><b>${x.meeting_date===isoDateOffset(0)?"오늘":"내일"} ${String(x.start_time).slice(0,5)} · ${escapeHtml(x.title)}</b><small>${escapeHtml(x.organizer_name||"")} · ${escapeHtml(x.meeting_with||"")}</small></div>`).join("")||`<div class="empty">오늘·내일 예약이 없습니다.</div>`}
async function saveMeeting(){const row={room_name:$("meetingRoom").value,meeting_date:$("meetingDate").value,start_time:$("meetingStart").value,end_time:$("meetingEnd").value,title:$("meetingTitle").value.trim(),organizer_name:$("meetingOrganizer").value.trim()||state.profile.name,meeting_with:$("meetingWith").value.trim(),attendees:$("meetingAttendees").value.trim(),memo:$("meetingMemo").value.trim(),created_by:state.user.id};if(!row.meeting_date||!row.start_time||!row.end_time||!row.title){toast("날짜, 시간, 미팅명을 입력하세요.");return}if(row.start_time>=row.end_time){toast("종료시간은 시작시간보다 늦어야 합니다.");return}const overlap=state.meetingBookings.some(x=>x.room_name===row.room_name&&x.meeting_date===row.meeting_date&&row.start_time<String(x.end_time).slice(0,5)&&row.end_time>String(x.start_time).slice(0,5));if(overlap){toast("이미 예약된 시간과 겹칩니다.");return}const {error}=await supabaseClient.from("meeting_room_bookings").insert(row);if(error){toast("예약 실패: "+error.message);return}await loadMeetingBookings();clearMeeting();renderMeetings();renderDashboard();toast("회의실을 예약했습니다.")}
function clearMeeting(){["meetingTitle","meetingWith","meetingAttendees","meetingMemo"].forEach(id=>$(id).value="");$("meetingDate").value=isoDateOffset(0);$("meetingStart").value="09:00";$("meetingEnd").value="10:00";$("meetingOrganizer").value=state.profile?.name||""}
window.deleteMeeting=async id=>{if(!confirm("예약을 취소할까요?"))return;await supabaseClient.from("meeting_room_bookings").delete().eq("id",id);await loadMeetingBookings();renderMeetings();renderDashboard()}


function selectedVehicle(){return state.vehicles.find(x=>x.id===state.selectedVehicleId)||null}
function renderSelectedVehicleSummary(){
  const box=$("selectedVehicleSummary"); if(!box)return;
  const v=selectedVehicle();
  if(!v){box.innerHTML=`<div class="empty">차량을 선택하세요.</div>`;return}
  const trips=state.vehicleTrips.filter(x=>x.vehicle_id===v.id);
  const maint=state.vehicleMaintenance.filter(x=>x.vehicle_id===v.id);
  const totalKm=trips.reduce((s,x)=>s+Number(x.distance_km||0),0);
  const totalFuel=trips.reduce((s,x)=>s+Number(x.fuel_cost||0),0);
  const totalMaint=maint.reduce((s,x)=>s+Number(x.cost||0),0);
  box.innerHTML=`<div><span>선택 차량</span><b>${escapeHtml(v.vehicle_name)} ${escapeHtml(v.vehicle_number)}</b></div>
  <div><span>현재 주행거리</span><b>${Number(v.current_mileage||0).toLocaleString()}km</b></div>
  <div><span>등록 운행거리</span><b>${totalKm.toLocaleString()}km</b></div>
  <div><span>주유비 합계</span><b>${money(totalFuel)}</b></div>
  <div><span>정비비 합계</span><b>${money(totalMaint)}</b></div>`;
}
function renderVehicles(){
  if(!$("vehicleCards"))return;
  const opts=state.vehicles.map(x=>`<option value="${x.id}">${escapeHtml(x.vehicle_name)} ${escapeHtml(x.vehicle_number)}</option>`).join("");
  $("tripVehicle").innerHTML=opts; $("maintenanceVehicle").innerHTML=opts;
  if(state.selectedVehicleId){$("tripVehicle").value=state.selectedVehicleId;$("maintenanceVehicle").value=state.selectedVehicleId}
  $("vehicleCards").innerHTML=state.vehicles.map(v=>`<article class="vehicle-card ${state.selectedVehicleId===v.id?"active":""}" onclick="selectVehicle('${v.id}')">
    <b>${escapeHtml(v.vehicle_name)}</b><strong>${escapeHtml(v.vehicle_number)}</strong>
    <small>${Number(v.current_mileage||0).toLocaleString()}km · ${escapeHtml(v.status||"운행가능")}</small>
    <div><button class="btn small" onclick="event.stopPropagation();editVehicle('${v.id}')">수정</button></div>
  </article>`).join("")||`<div class="empty">등록된 차량이 없습니다.</div>`;
  renderSelectedVehicleSummary(); renderVehicleTrips(); renderVehicleMaintenance(); renderVehicleAlerts();
}
window.selectVehicle=id=>{state.selectedVehicleId=id;if($("tripVehicle"))$("tripVehicle").value=id;if($("maintenanceVehicle"))$("maintenanceVehicle").value=id;renderVehicles()}
window.editVehicle=id=>{const v=state.vehicles.find(x=>x.id===id);if(!v)return;state.selectedVehicleId=id;state.editingVehicleId=id;$("vehicleName").value=v.vehicle_name||"";$("vehicleNumber").value=v.vehicle_number||"";$("vehicleManager").value=v.manager_name||"";$("vehicleMileage").value=v.current_mileage||0;$("vehicleInspection").value=v.inspection_expiry||"";$("vehicleStatus").value=v.status||"운행가능";$("vehicleMemo").value=v.memo||"";activateVehicleTab("basic")}
function clearVehicle(){state.editingVehicleId=null;["vehicleName","vehicleNumber","vehicleManager","vehicleInspection","vehicleMemo"].forEach(id=>{if($(id))$(id).value=""});$("vehicleMileage").value=0;$("vehicleStatus").value="운행가능"}
async function saveVehicle(){if(!has("employees_manage")&&!state.profile?.is_super_admin){toast("관리자만 차량을 수정할 수 있습니다.");return}const row={vehicle_name:$("vehicleName").value.trim(),vehicle_number:$("vehicleNumber").value.trim(),manager_name:$("vehicleManager").value.trim(),current_mileage:Number($("vehicleMileage").value||0),inspection_expiry:$("vehicleInspection").value||null,status:$("vehicleStatus").value,memo:$("vehicleMemo").value.trim(),updated_at:new Date().toISOString()};if(!row.vehicle_name||!row.vehicle_number){toast("차량명과 차량번호를 입력하세요.");return}let error;if(state.editingVehicleId)({error}=await supabaseClient.from("fleet_vehicles").update(row).eq("id",state.editingVehicleId));else ({error}=await supabaseClient.from("fleet_vehicles").upsert(row,{onConflict:"vehicle_number"}));if(error){toast("차량 저장 실패: "+error.message);return}await loadVehicles();clearVehicle();renderVehicles();toast("차량 정보를 저장했습니다.")}
async function deleteSelectedVehicle(){const v=selectedVehicle();if(!v){toast("삭제할 차량을 선택하세요.");return}if(!has("employees_manage")&&!state.profile?.is_super_admin){toast("관리자만 차량을 삭제할 수 있습니다.");return}if(!confirm(`${v.vehicle_name} ${v.vehicle_number} 차량과 연결된 운행·정비 기록을 모두 삭제할까요?`))return;const {error}=await supabaseClient.from("fleet_vehicles").delete().eq("id",v.id);if(error){toast("차량 삭제 실패: "+error.message);return}state.selectedVehicleId=null;await Promise.all([loadVehicles(),loadVehicleTrips(),loadVehicleMaintenance()]);renderVehicles();clearVehicle();toast("차량을 삭제했습니다.")}

function clearVehicleTrip(){state.editingTripId=null;["tripDepartment","tripDriver","tripStartPlace","tripEndPlace","tripPurpose","tripMemo"].forEach(id=>$(id).value="");["tripDistance","tripOdometer","tripFuelCost"].forEach(id=>$(id).value=0);$("tripDate").value=isoDateOffset(0)}
async function saveVehicleTrip(){const row={vehicle_id:$("tripVehicle").value,trip_date:$("tripDate").value,department:$("tripDepartment").value.trim(),driver_name:$("tripDriver").value.trim(),start_place:$("tripStartPlace").value.trim(),end_place:$("tripEndPlace").value.trim(),purpose_address:$("tripPurpose").value.trim(),distance_km:Number($("tripDistance").value||0),odometer_km:Number($("tripOdometer").value||0),fuel_cost:Number($("tripFuelCost").value||0),memo:$("tripMemo").value.trim(),created_by:state.user.id};if(!row.vehicle_id||!row.trip_date||!row.driver_name){toast("차량, 운행일, 운전자를 입력하세요.");return}let error;if(state.editingTripId)({error}=await supabaseClient.from("vehicle_trip_logs").update(row).eq("id",state.editingTripId));else ({error}=await supabaseClient.from("vehicle_trip_logs").insert(row));if(error){toast("운행일지 저장 실패: "+error.message);return}state.selectedVehicleId=row.vehicle_id;await Promise.all([loadVehicleTrips(),loadVehicles()]);clearVehicleTrip();renderVehicles();toast("운행일지를 저장했습니다.")}
window.editVehicleTrip=id=>{const x=state.vehicleTrips.find(r=>r.id===id);if(!x)return;state.editingTripId=id;state.selectedVehicleId=x.vehicle_id;$("tripVehicle").value=x.vehicle_id;$("tripDate").value=x.trip_date;$("tripDepartment").value=x.department||"";$("tripDriver").value=x.driver_name||"";$("tripStartPlace").value=x.start_place||"";$("tripEndPlace").value=x.end_place||"";$("tripPurpose").value=x.purpose_address||"";$("tripDistance").value=x.distance_km||0;$("tripOdometer").value=x.odometer_km||0;$("tripFuelCost").value=x.fuel_cost||0;$("tripMemo").value=x.memo||"";activateVehicleTab("trip")}
window.deleteVehicleTrip=async id=>{if(!confirm("이 운행일지를 삭제할까요?"))return;const {error}=await supabaseClient.from("vehicle_trip_logs").delete().eq("id",id);if(error){toast("삭제 실패: "+error.message);return}await loadVehicleTrips();renderVehicles();toast("운행일지를 삭제했습니다.")}
function renderVehicleTrips(){if(!$("vehicleTripTable"))return;const month=$("tripMonthFilter")?.value||isoDateOffset(0).slice(0,7);const rows=state.vehicleTrips.filter(x=>(!state.selectedVehicleId||x.vehicle_id===state.selectedVehicleId)&&String(x.trip_date).startsWith(month));$("vehicleTripTable").innerHTML=tableHtml(["일자","차량","운전자","출발","도착","주행km","최종km","주유금액","관리"],rows.map(x=>[x.trip_date,vehicleLabel(x.vehicle_id),x.driver_name,x.start_place||"",x.end_place||"",x.distance_km||0,x.odometer_km||0,money(x.fuel_cost),`<div class="table-actions"><button class="btn small" onclick="editVehicleTrip('${x.id}')">수정</button><button class="btn small danger" onclick="deleteVehicleTrip('${x.id}')">삭제</button></div>`]))}

function clearVehicleMaintenance(){state.editingMaintenanceId=null;["maintenanceShop","maintenanceNextDate","maintenanceMemo"].forEach(id=>$(id).value="");["maintenanceMileage","maintenanceCost","maintenanceNextMileage"].forEach(id=>$(id).value=0);$("maintenanceDate").value=isoDateOffset(0)}
async function saveVehicleMaintenance(){const row={vehicle_id:$("maintenanceVehicle").value,maintenance_date:$("maintenanceDate").value,maintenance_type:$("maintenanceType").value,mileage_km:Number($("maintenanceMileage").value||0),shop_name:$("maintenanceShop").value.trim(),cost:Number($("maintenanceCost").value||0),next_due_date:$("maintenanceNextDate").value||null,next_due_mileage:Number($("maintenanceNextMileage").value||0)||null,memo:$("maintenanceMemo").value.trim(),created_by:state.user.id};if(!row.vehicle_id||!row.maintenance_date){toast("차량과 정비일을 입력하세요.");return}let error;if(state.editingMaintenanceId)({error}=await supabaseClient.from("vehicle_maintenance").update(row).eq("id",state.editingMaintenanceId));else ({error}=await supabaseClient.from("vehicle_maintenance").insert(row));if(error){toast("정비 내역 저장 실패: "+error.message);return}state.selectedVehicleId=row.vehicle_id;await loadVehicleMaintenance();clearVehicleMaintenance();renderVehicles();toast("정비 내역을 저장했습니다.")}
window.editVehicleMaintenance=id=>{const x=state.vehicleMaintenance.find(r=>r.id===id);if(!x)return;state.editingMaintenanceId=id;state.selectedVehicleId=x.vehicle_id;$("maintenanceVehicle").value=x.vehicle_id;$("maintenanceDate").value=x.maintenance_date;$("maintenanceType").value=x.maintenance_type;$("maintenanceMileage").value=x.mileage_km||0;$("maintenanceShop").value=x.shop_name||"";$("maintenanceCost").value=x.cost||0;$("maintenanceNextDate").value=x.next_due_date||"";$("maintenanceNextMileage").value=x.next_due_mileage||0;$("maintenanceMemo").value=x.memo||"";activateVehicleTab("maintenance")}
window.deleteVehicleMaintenance=async id=>{if(!confirm("이 정비 내역을 삭제할까요?"))return;const {error}=await supabaseClient.from("vehicle_maintenance").delete().eq("id",id);if(error){toast("삭제 실패: "+error.message);return}await loadVehicleMaintenance();renderVehicles();toast("정비 내역을 삭제했습니다.")}
function renderVehicleMaintenance(){if(!$("vehicleMaintenanceTable"))return;const month=$("maintenanceMonthFilter")?.value||isoDateOffset(0).slice(0,7);const rows=state.vehicleMaintenance.filter(x=>(!state.selectedVehicleId||x.vehicle_id===state.selectedVehicleId)&&String(x.maintenance_date).startsWith(month));$("vehicleMaintenanceTable").innerHTML=tableHtml(["정비일","차량","항목","주행거리","업체","비용","다음 예정","관리"],rows.map(x=>[x.maintenance_date,vehicleLabel(x.vehicle_id),x.maintenance_type,`${Number(x.mileage_km||0).toLocaleString()}km`,x.shop_name||"",money(x.cost),x.next_due_date||((x.next_due_mileage||"")+"km"),`<div class="table-actions"><button class="btn small" onclick="editVehicleMaintenance('${x.id}')">수정</button><button class="btn small danger" onclick="deleteVehicleMaintenance('${x.id}')">삭제</button></div>`]))}
function vehicleLabel(id){const v=state.vehicles.find(x=>x.id===id);return v?`${v.vehicle_name} ${v.vehicle_number}`:"차량"}
function renderVehicleAlerts(){if(!$("vehicleAlertList"))return;const soon=isoDateOffset(30);let a=[];state.vehicles.forEach(v=>{if(v.inspection_expiry&&v.inspection_expiry<=soon)a.push(`${v.vehicle_name} 검사 만료 ${v.inspection_expiry}`)});state.vehicleMaintenance.forEach(m=>{if(m.next_due_date&&m.next_due_date<=soon)a.push(`${vehicleLabel(m.vehicle_id)} ${m.maintenance_type} 예정 ${m.next_due_date}`)});$("vehicleAlertList").innerHTML=a.map(x=>`<div class="list-item"><b>${escapeHtml(x)}</b></div>`).join("")||`<div class="empty">30일 이내 차량 알림이 없습니다.</div>`}
function vehicleWorkbookRows(vehicleId=null){const vehicles=vehicleId?state.vehicles.filter(v=>v.id===vehicleId):state.vehicles;const trips=state.vehicleTrips.filter(x=>!vehicleId||x.vehicle_id===vehicleId);const maint=state.vehicleMaintenance.filter(x=>!vehicleId||x.vehicle_id===vehicleId);return {vehicles,trips,maint}}
function exportVehicleExcel(vehicleId=null){
  if(!window.XLSX){toast("엑셀 기능을 불러오지 못했습니다.");return}
  const data=vehicleWorkbookRows(vehicleId);
  const wb=XLSX.utils.book_new();
  const targets=vehicleId?data.vehicles:state.vehicles;

  const safeSheetName=name=>String(name||"차량").replace(/[\\/?*\[\]:]/g," ").slice(0,31);
  const applyWidths=(ws,widths)=>{ws["!cols"]=widths.map(w=>({wch:w}))};
  const border={top:{style:"thin",color:{rgb:"000000"}},bottom:{style:"thin",color:{rgb:"000000"}},left:{style:"thin",color:{rgb:"000000"}},right:{style:"thin",color:{rgb:"000000"}}};
  const styleRange=(ws,range,style)=>{const r=XLSX.utils.decode_range(range);for(let R=r.s.r;R<=r.e.r;R++)for(let C=r.s.c;C<=r.e.c;C++){const a=XLSX.utils.encode_cell({r:R,c:C});if(ws[a])ws[a].s={...(ws[a].s||{}),...style};}};

  targets.forEach((v,idx)=>{
    const trips=state.vehicleTrips.filter(x=>x.vehicle_id===v.id).sort((a,b)=>String(a.trip_date).localeCompare(String(b.trip_date)));
    const firstKm=trips.length?Number(trips[0].odometer_km||0)-Number(trips[0].distance_km||0):Number(v.current_mileage||0);
    const rows=[];
    rows.push(["업무용 차량 일지","","","","","","","","","",""]);
    rows.push(["","","","","","","","","","",""]);
    rows.push(["1. 기본 정보 ","","","","","","","","","",""]);
    rows.push(["①차종",v.vehicle_name||"","","","②차량번호",v.vehicle_number||"","","","","",""]);
    rows.push(["담당자",v.manager_name||"","","","현재 주행거리",Number(v.current_mileage||0),"","","검사 만료일",v.inspection_expiry||"",""]);
    rows.push(["","","","","","","","","","",""]);
    rows.push(["2. 차량 운행기록 내역","","","","","","","","최초 km : "+Number(firstKm||0).toLocaleString(),"",""]);
    rows.push(["년도","월","일","부서","성명","출발지명","도착지명","주소 또는 목적","주행km","최종km\n(계기판)","주유기록\n(금액)"]);
    trips.forEach(x=>{
      const d=new Date(x.trip_date+"T00:00:00");
      rows.push([d.getFullYear(),d.getMonth()+1,d.getDate(),x.department||"",x.driver_name||"",x.start_place||"",x.end_place||"",x.purpose_address||"",Number(x.distance_km||0),Number(x.odometer_km||0),Number(x.fuel_cost||0)]);
    });
    if(!trips.length)for(let i=0;i<20;i++)rows.push(["","","","","","","","","","",""]);
    const ws=XLSX.utils.aoa_to_sheet(rows);
    ws["!merges"]=[XLSX.utils.decode_range("A1:K1"),XLSX.utils.decode_range("A3:K3"),XLSX.utils.decode_range("A7:H7")];
    applyWidths(ws,[8,7,7,12,12,18,18,30,11,13,14]);
    ws["!rows"]=[{hpt:28},{hpt:8},{hpt:22},{hpt:22},{hpt:22},{hpt:8},{hpt:22},{hpt:36}];
    styleRange(ws,"A1:K1",{font:{bold:true,sz:16},alignment:{horizontal:"center",vertical:"center"}});
    styleRange(ws,"A3:K3",{font:{bold:true,sz:12},fill:{fgColor:{rgb:"D9EAF7"}},border});
    styleRange(ws,"A4:K5",{border,alignment:{vertical:"center"}});
    styleRange(ws,"A7:K7",{font:{bold:true,sz:12},fill:{fgColor:{rgb:"D9EAF7"}},border});
    styleRange(ws,"A8:K"+rows.length,{border,alignment:{horizontal:"center",vertical:"center",wrapText:true}});
    styleRange(ws,"A8:K8",{font:{bold:true},fill:{fgColor:{rgb:"EDEDED"}},border,alignment:{horizontal:"center",vertical:"center",wrapText:true}});
    for(let r=9;r<=rows.length;r++){const c=ws["K"+r];if(c)c.z='#,##0"원"';const i=ws["I"+r];if(i)i.z='0.0';const j=ws["J"+r];if(j)j.z='#,##0';}
    ws["!autofilter"]={ref:"A8:K"+rows.length};
    ws["!freeze"]={xSplit:0,ySplit:8};
    XLSX.utils.book_append_sheet(wb,ws,safeSheetName((v.vehicle_name||"차량")+"_"+(v.vehicle_number||idx+1)));
  });

  const maintRows=[["정비일","차량명","차량번호","정비 항목","당시 주행거리","정비업체","비용","다음 교체 예정일","다음 교체 예정 주행거리","메모"]];
  data.maint.sort((a,b)=>String(a.maintenance_date).localeCompare(String(b.maintenance_date))).forEach(x=>{const v=state.vehicles.find(z=>z.id===x.vehicle_id)||{};maintRows.push([x.maintenance_date,v.vehicle_name||"",v.vehicle_number||"",x.maintenance_type||"",Number(x.mileage_km||0),x.shop_name||"",Number(x.cost||0),x.next_due_date||"",Number(x.next_due_mileage||0)||"",x.memo||""])});
  const mws=XLSX.utils.aoa_to_sheet(maintRows);applyWidths(mws,[13,14,14,15,16,18,14,17,22,30]);styleRange(mws,"A1:J"+Math.max(1,maintRows.length),{border,alignment:{vertical:"center",wrapText:true}});styleRange(mws,"A1:J1",{font:{bold:true},fill:{fgColor:{rgb:"EDEDED"}},alignment:{horizontal:"center",vertical:"center",wrapText:true},border});mws["!autofilter"]={ref:"A1:J"+Math.max(1,maintRows.length)};XLSX.utils.book_append_sheet(wb,mws,"정비관리");

  const v=vehicleId?state.vehicles.find(x=>x.id===vehicleId):null;
  XLSX.writeFile(wb,v?`${v.vehicle_name}_${v.vehicle_number}_차량운행일지.xlsx`:`서린컴퍼니_전체차량운행일지.xlsx`,{cellStyles:true});
}
function activateVehicleTab(tab){document.querySelectorAll(".vehicle-tab").forEach(x=>x.classList.toggle("active",x.dataset.vtab===tab));$("vehicleBasicPanel").classList.toggle("hidden",tab!=="basic");$("vehicleTripPanel").classList.toggle("hidden",tab!=="trip");$("vehicleMaintenancePanel").classList.toggle("hidden",tab!=="maintenance")}

function renderDashboardSchedule(){if(!$("dashboardScheduleList"))return;const today=isoDateOffset(0),tomorrow=isoDateOffset(1);let items=[];state.companyEvents.filter(x=>x.start_date<=tomorrow&&x.end_date>=today).forEach(x=>items.push({d:x.start_date,label:`${eventTypeLabel(x.event_type)} · ${x.title}`,meta:`${x.event_time||""} ${x.location||""}`}));state.meetingBookings.filter(x=>x.meeting_date>=today&&x.meeting_date<=tomorrow).forEach(x=>items.push({d:x.meeting_date,label:`회의 · ${x.title}`,meta:`${String(x.start_time).slice(0,5)} ${x.meeting_with||""}`}));items.sort((a,b)=>a.d.localeCompare(b.d));$("dashboardScheduleList").innerHTML=items.map(x=>`<div class="list-item"><b>${x.d===today?"오늘":"내일"} · ${escapeHtml(x.label)}</b><small>${escapeHtml(x.meta)}</small></div>`).join("")||`<div class="empty">오늘·내일 일정이 없습니다.</div>`}

window.openOrgPerson=function(empNo){const e=(state.employees||[]).find(x=>String(x.emp_no)===String(empNo));if(!e)return;const canEmergency=has("emergency_contacts_view")||e.id===state.user.id;$("orgPersonDetail").innerHTML=`<div class="org-contact-card"><h3>${escapeHtml(e.name||"")} <span>${escapeHtml(e.position||"")}</span></h3><p>${escapeHtml([e.department,e.team].filter(Boolean).join(" · "))}</p><dl><dt>본인 전화번호</dt><dd>${escapeHtml(e.phone||"미등록")}</dd>${canEmergency?`<dt>비상연락 대상</dt><dd>${escapeHtml(e.emergency_contact_name||"미등록")} ${e.emergency_contact_relation?`(${escapeHtml(e.emergency_contact_relation)})`:""}</dd><dt>비상연락 전화번호</dt><dd>${escapeHtml(e.emergency_contact_phone||"미등록")}</dd>`:"<dt>비상연락처</dt><dd>조회 권한이 없습니다.</dd>"}</dl></div>`;$("orgPersonModal").classList.remove("hidden")}


$("closeOrgPersonModalBtn").onclick=()=>$("orgPersonModal").classList.add("hidden");
$("saveCompanyEventBtn").onclick=saveCompanyEvent;$("clearCompanyEventBtn").onclick=clearCompanyEvent;$("eventMonthFilter").onchange=renderCompanyEvents;
$("saveMeetingBtn").onclick=saveMeeting;$("clearMeetingBtn").onclick=clearMeeting;$("meetingMonthFilter").onchange=renderMeetings;
$("saveVehicleBtn").onclick=saveVehicle;$("clearVehicleBtn").onclick=clearVehicle;$("deleteVehicleBtn").onclick=deleteSelectedVehicle;
$("saveVehicleTripBtn").onclick=saveVehicleTrip;$("clearVehicleTripBtn").onclick=clearVehicleTrip;
$("saveVehicleMaintenanceBtn").onclick=saveVehicleMaintenance;$("clearVehicleMaintenanceBtn").onclick=clearVehicleMaintenance;
$("exportVehicleExcelBtn").onclick=()=>exportVehicleExcel(null);$("exportSelectedVehicleExcelBtn").onclick=()=>{if(!state.selectedVehicleId){toast("차량을 먼저 선택하세요.");return}exportVehicleExcel(state.selectedVehicleId)};
$("tripMonthFilter").onchange=renderVehicleTrips;$("maintenanceMonthFilter").onchange=renderVehicleMaintenance;
$("tripVehicle").onchange=e=>{state.selectedVehicleId=e.target.value;renderVehicles()};$("maintenanceVehicle").onchange=e=>{state.selectedVehicleId=e.target.value;renderVehicles()};
document.querySelectorAll(".vehicle-tab").forEach(b=>b.onclick=()=>activateVehicleTab(b.dataset.vtab));

$("changePasswordBtn").onclick=changePassword;
$("reloadKpiBtn").onclick=()=>{$("kpiFrame").src="kpi.html?reload="+Date.now();toast("KPI 화면을 새로고침했습니다.");};
$("reloadB2bBtn").onclick=()=>{
  $("b2bFrame").src="b2b.html?reload="+Date.now();
  toast("B2B 작업통계를 새로고침했습니다.");
};

$("toggleOrgEditBtn").onclick=toggleOrgEdit;
$("addOrgTeamBtn").onclick=addOrgTeam;
$("saveOrgEmployeeBtn").onclick=saveOrgEmployee;
$("closeOrgEditBtn").onclick=closeOrgEdit;
$("orgEditPanel").addEventListener("click",e=>{
  if(e.target.id==="orgEditPanel")closeOrgEdit();
});
$("orgEmployeeSelect").onchange=e=>selectOrgEmployee(e.target.value);
$("sendChatBtn").onclick=sendChat;

$("newMessengerRoomBtn").onclick=openMessengerRoomModal;
$("closeMessengerRoomModalBtn").onclick=closeMessengerRoomModal;
$("messengerRoomType").onchange=updateMessengerRoomType;
$("messengerEmployeeSearch").oninput=renderMessengerEmployeePicker;
$("createMessengerRoomBtn").onclick=createMessengerRoom;
$("messengerMembersBtn").onclick=showMessengerMembers;
$("closeMessengerMembersBtn").onclick=()=>$("messengerMembersModal").classList.add("hidden");
$("messengerRoomModal").addEventListener("click",e=>{if(e.target.id==="messengerRoomModal")closeMessengerRoomModal()});
$("messengerMembersModal").addEventListener("click",e=>{if(e.target.id==="messengerMembersModal")$("messengerMembersModal").classList.add("hidden")});

$("refreshChatBtn").onclick=async()=>{await Promise.all([loadMessengerRooms(),loadChatMessages()]);renderMessengerRooms();renderChat();toast("대화 내용을 새로고침했습니다.")};
$("chatInput").addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendChat()}});
$("emergencySearch").addEventListener("input",renderEmergencyContacts);
$("refreshEmployeesBtn").onclick=async()=>{await Promise.all([loadEmployees(),loadEmployeeRegistry(),loadCalendarEntries(),loadLeaveAdjustments()]);renderEmployees();updateEmployeeLeavePreview();renderEmployeeLeaveHistory();toast("직원목록과 연차·대휴를 새로고침했습니다.")};
$("saveEmployeeBtn").onclick=saveEmployee;$("goPermissionBtn").onclick=openSelectedPermission;
$("showEmployeeEditBtn").onclick=()=>showEmployeeMode("edit");
$("showEmployeeAddBtn").onclick=()=>showEmployeeMode("add");
$("editAnnualLeave").addEventListener("input",updateEmployeeLeavePreview);
$("saveLeaveBalancesBtn").onclick=saveLeaveBalances;
$("refreshLeaveHistoryBtn").onclick=async()=>{await loadLeaveAdjustments();updateEmployeeLeavePreview();renderEmployeeLeaveHistory();toast("연차·대휴 이력을 새로고침했습니다.")};
document.querySelectorAll("[data-leave-type][data-delta]").forEach(btn=>btn.onclick=()=>quickLeaveAdjustment(btn.dataset.leaveType,Number(btn.dataset.delta)));
$("cardDate").value=new Date().toISOString().slice(0,10);$("cardMonthFilter").value=new Date().toISOString().slice(0,7);if($("cardUser"))$("cardUser").value=state.profile?.name||"";
$("calStart").value=new Date().toISOString().slice(0,10);$("calEnd").value=new Date().toISOString().slice(0,10);
if($("contractorWorkDate"))$("contractorWorkDate").value=new Date().toISOString().slice(0,10);
if($("contractorMonthFilter"))$("contractorMonthFilter").value=new Date().toISOString().slice(0,7);
if($("tripMonthFilter"))$("tripMonthFilter").value=new Date().toISOString().slice(0,7);
if($("maintenanceMonthFilter"))$("maintenanceMonthFilter").value=new Date().toISOString().slice(0,7);
["eventStartDate","eventEndDate","meetingDate","tripDate","maintenanceDate"].forEach(id=>{if($(id))$(id).value=isoDateOffset(0)});["eventMonthFilter","meetingMonthFilter"].forEach(id=>{if($(id))$(id).value=isoDateOffset(0).slice(0,7)});if($("meetingStart"))$("meetingStart").value="09:00";if($("meetingEnd"))$("meetingEnd").value="10:00";
document.addEventListener("keydown",e=>{if(e.key==="Enter"&&!$("loginView").classList.contains("hidden"))login()});
document.addEventListener("click",e=>{
  const btn=e.target.closest("button");if(!btn)return;
  if(btn.id==="newMessengerRoomBtn"){e.preventDefault();openMessengerRoomModal();}
  if(btn.id==="saveVehicleBtn"){e.preventDefault();saveVehicle();}
  if(btn.id==="saveLeaveBalancesBtn"){e.preventDefault();saveLeaveBalances();}
  if(btn.matches("[data-leave-type][data-delta]")){e.preventDefault();quickLeaveAdjustment(btn.dataset.leaveType,Number(btn.dataset.delta));}
});
(async()=>{if(!configured)return;const {data}=await supabaseClient.auth.getSession();if(data.session){state.user=data.session.user;await loadProfile();showApp()}})();
