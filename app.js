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
      timer:{seconds:25*60, running:false, context:{courseId:'stats',topic:'Probability'}}
    };
  }

  function loadState(key=activeStorageKey){
    try { const raw=localStorage.getItem(key); if(raw){ const parsed=JSON.parse(raw); if(parsed.version===1) return parsed; } } catch(e){}
    return seedState();
  }
  let state = loadState();
  if (!Array.isArray(state.tasks)) state.tasks = [];
  if (!Array.isArray(state.events)) state.events = [];
  let activeCourseId = null;
  let activeCourseTab = 'overview';
  let quickParsed = null;
  let syllabusParsed = [];
  let timerHandle = null;
  let cloudUser = null;
  let cloudSemester = null;
  let academicCloudReady = false;
  let plannerCloudReady = false;

  function save(){ localStorage.setItem(activeStorageKey, JSON.stringify(state)); updateBadges(); }
  function course(id){ return state.courses.find(c=>c.id===id); }
  function assessment(id){ return state.assessments.find(a=>a.id===id); }
  function courseName(id){ return course(id)?.name || 'Unassigned'; }
  function colorForCourse(id){ return course(id)?.color || 'var(--accent)'; }
  function daysUntil(date){ return (startOfDay(new Date(date))-startOfDay(new Date()))/DAY; }
  function isToday(date){ return isoDate(date)===isoDate(new Date()); }
  function weekStart(date=new Date()) { const d=startOfDay(date); const day=(d.getDay()+6)%7; return addDays(d,-day); }

  function requiredMinutesThisWeek(){
    const end=addDays(weekStart(),7);
    return state.assessments.filter(a=>new Date(a.due)<end && new Date(a.due)>=weekStart() && a.status!=='done').reduce((s,a)=>s+(a.remaining ?? a.effort ?? 0),0);
  }
  function scheduledWorkMinutesThisWeek(){
    const start=weekStart(), end=addDays(start,7);
    return state.events.filter(e=>['work','study'].includes(e.type)&&new Date(e.start)>=start&&new Date(e.start)<end)
      .reduce((s,e)=>s+Math.round((new Date(e.end)-new Date(e.start))/60000),0);
  }
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
    const todaysEvents=state.events.filter(e=>isToday(e.start)).sort((a,b)=>new Date(a.start)-new Date(b.start));
    const dueSoon=state.assessments.filter(a=>a.status!=='done').sort((a,b)=>new Date(a.due)-new Date(b.due)).slice(0,4);
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

      <div class="section-head"><div><h2>Today’s timeline</h2><p>Fixed commitments and scheduled work are intentionally separate.</p></div><button class="btn secondary" data-route-jump="planner">Open planner</button></div>
      <div class="section-grid">
        <article class="card timeline">
          ${todaysEvents.length?todaysEvents.map(e=>timelineRow(e)).join(''):`<div class="empty-state"><div class="empty-icon">○</div><h3>Open day</h3><p>No fixed or planned events today.</p></div>`}
        </article>
        <article class="card list-card">
          ${dueSoon.map(a=>{const c=course(a.courseId);return `<div class="list-row"><div><strong><span class="course-dot" style="--course-color:${c.color}"></span> ${esc(a.title)}</strong><small>${esc(c.name)} · ${formatMinutes(a.remaining)} left · ${a.type}</small></div><span class="date-chip">${humanDue(a.due)}</span></div>`}).join('')}
        </article>
      </div>

      <div class="section-head"><div><h2>Review queue</h2><p>Study is connected to the same course and topic objects.</p></div><button class="btn secondary" data-route-jump="study">Study now</button></div>
      <div class="review-queue">${state.review.slice(0,3).map(r=>reviewRow(r)).join('')}</div>
    `;
  }

  function timelineRow(e){ const c=course(e.courseId); const label=e.type==='fixed'?'Fixed event':e.type==='work'?'Work block':'Study session'; return `<div class="timeline-item"><span class="timeline-time">${fmtTime(e.start)}</span><span class="timeline-line" style="--item-color:${c?.color||'var(--accent)'}"></span><div class="timeline-copy"><strong>${esc(e.title)}</strong><small>${esc(c?.name||'Personal')} · ${label}</small></div><span class="timeline-status">${Math.round((new Date(e.end)-new Date(e.start))/60000)}m</span></div>`; }
  function reviewRow(r){ const c=course(r.courseId); return `<div class="review-item"><div><strong><span class="course-dot" style="--course-color:${c.color}"></span> ${esc(r.topic)}</strong><small>${esc(c.name)} · ${r.due===isoDate(new Date())?'Due today':'Due '+fmtDate(r.due,{month:'short',day:'numeric'})}</small></div><div class="mastery">${r.mastery}%</div></div>`; }

  function renderPlanner(){
    const start=weekStart(); const days=[0,1,2,3,4,5,6].map(n=>addDays(start,n));
    const req=requiredMinutesThisWeek(), sched=scheduledWorkMinutesThisWeek();
    const openTasks=(state.tasks||[]).filter(t=>t.status!=='done').sort((a,b)=>a.position-b.position).slice(0,8);
    return `
      <div class="stat-strip">
        <div class="stat"><span>Required this week</span><strong>${formatMinutes(req)}</strong></div>
        <div class="stat"><span>Already scheduled</span><strong>${formatMinutes(sched)}</strong></div>
        <div class="stat"><span>Unscheduled work</span><strong>${formatMinutes(Math.max(0,req-sched))}</strong></div>
        <div class="stat"><span>Capacity</span><strong>${formatMinutes(state.semester.availableMinutesPerWeek)}</strong></div>
      </div>
      <div class="week-toolbar"><div><span class="eyebrow">Week of ${fmtDate(start,{month:'short',day:'numeric'})}</span><h2 style="margin:4px 0 0;font-size:18px">Cloud planner · drag work blocks between days</h2></div><div class="button-row"><button class="btn secondary" id="autoPlan">Auto-plan remaining</button></div></div>
      <div class="week-grid">
        ${days.map(day=>{
          const events=state.events.filter(e=>e.status!=='done'&&isoDate(e.start)===isoDate(day)).sort((a,b)=>new Date(a.start)-new Date(b.start));
          const deadlines=state.assessments.filter(a=>isoDate(a.due)===isoDate(day)&&a.status!=='done');
          return `<div class="day-column" data-day="${isoDate(day)}"><div class="day-head ${isToday(day)?'today':''}"><strong>${fmtDate(day,{weekday:'short'})}</strong><span>${fmtDate(day,{month:'short',day:'numeric'})}</span></div>${events.map(eventCard).join('')}${deadlines.map(deadlineCard).join('')}</div>`
        }).join('')}
      </div>
      <p style="color:var(--muted);font-size:10px;margin-top:10px">Deadlines are constraints. Work blocks are stored in Appwrite and keep their time when you sign in elsewhere.</p>
      <div class="section-head"><div><h2>Work queue</h2><p>Planning an assessment creates actionable tasks before placing time blocks.</p></div><span class="pill ${plannerCloudReady?'success':''}">${plannerCloudReady?'Cloud tasks synced':'Planner cloud unavailable'}</span></div>
      <article class="card task-queue">${openTasks.length?openTasks.map(taskRow).join(''):`<div class="empty-state"><div class="empty-icon">✓</div><h3>No open planner tasks</h3><p>Use Plan work on an assessment to create a task breakdown.</p></div>`}</article>
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
    if(activeCourseTab==='overview') body=`<div class="section-grid"><article class="card list-card">${ass.slice(0,5).map(a=>`<div class="list-row"><div><strong>${esc(a.title)}</strong><small>${a.type} · ${formatMinutes(a.remaining)} left</small></div><span class="date-chip">${humanDue(a.due)}</span></div>`).join('')}</article><article class="card pad"><span class="eyebrow">Topics</span><div class="topic-cloud" style="margin-top:13px">${c.topics.map(t=>`<span class="topic-chip">${esc(t)}</span>`).join('')}</div></article></div>`;
    if(activeCourseTab==='work') body=`<article class="card list-card">${ass.map(a=>`<div class="list-row"><div><strong>${esc(a.title)}</strong><small>${a.type} · ${a.status.replace('_',' ')}</small></div><div class="button-row"><span class="date-chip">${humanDue(a.due)}</span><button class="btn secondary" data-plan="${a.id}">Plan</button></div></div>`).join('')}</article>`;
    if(activeCourseTab==='topics') body=`<div class="course-grid">${c.topics.map(t=>{const count=res.filter(r=>r.topic===t).length; const review=state.review.find(r=>r.courseId===id&&r.topic===t);return `<article class="card pad"><span class="course-dot" style="--course-color:${c.color}"></span><h3 style="margin:15px 0 5px">${esc(t)}</h3><p style="color:var(--muted);font-size:11px">${count} linked resources${review?` · mastery ${review.mastery}%`:''}</p></article>`}).join('')}</div>`;
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
    return `<div class="study-layout"><article class="card focus-card"><span class="eyebrow">Focus session</span><div class="timer" id="timerDisplay">${formatTimer(t.seconds)}</div><div class="timer-context"><span class="course-dot" style="--course-color:${c?.color||'var(--accent)'}"></span> ${esc(c?.name||'Study')} → ${esc(t.context.topic)}</div><div class="button-row" style="margin-top:24px"><button class="btn primary" id="timerToggle">${t.running?'Pause':'Start'}</button><button class="btn secondary" id="timerReset">Reset</button></div></article><article class="card practice-card"><span class="eyebrow">Practice from your course context</span><h3><span class="course-dot" style="--course-color:${colorForCourse(q.courseId)}"></span> ${esc(q.topic)}</h3><div class="practice-question"><p>${esc(q.q)}</p><p class="answer hidden" id="practiceAnswer">${esc(q.a)}</p></div><div class="button-row"><button class="btn secondary" id="showAnswer">Reveal answer</button><button class="btn primary" id="nextQuestion">Next question</button></div></article></div><div class="section-head"><div><h2>Due for review</h2><p>Simple spaced-review queue for the prototype.</p></div></div><div class="review-queue">${state.review.map(reviewRow).join('')}</div>`;
  }

  function renderLibrary(){
    return `<div class="library-toolbar"><input class="search-input" id="librarySearch" placeholder="Search notes, files, links and topics..."/><button class="btn secondary" id="addDemoResource">+ Demo resource</button></div><div class="resource-grid" id="resourceGrid">${state.resources.map(resourceCard).join('')}</div>`;
  }
  function resourceCard(r){ const c=course(r.courseId); const icon={PDF:'▤',Note:'✎',Link:'↗'}[r.type]||'•'; return `<article class="card resource-card" data-resource-text="${esc((r.title+' '+r.topic+' '+courseName(r.courseId)).toLowerCase())}"><div><div class="resource-icon">${icon}</div><h3>${esc(r.title)}</h3><p>${esc(r.description)}</p></div><footer><span><span class="course-dot" style="--course-color:${c?.color||'var(--accent)'}"></span> ${esc(c?.name||'Unassigned')} · ${esc(r.topic||'General')}</span><span>${esc(r.updated)}</span></footer></article>`; }

  function renderInbox(){
    const items=state.inbox.filter(i=>!i.processed).sort((a,b)=>new Date(b.created)-new Date(a.created));
    return `<div class="inbox-compose"><textarea id="inboxInput" placeholder="Drop something here without organizing it first..."></textarea><button class="btn primary" id="captureInbox">Capture</button></div><div class="section-head"><div><h2>Unorganized capture</h2><p>Process later. The system should reduce setup friction.</p></div></div><div class="inbox-list">${items.length?items.map(i=>`<article class="card inbox-item"><div><p>${esc(i.text)}</p><small>Captured ${timeAgo(i.created)}</small></div><div class="button-row"><button class="btn secondary" data-organize="${i.id}">Organize</button><button class="btn ghost" data-archive="${i.id}">Archive</button></div></article>`).join(''):`<div class="card empty-state"><div class="empty-icon">✓</div><h3>Inbox zero</h3><p>Everything captured has been processed.</p></div>`}</div>`;
  }

  function renderSettings(){
    const academicLabel = academicCloudReady ? 'Courses + assessments cloud' : 'Academic cloud unavailable';
    const plannerLabel = plannerCloudReady ? 'Tasks + work blocks cloud' : 'Planner cloud unavailable';
    return `<div class="settings-grid"><article class="card setting-card"><h3>Weekly study capacity</h3><p>The workload engine compares estimated required work with the time you realistically have.</p><label class="eyebrow" for="capacityInput">Hours / week</label><input id="capacityInput" type="number" min="1" max="80" step=".5" value="${state.semester.availableMinutesPerWeek/60}" style="width:100%;margin-top:7px"/></article><article class="card setting-card"><h3>Cloud academic data</h3><p>Semester, courses, assessments, planner tasks, and work blocks are stored in Appwrite.</p><span class="pill ${academicCloudReady?'success':''}">${academicLabel}</span> <span class="pill ${plannerCloudReady?'success':''}">${plannerLabel}</span></article><article class="card setting-card"><h3>One source of truth</h3><p>Plan work now creates cloud tasks and schedules cloud work blocks. Moving a work block updates Appwrite immediately.</p><button class="btn secondary" data-route-jump="planner">Open cloud planner</button></article><article class="card setting-card"><h3>Next backend step</h3><p>Move resources, study sessions, and Inbox into cloud storage, then connect syllabus PDFs to Gemini.</p><span class="pill">Study data + files next</span></article></div>`;
  }

  function bindPageEvents(){
    qsa('[data-route-jump]').forEach(b=>b.onclick=()=>setRoute(b.dataset.routeJump));
    qsa('[data-start-focus]').forEach(b=>b.onclick=()=>{ const a=assessment(b.dataset.startFocus); if(!a)return; state.timer.context={courseId:a.courseId,topic:a.topics?.[0]||a.title}; state.timer.seconds=Math.min(45,a.remaining||25)*60; state.timer.running=false; save(); setRoute('study'); });
    qsa('[data-plan]').forEach(b=>b.onclick=()=>planAssessment(b.dataset.plan));
    qsa('[data-course]').forEach(b=>b.onclick=()=>{activeCourseId=b.dataset.course; activeCourseTab='overview'; render();});
    qs('#backCourses')?.addEventListener('click',()=>{activeCourseId=null;render();});
    qsa('[data-course-tab]').forEach(b=>b.onclick=()=>{activeCourseTab=b.dataset.courseTab;render();});
    qs('#openImport')?.addEventListener('click',openImport);
    qs('#openAddCourse')?.addEventListener('click',openCourseModal);
    qs('#autoPlan')?.addEventListener('click',autoPlan);
    qsa('[data-task-done]').forEach(b=>b.onclick=()=>markTaskDone(b.dataset.taskDone));
    bindDragDrop();
    qs('#timerToggle')?.addEventListener('click',toggleTimer);
    qs('#timerReset')?.addEventListener('click',()=>{stopTimer();state.timer.seconds=25*60;state.timer.running=false;save();render();});
    qs('#showAnswer')?.addEventListener('click',()=>qs('#practiceAnswer')?.classList.toggle('hidden'));
    qs('#nextQuestion')?.addEventListener('click',()=>{state.practiceIndex=(state.practiceIndex+1)%practiceBank.length;save();render();});
    qs('#librarySearch')?.addEventListener('input',e=>{const q=e.target.value.toLowerCase();qsa('[data-resource-text]').forEach(card=>card.style.display=card.dataset.resourceText.includes(q)?'':'none');});
    qs('#addDemoResource')?.addEventListener('click',()=>{state.resources.unshift({id:uid('r'),courseId:state.courses[0]?.id||'',topic:state.courses[0]?.topics?.[0]||'General',type:'Note',title:'New captured note',description:'Demo note added locally',updated:'Now'});save();render();toast('Resource added to Library.');});
    qs('#captureInbox')?.addEventListener('click',()=>{const el=qs('#inboxInput');const text=el.value.trim();if(!text)return;state.inbox.unshift({id:uid('i'),text,created:new Date().toISOString(),processed:false});save();render();toast('Captured to Inbox.');});
    qsa('[data-organize]').forEach(b=>b.onclick=()=>{const i=state.inbox.find(x=>x.id===b.dataset.organize); if(!i)return; openQuickAdd(i.text, i.id);});
    qsa('[data-archive]').forEach(b=>b.onclick=()=>{const i=state.inbox.find(x=>x.id===b.dataset.archive);if(i)i.processed=true;save();render();toast('Inbox item archived.');});
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

  async function planAssessment(id, options={}){
    const a=assessment(id); if(!a)return 0;
    if(!plannerCloudReady || !cloudUser || !cloudSemester){ if(!options.silent)toast('Planner cloud is not ready. Check tasks and work_blocks in Appwrite.'); return 0; }
    const existing=state.events.filter(e=>e.assessmentId===id&&e.type==='work'&&e.status!=='done');
    if(existing.length){ if(!options.silent)toast('Work for this assessment is already scheduled.'); return 0; }
    try{
      const tasks=await ensureTasksForAssessment(a);
      const now=startOfDay(new Date()); const due=startOfDay(new Date(a.due)); const days=Math.max(1,Math.ceil((due-now)/DAY));
      let blockIndex=0, made=0;
      for(const task of tasks){
        let left=Math.max(0,task.remaining||task.estimate||0);
        while(left>0){
          const minutes=Math.min(60,left); const d=addDays(now,blockIndex%days); const h=16+(blockIndex%4);
          const start=dateAt(d,`${String(h).padStart(2,'0')}:00`); const end=new Date(start.getTime()+minutes*60000);
          const draft={id:uid('wb'),courseId:a.courseId,assessmentId:a.id,taskId:task.id,title:`${a.title} · ${task.title}`,type:'work',start:start.toISOString(),end:end.toISOString(),status:'planned',sourceType:'planner'};
          const row=await window.studentHubCloud.createWorkBlock(cloudUser,cloudSemester,draft,draft.id);
          state.events.push(rowToWorkBlock(row)); made++; blockIndex++; left-=minutes;
        }
      }
      save(); render(); updateCloudStatusCard();
      if(!options.silent)toast(`Created ${tasks.length} tasks and ${made} cloud work block${made!==1?'s':''}.`);
      return made;
    }catch(error){ console.error('Cloud planning failed:',error); if(!options.silent)toast('Could not create cloud planner data. Check the tasks/work_blocks table setup.'); return 0; }
  }

  async function autoPlan(){
    if(!plannerCloudReady){toast('Planner cloud is not ready.');return;}
    const button=qs('#autoPlan'); if(button){button.disabled=true;button.textContent='Planning…';}
    let made=0;
    for(const a of state.assessments.filter(a=>a.status!=='done')){
      if(!state.events.some(e=>e.assessmentId===a.id&&e.type==='work'&&e.status!=='done')) made+=await planAssessment(a.id,{silent:true});
    }
    render(); toast(made?`Created ${made} cloud work blocks.`:'Everything already has planned work.');
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
  function startTimer(){ stopTimer(false); state.timer.running=true; timerHandle=setInterval(()=>{ if(!state.timer.running)return; state.timer.seconds=Math.max(0,state.timer.seconds-1); const el=qs('#timerDisplay'); if(el)el.textContent=formatTimer(state.timer.seconds); if(state.timer.seconds===0){ stopTimer(); state.timer.running=false; state.studySessions.push({id:uid('s'),courseId:state.timer.context.courseId,topic:state.timer.context.topic,completedAt:new Date().toISOString(),minutes:25}); save();toast('Focus session complete.');render(); } },1000); }
  function stopTimer(setFalse=true){ if(timerHandle)clearInterval(timerHandle);timerHandle=null;if(setFalse)state.timer.running=false; }
  function formatTimer(s){ const m=Math.floor(s/60), sec=s%60;return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`; }

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
      if(inboxId){const i=state.inbox.find(x=>x.id===inboxId);if(i)i.processed=true;}
      save(); closeModals(); render(); updateCloudStatusCard();
      toast(academicCloudReady?'Assessment saved to Appwrite and surfaced everywhere.':'Added locally; cloud assessment sync is unavailable.');
    } catch (error) {
      console.error(error);
      toast('Could not save the assessment to Appwrite. Check the assessments table setup.');
    }
  }

  function openImport(){
    const tomorrow=addDays(new Date(),1), d5=addDays(new Date(),5), d12=addDays(new Date(),12);
    qs('#syllabusInput').value=`STAT210 Statistics\nProfessor: Dr. Park\nProblem Set 3 due ${isoDate(tomorrow)} 23:59 | estimated 2h\nQuiz: Probability & Distributions due ${isoDate(d5)} 14:00 | estimated 1h\nMidterm Exam due ${isoDate(d12)} 10:00 | estimated 5h`;
    qs('#syllabusPreview').classList.add('hidden');qs('#confirmSyllabus').classList.add('hidden');syllabusParsed=[];openModal(qs('#importModal'));
  }
  function parseSyllabusText(text){
    const lines=text.split(/\n+/).map(x=>x.trim()).filter(Boolean); const first=lines[0]?.toLowerCase()||''; const c=state.courses.find(c=>first.includes(c.name.toLowerCase())||first.includes(c.code.toLowerCase()))||state.courses[0]; const out=[];
    lines.forEach(line=>{ const lower=line.toLowerCase(); if(!/due|exam|quiz|assignment|project|problem set|report/.test(lower))return; const dm=line.match(/(20\d{2}-\d{2}-\d{2})(?:\s+(\d{1,2}:\d{2}))?/); if(!dm)return; const effort=line.match(/estimated\s+(\d+(?:\.\d+)?)\s*(h|hours?|m|minutes?)/i); let mins=60;if(effort)mins=/^h/.test(effort[2].toLowerCase())?Number(effort[1])*60:Number(effort[1]); let title=line.split(/\bdue\b/i)[0].replace(/^[-•]\s*/,'').trim(); let type=/exam|midterm|final/i.test(title)?'Exam':/quiz/i.test(title)?'Quiz':/project/i.test(title)?'Project':'Assignment';out.push({courseId:c.id,title,type,due:new Date(`${dm[1]}T${dm[2]||'23:59'}:00`).toISOString(),effort:Math.round(mins)}); }); return out;
  }
  function showSyllabusPreview(items){ qs('#syllabusPreview').innerHTML=`<div class="detected-list">${items.map(i=>`<div class="detected-item"><strong>${esc(i.title)}</strong><br><span style="color:var(--muted)">${esc(courseName(i.courseId))} · ${i.type} · ${fmtDate(i.due,{month:'short',day:'numeric'})} ${fmtTime(i.due)} · ${formatMinutes(i.effort)}</span></div>`).join('')}</div><p style="margin:10px 2px 0;color:var(--muted);font-size:10px">Detected locally. Production would preserve page/source provenance and confidence for every item.</p>`; qs('#syllabusPreview').classList.remove('hidden'); qs('#confirmSyllabus').classList.toggle('hidden',!items.length); }
  async function confirmSyllabus(){
    if (!syllabusParsed.length) return;
    let imported=0;
    try {
      for (const p of syllabusParsed) {
        const draft={id:uid('a'),courseId:p.courseId,title:p.title,type:p.type,due:p.due,effort:p.effort,remaining:p.effort,status:'not_started',weight:5,topics:[],sourceType:'syllabus_local'};
        if (academicCloudReady && cloudUser && cloudSemester) {
          const row=await window.studentHubCloud.createAssessment(cloudUser,cloudSemester,draft,draft.courseId,draft.id);
          state.assessments.push(rowToAssessment(row));
        } else {
          state.assessments.push(draft);
        }
        imported++;
      }
      save(); closeModals(); render(); updateCloudStatusCard();
      toast(`Imported ${imported} assessment${imported!==1?'s':''}${academicCloudReady?' to Appwrite':''}.`);
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
      topics: Array.isArray(row.topics) ? row.topics : []
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
      topics: Array.isArray(row.topics) ? row.topics : [],
      sourceType: row.sourceType || 'manual'
    };
  }

  function rowToTask(row) {
    return { id:row.$id, cloudId:row.$id, legacyId:row.legacyId||'', courseId:row.courseId, assessmentId:row.assessmentId, title:row.title||'Untitled task', estimate:Number(row.estimate||0), remaining:Number(row.remaining??row.estimate??0), status:row.status||'not_started', position:Number(row.position||0), sourceType:row.sourceType||'planner' };
  }

  function rowToWorkBlock(row) {
    return { id:row.$id, cloudId:row.$id, legacyId:row.legacyId||'', courseId:row.courseId, assessmentId:row.assessmentId, taskId:row.taskId||'', title:row.title||'Work block', type:'work', start:row.start, end:row.end, status:row.status||'planned', sourceType:row.sourceType||'planner' };
  }

  function applyCloudPlannerData(payload) {
    const tasks=Array.isArray(payload?.tasks)?payload.tasks:[];
    const blocks=Array.isArray(payload?.workBlocks)?payload.workBlocks:[];
    state.tasks=tasks.map(rowToTask);
    const localNonWork=state.events.filter(e=>e.type!=='work');
    state.events=[...localNonWork,...blocks.filter(row=>row.status!=='done').map(rowToWorkBlock)];
    save(); render();
  }

  function updateCloudStatusCard(){
    const title=qs('#cloudStatusTitle'), text=qs('#cloudStatusText'); if(!title||!text||!cloudUser)return;
    if(academicCloudReady&&plannerCloudReady){ title.textContent='Academic + planner cloud synced'; text.textContent=`${state.semester.name}: ${state.courses.length} courses, ${state.assessments.length} assessments, ${(state.tasks||[]).filter(t=>t.status!=='done').length} open tasks and ${state.events.filter(e=>e.type==='work').length} planned work blocks.`; }
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
    cloudUser=user||null; cloudSemester=semester||null; academicCloudReady=false; plannerCloudReady=false;
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

    render(); updateCloudStatusCard();
    return {academicCloudReady:true,plannerCloudReady,courses:state.courses.length,assessments:state.assessments.length,tasks:(state.tasks||[]).length,workBlocks:state.events.filter(e=>e.type==='work').length};
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

    const topics = qs('#courseTopics').value
      .split(',')
      .map(value=>value.trim())
      .filter(Boolean);

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
