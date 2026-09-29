(() => {
  const DAY = 86400000;
  const BASE_STORAGE_KEY = 'studentHubDemo.v1';
  let activeStorageKey = BASE_STORAGE_KEY;
  const qs = (s, el=document) => el.querySelector(s);
  const qsa = (s, el=document) => [...el.querySelectorAll(s)];
  const uid = (prefix='id') => `${prefix}_${Math.random().toString(36).slice(2,9)}`;
  const startOfDay = d => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
  const addDays = (d, n) => new Date(startOfDay(d).getTime() + n*DAY);
  const isoDate = d => new Date(d).toISOString().slice(0,10);
  const clamp = (n,min,max)=>Math.max(min,Math.min(max,n));
  const esc = str => String(str ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));
  const fmtDate = (d, opts={weekday:'short', month:'short', day:'numeric'}) => new Intl.DateTimeFormat(undefined, opts).format(new Date(d));
  const fmtTime = d => new Intl.DateTimeFormat(undefined,{hour:'numeric',minute:'2-digit'}).format(new Date(d));
  const dateAt = (date, time='09:00') => new Date(`${isoDate(date)}T${time}:00`);

  const colors = { algorithms:'#7e77ef', statistics:'#37a7b7', chemistry:'#d79036', writing:'#c9688a' };

  function seedState() {
    const today = startOfDay(new Date());
    const findNext = dow => {
      const d = new Date(today); const delta = (dow - d.getDay() + 7) % 7 || 7; return addDays(d, delta);
    };
    const tomorrow = addDays(today,1);
    const d2 = addDays(today,2);
    const d4 = addDays(today,4);
    const courses = [
      {id:'alg', code:'CS301', name:'Algorithms', teacher:'Prof. Kim', room:'B204', color:colors.algorithms, schedule:'Tue / Thu · 10:00', grade:78, target:85, topics:['Recursion','Sorting','Graphs','Dynamic Programming']},
      {id:'stats', code:'STAT210', name:'Statistics', teacher:'Dr. Park', room:'C112', color:colors.statistics, schedule:'Mon / Wed · 14:00', grade:82.4, target:88, topics:['Probability','Distributions','Hypothesis Testing','Regression']},
      {id:'chem', code:'CHEM114', name:'Chemistry', teacher:'Prof. Lee', room:'Lab 3', color:colors.chemistry, schedule:'Mon / Fri · 10:00', grade:84, target:88, topics:['Acids & Bases','Equilibrium','Thermodynamics','Kinetics']}
    ];
    const assessments = [
      {id:'a1', courseId:'stats', title:'Problem Set 2', type:'Assignment', due:dateAt(tomorrow,'23:59').toISOString(), effort:100, remaining:85, status:'in_progress', weight:6, topics:['Probability']},
      {id:'a2', courseId:'alg', title:'Project Proposal', type:'Project', due:dateAt(d2,'18:00').toISOString(), effort:150, remaining:150, status:'not_started', weight:10, topics:['Graphs']},
      {id:'a3', courseId:'chem', title:'Lab Report', type:'Assignment', due:dateAt(d4,'23:59').toISOString(), effort:180, remaining:180, status:'not_started', weight:8, topics:['Equilibrium']},
      {id:'a4', courseId:'alg', title:'Midterm', type:'Exam', due:dateAt(addDays(today,11),'10:00').toISOString(), effort:360, remaining:300, status:'not_started', weight:25, topics:['Recursion','Sorting','Graphs']}
    ];
    const events = [
      {id:'e1', courseId:'chem', title:'Chemistry lecture', type:'fixed', start:dateAt(today,'10:00').toISOString(), end:dateAt(today,'11:20').toISOString()},
      {id:'e2', courseId:'stats', title:'Statistics seminar', type:'fixed', start:dateAt(today,'14:00').toISOString(), end:dateAt(today,'15:20').toISOString()},
      {id:'e3', courseId:'alg', title:'Algorithms class', type:'fixed', start:dateAt(tomorrow,'10:00').toISOString(), end:dateAt(tomorrow,'11:20').toISOString()},
      {id:'e4', courseId:'stats', title:'Problem set work', type:'work', assessmentId:'a1', start:dateAt(today,'17:30').toISOString(), end:dateAt(today,'18:15').toISOString()},
      {id:'e5', courseId:'chem', title:'Equilibrium review', type:'study', start:dateAt(today,'19:30').toISOString(), end:dateAt(today,'20:00').toISOString()}
    ];
    const resources = [
      {id:'r1', courseId:'alg', topic:'Recursion', type:'PDF', title:'Lecture 05 — Recursion', description:'Slides · 28 pages', updated:'Today'},
      {id:'r2', courseId:'stats', topic:'Probability', type:'Note', title:'Probability cheat sheet', description:'Personal note · formulas + examples', updated:'Yesterday'},
      {id:'r3', courseId:'chem', topic:'Equilibrium', type:'PDF', title:'Lab 06 instructions', description:'Course PDF · linked to Lab Report', updated:'2d ago'},
      {id:'r4', courseId:'alg', topic:'Graphs', type:'Link', title:'Graph traversal visualizer', description:'Saved link · external resource', updated:'3d ago'},
      {id:'r5', courseId:'chem', topic:'Acids & Bases', type:'Note', title:'Acids & Bases review', description:'Personal note · 12 cards generated', updated:'4d ago'},
      {id:'r6', courseId:'stats', topic:'Distributions', type:'PDF', title:'Chapter 7 — Distributions', description:'Textbook excerpt', updated:'1w ago'}
    ];
    const inbox = [
      {id:'i1', text:'Professor said quiz next Monday covers recursion + sorting', created:new Date().toISOString(), processed:false},
      {id:'i2', text:'https://example.com/statistics-practice — save for probability review', created:new Date().toISOString(), processed:false}
    ];
    return {
      version:1,
      createdAt:new Date().toISOString(),
      route:'today', theme:'light',
      semester:{name:'Fall Semester', start:isoDate(today), availableMinutesPerWeek:840},
      courses, assessments, events, resources, inbox,
      tasks:[],
      studySessions:[],
      review:[
        {id:'rv1', courseId:'chem', topic:'Acids & Bases', due:isoDate(today), mastery:62},
        {id:'rv2', courseId:'alg', topic:'Recursion', due:isoDate(today), mastery:71},
        {id:'rv3', courseId:'stats', topic:'Probability', due:isoDate(tomorrow), mastery:58}
      ],
      practiceIndex:0,
      timer:{seconds:25*60, initialSeconds:25*60, running:false, context:{courseId:'stats',topic:'Probability'}}
    };
  }

  function loadState(key=activeStorageKey){
    try { const raw=localStorage.getItem(key); if(raw){ const parsed=JSON.parse(raw); if(parsed.version===1) return parsed; } } catch(e){}
    return seedState();
  }
  let state = loadState();
  if (!Array.isArray(state.tasks)) state.tasks = [];
  if (!Array.isArray(state.events)) state.events = [];
  if (!Array.isArray(state.resources)) state.resources = [];
  if (!Array.isArray(state.inbox)) state.inbox = [];
  if (!Array.isArray(state.studySessions)) state.studySessions = [];
  if (!state.timer.initialSeconds) state.timer.initialSeconds = state.timer.seconds || 25*60;
  let activeCourseId = null;
  let activeCourseTab = 'overview';
  let quickParsed = null;
  let syllabusParsed = [];
  let aiSyllabusResult = null;
  let timerHandle = null;
  let cloudUser = null;
  let cloudSemester = null;
  let academicCloudReady = false;
  let plannerCloudReady = false;
  let knowledgeCloudReady = false;
  let plannerWeekOffset = 0;

  function save(){ localStorage.setItem(activeStorageKey, JSON.stringify(state)); updateBadges(); }
  function course(id){ return state.courses.find(c=>c.id===id); }
  function assessment(id){ return state.assessments.find(a=>a.id===id); }
  function courseName(id){ return course(id)?.name || 'Unassigned'; }
  function colorForCourse(id){ return course(id)?.color || 'var(--accent)'; }
  function daysUntil(date){ return (startOfDay(new Date(date))-startOfDay(new Date()))/DAY; }
  function isToday(date){ return isoDate(date)===isoDate(new Date()); }
  function weekStart(date=new Date()) { const d=startOfDay(date); const day=(d.getDay()+6)%7; return addDays(d,-day); }

  function requiredMinutesForWeek(start=weekStart()){
    const end=addDays(start,7);
    return state.assessments
      .filter(a=>a.status!=='done'&&new Date(a.due)<end&&new Date(a.due)>=start)
      .reduce((s,a)=>s+(a.remaining ?? a.effort ?? 0),0);
  }
  function requiredMinutesThisWeek(){ return requiredMinutesForWeek(weekStart()); }

  function scheduledWorkMinutesForWeek(start=weekStart()){
    const end=addDays(start,7);
    return state.events.filter(e=>e.status!=='done'&&['work','study'].includes(e.type)&&new Date(e.start)>=start&&new Date(e.start)<end)
      .reduce((s,e)=>s+Math.round((new Date(e.end)-new Date(e.start))/60000),0);
  }
  function scheduledWorkMinutesThisWeek(){ return scheduledWorkMinutesForWeek(weekStart()); }

  function eventMinutes(e){ return Math.max(0,Math.round((new Date(e.end)-new Date(e.start))/60000)); }
  function plannedMinutesForAssessment(assessmentId){
    return state.events.filter(e=>e.type==='work'&&e.status!=='done'&&e.assessmentId===assessmentId).reduce((sum,e)=>sum+eventMinutes(e),0);
  }
  function plannedMinutesForTask(taskId){
    return state.events.filter(e=>e.type==='work'&&e.status!=='done'&&e.taskId===taskId).reduce((sum,e)=>sum+eventMinutes(e),0);
  }
  function unscheduledMinutesForAssessment(a){
    return Math.max(0,Math.round((a?.remaining ?? a?.effort ?? 0)-plannedMinutesForAssessment(a?.id)));
  }
  function planningLeadDays(a){
    const type=String(a?.type||'').toLowerCase();
    if(/project/.test(type)) return 21;
    if(/final|midterm|exam/.test(type)) return 14;
    if(/quiz/.test(type)) return 7;
    return 7;
  }
  function planningWindowStart(a){
    const due=startOfDay(new Date(a.due));
    const lead=addDays(due,-planningLeadDays(a));
    const now=startOfDay(new Date());
    return lead>now?lead:now;
  }
  function planningPriority(a){
    const due=new Date(a.due);
    const days=Math.max(.15,(due-new Date())/DAY);
    const unscheduled=unscheduledMinutesForAssessment(a);
    return (unscheduled/Math.max(.5,days))+(Number(a.weight||0)*4)+(days<3?120:days<7?45:0);
  }
  function planningState(a){
    const due=new Date(a.due), now=new Date();
    const remaining=Math.max(0,Number(a.remaining ?? a.effort ?? 0));
    const planned=plannedMinutesForAssessment(a);
    const unscheduled=Math.max(0,remaining-planned);
    const days=(due-now)/DAY;
    if(due<=now) return {key:'overdue',label:'Overdue',tone:'danger',remaining,planned,unscheduled,days};
    if(unscheduled<=5) return {key:'planned',label:'Planned',tone:'success',remaining,planned,unscheduled:0,days};
    if(days<=2) return {key:'risk',label:'At risk',tone:'danger',remaining,planned,unscheduled,days};
    if(days<=7) return {key:'needs',label:'Needs plan',tone:'warning',remaining,planned,unscheduled,days};
    return {key:'later',label:'Unscheduled',tone:'neutral',remaining,planned,unscheduled,days};
  }
  function planningCandidates({courseId='',limit=50}={}){
    return state.assessments
      .filter(a=>a.status!=='done'&&(!courseId||a.courseId===courseId)&&new Date(a.due)>new Date()&&unscheduledMinutesForAssessment(a)>5)
      .sort((a,b)=>planningPriority(b)-planningPriority(a))
      .slice(0,limit);
  }
  function plannerWeekStart(){ return addDays(weekStart(),plannerWeekOffset*7); }
  function nextAssessment(){
    const now=new Date();
    const list=state.assessments.filter(a=>a.status!=='done'&&new Date(a.due)>now);
    list.sort((a,b)=>scoreAssessment(b)-scoreAssessment(a));
    return list[0] || null;
  }
  function scoreAssessment(a){
    const days=Math.max(.25, daysUntil(a.due));
    const remaining=a.remaining ?? a.effort ?? 60;
    const weight=a.weight||5;
    return remaining/days + weight*3;
  }
  function nextEvent(){
    const now=new Date(); return state.events.filter(e=>new Date(e.end)>now).sort((a,b)=>new Date(a.start)-new Date(b.start))[0];
  }

  function setRoute(route){
    state.route=route; activeCourseId=null; save(); render();
  }

  function render(){
    document.body.classList.toggle('dark', state.theme==='dark');
    qs('#themeToggle').textContent = state.theme==='dark' ? '☀' : '☾';
    qsa('[data-route]').forEach(b=>b.classList.toggle('active', b.dataset.route===state.route));
    qsa('.mobile-nav [data-route]').forEach(b=>b.classList.toggle('active', b.dataset.route===state.route));
    const titleMap={today:['Semester workspace','Today'],planner:['Time layer','Planner'],courses:['Academic context','Courses'],study:['Learning layer','Study'],library:['Knowledge layer','Library'],inbox:['Capture layer','Inbox'],settings:['Demo controls','Settings']};
    const meta=titleMap[state.route]||titleMap.today;
    qs('#pageEyebrow').textContent=meta[0]; qs('#pageTitle').textContent=meta[1];
    const page=qs('#page');
    const renderers={today:renderToday,planner:renderPlanner,courses:renderCourses,study:renderStudy,library:renderLibrary,inbox:renderInbox,settings:renderSettings};
    page.innerHTML=(renderers[state.route]||renderToday)();
    bindPageEvents();
    updateBadges();
    updateCloudStatusCard();
  }

  function renderToday(){
    const best=nextAssessment(); const c=best?course(best.courseId):null; const next=nextEvent();
    const required=requiredMinutesThisWeek(), capacity=state.semester.availableMinutesPerWeek;
    const pct=clamp(Math.round(required/capacity*100),0,125);
    const todaysEvents=state.events.filter(e=>isToday(e.start)&&e.status!=='done').sort((a,b)=>new Date(a.start)-new Date(b.start));
    const dueSoon=state.assessments.filter(a=>a.status!=='done').sort((a,b)=>new Date(a.due)-new Date(b.due)).slice(0,4);
    const needsPlan=planningCandidates({limit:4});
    const urgentPlan=needsPlan.filter(a=>planningState(a).days<=7);
    const totalUnscheduled=needsPlan.reduce((sum,a)=>sum+unscheduledMinutesForAssessment(a),0);
    return `
      <div class="hero-grid">
        <article class="card hero-card">
          <div class="hero-kicker"><span class="pill success">● Semester synced</span><span class="pill">${esc(state.semester.name)}</span></div>
          <h2>${next ? `Next: ${esc(next.title)}` : 'You are clear for now.'}</h2>
          <p>${next ? `${esc(courseName(next.courseId))} · ${fmtTime(next.start)}–${fmtTime(next.end)}${course(next.courseId)?.room ? ` · ${esc(course(next.courseId).room)}`:''}` : 'Use the open time for your highest-risk assessment or a due review.'}</p>
          ${best ? `<div class="next-action"><div><span class="eyebrow">Best next action</span><strong><span class="course-dot" style="--course-color:${c.color}"></span> ${esc(best.title)} · ${Math.min(45,best.remaining||45)} min</strong><small>Suggested because it is due ${humanDue(best.due)} with ${formatMinutes(best.remaining)} remaining.</small></div><div class="button-row"><button class="btn primary" data-start-focus="${best.id}">Start focus</button><button class="btn secondary" data-plan="${best.id}">Plan work</button></div></div>`:''}
        </article>
        <article class="card capacity-card">
          <div><span class="eyebrow">Workload capacity</span><h3 style="margin:7px 0 0;font-size:16px">This week</h3></div>
          <div class="capacity-ring" style="--capacity:${Math.min(pct,100)}"><div><strong>${pct}%</strong><small>of capacity</small></div></div>
          <div class="capacity-meta"><span>${formatMinutes(required)} required</span><span>${formatMinutes(capacity)} available</span></div>
          <div class="pill ${required>capacity?'warning':'success'}" style="text-align:center;margin-top:13px">${required>capacity?`${formatMinutes(required-capacity)} over capacity`:`${formatMinutes(capacity-required)} buffer`}</div>
        </article>
      </div>

      ${needsPlan.length?`
      <article class="card planning-pulse">
        <div class="planning-pulse-copy">
          <span class="eyebrow">Planning pulse</span>
          <h3>${urgentPlan.length?`${urgentPlan.length} near-term deadline${urgentPlan.length===1?'':'s'} need a plan`:`${needsPlan.length} upcoming deadline${needsPlan.length===1?'':'s'} still need scheduling`}</h3>
          <p>${formatMinutes(totalUnscheduled)} of the highest-priority work is not yet placed on your calendar. Smart planning respects deadlines, existing blocks, and your weekly capacity.</p>
        </div>
        <div class="planning-pulse-items">
          ${needsPlan.slice(0,3).map(a=>{
            const ps=planningState(a), cc=course(a.courseId);
            return `<div class="planning-mini"><span class="course-dot" style="--course-color:${cc?.color||'var(--accent)'}"></span><div><strong>${esc(a.title)}</strong><small>${esc(cc?.name||'Course')} · ${humanDue(a.due)} · ${formatMinutes(ps.unscheduled)} unscheduled</small></div><span class="plan-status ${ps.tone}">${ps.label}</span></div>`;
          }).join('')}
        </div>
        <div class="planning-pulse-actions"><button class="btn secondary" data-route-jump="planner">Review planner</button><button class="btn primary" id="smartPlanToday">Build study plan</button></div>
      </article>`:''}

      <div class="section-head"><div><h2>Today’s timeline</h2><p>Fixed commitments and scheduled work are intentionally separate.</p></div><button class="btn secondary" data-route-jump="planner">Open planner</button></div>
      <div class="section-grid">
        <article class="card timeline">
          ${todaysEvents.length?todaysEvents.map(e=>timelineRow(e)).join(''):`<div class="empty-state"><div class="empty-icon">○</div><h3>Open day</h3><p>No fixed or planned events today.</p></div>`}
        </article>
        <article class="card list-card">
          ${dueSoon.map(a=>{const c=course(a.courseId);return `<div class="list-row"><div><strong><span class="course-dot" style="--course-color:${c?.color||'var(--accent)'}"></span> ${esc(a.title)}</strong><small>${esc(c?.name||'Course')} · ${formatMinutes(a.remaining)} left · ${a.type}</small></div><span class="date-chip">${humanDue(a.due)}</span></div>`}).join('')}
        </article>
      </div>

      <div class="section-head"><div><h2>Review queue</h2><p>Study is connected to the same course and topic objects.</p></div><button class="btn secondary" data-route-jump="study">Study now</button></div>
      <div class="review-queue">${state.review.slice(0,3).map(r=>reviewRow(r)).join('')}</div>
    `;
  }

  function timelineRow(e){ const c=course(e.courseId); const label=e.type==='fixed'?'Fixed event':e.type==='work'?'Work block':'Study session'; return `<div class="timeline-item"><span class="timeline-time">${fmtTime(e.start)}</span><span class="timeline-line" style="--item-color:${c?.color||'var(--accent)'}"></span><div class="timeline-copy"><strong>${esc(e.title)}</strong><small>${esc(c?.name||'Personal')} · ${label}</small></div><span class="timeline-status">${Math.round((new Date(e.end)-new Date(e.start))/60000)}m</span></div>`; }
  function reviewRow(r){ const c=course(r.courseId); return `<div class="review-item"><div><strong><span class="course-dot" style="--course-color:${c.color}"></span> ${esc(r.topic)}</strong><small>${esc(c.name)} · ${r.due===isoDate(new Date())?'Due today':'Due '+fmtDate(r.due,{month:'short',day:'numeric'})}</small></div><div class="mastery">${r.mastery}%</div></div>`; }

  function renderPlanner(){
    const start=plannerWeekStart(); const days=[0,1,2,3,4,5,6].map(n=>addDays(start,n));
    const req=requiredMinutesForWeek(start), sched=scheduledWorkMinutesForWeek(start);
    const openTasks=(state.tasks||[]).filter(t=>t.status!=='done').sort((a,b)=>a.position-b.position).slice(0,8);
    const needsPlan=planningCandidates({limit:6});
    const atRisk=state.assessments.filter(a=>a.status!=='done'&&['overdue','risk'].includes(planningState(a).key)).sort((a,b)=>new Date(a.due)-new Date(b.due));
    return `
      <div class="stat-strip">
        <div class="stat"><span>Required this week</span><strong>${formatMinutes(req)}</strong></div>
        <div class="stat"><span>Already scheduled</span><strong>${formatMinutes(sched)}</strong></div>
        <div class="stat"><span>Unscheduled work</span><strong>${formatMinutes(Math.max(0,req-sched))}</strong></div>
        <div class="stat"><span>Capacity</span><strong>${formatMinutes(state.semester.availableMinutesPerWeek)}</strong></div>
      </div>

      ${(needsPlan.length||atRisk.length)?`
      <article class="card planner-intelligence">
        <div class="planner-intelligence-head">
          <div><span class="eyebrow">Adaptive planner</span><h2>${atRisk.length?`${atRisk.length} deadline${atRisk.length===1?'':'s'} need attention`:`${needsPlan.length} assessment${needsPlan.length===1?'':'s'} can be scheduled`}</h2><p>Student Hub converts remaining effort into realistic work blocks before each deadline instead of simply storing due dates.</p></div>
          <button class="btn primary" id="smartPlanAll">Smart-plan unscheduled</button>
        </div>
        <div class="plan-recommendations">
          ${(atRisk.length?atRisk:needsPlan).slice(0,4).map(a=>{
            const ps=planningState(a), cc=course(a.courseId);
            const coverage=ps.remaining?Math.min(100,Math.round(ps.planned/ps.remaining*100)):100;
            return `<div class="plan-recommendation">
              <div class="plan-recommendation-main"><span class="course-dot" style="--course-color:${cc?.color||'var(--accent)'}"></span><div><strong>${esc(a.title)}</strong><small>${esc(cc?.name||'Course')} · ${humanDue(a.due)}</small></div></div>
              <div class="plan-recommendation-progress"><span style="--plan-progress:${coverage}%"></span></div>
              <div class="plan-recommendation-meta"><span>${formatMinutes(ps.planned)} placed</span><span>${formatMinutes(ps.unscheduled)} to schedule</span><span class="plan-status ${ps.tone}">${ps.label}</span></div>
              ${ps.key!=='overdue'&&ps.unscheduled>5?`<button class="btn ghost compact-btn" data-plan="${a.id}">Plan this</button>`:''}
            </div>`;
          }).join('')}
        </div>
      </article>`:''}

      <div class="week-toolbar">
        <div><span class="eyebrow">Week of ${fmtDate(start,{month:'short',day:'numeric'})}</span><h2 style="margin:4px 0 0;font-size:18px">Cloud planner · drag work blocks between days</h2></div>
        <div class="planner-week-actions">
          <div class="week-nav"><button class="btn ghost compact-btn" id="plannerPrevWeek" aria-label="Previous week">←</button><button class="btn secondary compact-btn" id="plannerThisWeek">This week</button><button class="btn ghost compact-btn" id="plannerNextWeek" aria-label="Next week">→</button></div>
          <button class="btn secondary" id="autoPlan">Smart-plan remaining</button>
        </div>
      </div>
      <div class="week-grid">
        ${days.map(day=>{
          const events=state.events.filter(e=>e.status!=='done'&&isoDate(e.start)===isoDate(day)).sort((a,b)=>new Date(a.start)-new Date(b.start));
          const deadlines=state.assessments.filter(a=>isoDate(a.due)===isoDate(day)&&a.status!=='done');
          return `<div class="day-column" data-day="${isoDate(day)}"><div class="day-head ${isToday(day)?'today':''}"><strong>${fmtDate(day,{weekday:'short'})}</strong><span>${fmtDate(day,{month:'short',day:'numeric'})}</span></div>${events.map(eventCard).join('')}${deadlines.map(deadlineCard).join('')}</div>`
        }).join('')}
      </div>
      <p style="color:var(--muted);font-size:10px;margin-top:10px">Deadlines are constraints. Adaptive work blocks respect your configured weekly capacity and avoid overlapping existing events.</p>
      <div class="section-head"><div><h2>Work queue</h2><p>Planning an assessment creates actionable tasks before placing time blocks.</p></div><span class="pill ${plannerCloudReady?'success':''}">${plannerCloudReady?'Cloud tasks synced':'Planner cloud unavailable'}</span></div>
      <article class="card task-queue">${openTasks.length?openTasks.map(taskRow).join(''):`<div class="empty-state"><div class="empty-icon">✓</div><h3>No open planner tasks</h3><p>Import a syllabus or use Plan work on an assessment to create a task breakdown.</p></div>`}</article>
    `;
  }

  function eventCard(e){ const c=course(e.courseId); const draggable=['work','study'].includes(e.type); return `<div class="event-card" ${draggable?'draggable="true"':''} data-event-id="${e.id}" style="--event-color:${c?.color||'var(--accent)'}"><div class="event-type">${e.type}${e.cloudId?' · cloud':''}</div><small>${fmtTime(e.start)}–${fmtTime(e.end)}</small><strong>${esc(e.title)}</strong></div>`; }
  function taskRow(t){ const c=course(t.courseId); const a=assessment(t.assessmentId); return `<div class="task-row"><div class="task-row-copy"><strong><span class="course-dot" style="--course-color:${c?.color||'var(--accent)'}"></span> ${esc(t.title)}</strong><small>${esc(c?.name||'Course')} · ${esc(a?.title||'Assessment')} · ${formatMinutes(t.remaining)} remaining</small></div><div class="button-row"><span class="pill">${esc(t.status.replace('_',' '))}</span><button class="btn secondary" data-task-done="${t.id}">Mark done</button></div></div>`; }
  function deadlineCard(a){ const c=course(a.courseId); return `<div class="event-card" style="--event-color:${c?.color||'var(--danger)'}"><div class="event-type">deadline · ${fmtTime(a.due)}</div><strong>${esc(a.title)}</strong><small>${formatMinutes(a.remaining)} remaining</small></div>`; }

  function renderCourses(){
    if(activeCourseId){ return renderCourseDetail(activeCourseId); }
    return `<div class="section-head" style="margin-top:0"><div><h2>Your course graph</h2><p>Courses and assessments now sync through Appwrite.</p></div><div class="button-row"><button class="btn secondary" id="openImport">Import syllabus</button><button class="btn primary" id="openAddCourse">+ Add course</button></div></div><div class="course-grid">${state.courses.map(c=>{
      const upcoming=state.assessments.filter(a=>a.courseId===c.id&&a.status!=='done').sort((a,b)=>new Date(a.due)-new Date(b.due));
      return `<article class="card course-card" data-course="${c.id}" style="--course-color:${c.color};--progress:${Math.min(100,c.grade)}%"><span class="pill"><span class="course-dot" style="--course-color:${c.color}"></span> ${esc(c.code)}</span><h3>${esc(c.name)}</h3><p>${esc(c.teacher||'No instructor yet')} · ${esc(c.schedule||'Schedule not set')}</p><div class="progress-track"><span></span></div><div class="course-meta"><span>${c.grade}% current</span><span>${upcoming[0]?`${esc(upcoming[0].title)} · ${humanDue(upcoming[0].due)}`:'No upcoming work'}</span></div></article>`
    }).join('')}</div>`;
  }
  function renderCourseDetail(id){
    const c=course(id); if(!c) return renderCourses();
    const ass=state.assessments.filter(a=>a.courseId===id).sort((a,b)=>new Date(a.due)-new Date(b.due));
    const res=state.resources.filter(r=>r.courseId===id);
    let body='';
    if(activeCourseTab==='overview') body=`<div class="section-grid"><article class="card list-card">${ass.slice(0,5).map(a=>`<div class="list-row"><div><strong>${esc(a.title)}</strong><small>${a.type} · ${formatMinutes(a.remaining)} left</small></div><span class="date-chip">${humanDue(a.due)}</span></div>`).join('')}</article><article class="card pad"><span class="eyebrow">Topics</span><div class="topic-cloud" style="margin-top:13px">${dedupeTopics(c.topics).map(t=>`<span class="topic-chip">${esc(t)}</span>`).join('')}</div></article></div>`;
    if(activeCourseTab==='work') body=`<article class="card list-card">${ass.map(a=>`<div class="list-row"><div><strong>${esc(a.title)}</strong><small>${a.type} · ${a.status.replace('_',' ')}</small></div><div class="button-row"><span class="date-chip">${humanDue(a.due)}</span><button class="btn secondary" data-plan="${a.id}">Plan</button></div></div>`).join('')}</article>`;
    if(activeCourseTab==='topics') body=`<div class="course-grid">${dedupeTopics(c.topics).map(t=>{const count=res.filter(r=>String(r.topic||'').toLowerCase()===String(t||'').toLowerCase()).length; const review=state.review.find(r=>r.courseId===id&&r.topic===t);return `<article class="card pad"><span class="course-dot" style="--course-color:${c.color}"></span><h3 style="margin:15px 0 5px">${esc(t)}</h3><p style="color:var(--muted);font-size:11px">${count} linked resources${review?` · mastery ${review.mastery}%`:''}</p></article>`}).join('')}</div>`;
    if(activeCourseTab==='materials') body=`<div class="resource-grid">${res.map(resourceCard).join('')}</div>`;
    if(activeCourseTab==='grades') body=`<article class="card pad"><span class="eyebrow">Course progress</span><h3 style="font-size:34px;letter-spacing:-.05em;margin:12px 0">${c.grade}%</h3><p style="color:var(--muted);font-size:11px">Target ${c.target}% · demo grade data</p><div class="progress-track" style="--course-color:${c.color};--progress:${c.grade}%"><span></span></div></article>`;
    return `<button class="btn ghost" id="backCourses">← All courses</button><article class="card course-detail-head" style="--course-color:${c.color};margin-top:10px"><div><span class="pill"><span class="course-dot" style="--course-color:${c.color}"></span> ${esc(c.code)}</span><h2>${esc(c.name)}</h2><p>${esc(c.teacher)} · ${esc(c.room)} · ${esc(c.schedule)}</p></div><div><span class="eyebrow">Current grade</span><strong style="display:block;font-size:28px;margin-top:5px">${c.grade}%</strong></div></article><div class="detail-tabs">${['overview','work','topics','materials','grades'].map(t=>`<button class="${activeCourseTab===t?'active':''}" data-course-tab="${t}">${t[0].toUpperCase()+t.slice(1)}</button>`).join('')}</div>${body}`;
  }

  const practiceBank=[
    {courseId:'stats',topic:'Probability',q:'A fair coin is tossed three times. What is the probability of getting exactly two heads?',a:'There are 3 successful outcomes out of 8 equally likely outcomes, so the probability is 3/8.'},
    {courseId:'alg',topic:'Recursion',q:'What two properties must a correct recursive algorithm have?',a:'A base case that stops recursion, and a recursive step that moves the problem toward that base case.'},
    {courseId:'chem',topic:'Equilibrium',q:'What does Le Châtelier’s principle predict when a reactant concentration is increased?',a:'The system shifts in the direction that consumes some of the added reactant, toward products for a simple reactant increase.'},
    {courseId:'alg',topic:'Graphs',q:'When is breadth-first search preferred over depth-first search for an unweighted graph?',a:'When you need shortest path length in number of edges, because BFS explores vertices level by level.'}
  ];
  function renderStudy(){
    const t=state.timer; const c=course(t.context.courseId); const q=practiceBank[state.practiceIndex%practiceBank.length];
    const recent=[...(state.studySessions||[])].sort((a,b)=>new Date(b.completedAt)-new Date(a.completedAt)).slice(0,6);
    const totalMinutes=(state.studySessions||[]).reduce((sum,x)=>sum+Number(x.minutes||0),0);
    return `<div class="study-layout"><article class="card focus-card"><span class="eyebrow">Focus session</span><div class="timer" id="timerDisplay">${formatTimer(t.seconds)}</div><div class="timer-context"><span class="course-dot" style="--course-color:${c?.color||'var(--accent)'}"></span> ${esc(c?.name||'Study')} → ${esc(t.context.topic)}</div><div class="button-row" style="margin-top:24px"><button class="btn primary" id="timerToggle">${t.running?'Pause':'Start'}</button><button class="btn secondary" id="timerReset">Reset</button><button class="btn secondary" id="finishSession">Finish & save</button></div><p class="cloud-note">${knowledgeCloudReady?'Completed focus sessions sync to Appwrite.':'Focus completion is local until study_sessions is ready.'}</p></article><article class="card practice-card"><span class="eyebrow">Practice from your course context</span><h3><span class="course-dot" style="--course-color:${colorForCourse(q.courseId)}"></span> ${esc(q.topic)}</h3><div class="practice-question"><p>${esc(q.q)}</p><p class="answer hidden" id="practiceAnswer">${esc(q.a)}</p></div><div class="button-row"><button class="btn secondary" id="showAnswer">Reveal answer</button><button class="btn primary" id="nextQuestion">Next question</button></div></article></div><div class="section-head"><div><h2>Due for review</h2><p>Simple spaced-review queue for the prototype.</p></div></div><div class="review-queue">${state.review.map(reviewRow).join('')}</div><div class="section-head"><div><h2>Study history</h2><p>${formatMinutes(totalMinutes)} recorded across ${(state.studySessions||[]).length} session${(state.studySessions||[]).length===1?'':'s'}.</p></div><span class="pill ${knowledgeCloudReady?'success':''}">${knowledgeCloudReady?'Cloud sessions synced':'Study cloud unavailable'}</span></div><article class="card session-history">${recent.length?recent.map(studySessionRow).join(''):`<div class="empty-state"><div class="empty-icon">◎</div><h3>No completed focus sessions yet</h3><p>Finish a timer and the session will appear here.</p></div>`}</article>`;
  }
  function studySessionRow(session){ const c=course(session.courseId); return `<div class="session-row"><div><strong><span class="course-dot" style="--course-color:${c?.color||'var(--accent)'}"></span> ${esc(session.topic||'Study')}</strong><small>${esc(c?.name||'Course')} · ${fmtDate(session.completedAt,{month:'short',day:'numeric'})} ${fmtTime(session.completedAt)}</small></div><span class="pill">${formatMinutes(session.minutes)}</span></div>`; }

  function renderLibrary(){
    return `<div class="library-toolbar"><input class="search-input" id="librarySearch" placeholder="Search notes, files, links and topics..."/><div class="button-row"><span class="pill ${knowledgeCloudReady?'success':''}">${knowledgeCloudReady?'Cloud library synced':'Library cloud unavailable'}</span><button class="btn primary" id="openAddResource">+ Add resource</button></div></div><div class="resource-grid" id="resourceGrid">${state.resources.map(resourceCard).join('')}</div>`;
  }
  function resourceCard(r){
    const c=course(r.courseId);
    const icon={PDF:'▤',Note:'✎',Link:'↗'}[r.type]||'•';
    const action=r.storageFileId
      ? `<button class="resource-open resource-action" data-open-resource="${esc(r.id)}">Open PDF ↗</button>`
      : r.url ? `<a class="resource-open" href="${esc(r.url)}" target="_blank" rel="noopener">Open ↗</a>` : '';
    const fileMeta=r.storageFileId ? `<div class="file-meta">${esc(r.fileName||'Stored PDF')} · ${formatBytes(r.fileSize||0)}</div>` : '';
    const remove=r.storageFileId ? `<button class="resource-delete" data-delete-resource="${esc(r.id)}">Delete</button>` : '';
    return `<article class="card resource-card" data-resource-text="${esc((r.title+' '+r.topic+' '+courseName(r.courseId)+' '+r.description+' '+(r.fileName||'')).toLowerCase())}"><div><div class="resource-icon">${icon}</div><h3>${esc(r.title)}</h3><p>${esc(r.description)}</p>${fileMeta}<div class="resource-actions">${action}${remove}</div></div><footer><span><span class="course-dot" style="--course-color:${c?.color||'var(--accent)'}"></span> ${esc(c?.name||'Unassigned')} · ${esc(r.topic||'General')}</span><span>${esc(r.updated||'Cloud')}</span></footer></article>`;
  }

  function renderInbox(){
    const items=state.inbox.filter(i=>!i.processed).sort((a,b)=>new Date(b.created)-new Date(a.created));
    return `<div class="inbox-compose"><textarea id="inboxInput" placeholder="Drop something here without organizing it first..."></textarea><button class="btn primary" id="captureInbox">Capture</button></div><div class="section-head"><div><h2>Unorganized capture</h2><p>Process later. Captures now follow you between devices.</p></div><span class="pill ${knowledgeCloudReady?'success':''}">${knowledgeCloudReady?'Cloud inbox synced':'Inbox cloud unavailable'}</span></div><div class="inbox-list">${items.length?items.map(i=>`<article class="card inbox-item"><div><p>${esc(i.text)}</p><small>Captured ${timeAgo(i.created)}</small></div><div class="button-row"><button class="btn secondary" data-organize="${i.id}">Organize</button><button class="btn ghost" data-archive="${i.id}">Archive</button></div></article>`).join(''):`<div class="card empty-state"><div class="empty-icon">✓</div><h3>Inbox zero</h3><p>Everything captured has been processed.</p></div>`}</div>`;
  }

  function renderSettings(){
    const academicLabel = academicCloudReady ? 'Courses + assessments cloud' : 'Academic cloud unavailable';
    const plannerLabel = plannerCloudReady ? 'Tasks + work blocks cloud' : 'Planner cloud unavailable';
    const knowledgeLabel = knowledgeCloudReady ? 'Library + Inbox + study cloud' : 'Knowledge cloud unavailable';
    return `<div class="settings-grid"><article class="card setting-card"><h3>Weekly study capacity</h3><p>The workload engine compares estimated required work with the time you realistically have.</p><label class="eyebrow" for="capacityInput">Hours / week</label><input id="capacityInput" type="number" min="1" max="80" step=".5" value="${state.semester.availableMinutesPerWeek/60}" style="width:100%;margin-top:7px"/></article><article class="card setting-card"><h3>Cloud academic data</h3><p>Semester, courses, assessments, planner tasks, work blocks, resources, Inbox, and study sessions use Appwrite.</p><span class="pill ${academicCloudReady?'success':''}">${academicLabel}</span> <span class="pill ${plannerCloudReady?'success':''}">${plannerLabel}</span> <span class="pill ${knowledgeCloudReady?'success':''}">${knowledgeLabel}</span></article><article class="card setting-card"><h3>Private academic files</h3><p>PDFs are stored privately in <strong>academic_files</strong>. Short-lived server-generated tokens are used when you open a PDF.</p><span class="pill ${window.studentHubCloud?.storage?'success':''}">${window.studentHubCloud?.storage?'Storage ready':'Storage unavailable'}</span></article><article class="card setting-card"><h3>Academic AI</h3><p>The <strong>academic-ai</strong> Appwrite Function reads your private syllabus as you, sends it to OpenRouter server-side, and returns reviewable structured data.</p><span class="pill ${window.studentHubCloud?.functions?'success':''}">${window.studentHubCloud?.functions?'Function client ready':'Function unavailable'}</span></article></div>`;
  }

  function bindPageEvents(){
    qsa('[data-route-jump]').forEach(b=>b.onclick=()=>setRoute(b.dataset.routeJump));
    qsa('[data-start-focus]').forEach(b=>b.onclick=()=>{ const a=assessment(b.dataset.startFocus); if(!a)return; state.timer.context={courseId:a.courseId,topic:a.topics?.[0]||a.title}; state.timer.seconds=Math.min(45,a.remaining||25)*60; state.timer.initialSeconds=state.timer.seconds; state.timer.running=false; save(); setRoute('study'); });
    qsa('[data-plan]').forEach(b=>b.onclick=()=>planAssessment(b.dataset.plan));
    qsa('[data-course]').forEach(b=>b.onclick=()=>{activeCourseId=b.dataset.course; activeCourseTab='overview'; render();});
    qs('#backCourses')?.addEventListener('click',()=>{activeCourseId=null;render();});
    qsa('[data-course-tab]').forEach(b=>b.onclick=()=>{activeCourseTab=b.dataset.courseTab;render();});
    qs('#openImport')?.addEventListener('click',openImport);
    qs('#openAddCourse')?.addEventListener('click',openCourseModal);
    qs('#autoPlan')?.addEventListener('click',()=>autoPlan());
    qs('#smartPlanAll')?.addEventListener('click',()=>autoPlan());
    qs('#smartPlanToday')?.addEventListener('click',async()=>{await autoPlan(); if(state.route!=='planner')setRoute('planner');});
    qs('#plannerPrevWeek')?.addEventListener('click',()=>{plannerWeekOffset--;render();});
    qs('#plannerNextWeek')?.addEventListener('click',()=>{plannerWeekOffset++;render();});
    qs('#plannerThisWeek')?.addEventListener('click',()=>{plannerWeekOffset=0;render();});
    qsa('[data-task-done]').forEach(b=>b.onclick=()=>markTaskDone(b.dataset.taskDone));
    bindDragDrop();
    qs('#timerToggle')?.addEventListener('click',toggleTimer);
    qs('#timerReset')?.addEventListener('click',()=>{stopTimer();state.timer.seconds=25*60;state.timer.initialSeconds=25*60;state.timer.running=false;save();render();});
    qs('#finishSession')?.addEventListener('click',finishStudySession);
    qs('#showAnswer')?.addEventListener('click',()=>qs('#practiceAnswer')?.classList.toggle('hidden'));
    qs('#nextQuestion')?.addEventListener('click',()=>{state.practiceIndex=(state.practiceIndex+1)%practiceBank.length;save();render();});
    qs('#librarySearch')?.addEventListener('input',e=>{const q=e.target.value.toLowerCase();qsa('[data-resource-text]').forEach(card=>card.style.display=card.dataset.resourceText.includes(q)?'':'none');});
    qs('#openAddResource')?.addEventListener('click',openResourceModal);
    qsa('[data-open-resource]').forEach(b=>b.onclick=()=>openStoredResource(b.dataset.openResource));
    qsa('[data-delete-resource]').forEach(b=>b.onclick=()=>deleteStoredResource(b.dataset.deleteResource));
    qs('#captureInbox')?.addEventListener('click',captureInboxItem);
    qsa('[data-organize]').forEach(b=>b.onclick=()=>{const i=state.inbox.find(x=>x.id===b.dataset.organize); if(!i)return; openQuickAdd(i.text, i.id);});
    qsa('[data-archive]').forEach(b=>b.onclick=()=>archiveInboxItem(b.dataset.archive));
    qs('#capacityInput')?.addEventListener('change',e=>{state.semester.availableMinutesPerWeek=Math.round(Number(e.target.value||14)*60);save();toast('Weekly capacity updated.');});
  }

  function taskTemplatesForAssessment(a){
    const type=String(a.type||'').toLowerCase();
    if(/exam|quiz|midterm|final/.test(type)) return [['Review covered concepts',.35],['Practice problems',.45],['Final recall check',.20]];
    if(/project/.test(type)) return [['Clarify requirements + outline',.20],['Build core deliverable',.55],['Review + refine',.20],['Final submission check',.05]];
    return [['Understand requirements',.15],['Complete main work',.65],['Check + revise',.15],['Submit / final check',.05]];
  }

  function buildTaskDrafts(a){
    const total=Math.max(10,Math.round(a.remaining||a.effort||60));
    let templates=taskTemplatesForAssessment(a);
    if(total<45) templates=[['Complete assessment',1]];
    else if(total<90) templates=[['Complete main work',.75],['Review + submit',.25]];
    let allocated=0;
    return templates.map(([label,pct],index)=>{
      const estimate=index===templates.length-1 ? Math.max(1,total-allocated) : Math.max(1,Math.round(total*pct));
      allocated+=estimate;
      return {id:uid('t'),courseId:a.courseId,assessmentId:a.id,title:label,estimate,remaining:estimate,status:'not_started',position:index,sourceType:'planner'};
    });
  }

  async function ensureTasksForAssessment(a){
    const existing=(state.tasks||[]).filter(t=>t.assessmentId===a.id && t.status!=='done');
    if(existing.length) return existing.sort((x,y)=>x.position-y.position);
    const drafts=buildTaskDrafts(a), created=[];
    for(const draft of drafts){
      const row=await window.studentHubCloud.createTask(cloudUser,cloudSemester,draft,draft.id);
      created.push(rowToTask(row));
    }
    state.tasks.push(...created); save();
    return created;
  }

  function overlapsExisting(start,end,extraEvents=[]){
    const pad=10*60000;
    const all=[...state.events.filter(e=>e.status!=='done'),...extraEvents];
    return all.some(e=>{
      const es=new Date(e.start).getTime(), ee=new Date(e.end).getTime();
      return start.getTime()<ee+pad&&end.getTime()>es-pad;
    });
  }

  function scheduledMinutesOnDay(day,extraEvents=[]){
    const key=isoDate(day);
    return [...state.events.filter(e=>e.status!=='done'),...extraEvents]
      .filter(e=>['work','study'].includes(e.type)&&isoDate(e.start)===key)
      .reduce((sum,e)=>sum+eventMinutes(e),0);
  }

  function scheduledMinutesInWeekContaining(day,extraEvents=[]){
    const start=weekStart(day), end=addDays(start,7);
    return [...state.events.filter(e=>e.status!=='done'),...extraEvents]
      .filter(e=>['work','study'].includes(e.type)&&new Date(e.start)>=start&&new Date(e.start)<end)
      .reduce((sum,e)=>sum+eventMinutes(e),0);
  }

  function dailyPlanningLimit(){
    return Math.max(90,Math.min(240,Math.round((state.semester.availableMinutesPerWeek||840)/5)));
  }

  function candidateWindowsForDay(day,flexible=false){
    const dow=new Date(day).getDay();
    if(flexible) return dow===0||dow===6 ? [['09:00','20:30']] : [['08:00','21:30']];
    return dow===0||dow===6 ? [['10:00','18:00']] : [['15:30','21:00']];
  }

  function findPlanningSlot(a,requestedMinutes,extraEvents=[]){
    const due=new Date(a.due);
    const now=new Date();
    const windowStart=planningWindowStart(a);
    const firstDay=startOfDay(windowStart);
    const lastDay=startOfDay(due);
    const dayLimit=dailyPlanningLimit();
    const capacity=Math.max(60,Number(state.semester.availableMinutesPerWeek||840));
    const durations=[requestedMinutes,Math.min(60,requestedMinutes),Math.min(45,requestedMinutes),Math.min(30,requestedMinutes)]
      .map(x=>Math.max(10,Math.round(x))).filter((x,i,arr)=>arr.indexOf(x)===i);

    for(const flexible of [false,true]){
      for(let day=firstDay; day<=lastDay; day=addDays(day,1)){
        const currentDayMinutes=scheduledMinutesOnDay(day,extraEvents);
        const allowedDaily=flexible?Math.max(dayLimit,300):dayLimit;
        for(const [from,to] of candidateWindowsForDay(day,flexible)){
          let cursor=dateAt(day,from);
          const windowEnd=dateAt(day,to);
          if(isToday(day)&&cursor<now){
            const rounded=new Date(Math.ceil(now.getTime()/(15*60000))*(15*60000));
            cursor=rounded>cursor?rounded:cursor;
          }
          if(cursor<windowStart) cursor=new Date(windowStart);
          for(;cursor<windowEnd;cursor=new Date(cursor.getTime()+30*60000)){
            for(const duration of durations){
              if(currentDayMinutes+duration>allowedDaily) continue;
              const end=new Date(cursor.getTime()+duration*60000);
              if(end>windowEnd||end>due||cursor<now) continue;
              const weekUsed=scheduledMinutesInWeekContaining(cursor,extraEvents);
              if(weekUsed+duration>capacity) continue;
              if(overlapsExisting(cursor,end,extraEvents)) continue;
              return {start:new Date(cursor),end,duration};
            }
          }
        }
      }
    }
    return null;
  }

  async function planAssessment(id, options={}){
    const a=assessment(id); if(!a)return 0;
    if(!plannerCloudReady || !cloudUser || !cloudSemester){ if(!options.silent)toast('Planner cloud is not ready. Check tasks and work_blocks in Appwrite.'); return 0; }
    if(new Date(a.due)<=new Date()){if(!options.silent)toast('This deadline is already overdue, so new work blocks were not created.');return 0;}
    try{
      const tasks=await ensureTasksForAssessment(a);
      let made=0, unscheduled=0;

      for(const task of tasks){
        let left=Math.max(0,(task.remaining||task.estimate||0)-plannedMinutesForTask(task.id));
        while(left>5){
          const requested=Math.min(60,left);
          const slot=findPlanningSlot(a,requested);
          if(!slot){unscheduled+=left;break;}
          const draft={
            id:uid('wb'),
            courseId:a.courseId,
            assessmentId:a.id,
            taskId:task.id,
            title:`${a.title} · ${task.title}`,
            type:'work',
            start:slot.start.toISOString(),
            end:slot.end.toISOString(),
            status:'planned',
            sourceType:'adaptive_planner'
          };
          const row=await window.studentHubCloud.createWorkBlock(cloudUser,cloudSemester,draft,draft.id);
          const mapped=rowToWorkBlock(row);
          state.events.push(mapped); made++; left-=slot.duration;
        }
      }

      save(); render(); updateCloudStatusCard();
      if(!options.silent){
        if(made&&unscheduled>5) toast(`Placed ${made} work block${made!==1?'s':''}; ${formatMinutes(unscheduled)} could not fit before the deadline/capacity limit.`);
        else if(made) toast(`Smart plan created ${made} cloud work block${made!==1?'s':''}.`);
        else toast(unscheduled>5?'No safe slot fits before this deadline within your capacity.':'This assessment is already fully planned.');
      }
      return made;
    }catch(error){
      console.error('Adaptive cloud planning failed:',error);
      if(!options.silent)toast('Could not create the adaptive plan. Check the tasks/work_blocks table setup.');
      return 0;
    }
  }

  async function autoPlan(options={}){
    if(!plannerCloudReady){toast('Planner cloud is not ready.');return 0;}
    const buttons=[qs('#autoPlan'),qs('#smartPlanAll'),qs('#smartPlanToday')].filter(Boolean);
    buttons.forEach(button=>{button.disabled=true;button.dataset.oldText=button.textContent;button.textContent='Planning…';});

    const courseId=options?.courseId||'';
    const candidates=planningCandidates({courseId,limit:50});
    let made=0;
    for(const a of candidates) made+=await planAssessment(a.id,{silent:true});

    render();
    toast(made?`Adaptive planner created ${made} work block${made!==1?'s':''}.`:(candidates.length?'No additional work blocks fit within current deadlines and capacity.':'Everything upcoming is already planned.'));
    return made;
  }

  async function markTaskDone(id){
    const task=(state.tasks||[]).find(t=>t.id===id); if(!task||task.status==='done')return;
    if(!plannerCloudReady){toast('Planner cloud is not ready.');return;}
    const oldRemaining=task.remaining;
    try{
      await window.studentHubCloud.updateTask(task.cloudId||task.id,{status:'done',remaining:0});
      task.status='done'; task.remaining=0;
      const linkedBlocks=state.events.filter(e=>e.type==='work'&&e.taskId===task.id&&e.status!=='done');
      for(const block of linkedBlocks){
        if(block.cloudId) await window.studentHubCloud.updateWorkBlock(block.cloudId,{status:'done'});
      }
      state.events=state.events.filter(e=>!(e.type==='work'&&e.taskId===task.id));
      const a=assessment(task.assessmentId);
      if(a){
        const remaining=(state.tasks||[]).filter(t=>t.assessmentId===a.id&&t.status!=='done').reduce((sum,t)=>sum+(t.remaining||0),0);
        a.remaining=remaining; a.status=remaining===0?'done':'in_progress';
        if(a.cloudId) await window.studentHubCloud.updateAssessment(a.cloudId,{remaining,status:a.status});
      }
      save(); render(); toast(`${task.title} completed.`);
    }catch(error){ task.remaining=oldRemaining; console.error(error); toast('Could not complete the task in Appwrite.'); }
  }

  function bindDragDrop(){
    qsa('.event-card[draggable="true"]').forEach(card=>card.addEventListener('dragstart',e=>e.dataTransfer.setData('text/plain',card.dataset.eventId)));
    qsa('.day-column').forEach(col=>{
      col.addEventListener('dragover',e=>{e.preventDefault();col.classList.add('drag-over')});
      col.addEventListener('dragleave',()=>col.classList.remove('drag-over'));
      col.addEventListener('drop',async e=>{
        e.preventDefault(); col.classList.remove('drag-over');
        const id=e.dataTransfer.getData('text/plain'); const ev=state.events.find(x=>x.id===id); if(!ev)return;
        const oldStart=ev.start, oldEnd=ev.end; const duration=new Date(ev.end)-new Date(ev.start); const old=new Date(ev.start);
        const time=`${String(old.getHours()).padStart(2,'0')}:${String(old.getMinutes()).padStart(2,'0')}`;
        ev.start=dateAt(new Date(col.dataset.day),time).toISOString(); ev.end=new Date(new Date(ev.start).getTime()+duration).toISOString();
        save(); render();
        if(ev.type==='work'&&ev.cloudId&&plannerCloudReady){
          try{ await window.studentHubCloud.updateWorkBlock(ev.cloudId,{start:ev.start,end:ev.end}); toast('Cloud work block moved.'); }
          catch(error){ console.error(error); ev.start=oldStart; ev.end=oldEnd; save(); render(); toast('Could not move the cloud block. Change reverted.'); }
        }else toast('Study block moved locally.');
      });
    });
  }

  function toggleTimer(){ state.timer.running=!state.timer.running; save(); if(state.timer.running) startTimer(); else stopTimer(); render(); }
  function startTimer(){ stopTimer(false); state.timer.running=true; if(!state.timer.initialSeconds||state.timer.initialSeconds<state.timer.seconds)state.timer.initialSeconds=state.timer.seconds; timerHandle=setInterval(()=>{ if(!state.timer.running)return; state.timer.seconds=Math.max(0,state.timer.seconds-1); const el=qs('#timerDisplay'); if(el)el.textContent=formatTimer(state.timer.seconds); if(state.timer.seconds===0){ stopTimer(); state.timer.running=false; const minutes=Math.max(1,Math.round((state.timer.initialSeconds||25*60)/60)); recordStudySession(minutes); } },1000); }
  function stopTimer(setFalse=true){ if(timerHandle)clearInterval(timerHandle);timerHandle=null;if(setFalse)state.timer.running=false; }
  function formatTimer(s){ const m=Math.floor(s/60), sec=s%60;return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`; }

  function finishStudySession(){
    const initial=state.timer.initialSeconds||25*60; const elapsed=Math.max(0,initial-state.timer.seconds);
    if(elapsed<5)return toast('Start the focus timer before saving a session.');
    stopTimer(); state.timer.running=false; recordStudySession(Math.max(1,Math.round(elapsed/60)));
  }

  async function recordStudySession(minutes){
    const draft={id:uid('s'),courseId:state.timer.context.courseId,assessmentId:'',topic:state.timer.context.topic,completedAt:new Date().toISOString(),minutes,sourceType:'focus'};
    try{
      if(knowledgeCloudReady&&cloudUser&&cloudSemester){ const row=await window.studentHubCloud.createStudySession(cloudUser,cloudSemester,draft,draft.id); state.studySessions.unshift(rowToStudySession(row)); }
      else state.studySessions.unshift(draft);
      state.timer.seconds=25*60; state.timer.initialSeconds=25*60; save(); render(); updateCloudStatusCard(); toast(knowledgeCloudReady?'Focus session saved to Appwrite.':'Focus session complete.');
    }catch(error){ console.error('Study session sync failed:',error); state.studySessions.unshift(draft); save(); render(); toast('Session saved locally; cloud study sync failed.'); }
  }

  function openResourceModal(){
    if(!knowledgeCloudReady){toast('Library cloud sync is not ready. Check the resources table.');return;}
    const form=qs('#addResourceForm'); form?.reset();
    const select=qs('#resourceCourse'); if(select)select.innerHTML=state.courses.map(c=>`<option value="${c.id}">${esc(c.code)} · ${esc(c.name)}</option>`).join('');
    qs('#resourceType').value='Note'; qs('#resourceTopic').value=state.courses[0]?.topics?.[0]||'General';
    setResourceTypeFields(); setUploadStatus('');
    openModal(qs('#addResourceModal')); setTimeout(()=>qs('#resourceTitle')?.focus(),60);
  }

  function setResourceTypeFields(){
    const type=qs('#resourceType')?.value||'Note';
    qs('#resourceFileWrap')?.classList.toggle('hidden',type!=='PDF');
    qs('#resourceUrlWrap')?.classList.toggle('hidden',type!=='Link');
    if(type!=='PDF'&&qs('#resourceFile'))qs('#resourceFile').value='';
  }

  function setUploadStatus(message, stateName=''){
    const box=qs('#resourceUploadStatus'); if(!box)return;
    box.textContent=message; box.className=`upload-status${stateName?` ${stateName}`:''}${message?'':' hidden'}`;
  }

  async function confirmAddResource(event){
    event?.preventDefault();
    if(!cloudUser||!cloudSemester||!knowledgeCloudReady)return toast('Library cloud sync is not ready.');
    const type=qs('#resourceType').value;
    const file=qs('#resourceFile')?.files?.[0]||null;
    const draft={id:uid('r'),courseId:qs('#resourceCourse').value,topic:qs('#resourceTopic').value.trim()||'General',type,title:qs('#resourceTitle').value.trim(),description:qs('#resourceDescription').value.trim(),url:type==='Link'?qs('#resourceUrl').value.trim():'',sourceType:type==='PDF'?'upload':'manual'};
    if(!draft.title)return toast('Resource title is required.');
    if(type==='PDF'&&!file)return toast('Choose a PDF file to upload.');
    const button=qs('#addResourceSubmit'); if(button){button.disabled=true;button.textContent=type==='PDF'?'Uploading…':'Saving…';}
    let uploaded=null;
    try{
      if(type==='PDF'){
        setUploadStatus(`Uploading ${file.name} (${formatBytes(file.size)})…`,'active');
        uploaded=await window.studentHubCloud.uploadAcademicFile(cloudUser,cloudSemester,file,'resources');
        draft.storageFileId=uploaded.$id; draft.fileName=uploaded.name||file.name; draft.mimeType=uploaded.mimeType||file.type||'application/pdf'; draft.fileSize=uploaded.sizeOriginal??file.size;
        setUploadStatus('Upload complete. Saving Library metadata…','success');
      }
      const row=await window.studentHubCloud.createResource(cloudUser,cloudSemester,draft,draft.id);
      state.resources.unshift(rowToResource(row)); save(); closeModals(); render(); updateCloudStatusCard(); toast(type==='PDF'?'PDF uploaded privately to Appwrite Storage.':'Resource saved to Appwrite.');
    }
    catch(error){
      console.error(error);
      if(uploaded?.$id){ try{await window.studentHubCloud.deleteAcademicFile(uploaded.$id);}catch(cleanupError){console.warn('Upload rollback failed:',cleanupError);} }
      setUploadStatus(error?.message||'Upload failed.','error'); toast(type==='PDF'?'Could not upload PDF. Check the Storage bucket and resource columns.':'Could not save resource. Check the resources table.');
    }
    finally{if(button){button.disabled=false;button.textContent='Add resource';}}
  }

  async function openStoredResource(resourceId){
    const tab=window.open('about:blank','_blank');
    try{
      const result=await window.studentHubCloud?.getPrivateFileUrl?.(resourceId);
      if(!result?.url)throw new Error('The Academic AI function did not return a file URL.');
      if(tab){tab.opener=null;tab.location.href=result.url;}else window.location.href=result.url;
    }catch(error){
      console.error(error); if(tab)tab.close();
      toast(error?.message||'Could not open this private PDF. Check the academic-ai function.');
    }
  }

  async function deleteStoredResource(resourceId){
    const item=state.resources.find(r=>r.id===resourceId); if(!item||!item.storageFileId)return;
    if(!confirm(`Delete “${item.title}” and its stored PDF?`))return;
    try{
      try{await window.studentHubCloud.deleteAcademicFile(item.storageFileId);}catch(error){if(error?.code!==404)throw error;}
      if(item.cloudId)await window.studentHubCloud.deleteResource(item.cloudId);
      state.resources=state.resources.filter(r=>r.id!==resourceId); save(); render(); updateCloudStatusCard(); toast('PDF and Library record deleted.');
    }catch(error){console.error(error);toast('Could not delete this stored resource.');}
  }

  async function captureInboxItem(){
    const el=qs('#inboxInput'); const text=el?.value.trim(); if(!text)return;
    const draft={id:uid('i'),text,created:new Date().toISOString(),processed:false,sourceType:'capture'};
    try{ if(knowledgeCloudReady&&cloudUser&&cloudSemester){const row=await window.studentHubCloud.createInboxItem(cloudUser,cloudSemester,draft,draft.id);state.inbox.unshift(rowToInbox(row));}else state.inbox.unshift(draft); save(); render(); updateCloudStatusCard(); toast(knowledgeCloudReady?'Captured to cloud Inbox.':'Captured locally; Inbox cloud unavailable.'); }
    catch(error){console.error(error);toast('Could not capture to Appwrite Inbox.');}
  }

  async function archiveInboxItem(id){
    const item=state.inbox.find(x=>x.id===id); if(!item)return;
    const processedAt=new Date().toISOString();
    try{ if(knowledgeCloudReady&&item.cloudId)await window.studentHubCloud.updateInboxItem(item.cloudId,{processed:true,processedAt}); item.processed=true; item.processedAt=processedAt; save(); render(); updateCloudStatusCard(); toast('Inbox item archived.'); }
    catch(error){console.error(error);toast('Could not archive the cloud Inbox item.');}
  }

  function openModal(modal){ qs('#modalBackdrop').classList.remove('hidden'); modal.classList.remove('hidden'); }
  function closeModals(){ qsa('.modal').forEach(m=>m.classList.add('hidden')); qs('#modalBackdrop').classList.add('hidden'); }
  function openQuickAdd(text='', inboxId=null){
    quickParsed=null; qs('#quickAddInput').value=text; qs('#quickAddInput').dataset.inboxId=inboxId||''; qs('#parsePreview').classList.add('hidden'); qs('#confirmQuickAdd').classList.add('hidden'); openModal(qs('#quickAddModal')); setTimeout(()=>qs('#quickAddInput').focus(),60);
  }
  function parseNatural(text){
    const lower=text.toLowerCase();
    const c=state.courses.find(c=> lower.includes(c.name.toLowerCase()) || lower.includes(c.code.toLowerCase()) || (c.name==='Chemistry'&&/\bchem\b/.test(lower)) || (c.name==='Statistics'&&/\bstats?\b/.test(lower)) || (c.name==='Algorithms'&&/\balgo\b/.test(lower)) ) || state.courses[0];
    let type='Task'; if(/exam|midterm|final/.test(lower))type='Exam'; else if(/quiz/.test(lower))type='Quiz'; else if(/project/.test(lower))type='Project'; else if(/assignment|report|problem set|homework/.test(lower))type='Assignment';
    let due=addDays(new Date(),2); if(/tomorrow/.test(lower)) due=addDays(new Date(),1); else {
      const weekdays=['sunday','monday','tuesday','wednesday','thursday','friday','saturday']; const found=weekdays.findIndex(w=>lower.includes(w)); if(found>=0){const cur=new Date().getDay();let delta=(found-cur+7)%7;if(delta===0)delta=7;due=addDays(new Date(),delta);}
      const iso=lower.match(/\b(20\d{2}-\d{2}-\d{2})\b/); if(iso) due=new Date(iso[1]+'T12:00:00');
    }
    let hh=23, mm=59; const timeMatch=lower.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/); if(timeMatch){hh=Number(timeMatch[1])%12+(timeMatch[3]==='pm'?12:0);mm=Number(timeMatch[2]||0);}
    due.setHours(hh,mm,0,0);
    let effort=60; const effortMatch=lower.match(/(?:probably\s*)?(\d+(?:\.\d+)?)\s*(hours?|hrs?|h|minutes?|mins?|m)\b/); if(effortMatch){ const n=Number(effortMatch[1]); effort=/^h|hour|hr/.test(effortMatch[2])?Math.round(n*60):Math.round(n); }
    let title=text.trim().replace(/\b(probably|around|about)\s*\d+(?:\.\d+)?\s*(hours?|hrs?|h|minutes?|mins?|m)\b/i,'').replace(/\b(tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/ig,'').replace(/\b\d{1,2}(?::\d{2})?\s*(am|pm)\b/ig,'').replace(/[,\-–]+/g,' ').replace(/\s+/g,' ').trim();
    title=title.replace(new RegExp(`^${c.name}\s*`,'i'),'').replace(/^chem\s+/i,'').replace(/^stats?\s+/i,'').replace(/^algo\s+/i,'');
    if(!title) title='New '+type;
    return {courseId:c.id,title:title[0].toUpperCase()+title.slice(1),type,due:due.toISOString(),effort,confidence:Math.round(74 + Math.random()*17)};
  }
  function showQuickPreview(p){ const c=course(p.courseId); qs('#parsePreview').innerHTML=`<div class="parse-grid"><div class="parse-field"><span>Course</span><strong>${esc(c.name)}</strong></div><div class="parse-field"><span>Type</span><strong>${esc(p.type)}</strong></div><div class="parse-field"><span>Due</span><strong>${fmtDate(p.due,{weekday:'short',month:'short',day:'numeric'})} · ${fmtTime(p.due)}</strong></div><div class="parse-field"><span>Estimated effort</span><strong>${formatMinutes(p.effort)}</strong></div></div><p style="margin:10px 2px 0;color:var(--muted);font-size:10px">Local demo parser · estimated confidence ${p.confidence}% · verify before saving.</p>`; qs('#parsePreview').classList.remove('hidden'); qs('#confirmQuickAdd').classList.remove('hidden'); }
  async function confirmQuick(){
    if(!quickParsed)return;
    const p=quickParsed;
    const draft={id:uid('a'),courseId:p.courseId,title:p.title,type:p.type,due:p.due,effort:p.effort,remaining:p.effort,status:'not_started',weight:5,topics:[],sourceType:'quick_add'};
    try {
      if (academicCloudReady && cloudUser && cloudSemester) {
        const row = await window.studentHubCloud.createAssessment(cloudUser, cloudSemester, draft, draft.courseId, draft.id);
        state.assessments.push(rowToAssessment(row));
      } else {
        state.assessments.push(draft);
      }
      const inboxId=qs('#quickAddInput').dataset.inboxId;
      if(inboxId){const i=state.inbox.find(x=>x.id===inboxId);if(i){const processedAt=new Date().toISOString();i.processed=true;i.processedAt=processedAt;if(knowledgeCloudReady&&i.cloudId){try{await window.studentHubCloud.updateInboxItem(i.cloudId,{processed:true,processedAt});}catch(error){console.error('Inbox organize update failed:',error);}}}}
      save(); closeModals(); render(); updateCloudStatusCard();
      toast(academicCloudReady?'Assessment saved to Appwrite and surfaced everywhere.':'Added locally; cloud assessment sync is unavailable.');
    } catch (error) {
      console.error(error);
      toast('Could not save the assessment to Appwrite. Check the assessments table setup.');
    }
  }

  function syncSyllabusSourceSelection(){
    const courseId=qs('#syllabusCourse')?.value;
    const existing=[...(state.resources||[])].find(r=>r.courseId===courseId&&r.storageFileId&&(r.sourceType==='syllabus_upload'||r.topic==='Syllabus'));
    const analyze=qs('#analyzeSyllabusFile'); const status=qs('#syllabusFileStatus');
    if(existing){
      analyze.disabled=false; analyze.dataset.resourceId=existing.id;
      if(status){status.textContent=`Stored syllabus ready: ${existing.fileName||existing.title} · ${formatBytes(existing.fileSize||0)}`;status.className='upload-status success';}
    }else{
      analyze.disabled=true; analyze.dataset.resourceId='';
      if(status){status.textContent='';status.className='upload-status hidden';}
    }
    aiSyllabusResult=null; qs('#aiSyllabusReview')?.classList.add('hidden'); if(qs('#aiSyllabusReview'))qs('#aiSyllabusReview').innerHTML=''; qs('#importAiSyllabus')?.classList.add('hidden');
  }

  function openImport(){
    const tomorrow=addDays(new Date(),1), d5=addDays(new Date(),5), d12=addDays(new Date(),12);
    qs('#syllabusInput').value=`STAT210 Statistics\nProfessor: Dr. Park\nProblem Set 3 due ${isoDate(tomorrow)} 23:59 | estimated 2h\nQuiz: Probability & Distributions due ${isoDate(d5)} 14:00 | estimated 1h\nMidterm Exam due ${isoDate(d12)} 10:00 | estimated 5h`;
    const courseSelect=qs('#syllabusCourse'); if(courseSelect)courseSelect.innerHTML=state.courses.map(c=>`<option value="${c.id}">${esc(c.code)} · ${esc(c.name)}</option>`).join('');
    if(qs('#syllabusFile'))qs('#syllabusFile').value='';
    qs('#syllabusPreview').classList.add('hidden');qs('#confirmSyllabus').classList.add('hidden');syllabusParsed=[];
    syncSyllabusSourceSelection(); openModal(qs('#importModal'));
  }

  async function uploadSyllabusPdf(){
    if(!cloudUser||!cloudSemester||!knowledgeCloudReady)return toast('Cloud Library must be ready before uploading a syllabus.');
    const file=qs('#syllabusFile')?.files?.[0]; if(!file)return toast('Choose a syllabus PDF first.');
    const courseId=qs('#syllabusCourse')?.value||state.courses[0]?.id; if(!courseId)return toast('Create or select a course first.');
    const button=qs('#uploadSyllabusFile'); const status=qs('#syllabusFileStatus');
    if(button){button.disabled=true;button.textContent='Uploading…';}
    if(status){status.textContent=`Uploading ${file.name} (${formatBytes(file.size)})…`;status.className='upload-status active';}
    let uploaded=null;
    try{
      uploaded=await window.studentHubCloud.uploadAcademicFile(cloudUser,cloudSemester,file,'syllabi');
      const c=course(courseId);
      const draft={id:uid('r'),courseId,topic:'Syllabus',type:'PDF',title:`${c?.code||'Course'} syllabus`,description:`Original syllabus PDF · ${file.name}`,url:'',sourceType:'syllabus_upload',storageFileId:uploaded.$id,fileName:uploaded.name||file.name,mimeType:uploaded.mimeType||file.type||'application/pdf',fileSize:uploaded.sizeOriginal??file.size};
      const row=await window.studentHubCloud.createResource(cloudUser,cloudSemester,draft,draft.id);
      const resource=rowToResource(row); state.resources.unshift(resource); save(); render(); updateCloudStatusCard();
      if(status){status.textContent=`Stored privately: ${resource.fileName} · ${formatBytes(resource.fileSize)}`;status.className='upload-status success';}
      qs('#analyzeSyllabusFile').disabled=false; qs('#analyzeSyllabusFile').dataset.resourceId=resource.id;
      toast('Syllabus PDF stored in Appwrite and ready for Academic AI.');
    }catch(error){
      console.error(error); if(uploaded?.$id){try{await window.studentHubCloud.deleteAcademicFile(uploaded.$id);}catch(cleanupError){console.warn(cleanupError);}}
      if(status){status.textContent=error?.message||'Upload failed.';status.className='upload-status error';}
      toast('Could not store the syllabus PDF. Check Storage setup and resource metadata columns.');
    }finally{if(button){button.disabled=false;button.textContent='Upload syllabus PDF';}}
  }

  async function analyzeStoredSyllabus(){
    const resourceId=qs('#analyzeSyllabusFile')?.dataset.resourceId;
    if(!resourceId)return toast('Upload a syllabus PDF first.');
    const button=qs('#analyzeSyllabusFile'); const status=qs('#syllabusFileStatus');
    if(button){button.disabled=true;button.textContent='Analyzing…';}
    if(status){status.textContent='Academic AI job queued securely. Reading the private syllabus in the background…';status.className='upload-status active';}
    const review=qs('#aiSyllabusReview');
    if(review){review.innerHTML='<div class="ai-loading-state"><span class="ai-spinner" aria-hidden="true"></span><div><strong>Reading your syllabus</strong><p>Extracting course details, assessments and topics in the background. You can safely wait here beyond 30 seconds.</p></div></div>';review.classList.remove('hidden');}
    qs('#importAiSyllabus')?.classList.add('hidden');
    try{
      const result=await window.studentHubCloud.analyzeSyllabusResource(resourceId,cloudUser,cloudSemester);
      aiSyllabusResult=result;
      showAiSyllabusReview(result);
      if(status){status.textContent=`AI analysis complete · ${result.model||'AI model'} · review everything before importing.`;status.className='upload-status success';}
      toast(`Detected ${(result.extraction?.assessments||[]).length} assessment${(result.extraction?.assessments||[]).length===1?'':'s'} for review.`);
    }catch(error){
      console.error(error);
      if(review){review.innerHTML='';review.classList.add('hidden');}
      if(status){status.textContent=error?.message||'AI analysis failed.';status.className='upload-status error';}
      toast(error?.message||'Could not analyze the syllabus. Check the academic-ai Function execution.');
    }finally{if(button){button.disabled=false;button.textContent='Analyze with AI';}}
  }

  function normalizeAssessmentType(value){
    const v=String(value||'').toLowerCase();
    if(v.includes('quiz'))return 'Quiz'; if(v.includes('exam')||v.includes('midterm')||v.includes('final'))return 'Exam'; if(v.includes('project')||v.includes('presentation'))return 'Project'; if(v.includes('assignment')||v.includes('homework')||v.includes('problem')||v.includes('report')||v.includes('lab'))return 'Assignment'; return 'Other';
  }

  function defaultEffortForType(type){ const t=normalizeAssessmentType(type); return t==='Exam'?300:t==='Project'?360:t==='Quiz'?60:t==='Assignment'?120:60; }


  function dedupeTopics(values){
    const out=[]; const seen=new Set();
    for(const value of (Array.isArray(values)?values:[])){
      const clean=String(value||'').trim().replace(/\s+/g,' ');
      if(!clean)continue;
      const key=clean.toLocaleLowerCase();
      if(seen.has(key))continue;
      seen.add(key); out.push(clean);
    }
    return out;
  }

  function normalizeAssessmentKey(value){
    return String(value||'')
      .toLocaleLowerCase()
      .replace(/&/g,' and ')
      .replace(/[^a-z0-9]+/g,' ')
      .replace(/\s+/g,' ')
      .trim();
  }

  function isLikelyAssessmentDuplicate(existing,draft){
    if(!existing||!draft||existing.courseId!==draft.courseId)return false;
    const a=normalizeAssessmentKey(existing.title), b=normalizeAssessmentKey(draft.title);
    if(!a||!b)return false;
    const ad=new Date(existing.due), bd=new Date(draft.due);
    const diff=Number.isNaN(ad.getTime())||Number.isNaN(bd.getTime())?Infinity:Math.abs(ad-bd);
    const sameDay=Number.isFinite(diff)&&isoDate(ad)===isoDate(bd);
    if(a===b && diff<=3*24*60*60*1000)return true;
    const closeTitle=(a.length>=6&&b.length>=6&&(a.includes(b)||b.includes(a)));
    return closeTitle && (sameDay||diff<=18*60*60*1000);
  }

  function showAiSyllabusReview(result){
    const extraction=result?.extraction||{};
    const c=extraction.course||{};
    const items=Array.isArray(extraction.assessments)?extraction.assessments:[];
    const topics=dedupeTopics(Array.isArray(extraction.topics)?extraction.topics:[]);
    const warnings=Array.isArray(extraction.warnings)?extraction.warnings:[];
    const current=course(qs('#syllabusCourse')?.value)||state.courses[0]||{};
    const review=qs('#aiSyllabusReview'); if(!review)return;
    review.innerHTML=`
      <div class="ai-review-head">
        <div><span class="eyebrow">AI extraction</span><h3>Review before importing</h3><p>Every detected field remains editable. Uncheck anything you do not want to import.</p></div>
        <span class="pill success ai-model-pill">${esc(result?.model||'AI model')}</span>
      </div>
      <section class="ai-review-card ai-course-card">
        <div class="ai-section-kicker"><div><strong>Course details</strong><small>These values will update the selected course.</small></div></div>
        <div class="ai-course-grid">
          <label><span>Course code</span><input id="aiCourseCode" maxlength="32" value="${esc(c.code||current.code||'')}" /></label>
          <label class="ai-course-name"><span>Course name</span><input id="aiCourseName" maxlength="120" value="${esc(c.name||current.name||'')}" /></label>
          <label><span>Instructor</span><input id="aiCourseTeacher" maxlength="120" value="${esc(c.instructor||current.teacher||'')}" /></label>
          <label><span>Room</span><input id="aiCourseRoom" maxlength="80" value="${esc(c.room||current.room||'')}" /></label>
          <label class="ai-wide"><span>Schedule</span><input id="aiCourseSchedule" maxlength="160" value="${esc(c.schedule||current.schedule||'')}" /></label>
        </div>
      </section>
      <section class="ai-review-section">
        <div class="ai-review-title"><div><strong>Assessments</strong><small>Check dates, weights and effort estimates before importing.</small></div><span class="pill">${items.length} detected</span></div>
        <div class="ai-assessment-list">${items.length?items.map((a,index)=>{
          const hasDate=/^\d{4}-\d{2}-\d{2}$/.test(a.dueDate||'');
          const effort=Number(a.effortMinutes)||defaultEffortForType(a.type);
          return `<article class="ai-assessment-card">
            <label class="ai-assessment-toggle"><input type="checkbox" class="ai-assessment-check" data-ai-index="${index}" ${hasDate?'checked':''}/><span>Include</span></label>
            <div class="ai-assessment-identity">
              <label class="ai-field ai-title-field"><span>Assessment</span><input class="ai-title" data-ai-field="title" data-ai-index="${index}" value="${esc(a.title||'')}"/></label>
              <label class="ai-field ai-type-field"><span>Type</span><select data-ai-field="type" data-ai-index="${index}">${['Assignment','Quiz','Exam','Project','Other'].map(t=>`<option ${normalizeAssessmentType(a.type)===t?'selected':''}>${t}</option>`).join('')}</select></label>
            </div>
            <div class="ai-assessment-fields">
              <label class="ai-field"><span>Due date</span><input type="date" data-ai-field="date" data-ai-index="${index}" value="${esc(a.dueDate||'')}"/></label>
              <label class="ai-field"><span>Time</span><input type="time" data-ai-field="time" data-ai-index="${index}" value="${esc(a.dueTime||'23:59')}"/></label>
              <label class="ai-field"><span>Weight</span><div class="ai-unit-input"><input type="number" min="0" max="100" step="0.1" data-ai-field="weight" data-ai-index="${index}" value="${Number(a.weight)||0}"/><span>%</span></div></label>
              <label class="ai-field"><span>Effort</span><div class="ai-unit-input"><input type="number" min="1" max="10000" step="5" data-ai-field="effort" data-ai-index="${index}" value="${effort}"/><span>min</span></div></label>
            </div>
          </article>`;
        }).join(''):`<div class="empty-state compact"><p>No dated assessments were detected.</p></div>`}</div>
      </section>
      <section class="ai-review-section ai-topics-section">
        <div class="ai-review-title"><div><strong>Topics</strong><small>Selected concepts will be merged into ${esc(current.name||'the course')} without case-only duplicates.</small></div><span class="pill">${topics.length} detected</span></div>
        <div class="ai-topic-list">${topics.length?topics.map(topic=>`<label class="ai-topic"><input type="checkbox" class="ai-topic-check" value="${esc(topic)}" checked/><span>${esc(topic)}</span></label>`).join(''):`<span class="muted-small">No explicit topic list detected.</span>`}</div>
      </section>
      ${warnings.length?`<div class="ai-warning-box"><strong>AI flagged</strong>${warnings.map(w=>`<p>• ${esc(w)}</p>`).join('')}</div>`:''}
      <p class="ai-source-note">Source: ${esc(result?.sourceFileName||'stored syllabus PDF')} · Nothing is imported until you confirm.</p>`;
    review.classList.remove('hidden'); qs('#importAiSyllabus')?.classList.remove('hidden');
    review.scrollIntoView({behavior:'smooth',block:'nearest'});
  }

  async function importReviewedAiSyllabus(){
    if(!aiSyllabusResult?.extraction)return;
    if(!academicCloudReady||!cloudUser||!cloudSemester)return toast('Academic cloud sync must be ready before importing.');
    const courseId=qs('#syllabusCourse')?.value; const target=course(courseId); if(!target)return toast('Select a course to update.');
    const button=qs('#importAiSyllabus'); if(button){button.disabled=true;button.textContent='Importing…';}
    try{
      const selectedTopics=qsa('.ai-topic-check:checked').map(x=>x.value.trim()).filter(Boolean);
      const originalTopics=dedupeTopics(target.topics||[]);
      const mergedTopics=dedupeTopics([...originalTopics,...selectedTopics]).slice(0,40);
      const patch={
        code:qs('#aiCourseCode')?.value.trim()||target.code,
        name:qs('#aiCourseName')?.value.trim()||target.name,
        teacher:qs('#aiCourseTeacher')?.value.trim()||target.teacher||'',
        room:qs('#aiCourseRoom')?.value.trim()||target.room||'',
        schedule:qs('#aiCourseSchedule')?.value.trim()||target.schedule||'',
        topics:mergedTopics
      };
      await window.studentHubCloud.updateCourse(target.cloudId||target.id,patch);
      Object.assign(target,patch);

      let imported=0, skipped=0;
      for(const check of qsa('.ai-assessment-check:checked')){
        const index=Number(check.dataset.aiIndex); const src=aiSyllabusResult.extraction.assessments[index]||{};
        const title=qs(`[data-ai-field="title"][data-ai-index="${index}"]`)?.value.trim();
        const type=qs(`[data-ai-field="type"][data-ai-index="${index}"]`)?.value||'Assignment';
        const date=qs(`[data-ai-field="date"][data-ai-index="${index}"]`)?.value||'';
        const time=qs(`[data-ai-field="time"][data-ai-index="${index}"]`)?.value||'23:59';
        const weight=Number(qs(`[data-ai-field="weight"][data-ai-index="${index}"]`)?.value||0);
        const effort=Math.max(1,Math.round(Number(qs(`[data-ai-field="effort"][data-ai-index="${index}"]`)?.value||defaultEffortForType(type))));
        if(!title||!date){skipped++;continue;}
        const dueLocal=new Date(`${date}T${time||'23:59'}:00`); if(Number.isNaN(dueLocal.getTime())){skipped++;continue;}
        const draft={id:uid('a'),courseId:target.id,title,type,due:dueLocal.toISOString(),effort,remaining:effort,status:'not_started',weight:Number.isFinite(weight)?weight:0,topics:dedupeTopics(Array.isArray(src.topics)?src.topics:[]),sourceType:'syllabus_ai'};
        const duplicate=state.assessments.some(a=>isLikelyAssessmentDuplicate(a,draft));
        if(duplicate){skipped++;continue;}
        const row=await window.studentHubCloud.createAssessment(cloudUser,cloudSemester,draft,target.id,draft.id);
        state.assessments.push(rowToAssessment(row)); imported++;
      }
      save(); render(); updateCloudStatusCard();
      const addedTopics=Math.max(0,mergedTopics.length-originalTopics.length);
      const review=qs('#aiSyllabusReview');
      if(review){
        const plannableForCourse=planningCandidates({courseId:target.id,limit:50}).length;
        review.innerHTML=`<div class="ai-import-success"><div class="ai-success-icon">✓</div><span class="eyebrow">Import complete</span><h3>${esc(target.name)} is updated</h3><p>${imported} assessment${imported===1?'':'s'} added${skipped?` · ${skipped} duplicate or invalid item${skipped===1?'':'s'} skipped`:''}${addedTopics?` · ${addedTopics} new topic${addedTopics===1?'':'s'} merged`:''}${plannableForCourse?` · ${plannableForCourse} deadline${plannableForCourse===1?' is':'s are'} ready for planning`:''}.</p><div class="button-row ai-success-actions">${plannableForCourse?`<button class="btn secondary" id="planImportedCourse" type="button">Build study plan</button>`:''}<button class="btn primary" id="viewImportedCourse" type="button">View course</button></div></div>`;
        review.classList.remove('hidden');
      }
      qs('#importAiSyllabus')?.classList.add('hidden');
      qs('#planImportedCourse')?.addEventListener('click',async()=>{
        const planButton=qs('#planImportedCourse'); if(planButton){planButton.disabled=true;planButton.textContent='Planning…';}
        await autoPlan({courseId:target.id});
        closeModals(); plannerWeekOffset=0; state.route='planner'; save(); render();
      });
      qs('#viewImportedCourse')?.addEventListener('click',()=>{activeCourseId=target.id;activeCourseTab='overview';closeModals();state.route='courses';save();render();});
      toast(`AI import complete: ${imported} added${skipped?`, ${skipped} skipped`:''}.`);
    }catch(error){console.error(error);toast(error?.message||'Could not import the reviewed syllabus.');}
    finally{if(button){button.disabled=false;button.textContent='Import reviewed syllabus';}}
  }

  function parseSyllabusText(text){
    const lines=text.split(/\n+/).map(x=>x.trim()).filter(Boolean); const first=lines[0]?.toLowerCase()||''; const c=state.courses.find(c=>first.includes(c.name.toLowerCase())||first.includes(c.code.toLowerCase()))||state.courses[0]; const out=[];
    lines.forEach(line=>{ const lower=line.toLowerCase(); if(!/due|exam|quiz|assignment|project|problem set|report/.test(lower))return; const dm=line.match(/(20\d{2}-\d{2}-\d{2})(?:\s+(\d{1,2}:\d{2}))?/); if(!dm)return; const effort=line.match(/estimated\s+(\d+(?:\.\d+)?)\s*(h|hours?|m|minutes?)/i); let mins=60;if(effort)mins=/^h/.test(effort[2].toLowerCase())?Number(effort[1])*60:Number(effort[1]); let title=line.split(/\bdue\b/i)[0].replace(/^[-•]\s*/,'').trim(); let type=/exam|midterm|final/i.test(title)?'Exam':/quiz/i.test(title)?'Quiz':/project/i.test(title)?'Project':'Assignment';out.push({courseId:c.id,title,type,due:new Date(`${dm[1]}T${dm[2]||'23:59'}:00`).toISOString(),effort:Math.round(mins)}); }); return out;
  }
  function showSyllabusPreview(items){ qs('#syllabusPreview').innerHTML=`<div class="detected-list">${items.map(i=>`<div class="detected-item"><strong>${esc(i.title)}</strong><br><span style="color:var(--muted)">${esc(courseName(i.courseId))} · ${i.type} · ${fmtDate(i.due,{month:'short',day:'numeric'})} ${fmtTime(i.due)} · ${formatMinutes(i.effort)}</span></div>`).join('')}</div><p style="margin:10px 2px 0;color:var(--muted);font-size:10px">Detected locally. Production would preserve page/source provenance and confidence for every item.</p>`; qs('#syllabusPreview').classList.remove('hidden'); qs('#confirmSyllabus').classList.toggle('hidden',!items.length); }
  async function confirmSyllabus(){
    if (!syllabusParsed.length) return;
    let imported=0, skipped=0;
    try {
      for (const p of syllabusParsed) {
        const draft={id:uid('a'),courseId:p.courseId,title:p.title,type:p.type,due:p.due,effort:p.effort,remaining:p.effort,status:'not_started',weight:5,topics:[],sourceType:'syllabus_local'};
        if(state.assessments.some(a=>isLikelyAssessmentDuplicate(a,draft))){skipped++;continue;}
        if (academicCloudReady && cloudUser && cloudSemester) {
          const row=await window.studentHubCloud.createAssessment(cloudUser,cloudSemester,draft,draft.courseId,draft.id);
          state.assessments.push(rowToAssessment(row));
        } else {
          state.assessments.push(draft);
        }
        imported++;
      }
      save(); closeModals(); render(); updateCloudStatusCard();
      toast(`Imported ${imported} assessment${imported!==1?'s':''}${skipped?`, ${skipped} duplicate${skipped===1?'':'s'} skipped`:''}${academicCloudReady?' to Appwrite':''}.`);
    } catch (error) {
      console.error(error);
      save(); render();
      toast(`Imported ${imported}, then cloud sync failed. Check the assessments table setup.`);
    }
  }

  function openSearch(){ openModal(qs('#searchModal')); qs('#searchInput').value=''; renderSearch(''); setTimeout(()=>qs('#searchInput').focus(),60); }
  function renderSearch(query){ const q=query.trim().toLowerCase(); const items=[]; state.courses.forEach(c=>items.push({type:'Course',icon:'◫',title:c.name,meta:c.code,id:c.id,text:(c.name+' '+c.code+' '+c.topics.join(' ')).toLowerCase()})); state.assessments.forEach(a=>items.push({type:a.type,icon:'✓',title:a.title,meta:courseName(a.courseId)+' · '+humanDue(a.due),id:a.id,text:(a.title+' '+courseName(a.courseId)+' '+(a.topics||[]).join(' ')).toLowerCase()})); state.resources.forEach(r=>items.push({type:r.type,icon:r.type==='PDF'?'▤':'⌁',title:r.title,meta:courseName(r.courseId)+' · '+r.topic,id:r.id,text:(r.title+' '+courseName(r.courseId)+' '+r.topic).toLowerCase()})); const filtered=items.filter(i=>!q||i.text.includes(q)).slice(0,12); qs('#searchResults').innerHTML=filtered.length?filtered.map(i=>`<button class="search-result" data-search-type="${i.type}" data-search-id="${i.id}"><span class="search-result-icon">${i.icon}</span><div><strong>${esc(i.title)}</strong><small>${esc(i.meta)}</small></div><small>${esc(i.type)}</small></button>`).join(''):`<div class="empty-state" style="min-height:160px"><p>No matching semester object.</p></div>`; qsa('.search-result').forEach(b=>b.onclick=()=>{const type=b.dataset.searchType;if(type==='Course'){activeCourseId=b.dataset.searchId;activeCourseTab='overview';state.route='courses';}else if(['PDF','Note','Link'].includes(type)){state.route='library';}else{state.route='planner';}save();closeModals();render();}); }

  function humanDue(date){ const d=daysUntil(date); if(d<0)return 'overdue'; if(d<1&&isToday(date))return `today ${fmtTime(date)}`; if(d<2)return 'tomorrow'; if(d<7)return fmtDate(date,{weekday:'short'}); return fmtDate(date,{month:'short',day:'numeric'}); }
  function formatMinutes(m=0){ m=Math.max(0,Math.round(m)); const h=Math.floor(m/60), min=m%60; return h?`${h}h${min?` ${min}m`:''}`:`${min}m`; }
  function formatBytes(bytes=0){ const n=Math.max(0,Number(bytes)||0); if(n<1024)return `${Math.round(n)} B`; if(n<1024*1024)return `${(n/1024).toFixed(1)} KB`; return `${(n/(1024*1024)).toFixed(1)} MB`; }
  function timeAgo(date){ const m=Math.max(0,Math.round((Date.now()-new Date(date))/60000)); if(m<1)return 'just now'; if(m<60)return `${m}m ago`;const h=Math.floor(m/60);if(h<24)return `${h}h ago`;return `${Math.floor(h/24)}d ago`; }
  function toast(msg){ const el=document.createElement('div');el.className='toast';el.textContent=msg;qs('#toastStack').appendChild(el);setTimeout(()=>el.remove(),3200); }
  function updateBadges(){ const n=state.inbox.filter(i=>!i.processed).length; const b=qs('#inboxBadge'); if(!b)return;b.textContent=n;b.classList.toggle('visible',n>0); }


  function rowToCourse(row) {
    return {
      id: row.$id,
      cloudId: row.$id,
      legacyId: row.legacyId || '',
      code: row.code || 'COURSE',
      name: row.name || 'Untitled course',
      teacher: row.teacher || '',
      room: row.room || '',
      color: row.color || '#6d63ed',
      schedule: row.schedule || '',
      grade: Number(row.grade || 0),
      target: Number(row.target || 0),
      topics: dedupeTopics(Array.isArray(row.topics) ? row.topics : [])
    };
  }

  function rowToAssessment(row) {
    return {
      id: row.$id,
      cloudId: row.$id,
      legacyId: row.legacyId || '',
      courseId: row.courseId,
      title: row.title || 'Untitled assessment',
      type: row.type || 'Assignment',
      due: row.due,
      effort: Number(row.effort || 0),
      remaining: Number(row.remaining ?? row.effort ?? 0),
      status: row.status || 'not_started',
      weight: Number(row.weight || 0),
      topics: dedupeTopics(Array.isArray(row.topics) ? row.topics : []),
      sourceType: row.sourceType || 'manual'
    };
  }

  function rowToTask(row) {
    return { id:row.$id, cloudId:row.$id, legacyId:row.legacyId||'', courseId:row.courseId, assessmentId:row.assessmentId, title:row.title||'Untitled task', estimate:Number(row.estimate||0), remaining:Number(row.remaining??row.estimate??0), status:row.status||'not_started', position:Number(row.position||0), sourceType:row.sourceType||'planner' };
  }

  function rowToWorkBlock(row) {
    return { id:row.$id, cloudId:row.$id, legacyId:row.legacyId||'', courseId:row.courseId, assessmentId:row.assessmentId, taskId:row.taskId||'', title:row.title||'Work block', type:'work', start:row.start, end:row.end, status:row.status||'planned', sourceType:row.sourceType||'planner' };
  }


  function rowToResource(row) {
    return { id:row.$id, cloudId:row.$id, legacyId:row.legacyId||'', courseId:row.courseId, topic:row.topic||'General', type:row.type||'Note', title:row.title||'Untitled resource', description:row.description||'', url:row.url||'', sourceType:row.sourceType||'library', storageFileId:row.storageFileId||'', fileName:row.fileName||'', mimeType:row.mimeType||'', fileSize:Number(row.fileSize||0), updated:timeAgo(row.$updatedAt||row.$createdAt||new Date()) };
  }

  function rowToInbox(row) {
    return { id:row.$id, cloudId:row.$id, legacyId:row.legacyId||'', text:row.text||'', created:row.$createdAt||new Date().toISOString(), processed:Boolean(row.processed), processedAt:row.processedAt||'', sourceType:row.sourceType||'capture' };
  }

  function rowToStudySession(row) {
    return { id:row.$id, cloudId:row.$id, legacyId:row.legacyId||'', courseId:row.courseId, assessmentId:row.assessmentId||'', topic:row.topic||'General', minutes:Number(row.minutes||0), completedAt:row.completedAt||row.$createdAt, sourceType:row.sourceType||'focus' };
  }

  function applyCloudPlannerData(payload) {
    const tasks=Array.isArray(payload?.tasks)?payload.tasks:[];
    const blocks=Array.isArray(payload?.workBlocks)?payload.workBlocks:[];
    state.tasks=tasks.map(rowToTask);
    const localNonWork=state.events.filter(e=>e.type!=='work');
    state.events=[...localNonWork,...blocks.filter(row=>row.status!=='done').map(rowToWorkBlock)];
    save(); render();
  }


  function applyCloudKnowledgeData(payload){
    state.resources=(Array.isArray(payload?.resources)?payload.resources:[]).map(rowToResource);
    state.inbox=(Array.isArray(payload?.inbox)?payload.inbox:[]).map(rowToInbox);
    state.studySessions=(Array.isArray(payload?.studySessions)?payload.studySessions:[]).map(rowToStudySession).sort((a,b)=>new Date(b.completedAt)-new Date(a.completedAt));
    save(); render();
  }

  function updateCloudStatusCard(){
    const title=qs('#cloudStatusTitle'), text=qs('#cloudStatusText'); if(!title||!text||!cloudUser)return;
    if(academicCloudReady&&plannerCloudReady&&knowledgeCloudReady){ title.textContent='Full semester cloud synced'; text.textContent=`${state.semester.name}: ${state.courses.length} courses, ${state.assessments.length} assessments, ${(state.tasks||[]).filter(t=>t.status!=='done').length} open tasks, ${state.resources.length} resources, ${state.inbox.filter(i=>!i.processed).length} Inbox items, and ${state.studySessions.length} study sessions.`; }
    else if(academicCloudReady&&plannerCloudReady){ title.textContent='Academic + planner cloud synced'; text.textContent=`${state.semester.name}: academic and planner data are synced. Library/Inbox/study need resources, inbox_items, and study_sessions tables.`; }
    else if(academicCloudReady){ title.textContent='Academic cloud synced'; text.textContent=`${state.semester.name}: courses and assessments are synced. Planner cloud still needs tasks/work_blocks setup.`; }
  }

  function remapDependentLocalData(courseMap, assessmentMap) {
    const mapCourse = id => courseMap.get(id) || id;
    const mapAssessment = id => assessmentMap.get(id) || id;

    state.events.forEach(event => {
      if (event.courseId) event.courseId = mapCourse(event.courseId);
      if (event.assessmentId) event.assessmentId = mapAssessment(event.assessmentId);
    });
    state.resources.forEach(resource => {
      if (resource.courseId) resource.courseId = mapCourse(resource.courseId);
    });
    state.review.forEach(item => {
      if (item.courseId) item.courseId = mapCourse(item.courseId);
    });
    state.studySessions.forEach(session => {
      if (session.courseId) session.courseId = mapCourse(session.courseId);
    });
    if (state.timer?.context?.courseId) {
      state.timer.context.courseId = mapCourse(state.timer.context.courseId);
    }
    practiceBank.forEach(question => {
      if (question.courseId) question.courseId = mapCourse(question.courseId);
    });
    if (activeCourseId) activeCourseId = mapCourse(activeCourseId);
  }

  function applyCloudAcademicData(payload) {
    const cloudCourses = Array.isArray(payload?.courses) ? payload.courses : [];
    const cloudAssessments = Array.isArray(payload?.assessments) ? payload.assessments : [];

    const courseMap = new Map();
    cloudCourses.forEach(row => {
      courseMap.set(row.$id, row.$id);
      if (row.legacyId) courseMap.set(row.legacyId, row.$id);
    });

    const assessmentMap = new Map();
    cloudAssessments.forEach(row => {
      assessmentMap.set(row.$id, row.$id);
      if (row.legacyId) assessmentMap.set(row.legacyId, row.$id);
    });

    remapDependentLocalData(courseMap, assessmentMap);
    state.courses = cloudCourses.map(rowToCourse);
    state.assessments = cloudAssessments.map(rowToAssessment);
    save();
    render();
  }

  async function setCloudContext(user, semester) {
    cloudUser=user||null; cloudSemester=semester||null; academicCloudReady=false; plannerCloudReady=false; knowledgeCloudReady=false;
    setUserContext(user?.$id, semester?.name || 'My Semester');
    if(!user||!semester||!window.studentHubCloud?.syncAcademicSeed) return {academicCloudReady:false,plannerCloudReady:false};

    try{
      const academic=await window.studentHubCloud.syncAcademicSeed(user,semester,state.courses,state.assessments);
      applyCloudAcademicData(academic); academicCloudReady=true;
    }catch(error){ console.error('Academic cloud sync failed:',error); render(); return {academicCloudReady:false,plannerCloudReady:false,error}; }

    try{
      if(!Array.isArray(state.tasks))state.tasks=[];
      const planner=await window.studentHubCloud.syncPlannerSeed(user,semester,state.tasks,state.events.filter(e=>e.type==='work'));
      applyCloudPlannerData(planner); plannerCloudReady=true;
    }catch(error){ console.error('Planner cloud sync failed:',error); plannerCloudReady=false; }

    try{
      const knowledge=await window.studentHubCloud.syncKnowledgeSeed(user,semester,state.resources||[],state.inbox||[],state.studySessions||[]);
      applyCloudKnowledgeData(knowledge); knowledgeCloudReady=true;
    }catch(error){ console.error('Knowledge cloud sync failed:',error); knowledgeCloudReady=false; }

    render(); updateCloudStatusCard();
    return {academicCloudReady:true,plannerCloudReady,knowledgeCloudReady,courses:state.courses.length,assessments:state.assessments.length,tasks:(state.tasks||[]).length,workBlocks:state.events.filter(e=>e.type==='work').length,resources:state.resources.length,inbox:state.inbox.filter(i=>!i.processed).length,studySessions:state.studySessions.length};
  }

  function openCourseModal() {
    const form = qs('#addCourseForm');
    form?.reset();
    qs('#courseColor').value = '#6d63ed';
    qs('#courseGrade').value = '0';
    qs('#courseTarget').value = '0';
    openModal(qs('#addCourseModal'));
    setTimeout(()=>qs('#courseCode')?.focus(),60);
  }

  async function confirmAddCourse(event) {
    event?.preventDefault();
    if (!cloudUser || !cloudSemester || !academicCloudReady) {
      toast('Course cloud sync is not ready. Check the Appwrite courses table.');
      return;
    }

    const topics = dedupeTopics(qs('#courseTopics').value
      .split(',')
      .map(value=>value.trim())
      .filter(Boolean));

    const draft = {
      id: uid('c'),
      code: qs('#courseCode').value.trim(),
      name: qs('#courseName').value.trim(),
      teacher: qs('#courseTeacher').value.trim(),
      room: qs('#courseRoom').value.trim(),
      color: qs('#courseColor').value || '#6d63ed',
      schedule: qs('#courseSchedule').value.trim(),
      grade: Number(qs('#courseGrade').value || 0),
      target: Number(qs('#courseTarget').value || 0),
      topics
    };

    if (!draft.code || !draft.name) {
      toast('Course code and course name are required.');
      return;
    }

    const button=qs('#addCourseSubmit');
    if(button){button.disabled=true;button.textContent='Saving…';}

    try {
      const row=await window.studentHubCloud.createCourse(cloudUser,cloudSemester,draft,draft.id);
      state.courses.push(rowToCourse(row));
      save();
      closeModals();
      render();
      updateCloudStatusCard();
      toast(`${draft.name} saved to Appwrite.`);
    } catch (error) {
      console.error(error);
      toast('Could not save the course. Check your Appwrite courses table.');
    } finally {
      if(button){button.disabled=false;button.textContent='Add course';}
    }
  }

  function setUserContext(userId, semesterName='') {
    if (!userId) return;
    const nextKey = `${BASE_STORAGE_KEY}.${userId}`;
    if (activeStorageKey !== nextKey) {
      if (!localStorage.getItem(nextKey)) {
        const existing = localStorage.getItem(BASE_STORAGE_KEY);
        if (existing) localStorage.setItem(nextKey, existing);
      }
      activeStorageKey = nextKey;
      state = loadState(activeStorageKey);
      if (!Array.isArray(state.tasks)) state.tasks = [];
      if (!Array.isArray(state.events)) state.events = [];
      if (!Array.isArray(state.resources)) state.resources = [];
      if (!Array.isArray(state.inbox)) state.inbox = [];
      if (!Array.isArray(state.studySessions)) state.studySessions = [];
      if (!state.timer.initialSeconds) state.timer.initialSeconds = state.timer.seconds || 25*60;
    }
    if (semesterName) state.semester.name = semesterName;
    save();
    render();
  }

  function resetUserContext() {
    stopTimer();
    cloudUser = null;
    cloudSemester = null;
    academicCloudReady = false;
    plannerCloudReady = false;
    knowledgeCloudReady = false;
    activeStorageKey = BASE_STORAGE_KEY;
    state = loadState(activeStorageKey);
  }

  window.studentHubApp = Object.freeze({
    setUserContext,
    setCloudContext,
    resetUserContext,
    render,
    toast
  });

  qsa('[data-route]').forEach(b=>b.addEventListener('click',()=>setRoute(b.dataset.route)));
  qs('#themeToggle').addEventListener('click',()=>{state.theme=state.theme==='dark'?'light':'dark';save();render();});
  qs('#openQuickAdd').addEventListener('click',()=>openQuickAdd());
  qs('#mobileQuickAdd').addEventListener('click',()=>openQuickAdd());
  qs('#openSearch').addEventListener('click',openSearch);
  qs('#modalBackdrop').addEventListener('click',closeModals);
  qsa('.close-modal').forEach(b=>b.addEventListener('click',closeModals));
  qs('#addCourseForm')?.addEventListener('submit',confirmAddCourse);
  qs('#addResourceForm')?.addEventListener('submit',confirmAddResource);
  qs('#resourceType')?.addEventListener('change',setResourceTypeFields);
  qs('#syllabusCourse')?.addEventListener('change',syncSyllabusSourceSelection);
  qs('#uploadSyllabusFile')?.addEventListener('click',uploadSyllabusPdf);
  qs('#analyzeSyllabusFile')?.addEventListener('click',analyzeStoredSyllabus);
  qs('#importAiSyllabus')?.addEventListener('click',importReviewedAiSyllabus);
  qs('#fillExample').addEventListener('click',()=>{qs('#quickAddInput').value='Chem lab report Friday 6pm, probably 2 hours';});
  qs('#parseQuickAdd').addEventListener('click',()=>{const text=qs('#quickAddInput').value.trim();if(!text)return toast('Type something to capture first.');quickParsed=parseNatural(text);showQuickPreview(quickParsed);});
  qs('#confirmQuickAdd').addEventListener('click',confirmQuick);
  qs('#parseSyllabus').addEventListener('click',()=>{syllabusParsed=parseSyllabusText(qs('#syllabusInput').value);showSyllabusPreview(syllabusParsed);if(!syllabusParsed.length)toast('No dated assessment lines detected.');});
  qs('#confirmSyllabus').addEventListener('click',confirmSyllabus);
  qs('#searchInput').addEventListener('input',e=>renderSearch(e.target.value));
  document.addEventListener('keydown',e=>{ if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch();} else if(e.key==='Escape')closeModals(); else if(e.key.toLowerCase()==='q'&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();openQuickAdd();} });

  window.addEventListener('beforeunload',save);
  if('serviceWorker' in navigator){ window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{})); }
  if(state.timer.running) startTimer();
  render();
})();
