(() => {
  const DAY = 86400000;
  const BASE_STORAGE_KEY = 'studentHubDemo.v1';
  let activeStorageKey = BASE_STORAGE_KEY;
  const qs = (s, el=document) => el.querySelector(s);
  const qsa = (s, el=document) => [...el.querySelectorAll(s)];
  const uid = (prefix='id') => `${prefix}_${Math.random().toString(36).slice(2,9)}`;
  const startOfDay = d => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
  const addDays = (d, n) => { const x=startOfDay(d); x.setDate(x.getDate()+n); return x; };
  const isoDate = d => { const x=new Date(d); const y=x.getFullYear(); const m=String(x.getMonth()+1).padStart(2,'0'); const day=String(x.getDate()).padStart(2,'0'); return `${y}-${m}-${day}`; };
  const clamp = (n,min,max)=>Math.max(min,Math.min(max,n));
  const esc = str => String(str ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));
  const UI_LOCALE = 'en-GB';
  const fmtDate = (d, opts={weekday:'short', month:'short', day:'numeric'}) => new Intl.DateTimeFormat(UI_LOCALE, opts).format(new Date(d));
  const fmtTime = d => new Intl.DateTimeFormat(UI_LOCALE,{hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(d));
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

  function emptyUserState(semesterName='My Semester'){
    const base=seedState();
    return {
      ...base,
      route:'today',
      semester:{...base.semester,name:semesterName||'My Semester'},
      courses:[],assessments:[],events:[],resources:[],inbox:[],tasks:[],studySessions:[],review:[],
      timer:{seconds:25*60,initialSeconds:25*60,running:false,context:{courseId:'',assessmentId:'',topic:'Focused study'}},
      onboarding:{dismissed:false,step:1},
      availability:{weekdayStart:'16:00',weekdayEnd:'21:00',weekendStart:'10:00',weekendEnd:'18:00',maxDailyMinutes:180,weekends:true}
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
  if (!state.availability || typeof state.availability!=='object') state.availability={weekdayStart:'16:00',weekdayEnd:'21:00',weekendStart:'10:00',weekendEnd:'18:00',maxDailyMinutes:180,weekends:true};
  if (!state.onboarding || typeof state.onboarding!=='object') state.onboarding={dismissed:false,step:1};
  let activeCourseId = null;
  let activeCourseTab = 'overview';
  let quickParsed = null;
  let syllabusParsed = [];
  let aiSyllabusResult = null;
  let timerHandle = null;
  let focusMode = false;
  let cloudUser = null;
  let cloudSemester = null;
  let academicCloudReady = false;
  let plannerCloudReady = false;
  let knowledgeCloudReady = false;
  let plannerWeekOffset = 0;
  let plannerMonthOffset = 0;
  let plannerExpandedGroups = new Set();
  let plannerPreview = null;
  let pendingStudyReflection = null;
  let libraryCourseFilter = 'all';
  let libraryTopicFilter = '';
  let resourceContextCourseId = '';
  let onboardingPendingCourse = false;

  function ensurePlannerPrefs(){
    const defaults={view:'week',lens:'plan',courseId:'all',assessmentType:'all',density:'compact',layers:{fixed:true,work:true,deadlines:true}};
    if(!state.plannerPrefs || typeof state.plannerPrefs!=='object') state.plannerPrefs={...defaults,layers:{...defaults.layers}};
    state.plannerPrefs.view=['week','month','agenda'].includes(state.plannerPrefs.view)?state.plannerPrefs.view:'week';
    state.plannerPrefs.lens=['plan','classes','deadlines','courses','impact'].includes(state.plannerPrefs.lens)?state.plannerPrefs.lens:'plan';
    state.plannerPrefs.courseId=state.plannerPrefs.courseId||'all';
    state.plannerPrefs.assessmentType=['all','assignment','quiz','project','exam'].includes(state.plannerPrefs.assessmentType)?state.plannerPrefs.assessmentType:'all';
    state.plannerPrefs.density=['compact','comfortable'].includes(state.plannerPrefs.density)?state.plannerPrefs.density:'compact';
    state.plannerPrefs.layers={...defaults.layers,...(state.plannerPrefs.layers||{})};
    return state.plannerPrefs;
  }
  ensurePlannerPrefs();

  function ensureAssistantPrefs(){
    const defaults={deadlineRisk:true,slippedPlan:true,reviewDue:true,inbox:true,dataHealth:true,browser:false};
    if(!state.assistantPrefs||typeof state.assistantPrefs!=='object') state.assistantPrefs={...defaults};
    state.assistantPrefs={...defaults,...state.assistantPrefs};
    if(!state.assistantState||typeof state.assistantState!=='object') state.assistantState={snoozed:{},notified:{}};
    state.assistantState.snoozed=state.assistantState.snoozed&&typeof state.assistantState.snoozed==='object'?state.assistantState.snoozed:{};
    state.assistantState.notified=state.assistantState.notified&&typeof state.assistantState.notified==='object'?state.assistantState.notified:{};
    return state.assistantPrefs;
  }
  ensureAssistantPrefs();
  canonicalizeStateData();

  function save(){
    try { localStorage.setItem(activeStorageKey, JSON.stringify(state)); }
    catch(error){ console.error('Local save failed:',error); setTimeout(()=>toast('Could not save local changes. Export a backup from Settings if this continues.'),0); }
    updateBadges();
  }
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

  // Canonical planning snapshot used by Today, Planner and the Action Center.
  // Keeping these calculations in one place prevents different surfaces from
  // reporting different counts for the same semester state.
  function activeAssessmentIdSet(){
    return new Set((state.assessments||[]).filter(a=>a.status!=='done').map(a=>a.id).filter(Boolean));
  }
  function canonicalSlippedWork(now=new Date()){
    const activeIds=activeAssessmentIdSet();
    return (state.events||[])
      .filter(e=>e.type==='work'&&e.status!=='done'&&hasValidDate(e.end)&&new Date(e.end)<now)
      .filter(e=>!e.assessmentId||activeIds.has(e.assessmentId))
      .sort((a,b)=>new Date(b.end)-new Date(a.end));
  }
  function semesterPlanningSnapshot(now=new Date()){
    const currentStart=weekStart(now), currentEnd=addDays(currentStart,7);
    const capacity=Math.max(60,Number(state.semester.availableMinutesPerWeek||840));
    const dueAssessments=dedupeAssessmentList((state.assessments||[]).filter(a=>a.status!=='done'&&hasValidDate(a.due)&&new Date(a.due)>=currentStart&&new Date(a.due)<currentEnd));
    const dueWorkload=dueAssessments.reduce((sum,a)=>sum+Math.max(0,Number(a.remaining??a.effort??0)),0);
    const plannedStudy=(state.events||[]).filter(e=>e.status!=='done'&&['work','study'].includes(e.type)&&hasValidDate(e.start)&&new Date(e.start)>=currentStart&&new Date(e.start)<currentEnd).reduce((sum,e)=>sum+eventMinutes(e),0);
    const slippedBlocks=canonicalSlippedWork(now);
    const slippedMinutes=slippedBlocks.reduce((sum,e)=>sum+eventMinutes(e),0);
    const needsPlanning=planningCandidates({limit:50});
    const atRisk=dedupeAssessmentList((state.assessments||[]).filter(a=>a.status!=='done'&&deadlineRiskProfile(a).rank>=2));
    return {
      now,currentStart,currentEnd,capacity,dueAssessments,dueWorkload,plannedStudy,
      overCapacity:Math.max(0,plannedStudy-capacity),
      capacityLeft:Math.max(0,capacity-plannedStudy),
      slippedBlocks,slippedMinutes,needsPlanning,atRisk
    };
  }

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
  function deadlineRiskProfile(a){
    const now=new Date(), due=new Date(a?.due);
    const remaining=Math.max(0,Number(a?.remaining??a?.effort??0));
    const futureBlocks=(state.events||[]).filter(e=>e.type==='work'&&e.status!=='done'&&e.assessmentId===a?.id&&new Date(e.end)>now&&new Date(e.start)<due);
    const futurePlanned=futureBlocks.reduce((sum,e)=>sum+eventMinutes(e),0);
    const slipped=(state.events||[]).filter(e=>e.type==='work'&&e.status!=='done'&&e.assessmentId===a?.id&&new Date(e.end)<=now).reduce((sum,e)=>sum+eventMinutes(e),0);
    const unplanned=Math.max(0,remaining-futurePlanned);
    const hours=(due-now)/3600000;
    const days=Math.max(.25,hours/24);
    const maxDaily=Math.max(30,Number(state.availability?.maxDailyMinutes||180));
    const dailyNeed=unplanned/Math.max(1,Math.ceil(days));
    const coverage=remaining?Math.min(1,futurePlanned/remaining):1;
    const reasons=[]; let score=0;
    if(hours<0){score=100;reasons.push('Deadline has passed');}
    else {
      if(hours<=24){score+=44;reasons.push('Due within 24 hours');}
      else if(hours<=48){score+=32;reasons.push('Due within 2 days');}
      else if(hours<=96){score+=18;reasons.push('Due within 4 days');}
      if(unplanned>5){
        if(coverage<.35){score+=30;reasons.push(`${formatMinutes(unplanned)} still has no calendar coverage`);}
        else if(coverage<.75){score+=18;reasons.push(`Only ${Math.round(coverage*100)}% of remaining work is planned`);}
      }
      if(dailyNeed>maxDaily){score+=24;reasons.push(`Needs about ${formatMinutes(dailyNeed)} per day, above your daily limit`);}
      if(slipped>0){score+=18;reasons.push(`${formatMinutes(slipped)} of planned work has already slipped`);}
      if(Number(a?.weight||0)>=25){score+=8;reasons.push(`${Number(a.weight)}% course weight`);}
    }
    let level='Covered',tone='success',rank=0;
    if(score>=74){level='Critical',tone='danger',rank=4;}
    else if(score>=50){level='High risk',tone='danger',rank=3;}
    else if(score>=28){level='Watch',tone='warning',rank=2;}
    else if(unplanned>5){level='Needs plan',tone='neutral',rank=1;}
    const primary=reasons[0]||(unplanned<=5?'Remaining work is covered by future study blocks':`${formatMinutes(unplanned)} is not scheduled yet`);
    return {score,rank,level,tone,reasons,primary,remaining,futurePlanned,unplanned,slipped,coverage,hours,dailyNeed};
  }

  function assistantSnoozed(key){ return state.assistantState?.snoozed?.[key]===isoDate(new Date()); }
  function assistantItemByKey(key){ return studentAssistantItems({includeSnoozed:true}).find(item=>item.key===key)||null; }
  function studentAssistantItems({includeSnoozed=false}={}){
    const prefs=ensureAssistantPrefs(), items=[], now=new Date();
    const severityRank={danger:4,warning:3,neutral:2,info:1,success:0};
    const snapshot=semesterPlanningSnapshot(now);
    if(prefs.slippedPlan&&snapshot.slippedBlocks.length){
      items.push({key:'slipped-plan',kind:'plan',tone:'warning',priority:94,title:`${snapshot.slippedBlocks.length} study block${snapshot.slippedBlocks.length===1?' has':'s have'} slipped`,body:`${formatMinutes(snapshot.slippedMinutes)} was scheduled in the past and is still unfinished. Rebalance only the work that still matters.`,action:'repair',actionLabel:'Review slipped work'});
    }
    if(prefs.deadlineRisk){
      const slippedAssessmentIds=new Set(snapshot.slippedBlocks.map(e=>e.assessmentId).filter(Boolean));
      const deadlines=(state.assessments||[]).filter(a=>a.status!=='done').map(a=>({a,risk:deadlineRiskProfile(a)})).filter(x=>x.risk.rank>=2||new Date(x.a.due)<now).sort((x,y)=>y.risk.rank-x.risk.rank||new Date(x.a.due)-new Date(y.a.due)).slice(0,6);
      deadlines.forEach(({a,risk})=>{
        const c=course(a.courseId), overdue=risk.hours<0;
        // If the only meaningful warning is already represented by the global
        // slipped-plan item, avoid repeating the same problem twice.
        const nonSlipReasons=(risk.reasons||[]).filter(reason=>!/slipped/i.test(reason));
        if(slippedAssessmentIds.has(a.id)&&risk.rank<=2&&!overdue&&nonSlipReasons.length===0)return;
        items.push({key:`risk:${a.id}`,kind:'deadline',tone:risk.tone,priority:80+risk.rank*4-Math.min(10,Math.max(0,risk.hours/24)),title:`${a.title}: ${risk.level}`,body:`${(nonSlipReasons.length?nonSlipReasons:risk.reasons).slice(0,2).join(' · ')||risk.primary}. ${formatMinutes(risk.remaining)} remains${risk.unplanned>5?` and ${formatMinutes(risk.unplanned)} is unplanned`:''}.`,meta:`${c?.name||'Course'} · ${humanDue(a.due)}`,action:overdue?'focus':'preview',targetId:a.id,actionLabel:overdue?'Start catch-up':'Review plan'});
      });
    }
    if(prefs.reviewDue){
      const dueReview=(state.review||[]).filter(r=>!r.due||new Date(`${r.due}T23:59:59`)<=addDays(startOfDay(now),1));
      if(dueReview.length){
        const weakest=[...dueReview].sort((a,b)=>Number(a.mastery||100)-Number(b.mastery||100))[0];
        items.push({key:'review-due',kind:'review',tone:'info',priority:58,title:`${dueReview.length} review item${dueReview.length===1?' is':'s are'} due`,body:`${weakest?.topic||'A topic'} is the weakest due review at ${Math.round(Number(weakest?.mastery||0))}% mastery. A short retrieval session can keep it from being forgotten.`,action:'review',targetId:weakest?.id||'',actionLabel:'Study this topic'});
      }
    }
    if(prefs.inbox){
      const open=(state.inbox||[]).filter(i=>!i.processed);
      if(open.length) items.push({key:'inbox-open',kind:'inbox',tone:'neutral',priority:44,title:`${open.length} Inbox capture${open.length===1?' needs':'s need'} processing`,body:'Turn captured notes into deadlines, resources, or archive them so the semester model stays clean.',action:'inbox',actionLabel:'Process Inbox'});
    }
    if(prefs.dataHealth){
      const health=dataHealthReport();
      if(!health.clean) items.push({key:'data-health',kind:'reliability',tone:health.repairable?'warning':'neutral',priority:36,title:`${health.total} data consistency issue${health.total===1?'':'s'}`,body:health.repairable?`${health.repairable} can be repaired safely. Student Hub will not delete uncertain cloud-linked records.`:'These need manual review before relying on the affected data.',action:'settings',actionLabel:'Open reliability'});
    }
    if(cloudUser&&!(academicCloudReady&&plannerCloudReady&&knowledgeCloudReady)) items.push({key:'sync-health',kind:'sync',tone:'warning',priority:32,title:'Cloud sync needs attention',body:'One or more data groups are still local. Check diagnostics before relying on another device.',action:'settings',actionLabel:'Check diagnostics'});
    items.sort((a,b)=>(b.priority||severityRank[b.tone]||0)-(a.priority||severityRank[a.tone]||0));
    return includeSnoozed?items:items.filter(item=>!assistantSnoozed(item.key));
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
    closeAssistantPanel();
    if(route!=='study'&&focusMode){focusMode=false;document.body.classList.remove('focus-mode');if(document.fullscreenElement&&document.exitFullscreen)document.exitFullscreen().catch(()=>{});}
    state.route=route; activeCourseId=null; save(); render();
  }

  function render(){
    document.body.classList.toggle('dark', state.theme==='dark');
    document.body.classList.toggle('focus-mode', focusMode&&state.route==='study');
    qs('#themeToggle').textContent = state.theme==='dark' ? '☀' : '☾';
    qsa('[data-route]').forEach(b=>b.classList.toggle('active', b.dataset.route===state.route));
    qsa('.mobile-nav [data-route]').forEach(b=>b.classList.toggle('active', b.dataset.route===state.route));
    const titleMap={today:['Semester workspace','Today'],planner:['Time layer','Planner'],courses:['Academic context','Courses'],study:['Learning layer','Study'],library:['Knowledge layer','Library'],inbox:['Capture layer','Inbox'],settings:['Personalization','Settings']};
    const meta=titleMap[state.route]||titleMap.today;
    qs('#pageEyebrow').textContent=meta[0]; qs('#pageTitle').textContent=meta[1];
    const page=qs('#page');
    const renderers={today:renderToday,planner:renderPlanner,courses:renderCourses,study:renderStudy,library:renderLibrary,inbox:renderInbox,settings:renderSettings};
    page.innerHTML=(renderers[state.route]||renderToday)();
    bindPageEvents();
    updateBadges();
    updateCloudStatusCard();
    setTimeout(maybeSendBrowserAssistanceNotification,0);
  }

  function renderToday(){
    const now=new Date();
    const best=nextAssessment();
    const dayStart=startOfDay(now), dayEnd=addDays(dayStart,1);
    const derivedClasses=classScheduleEntries(dayStart,dayEnd).map(x=>({...x,type:'fixed'}));
    const scheduled=state.events.filter(e=>e.status!=='done'&&e.type!=='fixed'&&new Date(e.start)>=dayStart&&new Date(e.start)<dayEnd);
    const todaysEvents=[...derivedClasses,...scheduled].sort((a,b)=>new Date(a.start)-new Date(b.start));
    const nextToday=todaysEvents.find(e=>new Date(e.end||e.start)>now)||null;
    const nextStartsSoon=nextToday && new Date(nextToday.start).getTime()-now.getTime()<=4*60*60*1000;
    const actionEvent=nextStartsSoon?nextToday:null;
    const actionAssessment=actionEvent?.assessmentId?assessment(actionEvent.assessmentId):best;
    const actionCourse=course(actionEvent?.courseId||actionAssessment?.courseId);
    const actionIsClass=actionEvent?.type==='fixed';
    const actionTitle=actionEvent?(actionIsClass?`${actionEvent.code||actionCourse?.code||'Class'} · ${actionCourse?.name||actionEvent.title||'Course'}`:actionEvent.title):(actionAssessment?.title||'');
    const actionMeta=actionEvent?(actionIsClass?`${fmtTime(actionEvent.start)}–${fmtTime(actionEvent.end)}${actionEvent.room?` · ${actionEvent.room}`:''}`:`${fmtTime(actionEvent.start)}–${fmtTime(actionEvent.end)} · ${eventMinutes(actionEvent)} min planned`):(actionAssessment?`${formatMinutes(Math.min(preferredSessionMinutes(actionAssessment),Math.max(15,actionAssessment.remaining||45)))} focus · ${humanDue(actionAssessment.due)}`:'');
    const dueSoon=dedupeAssessmentList(state.assessments.filter(a=>a.status!=='done'&&new Date(a.due)>=startOfDay(now))).sort((a,b)=>new Date(a.due)-new Date(b.due)).slice(0,4);
    const snapshot=semesterPlanningSnapshot(now);
    const needsPlan=snapshot.needsPlanning.slice(0,4);
    const missedBlocks=snapshot.slippedBlocks;
    const required=snapshot.dueWorkload, capacity=snapshot.capacity, over=snapshot.overCapacity;
    const repair=plannerRepairPreview();
    const attention=missedBlocks.length||repair.remove.length||over>0||needsPlan.some(a=>planningState(a).days<=3);
    const planTitle=missedBlocks.length?`${missedBlocks.length} study block${missedBlocks.length===1?'':'s'} slipped`:(over>0?`${formatMinutes(over)} above this week's capacity`:(needsPlan.length?`${needsPlan.length} deadline${needsPlan.length===1?' needs':'s need'} calendar coverage`:'Your plan is on track'));
    const planCopy=missedBlocks.length?'Review the missed work and rebalance only what still matters.':over>0?'Reduce, move, or defer study work before the week becomes unrealistic.':needsPlan.length?'Smart Plan can place the highest-priority unscheduled work without moving fixed classes.':'Nothing urgent needs replanning right now.';
    const briefItems=studentAssistantItems().filter(item=>!['sync','data-health'].includes(item.kind)).slice(0,3);

    if(!state.courses.length){
      return `<section class="today-empty-start card"><span class="eyebrow">Start here</span><h2>Turn your semester into a plan.</h2><p>Add your first course, set realistic study availability, then import a syllabus. Student Hub will connect deadlines, topics, materials and study time.</p><div class="button-row"><button class="btn primary" id="startOnboarding">Set up semester</button><button class="btn secondary" id="openAddCourse">Add course manually</button></div></section>`;
    }

    return `
      <section class="today-command-grid">
        <article class="card today-next-card">
          <div class="today-card-head"><span class="eyebrow">${actionEvent?'Next scheduled':'Next action'}</span>${actionEvent?`<span class="pill">${fmtTime(actionEvent.start)}</span>`:''}</div>
          ${actionTitle?`<div class="today-next-main"><span class="course-dot large" style="--course-color:${actionCourse?.color||'var(--accent)'}"></span><div><h2>${esc(actionTitle)}</h2><p>${esc(actionCourse?.name||'Course')} · ${esc(actionMeta)}</p></div></div><div class="today-reason">${actionEvent?(actionIsClass?'Your recurring timetable puts this class next.':'This block is already reserved in your plan.'):(actionAssessment?`Suggested because ${humanDue(actionAssessment.due)==='overdue'?'it is overdue':`it is due ${humanDue(actionAssessment.due)}`} and ${formatMinutes(actionAssessment.remaining)} remains.`:'')}</div><div class="button-row">${actionIsClass?`<button class="btn primary" data-open-course-id="${actionCourse?.id||''}">Open course</button>`:actionAssessment?`<button class="btn primary" data-start-focus="${actionAssessment.id}">${actionEvent?'Start focus':`Start ${Math.min(preferredSessionMinutes(actionAssessment),Math.max(15,actionAssessment.remaining||45))} min`}</button><button class="btn secondary" data-plan="${actionAssessment.id}">Review plan</button>`:`<button class="btn secondary" data-route-jump="planner">Open planner</button>`}</div>`:`<div class="empty-state compact"><div class="empty-icon">✓</div><h3>No urgent academic work</h3><p>Your upcoming deadlines are currently covered.</p></div>`}
        </article>

        <article class="card today-plan-card ${attention?'attention':'calm'}">
          <div class="today-card-head"><span class="eyebrow">Plan status</span><span class="plan-state-dot">${attention?'!':'✓'}</span></div>
          <h3>${esc(planTitle)}</h3><p>${esc(planCopy)}</p>
          <div class="today-plan-metrics"><span><strong>${formatMinutes(required)}</strong><small>due this week</small></span><span><strong>${formatMinutes(snapshot.plannedStudy)}</strong><small>planned this week</small></span><span><strong>${formatMinutes(capacity)}</strong><small>weekly capacity</small></span></div>
          <div class="button-row">${missedBlocks.length||repair.remove.length?`<button class="btn primary" id="reviewPlanRepair">${missedBlocks.length?'Review slipped work':'Repair plan'}</button>`:`<button class="btn ${attention?'primary':'secondary'}" id="smartPlanToday">${attention?'Preview changes':'Check smart plan'}</button>`}<button class="btn secondary" data-route-jump="planner">Open planner</button></div>
        </article>
      </section>

      ${briefItems.length?`<section class="card today-assist-strip"><div class="assist-strip-title"><span class="eyebrow">Proactive brief</span><strong>${briefItems.length} thing${briefItems.length===1?'':'s'} worth attention</strong></div><div class="assist-strip-items">${briefItems.map(item=>`<span class="assist-strip-chip ${item.tone}"><b>${esc(item.title)}</b><small>${esc(item.meta||item.body)}</small></span>`).join('')}</div><button class="btn ghost compact-btn" id="openAssistantToday">Review all</button></section>`:''}

      <section class="today-two-column">
        <article class="card today-agenda-card">
          <div class="section-head compact"><div><h2>Today</h2><p>Classes and planned work, in time order.</p></div><button class="btn ghost compact-btn" id="openQuickAddToday">+ Capture</button></div>
          <div class="timeline calm-timeline">${todaysEvents.length?todaysEvents.map(todayTimelineRow).join(''):`<div class="empty-state compact"><div class="empty-icon">○</div><h3>Open day</h3><p>No classes or study blocks are scheduled today.</p></div>`}</div>
        </article>
        <article class="card today-upcoming-card">
          <div class="section-head compact"><div><h2>Coming up</h2><p>Only the deadlines that deserve attention next.</p></div><button class="btn ghost compact-btn" data-route-jump="planner">See all</button></div>
          <div class="today-deadline-list">${dueSoon.length?dueSoon.map(a=>{const c=course(a.courseId),ps=planningState(a),risk=deadlineRiskProfile(a);return `<button class="today-deadline-row" data-preview-plan="${a.id}"><span class="course-dot" style="--course-color:${c?.color||'var(--accent)'}"></span><div><strong>${esc(a.title)}</strong><small>${esc(c?.name||'Course')} · ${formatMinutes(a.remaining)} left</small>${risk.rank>=2?`<em class="today-risk-note ${risk.tone}">${esc(risk.level)} · ${esc(risk.primary)}</em>`:''}</div><span class="today-due ${ps.tone}">${humanDue(a.due)}</span></button>`}).join(''):`<div class="empty-state compact"><p>No upcoming deadlines.</p></div>`}</div>
        </article>
      </section>
    `;
  }

  function todayTimelineRow(e){
    const c=course(e.courseId), isClass=e.type==='fixed';
    return `<div class="timeline-item today-row"><span class="timeline-time">${fmtTime(e.start)}</span><span class="timeline-line" style="--item-color:${c?.color||'var(--accent)'}"></span><div class="timeline-copy"><strong>${esc(isClass?(e.code||e.title):e.title)}</strong><small>${isClass?`${esc(c?.name||e.title)}${e.room?` · ${esc(e.room)}`:''}`:`${esc(c?.name||'Study')} · planned study`}</small></div><span class="timeline-status">${isClass?'Class':`${eventMinutes(e)}m`}</span></div>`;
  }

  function timelineRow(e){ return todayTimelineRow(e); }
  function reviewRow(r){ const c=course(r.courseId); return `<div class="review-item"><div><strong><span class="course-dot" style="--course-color:${c.color}"></span> ${esc(r.topic)}</strong><small>${esc(c.name)} · ${r.due===isoDate(new Date())?'Due today':'Due '+fmtDate(r.due,{month:'short',day:'numeric'})}</small></div><div class="mastery">${r.mastery}%</div></div>`; }

  function plannerMonthStart(){
    const now=new Date();
    return new Date(now.getFullYear(),now.getMonth()+plannerMonthOffset,1);
  }
  function plannerMonthGridStart(){ return weekStart(plannerMonthStart()); }
  function plannerRange(){
    const prefs=ensurePlannerPrefs();
    if(prefs.view==='month'){
      const start=plannerMonthGridStart();
      return {start,end:addDays(start,42),weeks:6,anchor:plannerMonthStart()};
    }
    const start=plannerWeekStart();
    return {start,end:addDays(start,7),weeks:1,anchor:start};
  }
  function assessmentTypeKey(a){
    const t=String(a?.type||'').toLowerCase();
    if(/final|midterm|exam/.test(t)) return 'exam';
    if(/quiz/.test(t)) return 'quiz';
    if(/project/.test(t)) return 'project';
    return 'assignment';
  }
  function plannerAssessmentMatches(a){
    const prefs=ensurePlannerPrefs();
    if(!a) return false;
    if(prefs.courseId!=='all' && a.courseId!==prefs.courseId) return false;
    if(prefs.assessmentType!=='all' && assessmentTypeKey(a)!==prefs.assessmentType) return false;
    return true;
  }
  function plannerEventMatches(e){
    const prefs=ensurePlannerPrefs();
    if(!e || e.status==='done') return false;
    if(prefs.courseId!=='all' && e.courseId!==prefs.courseId) return false;
    if(prefs.lens==='classes') return e.type==='fixed';
    if(e.assessmentId && !plannerAssessmentMatches(assessment(e.assessmentId))) return false;
    if(e.type==='fixed' && !prefs.layers.fixed) return false;
    if(['work','study'].includes(e.type) && !prefs.layers.work) return false;
    if(prefs.lens==='deadlines') return false;
    return true;
  }
  function plannerDeadlineMatches(a){
    const prefs=ensurePlannerPrefs();
    if(prefs.lens==='classes') return false;
    return prefs.layers.deadlines && a?.status!=='done' && plannerAssessmentMatches(a);
  }
  function rangeMinutes(start,end){
    const prefs=ensurePlannerPrefs();
    return state.events.filter(e=>{
      if(e.status==='done'||!['work','study'].includes(e.type)||new Date(e.start)<start||new Date(e.start)>=end) return false;
      if(prefs.courseId!=='all'&&e.courseId!==prefs.courseId) return false;
      if(e.assessmentId&&!plannerAssessmentMatches(assessment(e.assessmentId))) return false;
      return true;
    }).reduce((sum,e)=>sum+eventMinutes(e),0);
  }
  function rangeDueMinutes(start,end){
    return state.assessments.filter(a=>plannerDeadlineMatches(a)&&new Date(a.due)>=start&&new Date(a.due)<end).reduce((sum,a)=>sum+Math.max(0,Number(a.remaining??a.effort??0)),0);
  }
  function rangeAtRisk(start,end){
    return state.assessments.filter(a=>plannerDeadlineMatches(a)&&new Date(a.due)>=start&&new Date(a.due)<end&&deadlineRiskProfile(a).rank>=2);
  }
  function topicWeakness(a){
    const topics=new Set((a?.topics||[]).map(x=>String(x).toLowerCase()));
    const matches=(state.review||[]).filter(r=>r.courseId===a?.courseId && (!topics.size||topics.has(String(r.topic||'').toLowerCase())));
    if(!matches.length) return 35;
    return clamp(Math.round(matches.reduce((s,r)=>s+(100-Number(r.mastery||0)),0)/matches.length),0,100);
  }
  function academicPriorityScore(a){
    if(!a) return 0;
    const days=Math.max(.5,(new Date(a.due)-new Date())/DAY);
    const remaining=Math.max(10,Number(a.remaining??a.effort??60));
    const c=course(a.courseId);
    const urgency=clamp(14/days,.2,5);
    const effort=clamp(remaining/120,.4,4);
    const weight=clamp((Number(a.weight||5))/10,.35,4);
    const weakness=1+topicWeakness(a)/100;
    const gradeGap=1+clamp(((Number(c?.target||0)-Number(c?.grade||0))/15),0,1);
    const raw=urgency*effort*weight*weakness*gradeGap;
    return clamp(Math.round(16*Math.log2(1+raw)),5,100);
  }
  function priorityDescriptor(a){
    const ps=planningState(a), score=academicPriorityScore(a), remaining=Math.max(0,Number(a?.remaining??a?.effort??0)), weight=Number(a?.weight||0);
    const level=score>=70?'High':score>=42?'Medium':'Normal';
    const tone=score>=70?'danger':score>=42?'warning':'neutral';
    const reasons=[];
    if(ps.days<=2) reasons.push('due very soon'); else if(ps.days<=7) reasons.push('due this week');
    if(weight>=20) reasons.push(`${weight}% of course`);
    if(remaining>=180) reasons.push(`${formatMinutes(remaining)} remaining`);
    if(ps.unscheduled>5) reasons.push(`${formatMinutes(ps.unscheduled)} unplanned`);
    if(!reasons.length) reasons.push('covered by current plan');
    return {level,tone,reasons:reasons.slice(0,3)};
  }

  function preferredSessionMinutes(a){
    const topics=new Set((a?.topics||[]).map(x=>String(x).toLowerCase()));
    const samples=(state.studySessions||[])
      .filter(s=>s.courseId===a?.courseId && (s.assessmentId===a?.id || !topics.size || topics.has(String(s.topic||'').toLowerCase())))
      .map(s=>Number(s.minutes||0)).filter(x=>x>=10&&x<=120).sort((x,y)=>x-y);
    if(!samples.length) return 45;
    const mid=Math.floor(samples.length/2);
    const median=samples.length%2?samples[mid]:(samples[mid-1]+samples[mid])/2;
    return clamp(Math.round(median/5)*5,25,60);
  }
  function plannerPeriodLabel(){
    const prefs=ensurePlannerPrefs();
    if(prefs.view==='month') return fmtDate(plannerMonthStart(),{month:'long',year:'numeric'});
    const start=plannerWeekStart(), end=addDays(start,6);
    const left=fmtDate(start,{month:'short',day:'numeric'}), right=fmtDate(end,{month:'short',day:'numeric'});
    return `${left} – ${right}`;
  }

  function parseCourseSchedule(schedule=''){
    const raw=String(schedule||'').trim();
    if(!raw) return null;
    const dayMap={mon:1,monday:1,tue:2,tues:2,tuesday:2,wed:3,wednesday:3,thu:4,thur:4,thurs:4,thursday:4,fri:5,friday:5,sat:6,saturday:6,sun:0,sunday:0};
    const days=[];
    const lower=raw.toLowerCase();
    Object.entries(dayMap).forEach(([name,num])=>{
      const re=new RegExp(`(^|[^a-z])${name}(?=$|[^a-z])`,'i');
      if(re.test(lower) && !days.includes(num)) days.push(num);
    });
    const timeMatch=raw.match(/(\d{1,2}:\d{2})(?:\s*[-–—]\s*(\d{1,2}:\d{2}))?/);
    if(!days.length || !timeMatch) return null;
    return {days,start:timeMatch[1],end:timeMatch[2]||'',raw};
  }
  function classScheduleEntries(start,end){
    const prefs=ensurePlannerPrefs();
    const entries=[];
    for(const c of state.courses){
      if(prefs.courseId!=='all'&&c.id!==prefs.courseId) continue;
      const parsed=parseCourseSchedule(c.schedule);
      if(!parsed) continue;
      for(let day=startOfDay(start);day<end;day=addDays(day,1)){
        if(!parsed.days.includes(day.getDay())) continue;
        const startAt=dateAt(day,parsed.start);
        const endAt=parsed.end?dateAt(day,parsed.end):null;
        entries.push({id:`class-schedule-${c.id}-${isoDate(day)}`,courseId:c.id,title:c.name,code:c.code||'',room:c.room||'',teacher:c.teacher||'',start:startAt,end:endAt,sourceSchedule:parsed.raw});
      }
    }
    return entries.sort((a,b)=>a.start-b.start);
  }
  function renderClassScheduleStats(start,end){
    const entries=classScheduleEntries(start,end);
    const dayKeys=new Set(entries.map(e=>isoDate(e.start)));
    const courseKeys=new Set(entries.map(e=>e.courseId));
    const earliest=entries.length?entries.reduce((best,e)=>e.start<best?e.start:best,entries[0].start):null;
    const busiest=[...dayKeys].map(key=>[key,entries.filter(e=>isoDate(e.start)===key).length]).sort((a,b)=>b[1]-a[1])[0];
    return `<div class="stat-strip planner-stat-strip class-schedule-stats">
      <div class="stat"><span>Class meetings</span><strong>${entries.length}</strong><small>scheduled in this view</small></div>
      <div class="stat"><span>Courses shown</span><strong>${courseKeys.size}</strong><small>${ensurePlannerPrefs().courseId==='all'?'all matching courses':'selected course'}</small></div>
      <div class="stat"><span>Active days</span><strong>${dayKeys.size}</strong><small>days with classes</small></div>
      <div class="stat"><span>${busiest?'Busiest day':'Earliest class'}</span><strong>${busiest?fmtDate(`${busiest[0]}T12:00:00`,{weekday:'short'}):(earliest?fmtTime(earliest):'—')}</strong><small>${busiest?`${busiest[1]} meeting${busiest[1]===1?'':'s'}`:'from course schedules'}</small></div>
    </div>`;
  }
  function classScheduleCard(entry){
    const c=course(entry.courseId), detailed=ensurePlannerPrefs().density==='comfortable';
    return `<article class="class-schedule-card ${detailed?'detailed':'compact'}" style="--event-color:${c?.color||'var(--accent)'}"><div class="event-type">class schedule</div><strong>${esc(entry.code||entry.title)}</strong>${detailed&&entry.code?`<span class="class-name">${esc(entry.title)}</span>`:''}<small>${fmtTime(entry.start)}${entry.end?`–${fmtTime(entry.end)}`:''}${entry.room?` · ${esc(entry.room)}`:''}</small>${detailed&&entry.teacher?`<em>${esc(entry.teacher)}</em>`:''}</article>`;
  }
  function renderClassScheduleWeek(start){
    const days=[0,1,2,3,4,5,6].map(n=>addDays(start,n)), all=classScheduleEntries(start,addDays(start,7));
    return `<div class="week-grid redesigned class-only ${ensurePlannerPrefs().density}">${days.map(day=>{const entries=all.filter(e=>isoDate(e.start)===isoDate(day));return `<div class="day-column redesigned class-day" data-day="${isoDate(day)}"><div class="day-head ${isToday(day)?'today':''}"><div><strong>${fmtDate(day,{weekday:'short'})}</strong><span>${fmtDate(day,{month:'short',day:'numeric'})}</span></div><div class="day-load"><small>${entries.length?`${entries.length} class${entries.length===1?'':'es'}`:'open'}</small></div></div><div class="day-event-stack">${entries.map(classScheduleCard).join('')||'<div class="day-empty">No classes</div>'}</div></div>`;}).join('')}</div>`;
  }
  function renderClassScheduleAgenda(start){
    const days=[0,1,2,3,4,5,6].map(n=>addDays(start,n)), all=classScheduleEntries(start,addDays(start,7));
    return `<div class="planner-agenda class-agenda">${days.map(day=>{const entries=all.filter(e=>isoDate(e.start)===isoDate(day));return `<section class="agenda-day ${isToday(day)?'today':''}"><header><div><span>${fmtDate(day,{weekday:'long'})}</span><strong>${fmtDate(day,{month:'short',day:'numeric'})}</strong></div><small>${entries.length} class${entries.length===1?'':'es'}</small></header><div class="agenda-items">${entries.map(e=>{const c=course(e.courseId);return `<div class="agenda-row class-row" style="--row-color:${c?.color||'var(--accent)'}"><span class="agenda-time">${fmtTime(e.start)}${e.end?`–${fmtTime(e.end)}`:''}</span><div><strong>${esc(e.code?`${e.code} · ${e.title}`:e.title)}</strong><small>${[e.teacher,e.room].filter(Boolean).map(esc).join(' · ')}</small></div><span class="pill">Class</span></div>`;}).join('')||'<div class="agenda-empty">No classes</div>'}</div></section>`;}).join('')}</div>`;
  }
  function renderClassScheduleMonth(){
    const month=plannerMonthStart(), start=plannerMonthGridStart(), end=addDays(start,42), all=classScheduleEntries(start,end), monthIndex=month.getMonth();
    const days=Array.from({length:42},(_,i)=>addDays(start,i));
    return `<div class="month-weekdays">${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(x=>`<span>${x}</span>`).join('')}</div><div class="planner-month-grid class-month">${days.map(day=>{const entries=all.filter(e=>isoDate(e.start)===isoDate(day));return `<button class="month-day ${day.getMonth()!==monthIndex?'outside':''} ${isToday(day)?'today':''}" data-jump-day="${isoDate(day)}"><header><span>${day.getDate()}</span>${entries.length?`<small>${entries.length} class${entries.length===1?'':'es'}</small>`:''}</header><div class="class-month-list">${entries.slice(0,3).map(e=>`<span style="--dot:${colorForCourse(e.courseId)}"><b>${esc(e.code||courseName(e.courseId))}</b> ${fmtTime(e.start)}</span>`).join('')}${entries.length>3?`<em>+${entries.length-3} more</em>`:''}</div></button>`;}).join('')}</div>`;
  }
  function plannerCourseLoad(courseId,start,end){
    const scheduled=state.events.filter(e=>e.status!=='done'&&e.courseId===courseId&&['work','study'].includes(e.type)&&new Date(e.start)>=start&&new Date(e.start)<end).reduce((s,e)=>s+eventMinutes(e),0);
    const deadlines=state.assessments.filter(a=>a.status!=='done'&&a.courseId===courseId&&new Date(a.due)>=start&&new Date(a.due)<end);
    return {scheduled,deadlines,maxImpact:deadlines.reduce((m,a)=>Math.max(m,academicPriorityScore(a)),0)};
  }
  function plannerRepairPreview(){
    const now=new Date();
    const capacity=Math.max(60,Number(state.semester.availableMinutesPerWeek||840));
    const adaptive=e=>e.type==='work'&&e.status!=='done'&&String(e.sourceType||'').startsWith('adaptive_planner');
    const removals=new Map();
    const reason=(e,msg)=>{ if(!removals.has(e.id)) removals.set(e.id,{event:e,reason:msg}); };
    const adaptiveBlocks=state.events.filter(adaptive).sort((a,b)=>new Date(a.start)-new Date(b.start));

    for(const e of adaptiveBlocks){
      const a=assessment(e.assessmentId);
      if(new Date(e.end)<now){ reason(e,'Study block slipped into the past'); continue; }
      if(!a){ reason(e,'Orphaned planner block'); continue; }
      if(new Date(e.start)<planningWindowStart(a)) reason(e,'Scheduled before its planning window');
      else if(new Date(e.end)>new Date(a.due)) reason(e,'Scheduled after the deadline');
    }

    const byAssessment=new Map();
    adaptiveBlocks.filter(e=>!removals.has(e.id)&&new Date(e.end)>=now).forEach(e=>{
      if(!byAssessment.has(e.assessmentId)) byAssessment.set(e.assessmentId,[]);
      byAssessment.get(e.assessmentId).push(e);
    });
    for(const [aid,blocks] of byAssessment){
      const a=assessment(aid); if(!a) continue;
      let allowance=Math.max(0,Number(a.remaining??a.effort??0));
      for(const e of blocks.sort((x,y)=>new Date(x.start)-new Date(y.start))){
        const mins=eventMinutes(e);
        if(allowance<=5 || mins>allowance+5) reason(e,'Exceeds the assessment remaining effort');
        else allowance-=mins;
      }
    }

    const surviving=adaptiveBlocks.filter(e=>!removals.has(e.id)&&new Date(e.end)>=now);
    const weeks=new Map();
    for(const e of surviving){
      const key=isoDate(weekStart(e.start));
      if(!weeks.has(key)) weeks.set(key,[]);
      weeks.get(key).push(e);
    }
    for(const [key,blocks] of weeks){
      const start=new Date(`${key}T00:00:00`), end=addDays(start,7);
      const nonAdaptive=state.events.filter(e=>e.status!=='done'&&!adaptive(e)&&['work','study'].includes(e.type)&&new Date(e.start)>=start&&new Date(e.start)<end).reduce((s,e)=>s+eventMinutes(e),0);
      let available=Math.max(0,capacity-nonAdaptive);
      const ordered=[...blocks].sort((x,y)=>{
        const ax=assessment(x.assessmentId), ay=assessment(y.assessmentId);
        return planningPriority(ay)-planningPriority(ax) || new Date(x.start)-new Date(y.start);
      });
      for(const e of ordered){
        const mins=eventMinutes(e);
        if(mins<=available) available-=mins;
        else reason(e,'Pushes the week above your study-capacity limit');
      }
    }
    const currentStart=weekStart(), currentEnd=addDays(currentStart,7);
    const currentScheduled=scheduledWorkMinutesForWeek(currentStart);
    const currentManual=state.events.filter(e=>e.status!=='done'&&['work','study'].includes(e.type)&&new Date(e.start)>=currentStart&&new Date(e.start)<currentEnd&&!adaptive(e)).sort((a,b)=>new Date(a.start)-new Date(b.start));
    const manualMissed=canonicalSlippedWork(now).filter(e=>!adaptive(e));
    const remove=[...removals.values()];
    const slipped=remove.filter(item=>new Date(item.event.end)<now).length;
    return {mode:'repair',remove,slipped,manual:currentManual,manualMissed,capacity,currentScheduled,overBy:Math.max(0,currentScheduled-capacity),generatedAt:new Date().toISOString()};
  }
  function planHealth(){
    const repair=plannerRepairPreview();
    const snapshot=semesterPlanningSnapshot();
    return {repairCount:repair.remove.length,currentScheduled:snapshot.plannedStudy,capacity:snapshot.capacity,overBy:snapshot.overCapacity,slipped:snapshot.slippedBlocks.length};
  }
  function renderPlannerStats(start,end,weeks){
    const due=rangeDueMinutes(start,end), scheduled=rangeMinutes(start,end), capacity=(state.semester.availableMinutesPerWeek||840)*weeks;
    const free=capacity-scheduled, risk=rangeAtRisk(start,end).length;
    return `<div class="stat-strip planner-stat-strip">
      <div class="stat"><span>Due workload</span><strong>${formatMinutes(due)}</strong><small>remaining effort due in this view</small></div>
      <div class="stat"><span>Planned study</span><strong>${formatMinutes(scheduled)}</strong><small>work blocks in this view</small></div>
      <div class="stat ${free<0?'stat-danger':''}"><span>${free<0?'Over capacity':'Capacity left'}</span><strong>${formatMinutes(Math.abs(free))}</strong><small>${weeks===1?'this week':`${weeks} visible weeks`}</small></div>
      <div class="stat ${risk?'stat-warning':''}"><span>At-risk deadlines</span><strong>${risk}</strong><small>due in this view</small></div>
    </div>`;
  }
  function renderPlannerControlBar(){
    const prefs=ensurePlannerPrefs();
    const viewButton=(key,label)=>`<button class="planner-segment ${prefs.view===key?'active':''}" data-planner-view="${key}">${label}</button>`;
    const lensButton=(key,label)=>`<button class="planner-segment ${prefs.lens===key?'active':''}" data-planner-lens="${key}">${label}</button>`;
    return `<div class="planner-commandbar card">
      <div class="planner-period-nav"><button class="icon-btn planner-arrow" id="plannerPrevPeriod" aria-label="Previous period">←</button><button class="planner-period-label" id="plannerToday">${esc(plannerPeriodLabel())}<small>Jump to today</small></button><button class="icon-btn planner-arrow" id="plannerNextPeriod" aria-label="Next period">→</button></div>
      <div class="planner-command-groups">
        <div class="planner-control-cluster"><small>View</small><div class="planner-segments" aria-label="Calendar view">${viewButton('week','Week')}${viewButton('month','Month')}${viewButton('agenda','Agenda')}</div></div>
        <div class="planner-control-cluster"><small>Show</small><div class="planner-segments" aria-label="Planner content">${lensButton('plan','My plan')}${lensButton('classes','Timetable')}${lensButton('deadlines','Deadlines')}</div></div>
        <div class="planner-control-cluster insights"><small>Insights</small><div class="planner-segments" aria-label="Planner insights">${lensButton('courses','Course load')}${lensButton('impact','Priorities')}</div></div>
      </div>
      <button class="btn primary" id="autoPlan">Preview smart plan</button>
    </div>`;
  }
  function renderPlannerFilters(start,end){
    const prefs=ensurePlannerPrefs();
    const courseButton=(id,label,color='var(--accent)')=>`<button class="planner-filter-btn ${prefs.courseId===id?'active':''}" data-planner-course-filter="${id}"><span class="course-dot" style="--course-color:${color}"></span><span>${esc(label)}</span></button>`;
    const typeButton=(key,label)=>`<button class="planner-filter-btn mini ${prefs.assessmentType===key?'active':''}" data-planner-type-filter="${key}">${label}</button>`;
    const layerButton=(key,label)=>`<button class="planner-filter-btn mini ${prefs.layers[key]?'active':''}" data-planner-layer="${key}"><span class="layer-check">${prefs.layers[key]?'✓':''}</span>${label}</button>`;
    return `<aside class="planner-filter-panel card">
      <div class="planner-filter-section"><span class="eyebrow">Courses</span>${courseButton('all','All courses','#6d63ed')}${state.courses.map(c=>courseButton(c.id,c.name,c.color)).join('')}</div>
      ${prefs.lens==='classes'?`<div class="planner-filter-section schedule-filter-note"><span class="eyebrow">Schedule mode</span><strong>Classes only</strong><small>Built from each course's recurring schedule. Assessments and study blocks are hidden.</small></div>`:`<div class="planner-filter-section"><span class="eyebrow">Assessment type</span><div class="planner-mini-grid">${typeButton('all','All')}${typeButton('assignment','Homework')}${typeButton('quiz','Quizzes')}${typeButton('project','Projects')}${typeButton('exam','Exams')}</div></div><div class="planner-filter-section"><span class="eyebrow">Layers</span><div class="planner-mini-grid">${layerButton('fixed','Classes')}${layerButton('work','Study work')}${layerButton('deadlines','Deadlines')}</div></div>`}
      <div class="planner-filter-section"><span class="eyebrow">Density</span><button class="planner-density-toggle" id="plannerDensity"><span>${prefs.density==='compact'?'Compact':'Detailed'}</span><small>${prefs.density==='compact'?'Grouped sessions':'Individual sessions'}</small></button></div>
    </aside>`;
  }
  function renderCourseLens(start,end){
    if(ensurePlannerPrefs().lens!=='courses') return '';
    return `<div class="planner-course-lens">${state.courses.map(c=>{ const load=plannerCourseLoad(c.id,start,end); const highest=load.deadlines.slice().sort((a,b)=>academicPriorityScore(b)-academicPriorityScore(a))[0]; const priority=highest?priorityDescriptor(highest):null; return `<button class="course-load-card ${ensurePlannerPrefs().courseId===c.id?'active':''}" data-planner-course-filter="${c.id}" style="--course-color:${c.color}"><span class="course-dot" style="--course-color:${c.color}"></span><div><strong>${esc(c.name)}</strong><small>${formatMinutes(load.scheduled)} planned · ${load.deadlines.length} deadline${load.deadlines.length===1?'':'s'}</small></div><span class="impact-chip ${priority?.tone||''}">${priority?`${priority.level} priority`:'Clear'}</span></button>`; }).join('')}</div>`;
  }
  function renderDeadlineRunway(){
    if(ensurePlannerPrefs().lens!=='deadlines') return '';
    const now=new Date(), horizon=addDays(now,35);
    const items=state.assessments.filter(a=>plannerDeadlineMatches(a)&&new Date(a.due)>=now&&new Date(a.due)<horizon).sort((a,b)=>new Date(a.due)-new Date(b.due));
    const buckets=[['Next 3 days',0,3],['This week',3,7],['Next 2 weeks',7,14],['Later',14,35]];
    return `<div class="deadline-runway">${buckets.map(([label,min,max])=>{ const list=items.filter(a=>{const d=(new Date(a.due)-now)/DAY;return d>=min&&d<max;}); return `<section class="deadline-bucket"><div class="deadline-bucket-head"><strong>${label}</strong><span>${list.length}</span></div>${list.length?list.slice(0,6).map(a=>deadlineRunwayItem(a)).join(''):`<div class="deadline-empty">Nothing here</div>`}</section>`; }).join('')}</div>`;
  }
  function deadlineRunwayItem(a){
    const c=course(a.courseId), ps=planningState(a), priority=priorityDescriptor(a);
    return `<button class="deadline-runway-item" data-preview-plan="${a.id}" style="--course-color:${c?.color||'var(--accent)'}"><span class="course-dot" style="--course-color:${c?.color||'var(--accent)'}"></span><div><strong>${esc(a.title)}</strong><small>${esc(c?.name||'Course')} · ${humanDue(a.due)} · ${formatMinutes(ps.unscheduled)} unplanned</small></div><span class="impact-chip ${priority.tone}">${priority.level}</span></button>`;
  }
  function renderPlannerWeek(start){
    const prefs=ensurePlannerPrefs();
    const days=[0,1,2,3,4,5,6].map(n=>addDays(start,n));
    return `<div class="week-grid redesigned ${prefs.density}">${days.map(day=>renderPlannerDay(day)).join('')}</div>`;
  }
  function renderPlannerDay(day){
    const events=state.events.filter(e=>plannerEventMatches(e)&&isoDate(e.start)===isoDate(day)).sort((a,b)=>new Date(a.start)-new Date(b.start));
    const deadlines=state.assessments.filter(a=>plannerDeadlineMatches(a)&&isoDate(a.due)===isoDate(day)).sort((a,b)=>new Date(a.due)-new Date(b.due));
    const fixed=events.filter(e=>e.type==='fixed');
    const work=events.filter(e=>['work','study'].includes(e.type));
    const workGroups=groupWorkForDay(work,day);
    const workMinutes=work.reduce((s,e)=>s+eventMinutes(e),0), dayLimit=dailyPlanningLimit();
    return `<div class="day-column redesigned" data-day="${isoDate(day)}"><div class="day-head ${isToday(day)?'today':''}"><div><strong>${fmtDate(day,{weekday:'short'})}</strong><span>${fmtDate(day,{month:'short',day:'numeric'})}</span></div><div class="day-load"><span style="--load:${Math.min(100,Math.round(workMinutes/Math.max(1,dayLimit)*100))}%"></span><small>${workMinutes?formatMinutes(workMinutes):'open'}</small></div></div>
      ${deadlines.length?`<div class="deadline-stack">${deadlines.map(deadlineFlag).join('')}</div>`:''}
      <div class="day-event-stack">${fixed.map(compactEventCard).join('')}${workGroups.map(group=>renderWorkGroup(group,day)).join('')}${!fixed.length&&!workGroups.length&&!deadlines.length?'<div class="day-empty">Open capacity</div>':''}</div>
    </div>`;
  }
  function groupWorkForDay(events,day){
    const map=new Map();
    for(const e of events){
      const key=e.assessmentId||e.taskId||e.id;
      if(!map.has(key)) map.set(key,{key,assessmentId:e.assessmentId||'',events:[]});
      map.get(key).events.push(e);
    }
    return [...map.values()].sort((a,b)=>new Date(a.events[0].start)-new Date(b.events[0].start));
  }
  function renderWorkGroup(group,day){
    const events=group.events.sort((a,b)=>new Date(a.start)-new Date(b.start));
    const groupKey=`${isoDate(day)}::${group.key}`;
    const prefs=ensurePlannerPrefs();
    const expanded=plannerExpandedGroups.has(groupKey) || prefs.density==='comfortable';
    if(events.length===1 || expanded){
      return `${events.map(compactEventCard).join('')}${events.length>1&&prefs.density==='compact'?`<button class="group-collapse" data-toggle-work-group="${esc(groupKey)}">Collapse ${events.length} sessions</button>`:''}`;
    }
    const a=assessment(group.assessmentId), c=course(events[0].courseId);
    const mins=events.reduce((s,e)=>s+eventMinutes(e),0);
    const taskLabels=[...new Set(events.map(e=>String(e.title||'').split(' · ').slice(1).join(' · ')).filter(Boolean))].slice(0,2);
    return `<button class="work-group-card" data-toggle-work-group="${esc(groupKey)}" style="--event-color:${c?.color||'var(--accent)'}"><div class="event-type">${events.length} sessions · ${formatMinutes(mins)}</div><strong>${esc(a?.title||courseName(events[0].courseId))}</strong><small>${fmtTime(events[0].start)}–${fmtTime(events[events.length-1].end)}${taskLabels.length?` · ${esc(taskLabels.join(' + '))}`:''}</small><span>Expand</span></button>`;
  }
  function compactEventCard(e){
    const c=course(e.courseId), draggable=['work','study'].includes(e.type), detailed=ensurePlannerPrefs().density==='comfortable';
    const a=e.assessmentId?assessment(e.assessmentId):null;
    const primary=!detailed&&a?a.title:e.title;
    const secondary=detailed?`${esc(c?.name||'Course')}${c?.room?` · ${esc(c.room)}`:''}`:(a&&e.title!==a.title?`${eventMinutes(e)}m planned session`:esc(c?.name||'Course'));
    return `<div class="event-card compact-event ${detailed?'detailed':'dense'}" ${draggable?'draggable="true"':''} data-event-id="${e.id}" style="--event-color:${c?.color||'var(--accent)'}"><div class="event-type">${e.type==='fixed'?'class':'study block'}</div><strong>${esc(primary)}</strong><span class="event-course-meta">${secondary}</span><small>${fmtTime(e.start)}–${fmtTime(e.end)}${detailed?` · ${eventMinutes(e)}m`:''}</small></div>`;
  }
  function deadlineFlag(a){
    const c=course(a.courseId), ps=planningState(a);
    return `<button class="deadline-flag ${ps.tone}" data-preview-plan="${a.id}" style="--event-color:${c?.color||'var(--danger)'}"><span>${fmtTime(a.due)}</span><strong>${esc(a.title)}</strong><small>${formatMinutes(a.remaining)} left</small></button>`;
  }
  function renderPlannerAgenda(start){
    const days=[0,1,2,3,4,5,6].map(n=>addDays(start,n));
    return `<div class="planner-agenda">${days.map(day=>{
      const events=state.events.filter(e=>plannerEventMatches(e)&&isoDate(e.start)===isoDate(day)).sort((a,b)=>new Date(a.start)-new Date(b.start));
      const deadlines=state.assessments.filter(a=>plannerDeadlineMatches(a)&&isoDate(a.due)===isoDate(day)).sort((a,b)=>new Date(a.due)-new Date(b.due));
      const work=events.filter(e=>['work','study'].includes(e.type));
      const fixed=events.filter(e=>e.type==='fixed');
      const groups=groupWorkForDay(work,day);
      return `<section class="agenda-day ${isToday(day)?'today':''}"><header><div><span>${fmtDate(day,{weekday:'long'})}</span><strong>${fmtDate(day,{month:'short',day:'numeric'})}</strong></div><small>${formatMinutes(work.reduce((s,e)=>s+eventMinutes(e),0))} planned · ${deadlines.length} deadline${deadlines.length===1?'':'s'}</small></header><div class="agenda-items">${deadlines.map(deadlineAgendaItem).join('')}${fixed.map(agendaEventItem).join('')}${groups.map(g=>agendaGroupItem(g)).join('')}${!events.length&&!deadlines.length?'<div class="agenda-empty">No academic commitments</div>':''}</div></section>`;
    }).join('')}</div>`;
  }
  function deadlineAgendaItem(a){ const c=course(a.courseId), ps=planningState(a); return `<button class="agenda-row deadline" data-preview-plan="${a.id}" style="--row-color:${c?.color||'var(--danger)'}"><span class="agenda-time">Due ${fmtTime(a.due)}</span><div><strong>${esc(a.title)}</strong><small>${esc(c?.name||'Course')} · ${formatMinutes(a.remaining)} remaining</small></div><span class="plan-status ${ps.tone}">${ps.label}</span></button>`; }
  function agendaEventItem(e){ const c=course(e.courseId); return `<div class="agenda-row" style="--row-color:${c?.color||'var(--accent)'}"><span class="agenda-time">${fmtTime(e.start)}</span><div><strong>${esc(e.title)}</strong><small>${esc(c?.name||'Course')} · ${eventMinutes(e)}m</small></div><span class="pill">Class</span></div>`; }
  function agendaGroupItem(g){ const events=g.events, a=assessment(g.assessmentId), c=course(events[0]?.courseId), mins=events.reduce((s,e)=>s+eventMinutes(e),0); return `<div class="agenda-row" style="--row-color:${c?.color||'var(--accent)'}"><span class="agenda-time">${fmtTime(events[0].start)}</span><div><strong>${esc(a?.title||events[0].title)}</strong><small>${events.length} session${events.length===1?'':'s'} · ${formatMinutes(mins)} · ${esc(c?.name||'Course')}</small></div><span class="pill">Study</span></div>`; }
  function renderPlannerMonth(){
    const month=plannerMonthStart(), start=plannerMonthGridStart();
    const days=Array.from({length:42},(_,i)=>addDays(start,i));
    const monthIndex=month.getMonth();
    return `<div class="month-weekdays">${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(x=>`<span>${x}</span>`).join('')}</div><div class="planner-month-grid">${days.map(day=>{
      const events=state.events.filter(e=>plannerEventMatches(e)&&isoDate(e.start)===isoDate(day));
      const work=events.filter(e=>['work','study'].includes(e.type));
      const deadlines=state.assessments.filter(a=>plannerDeadlineMatches(a)&&isoDate(a.due)===isoDate(day));
      const mins=work.reduce((s,e)=>s+eventMinutes(e),0), load=Math.min(100,Math.round(mins/Math.max(1,dailyPlanningLimit())*100));
      return `<button class="month-day ${day.getMonth()!==monthIndex?'outside':''} ${isToday(day)?'today':''}" data-jump-day="${isoDate(day)}"><header><span>${day.getDate()}</span>${mins?`<small>${formatMinutes(mins)}</small>`:''}</header><div class="month-load"><span style="--load:${load}%"></span></div><div class="month-deadlines">${deadlines.slice(0,2).map(a=>`<span style="--dot:${colorForCourse(a.courseId)}">${esc(a.title)}</span>`).join('')}${deadlines.length>2?`<em>+${deadlines.length-2} more</em>`:''}</div>${work.length?`<div class="month-session-count">${work.length} session${work.length===1?'':'s'}</div>`:''}</button>`;
    }).join('')}</div>`;
  }
  function renderImpactView(start,end){
    const now=new Date();
    let items=state.assessments.filter(a=>a.status!=='done'&&new Date(a.due)>now&&plannerAssessmentMatches(a));
    const inRange=items.filter(a=>new Date(a.due)>=start&&new Date(a.due)<end);
    if(inRange.length) items=inRange;
    items=items.sort((a,b)=>academicPriorityScore(b)-academicPriorityScore(a)).slice(0,12);
    return `<div class="impact-board"><div class="impact-note"><strong>Why these need attention</strong><span>Priority explains the reasons behind the plan instead of exposing an arbitrary score. It uses urgency, remaining effort, assessment weight, review gaps and plan coverage.</span></div>${items.length?items.map(a=>{const c=course(a.courseId),priority=priorityDescriptor(a),weak=topicWeakness(a),ps=planningState(a),coverage=ps.remaining?Math.min(100,Math.round(ps.planned/ps.remaining*100)):100,gradeGap=Math.max(0,Math.round((Number(c?.target||0)-Number(c?.grade||0))*10)/10);return `<article class="impact-card" style="--course-color:${c?.color||'var(--accent)'}"><div class="priority-badge ${priority.tone}"><strong>${priority.level}</strong><span>priority</span></div><div class="impact-main"><span class="eyebrow">${esc(c?.name||'Course')} · ${esc(a.type)}</span><h3>${esc(a.title)}</h3><p>${humanDue(a.due)} · ${formatMinutes(a.remaining)} remaining · ${preferredSessionMinutes(a)}m preferred sessions</p><div class="priority-reasons">${priority.reasons.map(r=>`<span>${esc(r)}</span>`).join('')}</div><div class="impact-factors"><span><b>${coverage}%</b> planned</span>${weak?`<span><b>${weak}%</b> review gap</span>`:''}${gradeGap?`<span><b>${gradeGap}%</b> to target</span>`:''}</div></div><button class="btn secondary compact-btn" data-preview-plan="${a.id}">Preview plan</button></article>`;}).join(''):`<div class="empty-state"><div class="empty-icon">✓</div><h3>No matching upcoming assessments</h3><p>Change the course/type filter or time period.</p></div>`}</div>`;
  }

  function renderUnscheduledShelf(){
    const prefs=ensurePlannerPrefs();
    if(prefs.lens==='deadlines') return '';
    const candidates=planningCandidates({courseId:prefs.courseId==='all'?'':prefs.courseId,limit:10}).filter(plannerAssessmentMatches);
    return `<section class="unscheduled-shelf"><div class="section-head compact"><div><h2>Unscheduled shelf</h2><p>Work stays here until it earns calendar space. Smart Plan previews changes before saving them.</p></div>${candidates.length?`<span class="pill">${candidates.length} need planning</span>`:''}</div><div class="unscheduled-track">${candidates.length?candidates.map(a=>{const c=course(a.courseId),ps=planningState(a),priority=priorityDescriptor(a);return `<article class="unscheduled-card" style="--course-color:${c?.color||'var(--accent)'}"><div class="unscheduled-card-head"><span class="course-dot" style="--course-color:${c?.color||'var(--accent)'}"></span><span class="impact-chip ${priority.tone}">${priority.level} priority</span></div><strong>${esc(a.title)}</strong><small>${esc(c?.name||'Course')} · ${humanDue(a.due)}</small><div class="unscheduled-meta"><span>${formatMinutes(ps.unscheduled)} unplanned</span><span>${preferredSessionMinutes(a)}m sessions</span></div><div class="priority-reasons compact">${priority.reasons.slice(0,2).map(r=>`<span>${esc(r)}</span>`).join('')}</div><button class="btn secondary compact-btn" data-preview-plan="${a.id}">Preview plan</button></article>`;}).join(''):`<div class="unscheduled-clear"><span>✓</span><div><strong>Everything upcoming has calendar coverage</strong><small>New work will appear here when it needs scheduling.</small></div></div>`}</div></section>`;
  }
  function renderPlanner(){
    const prefs=ensurePlannerPrefs(), range=plannerRange(), health=planHealth();
    const openTasks=(state.tasks||[]).filter(t=>t.status!=='done' && (prefs.courseId==='all'||t.courseId===prefs.courseId)).sort((a,b)=>a.position-b.position);
    const healthIssue=health.repairCount||health.overBy>0;
    const mainView=prefs.lens==='impact'?renderImpactView(range.start,range.end):prefs.lens==='classes'?(prefs.view==='month'?renderClassScheduleMonth():prefs.view==='agenda'?renderClassScheduleAgenda(range.start):renderClassScheduleWeek(range.start)):(prefs.view==='month'?renderPlannerMonth():prefs.view==='agenda'?renderPlannerAgenda(range.start):renderPlannerWeek(range.start));
    const stats=prefs.lens==='classes'?renderClassScheduleStats(range.start,range.end):renderPlannerStats(range.start,range.end,range.weeks);
    return `${renderPlannerControlBar()}${stats}
      ${prefs.lens==='classes'?'':healthIssue?`<article class="planner-health warning"><div><span class="eyebrow">Plan health</span><strong>${health.overBy?`${formatMinutes(health.overBy)} over this week's capacity`:''}${health.overBy&&health.repairCount?' · ':''}${health.repairCount?`${health.repairCount} adaptive block${health.repairCount===1?'':'s'} can be repaired`:''}</strong><small>${health.repairCount?'Repair only touches future auto-generated blocks; fixed classes and manual work stay unchanged.':'This overload comes from manual or legacy work, so it cannot be safely auto-deleted.'}</small></div><button class="btn secondary" id="reviewPlanRepair">${health.repairCount?'Review repair':'Review overload'}</button></article>`:`<article class="planner-health success"><div><span class="eyebrow">Plan health</span><strong>Capacity and planning windows look consistent</strong><small>Future auto-generated blocks are inside their deadline windows and weekly limits.</small></div><span class="health-check">✓</span></article>`}
      ${prefs.lens==='classes'?'':renderDeadlineRunway()}${prefs.lens==='classes'?'':renderCourseLens(range.start,range.end)}
      <div class="planner-shell ${prefs.density}">${renderPlannerFilters(range.start,range.end)}<main class="planner-calendar-panel"><div class="planner-view-caption"><div><span class="eyebrow">${prefs.lens==='plan'?'Time plan':prefs.lens==='classes'?'Class timetable':prefs.lens==='deadlines'?'Deadline runway':prefs.lens==='impact'?'Priorities':'Course load'}</span><h2>${esc(plannerPeriodLabel())}</h2></div><span class="planner-hint">${prefs.lens==='classes'?'Recurring course schedule only':prefs.view==='week'?'Drag individual expanded study blocks between days':prefs.view==='month'?'Select a date to zoom into its week':'Compact chronological view'}</span></div>${mainView}</main></div>
      ${prefs.lens==='classes'?'':renderUnscheduledShelf()}
      <details class="card planner-details"><summary><span>Task breakdown</span><small>${openTasks.length} open planner task${openTasks.length===1?'':'s'} · expand when you need execution detail</small></summary><div class="task-queue embedded">${openTasks.length?openTasks.slice(0,20).map(taskRow).join(''):`<div class="empty-state compact"><div class="empty-icon">✓</div><h3>No open planner tasks</h3><p>Use Preview smart plan on an assessment to create a task breakdown.</p></div>`}</div></details>`;
  }

  function taskRow(t){ const c=course(t.courseId); const a=assessment(t.assessmentId); return `<div class="task-row"><div class="task-row-copy"><strong><span class="course-dot" style="--course-color:${c?.color||'var(--accent)'}"></span> ${esc(t.title)}</strong><small>${esc(c?.name||'Course')} · ${esc(a?.title||'Assessment')} · ${formatMinutes(t.remaining)} remaining</small></div><div class="button-row"><span class="pill">${esc(t.status.replace('_',' '))}</span><button class="btn secondary" data-task-done="${t.id}">Mark done</button></div></div>`; }

  function renderCourses(){
    if(activeCourseId){ return renderCourseDetail(activeCourseId); }
    return `<div class="section-head" style="margin-top:0"><div><h2>Your course graph</h2><p>Your semester structure: classes, deadlines, topics and materials in one academic context.</p></div><div class="button-row"><button class="btn secondary" id="openImport">Import syllabus</button><button class="btn primary" id="openAddCourse">+ Add course</button></div></div><div class="course-grid">${state.courses.map(c=>{
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
    if(activeCourseTab==='topics') body=`<div class="course-grid">${dedupeTopics(c.topics).map(t=>{const count=res.filter(r=>String(r.topic||'').toLowerCase()===String(t||'').toLowerCase()).length; const review=state.review.find(r=>r.courseId===id&&r.topic===t);return `<button class="card pad topic-link-card" data-open-library-topic="${esc(t)}" data-open-library-topic-course="${c.id}"><span class="course-dot" style="--course-color:${c.color}"></span><h3 style="margin:15px 0 5px">${esc(t)}</h3><p style="color:var(--muted);font-size:11px">${count} linked resources${review?` · mastery ${review.mastery}%`:''}</p><small>Open materials →</small></button>`}).join('')}</div>`;
    if(activeCourseTab==='materials') body=`<div class="context-toolbar card"><div><span class="eyebrow">Shared Library</span><strong>${esc(c.name)} materials</strong><small>These are the same resources stored in Library, filtered to this course.</small></div><div class="button-row"><button class="btn secondary" data-open-library-course="${c.id}">Open Library</button><button class="btn primary" data-add-resource-course="${c.id}">+ Add material</button></div></div><div class="resource-grid">${res.length?res.map(resourceCard).join(''):`<div class="card empty-state"><div class="empty-icon">▤</div><h3>No materials yet</h3><p>Add one here or from Library. It will appear in both places.</p></div>`}</div>`;
    return `<button class="btn ghost" id="backCourses">← All courses</button><article class="card course-detail-head" style="--course-color:${c.color};margin-top:10px"><div><span class="pill"><span class="course-dot" style="--course-color:${c.color}"></span> ${esc(c.code)}</span><h2>${esc(c.name)}</h2><p>${esc(c.teacher)} · ${esc(c.room)} · ${esc(c.schedule)}</p></div>${Number(c.grade)>0?`<div><span class="eyebrow">Current grade</span><strong style="display:block;font-size:28px;margin-top:5px">${c.grade}%</strong></div>`:''}</article><div class="detail-tabs">${['overview','work','topics','materials'].map(t=>`<button class="${activeCourseTab===t?'active':''}" data-course-tab="${t}">${t[0].toUpperCase()+t.slice(1)}</button>`).join('')}</div>${body}`;
  }

  const practiceBank=[
    {courseId:'stats',topic:'Probability',q:'A fair coin is tossed three times. What is the probability of getting exactly two heads?',a:'There are 3 successful outcomes out of 8 equally likely outcomes, so the probability is 3/8.'},
    {courseId:'alg',topic:'Recursion',q:'What two properties must a correct recursive algorithm have?',a:'A base case that stops recursion, and a recursive step that moves the problem toward that base case.'},
    {courseId:'chem',topic:'Equilibrium',q:'What does Le Châtelier’s principle predict when a reactant concentration is increased?',a:'The system shifts in the direction that consumes some of the added reactant, toward products for a simple reactant increase.'},
    {courseId:'alg',topic:'Graphs',q:'When is breadth-first search preferred over depth-first search for an unweighted graph?',a:'When you need shortest path length in number of edges, because BFS explores vertices level by level.'}
  ];
  function studyTargetOptions(){
    const openTasks=(state.tasks||[]).filter(t=>t.status!=='done'&&assessment(t.assessmentId)?.status!=='done').sort((a,b)=>new Date(assessment(a.assessmentId)?.due||0)-new Date(assessment(b.assessmentId)?.due||0));
    const taskAssessmentIds=new Set(openTasks.map(t=>t.assessmentId));
    const openAssessments=state.assessments.filter(a=>a.status!=='done'&&new Date(a.due)>=startOfDay(new Date())).sort((a,b)=>new Date(a.due)-new Date(b.due));
    const current=state.timer?.context||{};
    let selected='free';
    if(current.taskId&&openTasks.some(t=>t.id===current.taskId)) selected=`task:${current.taskId}`;
    else if(current.assessmentId&&openAssessments.some(a=>a.id===current.assessmentId)) selected=`assessment:${current.assessmentId}`;
    const taskOptions=openTasks.map(t=>{const a=assessment(t.assessmentId),c=course(t.courseId);return `<option value="task:${esc(t.id)}" ${selected===`task:${t.id}`?'selected':''}>${esc(c?.code||'Course')} · ${esc(a?.title||'Deadline')} — ${esc(t.title)}</option>`;}).join('');
    const assessmentOptions=openAssessments.filter(a=>!taskAssessmentIds.has(a.id)).map(a=>{const c=course(a.courseId);return `<option value="assessment:${esc(a.id)}" ${selected===`assessment:${a.id}`?'selected':''}>${esc(c?.code||'Course')} · ${esc(a.title)}</option>`;}).join('');
    return `<option value="free" ${selected==='free'?'selected':''}>Free focus · timer only</option>${taskOptions?`<optgroup label="Planner tasks">${taskOptions}</optgroup>`:''}${assessmentOptions?`<optgroup label="Deadlines">${assessmentOptions}</optgroup>`:''}`;
  }

  function studyTargetValue(){
    const ctx=state.timer?.context||{};
    if(ctx.taskId&&(state.tasks||[]).some(t=>t.id===ctx.taskId&&t.status!=='done')) return `task:${ctx.taskId}`;
    if(ctx.assessmentId&&assessment(ctx.assessmentId)?.status!=='done') return `assessment:${ctx.assessmentId}`;
    return 'free';
  }

  function setStudyTarget(value){
    if(state.timer.running)return toast('Pause the timer before switching focus.');
    const previousCourse=state.timer.context?.courseId||state.courses[0]?.id||'';
    if(value==='free'){
      state.timer.context={courseId:previousCourse,assessmentId:'',taskId:'',topic:'Focused study'};
    }else if(String(value).startsWith('task:')){
      const task=(state.tasks||[]).find(t=>t.id===String(value).slice(5));
      const a=task&&assessment(task.assessmentId);
      if(task&&a)state.timer.context={courseId:task.courseId||a.courseId,assessmentId:a.id,taskId:task.id,topic:a.topics?.[0]||task.title};
    }else if(String(value).startsWith('assessment:')){
      const a=assessment(String(value).slice(11));
      if(a)state.timer.context={courseId:a.courseId,assessmentId:a.id,taskId:'',topic:a.topics?.[0]||a.title};
    }
    save(); render();
  }

  function setStudyCourse(courseId){
    if(state.timer.running)return toast('Pause the timer before changing course context.');
    if(!course(courseId))return;
    state.timer.context={...(state.timer.context||{}),courseId,assessmentId:'',taskId:'',topic:'Focused study'};
    save(); render();
  }

  function setTimerDurationMinutes(minutes){
    if(state.timer.running)return toast('Pause the timer before changing its length.');
    const mins=clamp(Math.round(Number(minutes)||25),5,180);
    state.timer.seconds=mins*60;
    state.timer.initialSeconds=mins*60;
    save(); render();
  }

  function adjustTimerMinutes(delta){
    const current=Math.max(5,Math.round((state.timer.initialSeconds||state.timer.seconds||1500)/60));
    setTimerDurationMinutes(current+Number(delta||0));
  }

  async function setFocusMode(on){
    focusMode=!!on;
    document.body.classList.toggle('focus-mode',focusMode);
    if(focusMode && !document.fullscreenElement && document.documentElement.requestFullscreen){
      try{await document.documentElement.requestFullscreen();}catch(error){console.info('Browser fullscreen unavailable; using distraction-free app mode.',error);}
    }else if(!focusMode && document.fullscreenElement && document.exitFullscreen){
      try{await document.exitFullscreen();}catch(error){console.info('Could not exit browser fullscreen.',error);}
    }
    render();
  }

  const MATERIAL_STOP_WORDS=new Set(['a','an','and','are','as','at','be','before','by','complete','course','do','for','from','in','into','is','it','main','of','on','or','review','submit','task','the','this','to','work','with']);
  function materialTokens(...parts){
    return [...new Set(parts.flatMap(part=>String(part||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').split(/\s+/)).filter(token=>token.length>2&&!MATERIAL_STOP_WORDS.has(token)))];
  }
  function overlapTokens(a,b){ const right=new Set(b); return a.filter(token=>right.has(token)); }
  function resourceMatchForStudy(resource,{contextCourse,contextAssessment,contextTask,contextTopic}){
    if(!resource||resource.courseId!==contextCourse?.id)return {resource,score:-1,reasons:[]};
    const reasons=[];
    let score=10;
    const resourceTopic=topicKey(resource.topic);
    const primaryTopic=topicKey(contextTopic);
    const assessmentTopics=new Set((contextAssessment?.topics||[]).map(topicKey).filter(Boolean));
    if(resourceTopic&&primaryTopic&&resourceTopic===primaryTopic){score+=100;reasons.push('Exact topic');}
    else if(resourceTopic&&assessmentTopics.has(resourceTopic)){score+=78;reasons.push('Deadline topic');}
    const resourceTextTokens=materialTokens(resource.title,resource.description,resource.topic);
    const deadlineTokens=materialTokens(contextAssessment?.title,...(contextAssessment?.topics||[]));
    const taskTokens=materialTokens(contextTask?.title);
    const deadlineHits=overlapTokens(deadlineTokens,resourceTextTokens);
    const taskHits=overlapTokens(taskTokens,resourceTextTokens);
    if(deadlineHits.length){score+=Math.min(54,deadlineHits.length*18);reasons.push(`Matches deadline${deadlineHits.length>1?' context':''}`);}
    if(taskHits.length){score+=Math.min(36,taskHits.length*18);reasons.push('Matches task');}
    const normalizedDescription=normalizeAssessmentKey(resource.description||'');
    const normalizedAssessment=normalizeAssessmentKey(contextAssessment?.title||'');
    if(normalizedAssessment&&normalizedDescription.includes(normalizedAssessment)){score+=50;reasons.push('Linked by description');}
    if(resourceTopic==='syllabus'||resource.sourceType==='syllabus_upload'){score+=4;reasons.push('Course reference');}
    if(contextTopic==='Focused study'&&!contextAssessment&&!contextTask){score=Math.max(score,40);if(!reasons.length)reasons.push('Same course');}
    return {resource,score,reasons:[...new Set(reasons)]};
  }
  function studyMaterialRecommendations(context){
    const ranked=(state.resources||[]).filter(r=>r.courseId===context.contextCourse?.id).map(r=>resourceMatchForStudy(r,context)).sort((a,b)=>b.score-a.score||String(a.resource.title||'').localeCompare(String(b.resource.title||'')));
    const recommended=ranked.filter(item=>item.score>=38).slice(0,4);
    const used=new Set(recommended.map(item=>item.resource.id));
    const fallback=ranked.filter(item=>!used.has(item.resource.id)).slice(0,4);
    return {recommended,fallback,total:ranked.length};
  }
  function studyMaterialButton(item,secondary=false){
    const r=item.resource;
    const icon=r.type==='PDF'?'▤':r.type==='Link'?'↗':'✎';
    const reason=item.reasons?.slice(0,2).join(' · ')||(secondary?'Same course':'Suggested');
    return `<button class="session-material ${secondary?'secondary-match':''}" data-open-library-resource="${esc(r.id)}"><span>${icon}</span><div><strong>${esc(r.title)}</strong><small>${esc(r.topic||'General')} · ${esc(r.type)}</small><em>${esc(reason)}</em></div></button>`;
  }

  function renderStudy(){
    const t=state.timer;
    if(!state.courses.length){
      return `<article class="card empty-state study-empty"><div class="empty-icon">◎</div><h2>Study starts with academic context.</h2><p>Add a course and deadline first. Student Hub will use them to start focused sessions with the right materials attached.</p><div class="button-row"><button class="btn primary" id="startOnboarding">Set up semester</button><button class="btn secondary" data-route-jump="courses">Go to courses</button></div></article>`;
    }
    const targetValue=studyTargetValue();
    const contextCourse=course(t.context.courseId)||state.courses[0];
    const contextAssessment=assessment(t.context.assessmentId);
    const contextTask=(state.tasks||[]).find(task=>task.id===t.context.taskId);
    if(!t.context.courseId&&contextCourse) t.context.courseId=contextCourse.id;
    const contextTopic=t.context.topic||contextAssessment?.topics?.[0]||'Focused study';
    const displayTitle=contextTask?`${contextAssessment?.title||'Task'} · ${contextTask.title}`:(contextAssessment?.title||contextTopic);
    const materialMatches=studyMaterialRecommendations({contextCourse,contextAssessment,contextTask,contextTopic});
    const recent=[...(state.studySessions||[])].sort((a,b)=>new Date(b.completedAt)-new Date(a.completedAt)).slice(0,6);
    const totalMinutes=(state.studySessions||[]).reduce((sum,x)=>sum+Number(x.minutes||0),0);
    const duration=Math.max(5,Math.round((t.initialSeconds||t.seconds||25*60)/60));
    const durationPresets=[15,25,45,60];
    const courseOptions=state.courses.map(c=>`<option value="${esc(c.id)}" ${c.id===contextCourse?.id?'selected':''}>${esc(c.code)} · ${esc(c.name)}</option>`).join('');
    return `<div class="study-control-bar card">
      <div class="study-control-main">
        <label class="study-field"><span>Focus target</span><select id="studyTargetSelect" ${t.running?'disabled':''}>${studyTargetOptions()}</select></label>
        ${targetValue==='free'?`<label class="study-field compact-field"><span>Course context</span><select id="studyCourseSelect" ${t.running?'disabled':''}>${courseOptions}</select></label>`:''}
      </div>
      <div class="study-duration-wrap">
        <span class="study-field-label">Session length</span>
        <div class="duration-stepper"><button class="duration-adjust" id="timerMinus" ${t.running?'disabled':''} aria-label="Reduce focus time by 5 minutes">−5</button>${durationPresets.map(m=>`<button class="duration-preset ${duration===m?'active':''}" data-duration-minutes="${m}" ${t.running?'disabled':''}>${m}m</button>`).join('')}<button class="duration-adjust" id="timerPlus" ${t.running?'disabled':''} aria-label="Increase focus time by 5 minutes">+5</button></div>
      </div>
      <button class="btn secondary focus-mode-button" id="focusModeToggle">${focusMode?'Exit full screen':'Full screen focus'}</button>
    </div>
    <div class="study-execution-grid"><article class="card focus-card execution-focus">
      <div class="today-card-head"><span class="eyebrow">${contextTask?'Planner task':contextAssessment?'Deadline focus':'Free focus'}</span><div class="focus-head-actions">${contextAssessment?`<span class="pill">${esc(contextAssessment.type)}</span>`:''}<button class="btn ghost compact-btn focus-exit-inline" id="focusModeExit">Exit full screen</button></div></div>
      <h2>${esc(displayTitle)}</h2>
      <p class="focus-context-line"><span class="course-dot" style="--course-color:${contextCourse?.color||'var(--accent)'}"></span>${esc(contextCourse?.name||'Study')}${contextTask?` · ${esc(contextTask.title)}`:` · ${esc(contextTopic)}`}</p>
      <div class="timer" id="timerDisplay">${formatTimer(t.seconds)}</div>
      <div class="focus-session-meta"><span>${duration} min target</span>${contextAssessment?`<span>${formatMinutes(contextAssessment.remaining)} deadline work left</span>`:'<span>No task tracking attached</span>'}</div>
      <div class="button-row focus-actions"><button class="btn primary" id="timerToggle">${t.running?'Pause':'Start'}</button><button class="btn secondary" id="timerReset">Reset</button><button class="btn secondary" id="finishSession">Finish & save</button></div>
      <p class="quiet-note">${focusMode?'Distraction-free mode is active. Press Esc or use Exit full screen when you are done.':contextAssessment?'Finish & save records the session, then asks what work is still left so Planner can adapt.':'Actual study time is recorded when you finish and can improve future session sizing.'}</p>
    </article>
    <article class="card session-materials"><div class="section-head compact"><div><span class="eyebrow">For this session</span><h2>Materials</h2><p class="material-match-copy">Ranked from course, topic, deadline and task context — not just upload order.</p></div><button class="btn ghost compact-btn" data-open-library-course="${contextCourse?.id||''}">Open Library</button></div>${materialMatches.recommended.length?`<div class="material-match-label"><span>Recommended</span><small>${materialMatches.recommended.length} strong match${materialMatches.recommended.length===1?'':'es'}</small></div><div class="session-material-list">${materialMatches.recommended.map(item=>studyMaterialButton(item)).join('')}</div>${materialMatches.fallback.length?`<details class="material-fallback"><summary>More from ${esc(contextCourse?.name||'this course')} <span>${materialMatches.fallback.length}</span></summary><div class="session-material-list">${materialMatches.fallback.map(item=>studyMaterialButton(item,true)).join('')}</div></details>`:''}`:materialMatches.fallback.length?`<div class="material-context-note"><strong>No strong contextual match yet</strong><small>These are still from ${esc(contextCourse?.name||'the selected course')}. Add a topic or clearer description to improve matching.</small></div><div class="session-material-list">${materialMatches.fallback.map(item=>studyMaterialButton(item,true)).join('')}</div>`:`<div class="empty-state compact"><p>${targetValue==='free'?'No materials are saved for this course yet.':'No material is linked closely enough to this study context yet.'}</p><button class="btn secondary compact-btn" data-add-resource-course="${contextCourse?.id||''}">+ Add material</button></div>`}</article></div>
    <div class="section-head"><div><h2>Due for review</h2><p>Review prompts stay secondary to the session you chose to do now.</p></div></div><div class="review-queue">${state.review.length?state.review.map(reviewRow).join(''):`<div class="card empty-state compact"><p>No review items are due.</p></div>`}</div><div class="section-head"><div><h2>Study history</h2><p>${formatMinutes(totalMinutes)} recorded across ${(state.studySessions||[]).length} session${(state.studySessions||[]).length===1?'':'s'}.</p></div><span class="pill ${knowledgeCloudReady?'success':''}">${knowledgeCloudReady?'Synced':'Local'}</span></div><article class="card session-history">${recent.length?recent.map(studySessionRow).join(''):`<div class="empty-state"><div class="empty-icon">◎</div><h3>No completed focus sessions yet</h3><p>Finish a timer and the session will appear here.</p></div>`}</article>`;
  }
  function studySessionRow(session){ const c=course(session.courseId), a=assessment(session.assessmentId); const label=a?.title||session.topic||'Study'; const context=a&&session.topic&&topicKey(session.topic)!==topicKey(a.title)?`${c?.name||'Course'} · ${session.topic}`:(c?.name||'Course'); return `<div class="session-row"><div><strong><span class="course-dot" style="--course-color:${c?.color||'var(--accent)'}"></span> ${esc(label)}</strong><small>${esc(context)} · ${fmtDate(session.completedAt,{month:'short',day:'numeric'})} ${fmtTime(session.completedAt)}</small></div><span class="pill">${formatMinutes(session.minutes)}</span></div>`; }

  function startStudyFromResource(resourceId){
    const r=(state.resources||[]).find(item=>item.id===resourceId); if(!r)return;
    if(state.timer.running)return toast('Pause the current timer before switching study context.');
    state.timer.context={courseId:r.courseId||'',assessmentId:'',taskId:'',topic:topicKey(r.topic)==='syllabus'?'Focused study':(r.topic||'Focused study')};
    state.timer.running=false;
    if(!state.timer.initialSeconds)state.timer.initialSeconds=25*60;
    if(!state.timer.seconds||state.timer.seconds<1)state.timer.seconds=state.timer.initialSeconds;
    save(); setRoute('study');
  }

  function renderLibrary(){
    const filtered=state.resources.filter(r=>(libraryCourseFilter==='all'||r.courseId===libraryCourseFilter)&&(!libraryTopicFilter||topicKey(r.topic)===topicKey(libraryTopicFilter)));
    const filterButton=(id,label,color='var(--accent)')=>`<button class="library-filter ${libraryCourseFilter===id?'active':''}" data-library-course="${id}"><span class="course-dot" style="--course-color:${color}"></span>${esc(label)}</button>`;
    return `<div class="library-toolbar"><div class="library-search-wrap"><input class="search-input" id="librarySearch" placeholder="Search notes, files, links and topics..."/><small>One Library. Course pages and Study simply show filtered views of the same materials.</small></div><div class="button-row"><span class="pill ${knowledgeCloudReady?'success':''}">${knowledgeCloudReady?'Synced':'Local'}</span><button class="btn primary" id="openAddResource">+ Add resource</button></div></div><div class="library-filter-row">${filterButton('all','All materials','#6d63ed')}${state.courses.map(c=>filterButton(c.id,c.name,c.color)).join('')}${libraryTopicFilter?`<button class="library-topic-clear" id="clearLibraryTopic">Topic: ${esc(libraryTopicFilter)} ×</button>`:''}</div><div class="resource-grid" id="resourceGrid">${filtered.length?filtered.map(resourceCard).join(''):`<div class="card empty-state"><div class="empty-icon">⌁</div><h3>No materials match this view</h3><p>Try another course filter or add a new resource.</p></div>`}</div>`;
  }
  function resourceCard(r){
    const c=course(r.courseId);
    const icon={PDF:'▤',Note:'✎',Link:'↗'}[r.type]||'•';
    const action=r.storageFileId
      ? `<button class="resource-open resource-action" data-open-resource="${esc(r.id)}">Open PDF ↗</button>`
      : r.url ? `<a class="resource-open" href="${esc(r.url)}" target="_blank" rel="noopener">Open ↗</a>` : '';
    const fileMeta=r.storageFileId ? `<div class="file-meta">${esc(r.fileName||'Stored PDF')} · ${formatBytes(r.fileSize||0)}</div>` : '';
    const remove=r.storageFileId ? `<button class="resource-delete" data-delete-resource="${esc(r.id)}">Delete</button>` : '';
    const studyAction=r.courseId?`<button class="resource-study" data-study-resource="${esc(r.id)}">Study this</button>`:'';
    return `<article class="card resource-card" data-resource-text="${esc((r.title+' '+r.topic+' '+courseName(r.courseId)+' '+r.description+' '+(r.fileName||'')).toLowerCase())}"><div><div class="resource-icon">${icon}</div><h3>${esc(r.title)}</h3><p>${esc(r.description)}</p>${fileMeta}<div class="resource-actions">${action}${studyAction}${remove}</div></div><footer><span><span class="course-dot" style="--course-color:${c?.color||'var(--accent)'}"></span> ${esc(c?.name||'Unassigned')} · ${esc(r.topic||'General')}</span><span>${esc(r.updated||'Synced')}</span></footer></article>`;
  }

  function renderInbox(){
    const items=state.inbox.filter(i=>!i.processed).sort((a,b)=>new Date(b.created)-new Date(a.created));
    return `<div class="inbox-compose"><textarea id="inboxInput" placeholder="Drop something here without organizing it first..."></textarea><button class="btn primary" id="captureInbox">Capture</button></div><div class="section-head"><div><h2>Process later</h2><p>Inbox is temporary staging. Turn each capture into a deadline, material, note, or archive it.</p></div><span class="pill ${knowledgeCloudReady?'success':''}">${knowledgeCloudReady?'Synced':'Local'}</span></div><div class="inbox-list">${items.length?items.map(i=>`<article class="card inbox-item"><div><p>${esc(i.text)}</p><small>Captured ${timeAgo(i.created)}</small></div><div class="button-row"><button class="btn primary" data-organize="${i.id}">Process</button><button class="btn ghost" data-archive="${i.id}">Archive</button></div></article>`).join(''):`<div class="card empty-state"><div class="empty-icon">✓</div><h3>Inbox zero</h3><p>Everything captured has been processed.</p></div>`}</div>`;
  }

  function hasValidDate(value){ const d=new Date(value); return !Number.isNaN(d.getTime()); }
  function duplicateIdCount(items){ const seen=new Set(); let duplicates=0; for(const item of items||[]){ if(!item?.id)continue; if(seen.has(item.id))duplicates++; else seen.add(item.id); } return duplicates; }
  function dataHealthReport(){
    const courseIds=new Set((state.courses||[]).map(c=>c.id).filter(Boolean));
    const assessmentIds=new Set((state.assessments||[]).map(a=>a.id).filter(Boolean));
    const taskIds=new Set((state.tasks||[]).map(t=>t.id).filter(Boolean));
    const issues=[];
    const add=(kind,label,count,repairable=false)=>{if(count>0)issues.push({kind,label,count,repairable});};
    add('links','Deadlines without a valid course',(state.assessments||[]).filter(a=>!courseIds.has(a.courseId)).length,false);
    add('links','Planner tasks without a valid deadline',(state.tasks||[]).filter(t=>!assessmentIds.has(t.assessmentId)).length,true);
    add('links','Adaptive study blocks without a valid deadline',(state.events||[]).filter(e=>e.type==='work'&&String(e.sourceType||'').startsWith('adaptive_planner')&&e.assessmentId&&!assessmentIds.has(e.assessmentId)).length,true);
    add('links','Materials without a valid course',(state.resources||[]).filter(r=>r.courseId&&!courseIds.has(r.courseId)).length,false);
    add('links','Study sessions without a valid course',(state.studySessions||[]).filter(row=>row.courseId&&!courseIds.has(row.courseId)).length,false);
    add('dates','Deadlines with invalid dates',(state.assessments||[]).filter(a=>!hasValidDate(a.due)).length,false);
    add('dates','Calendar blocks with invalid dates',(state.events||[]).filter(e=>!hasValidDate(e.start)||!hasValidDate(e.end)||new Date(e.end)<=new Date(e.start)).length,false);
    add('values','Negative remaining estimates',(state.assessments||[]).filter(a=>Number(a.remaining)<0).length+(state.tasks||[]).filter(t=>Number(t.remaining)<0).length,true);
    const duplicateIds=duplicateIdCount(state.courses)+duplicateIdCount(state.assessments)+duplicateIdCount(state.tasks)+duplicateIdCount(state.events)+duplicateIdCount(state.resources)+duplicateIdCount(state.studySessions);
    add('ids','Duplicate record IDs',duplicateIds,true);
    const repairable=issues.reduce((sum,item)=>sum+(item.repairable?item.count:0),0);
    return {issues,repairable,total:issues.reduce((sum,item)=>sum+item.count,0),clean:issues.length===0};
  }
  function dedupeById(items){
    const seen=new Set(); const out=[];
    for(const item of (items||[]).slice().reverse()){
      const key=item?.id||item?.cloudId||item?.legacyId||'';
      if(key&&seen.has(key))continue;
      if(key)seen.add(key);
      out.push(item);
    }
    return out.reverse();
  }
  function repairDataHealth(){
    const before=dataHealthReport();
    state.courses=dedupeById(state.courses||[]);
    state.assessments=dedupeById(state.assessments||[]).map(a=>({...a,remaining:Math.max(0,Number(a.remaining??a.effort??0)),effort:Math.max(0,Number(a.effort??a.remaining??0))}));
    const assessmentIds=new Set(state.assessments.map(a=>a.id));
    state.tasks=dedupeById(state.tasks||[]).filter(t=>assessmentIds.has(t.assessmentId)||t.cloudId).map(t=>({...t,remaining:Math.max(0,Number(t.remaining??t.estimate??0)),estimate:Math.max(0,Number(t.estimate??t.remaining??0))}));
    const taskIds=new Set(state.tasks.map(t=>t.id));
    state.events=dedupeById(state.events||[]).filter(e=>!(e.type==='work'&&String(e.sourceType||'').startsWith('adaptive_planner')&&e.assessmentId&&!assessmentIds.has(e.assessmentId)&&!e.cloudId)).map(e=>e.taskId&&!taskIds.has(e.taskId)&&String(e.sourceType||'').startsWith('adaptive_planner')&&!e.cloudId?{...e,taskId:''}:e);
    state.resources=dedupeById(state.resources||[]);
    state.studySessions=dedupeById(state.studySessions||[]);
    canonicalizeStateData();
    save();
    const after=dataHealthReport();
    render();
    toast(after.clean?'Data health check passed.':before.repairable>0?'Safe repairs applied. Remaining items need review.':'No automatic repair was needed.');
  }
  function exportStudentHubBackup(){
    try{
      const payload={exportedAt:new Date().toISOString(),app:'Student Hub',formatVersion:1,userScoped:Boolean(cloudUser),state};
      const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
      const url=URL.createObjectURL(blob);
      const a=document.createElement('a');
      a.href=url; a.download=`student-hub-backup-${isoDate(new Date())}.json`; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),1000); toast('Backup downloaded.');
    }catch(error){console.error('Backup export failed:',error);toast('Could not export backup.');}
  }

  function renderSettings(){
    const availability=state.availability||{};
    const syncReady=academicCloudReady&&plannerCloudReady&&knowledgeCloudReady;
    const uniqueTopics=new Set(state.courses.flatMap(c=>dedupeTopics(c.topics||[]).map(topicKey))).size;
    const health=dataHealthReport();
    const healthTitle=health.clean?'Data model looks healthy':`${health.total} data issue${health.total===1?'':'s'} found`;
    const healthCopy=health.clean?'Course, deadline, task, calendar, material and study-session references are internally consistent.':health.repairable?`${health.repairable} issue${health.repairable===1?' is':'s are'} safe to repair automatically. Anything else is left untouched for review.`:'The remaining issues need manual review; Student Hub will not delete uncertain records.';
    return `<div class="settings-grid">
      <article class="card setting-card availability-card"><span class="eyebrow">Planning assumptions</span><h3>Study availability</h3><p>Make capacity personal so overload warnings mean something.</p><div class="setting-field-grid"><label><span>Hours / week</span><input id="capacityInput" type="number" min="1" max="80" step=".5" value="${state.semester.availableMinutesPerWeek/60}"/></label><label><span>Max / day (min)</span><input id="maxDailyInput" type="number" min="30" max="600" step="15" value="${availability.maxDailyMinutes||180}"/></label><label><span>Weekday start</span><input id="weekdayStartInput" type="time" value="${esc(availability.weekdayStart||'16:00')}"/></label><label><span>Weekday end</span><input id="weekdayEndInput" type="time" value="${esc(availability.weekdayEnd||'21:00')}"/></label><label><span>Weekend start</span><input id="weekendStartInput" type="time" value="${esc(availability.weekendStart||'10:00')}"/></label><label><span>Weekend end</span><input id="weekendEndInput" type="time" value="${esc(availability.weekendEnd||'18:00')}"/></label></div><label class="setting-check"><input id="weekendsInput" type="checkbox" ${availability.weekends!==false?'checked':''}/><span>Allow weekend study blocks</span></label><small>Smart Plan still respects existing events and deadlines.</small></article>
      <article class="card setting-card"><span class="eyebrow">Academic data</span><h3>Canonical semester model</h3><p>Course → deadline → task → study block is the single planning chain. Materials and topics attach to that context instead of becoming separate systems.</p><div class="settings-metrics"><span><strong>${state.courses.length}</strong><small>courses</small></span><span><strong>${state.assessments.length}</strong><small>deadlines</small></span><span><strong>${uniqueTopics}</strong><small>topics</small></span></div><span class="pill success">Duplicate naming normalized</span></article>
      <article class="card setting-card data-health-card"><span class="eyebrow">Reliability</span><h3>${esc(healthTitle)}</h3><p>${esc(healthCopy)}</p>${health.issues.length?`<div class="health-issue-list">${health.issues.slice(0,4).map(item=>`<span><strong>${item.count}</strong>${esc(item.label)}</span>`).join('')}${health.issues.length>4?`<small>+ ${health.issues.length-4} more issue type${health.issues.length-4===1?'':'s'}</small>`:''}</div>`:`<div class="health-clean-line"><span>✓</span><small>No orphaned planner links, invalid dates or duplicate record IDs detected.</small></div>`}<div class="button-row settings-actions"><button class="btn secondary" id="runDataHealth">${health.repairable?'Run safe repair':'Run consistency check'}</button><button class="btn ghost" id="exportBackup">Export backup</button></div></article>
      <article class="card setting-card assistant-settings-card"><span class="eyebrow">Student assistant</span><h3>Proactive guidance, without noise</h3><p>Student Hub surfaces only changes that can affect what you should do next. Snoozed items stay quiet for the rest of the day.</p><div class="assistant-pref-list"><label class="setting-check"><input type="checkbox" data-assist-pref="deadlineRisk" ${ensureAssistantPrefs().deadlineRisk?'checked':''}/><span>Deadline-risk explanations</span></label><label class="setting-check"><input type="checkbox" data-assist-pref="slippedPlan" ${ensureAssistantPrefs().slippedPlan?'checked':''}/><span>Slipped-plan recovery</span></label><label class="setting-check"><input type="checkbox" data-assist-pref="reviewDue" ${ensureAssistantPrefs().reviewDue?'checked':''}/><span>Review reminders</span></label><label class="setting-check"><input type="checkbox" data-assist-pref="inbox" ${ensureAssistantPrefs().inbox?'checked':''}/><span>Inbox cleanup reminders</span></label><label class="setting-check"><input type="checkbox" data-assist-pref="dataHealth" ${ensureAssistantPrefs().dataHealth?'checked':''}/><span>Reliability warnings</span></label><label class="setting-check"><input type="checkbox" data-assist-pref="browser" ${ensureAssistantPrefs().browser?'checked':''}/><span>Browser reminders while Student Hub is open</span></label></div><small>Browser reminders are optional and are not background push notifications. They only work while this site is open and your browser permission is granted.</small><div class="button-row settings-actions"><button class="btn secondary" id="openAssistantSettings">Open action center</button></div></article>
      <article class="card setting-card"><span class="eyebrow">Sync</span><h3>${syncReady?'Everything important is synced':'Some data is local'}</h3><p>${syncReady?'Courses, deadlines, plans, materials, Inbox and study history are available across signed-in devices.':'Student Hub will keep working locally where possible, but one or more cloud data groups need attention.'}</p><span class="pill ${syncReady?'success':'warning'}">${syncReady?'Synced':'Check setup'}</span></article>
      <article class="card setting-card"><span class="eyebrow">Onboarding</span><h3>Semester setup</h3><p>Replay the setup guide without deleting existing data.</p><button class="btn secondary" id="restartOnboarding">Open setup guide</button></article>
    </div><details class="card technical-settings"><summary><span>Technical diagnostics</span><small>Appwrite storage, database, Academic AI and local data integrity</small></summary><div class="technical-grid"><div><strong>Academic data</strong><small>${academicCloudReady?'ready':'needs attention'}</small></div><div><strong>Planner data</strong><small>${plannerCloudReady?'ready':'needs attention'}</small></div><div><strong>Knowledge data</strong><small>${knowledgeCloudReady?'ready':'needs attention'}</small></div><div><strong>Private files</strong><small>${window.studentHubCloud?.storage?'ready':'needs attention'}</small></div><div><strong>Academic AI</strong><small>${window.studentHubCloud?.functions?'client ready':'needs attention'}</small></div><div><strong>Data integrity</strong><small>${health.clean?'healthy':`${health.total} issue${health.total===1?'':'s'}`}</small></div></div></details>`;
  }

  function bindPageEvents(){
    qsa('[data-route-jump]').forEach(b=>b.onclick=()=>setRoute(b.dataset.routeJump));
    qsa('[data-start-focus]').forEach(b=>b.onclick=()=>startFocusForAssessment(b.dataset.startFocus));
    qsa('[data-plan]').forEach(b=>b.onclick=()=>openPlannerPreview({assessmentId:b.dataset.plan}));
    qsa('[data-preview-plan]').forEach(b=>b.onclick=()=>openPlannerPreview({assessmentId:b.dataset.previewPlan}));
    qsa('[data-course]').forEach(b=>b.onclick=()=>{activeCourseId=b.dataset.course; activeCourseTab='overview'; render();});
    qsa('[data-open-course-id]').forEach(b=>b.onclick=()=>{activeCourseId=b.dataset.openCourseId;activeCourseTab='overview';state.route='courses';save();render();});
    qs('#backCourses')?.addEventListener('click',()=>{activeCourseId=null;render();});
    qsa('[data-course-tab]').forEach(b=>b.onclick=()=>{activeCourseTab=b.dataset.courseTab;render();});
    qs('#openImport')?.addEventListener('click',openImport);
    qs('#openAddCourse')?.addEventListener('click',openCourseModal);
    qs('#startOnboarding')?.addEventListener('click',()=>openOnboarding(1));
    qs('#openQuickAddToday')?.addEventListener('click',()=>openQuickAdd());
    qs('#openAssistantToday')?.addEventListener('click',()=>openAssistantPanel());
    qs('#openAssistantSettings')?.addEventListener('click',()=>openAssistantPanel());
    qs('#autoPlan')?.addEventListener('click',()=>openPlannerPreview({all:true}));
    qs('#smartPlanAll')?.addEventListener('click',()=>openPlannerPreview({all:true}));
    qs('#smartPlanToday')?.addEventListener('click',()=>openPlannerPreview({all:true}));
    qs('#reviewPlanRepair')?.addEventListener('click',openPlannerRepairPreview);
    qs('#plannerPrevPeriod')?.addEventListener('click',()=>{ const p=ensurePlannerPrefs(); if(p.view==='month')plannerMonthOffset--; else plannerWeekOffset--; render(); });
    qs('#plannerNextPeriod')?.addEventListener('click',()=>{ const p=ensurePlannerPrefs(); if(p.view==='month')plannerMonthOffset++; else plannerWeekOffset++; render(); });
    qs('#plannerToday')?.addEventListener('click',()=>{plannerWeekOffset=0;plannerMonthOffset=0;render();});
    qsa('[data-planner-view]').forEach(b=>b.onclick=()=>{const p=ensurePlannerPrefs();p.view=b.dataset.plannerView;save();render();});
    qsa('[data-planner-lens]').forEach(b=>b.onclick=()=>{const p=ensurePlannerPrefs();p.lens=b.dataset.plannerLens;save();render();});
    qsa('[data-planner-course-filter]').forEach(b=>b.onclick=()=>{const p=ensurePlannerPrefs();p.courseId=b.dataset.plannerCourseFilter;save();render();});
    qsa('[data-planner-type-filter]').forEach(b=>b.onclick=()=>{const p=ensurePlannerPrefs();p.assessmentType=b.dataset.plannerTypeFilter;save();render();});
    qsa('[data-planner-layer]').forEach(b=>b.onclick=()=>{const p=ensurePlannerPrefs();const key=b.dataset.plannerLayer;p.layers[key]=!p.layers[key];save();render();});
    qs('#plannerDensity')?.addEventListener('click',()=>{const p=ensurePlannerPrefs();p.density=p.density==='compact'?'comfortable':'compact';save();render();});
    qsa('[data-toggle-work-group]').forEach(b=>b.onclick=()=>{const key=b.dataset.toggleWorkGroup; if(plannerExpandedGroups.has(key))plannerExpandedGroups.delete(key);else plannerExpandedGroups.add(key);render();});
    qsa('[data-jump-day]').forEach(b=>b.onclick=()=>{const target=new Date(`${b.dataset.jumpDay}T12:00:00`); const diff=Math.round((weekStart(target)-weekStart())/(7*DAY)); plannerWeekOffset=diff; ensurePlannerPrefs().view='week'; save();render();});
    qsa('[data-task-done]').forEach(b=>b.onclick=()=>markTaskDone(b.dataset.taskDone));
    bindDragDrop();
    qs('#studyTargetSelect')?.addEventListener('change',e=>setStudyTarget(e.target.value));
    qs('#studyCourseSelect')?.addEventListener('change',e=>setStudyCourse(e.target.value));
    qsa('[data-duration-minutes]').forEach(b=>b.onclick=()=>setTimerDurationMinutes(Number(b.dataset.durationMinutes)));
    qs('#timerMinus')?.addEventListener('click',()=>adjustTimerMinutes(-5));
    qs('#timerPlus')?.addEventListener('click',()=>adjustTimerMinutes(5));
    qs('#focusModeToggle')?.addEventListener('click',()=>setFocusMode(!focusMode));
    qs('#focusModeExit')?.addEventListener('click',()=>setFocusMode(false));
    qs('#timerToggle')?.addEventListener('click',toggleTimer);
    qs('#timerReset')?.addEventListener('click',()=>{stopTimer();state.timer.seconds=state.timer.initialSeconds||25*60;state.timer.running=false;save();render();});
    qs('#finishSession')?.addEventListener('click',finishStudySession);
    qs('#showAnswer')?.addEventListener('click',()=>qs('#practiceAnswer')?.classList.toggle('hidden'));
    qs('#nextQuestion')?.addEventListener('click',()=>{state.practiceIndex=(state.practiceIndex+1)%practiceBank.length;save();render();});
    qs('#librarySearch')?.addEventListener('input',e=>{const q=e.target.value.toLowerCase();qsa('[data-resource-text]').forEach(card=>card.style.display=card.dataset.resourceText.includes(q)?'':'none');});
    qs('#openAddResource')?.addEventListener('click',()=>{resourceContextCourseId=libraryCourseFilter==='all'?'':libraryCourseFilter;openResourceModal();});
    qsa('[data-library-course]').forEach(b=>b.onclick=()=>{libraryCourseFilter=b.dataset.libraryCourse||'all';libraryTopicFilter='';render();});
    qs('#clearLibraryTopic')?.addEventListener('click',()=>{libraryTopicFilter='';render();});
    qsa('[data-open-library-course]').forEach(b=>b.onclick=()=>{libraryCourseFilter=b.dataset.openLibraryCourse||'all';libraryTopicFilter='';setRoute('library');});
    qsa('[data-open-library-topic]').forEach(b=>b.onclick=()=>{libraryCourseFilter=b.dataset.openLibraryTopicCourse||'all';libraryTopicFilter=b.dataset.openLibraryTopic||'';setRoute('library');});
    qsa('[data-add-resource-course]').forEach(b=>b.onclick=()=>{resourceContextCourseId=b.dataset.addResourceCourse||'';openResourceModal();});
    qsa('[data-open-library-resource]').forEach(b=>b.onclick=()=>{const r=state.resources.find(x=>x.id===b.dataset.openLibraryResource);if(!r)return;if(r.storageFileId)return openStoredResource(r.id);if(r.url){window.open(r.url,'_blank','noopener');return;}libraryCourseFilter=r.courseId||'all';libraryTopicFilter=r.topic||'';setRoute('library');});
    qsa('[data-open-resource]').forEach(b=>b.onclick=()=>openStoredResource(b.dataset.openResource));
    qsa('[data-study-resource]').forEach(b=>b.onclick=()=>startStudyFromResource(b.dataset.studyResource));
    qsa('[data-delete-resource]').forEach(b=>b.onclick=()=>deleteStoredResource(b.dataset.deleteResource));
    qs('#captureInbox')?.addEventListener('click',captureInboxItem);
    qsa('[data-organize]').forEach(b=>b.onclick=()=>{const i=state.inbox.find(x=>x.id===b.dataset.organize); if(!i)return; openQuickAdd(i.text, i.id);});
    qsa('[data-archive]').forEach(b=>b.onclick=()=>archiveInboxItem(b.dataset.archive));
    qs('#capacityInput')?.addEventListener('change',e=>{state.semester.availableMinutesPerWeek=Math.round(Number(e.target.value||14)*60);save();toast('Weekly capacity updated.');});
    qs('#maxDailyInput')?.addEventListener('change',e=>{state.availability.maxDailyMinutes=clamp(Math.round(Number(e.target.value||180)),30,600);save();});
    qs('#weekdayStartInput')?.addEventListener('change',e=>{state.availability.weekdayStart=e.target.value||'16:00';save();});
    qs('#weekdayEndInput')?.addEventListener('change',e=>{state.availability.weekdayEnd=e.target.value||'21:00';save();});
    qs('#weekendStartInput')?.addEventListener('change',e=>{state.availability.weekendStart=e.target.value||'10:00';save();});
    qs('#weekendEndInput')?.addEventListener('change',e=>{state.availability.weekendEnd=e.target.value||'18:00';save();});
    qs('#weekendsInput')?.addEventListener('change',e=>{state.availability.weekends=e.target.checked;save();});
    qs('#runDataHealth')?.addEventListener('click',repairDataHealth);
    qs('#exportBackup')?.addEventListener('click',exportStudentHubBackup);
    qs('#restartOnboarding')?.addEventListener('click',()=>{state.onboarding={dismissed:false,step:1};save();openOnboarding(1);});
    qsa('[data-assist-pref]').forEach(input=>input.addEventListener('change',async e=>{
      const key=e.target.dataset.assistPref, prefs=ensureAssistantPrefs();
      if(key==='browser'&&e.target.checked){
        if(!('Notification' in window)){ prefs.browser=false; e.target.checked=false; toast('Browser notifications are not supported here.'); return; }
        let permission=Notification.permission;
        if(permission==='default') permission=await Notification.requestPermission();
        if(permission!=='granted'){ prefs.browser=false; e.target.checked=false; toast('Browser reminder permission was not granted.'); save(); return; }
      }
      prefs[key]=Boolean(e.target.checked); save(); render();
    }));
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

  function buildPlannerPreview({assessmentId='',courseId=''}={}){
    const prefs=ensurePlannerPrefs();
    let candidates=assessmentId?[assessment(assessmentId)].filter(Boolean):planningCandidates({courseId:courseId||(prefs.courseId==='all'?'':prefs.courseId),limit:50});
    candidates=candidates.filter(a=>a.status!=='done'&&new Date(a.due)>new Date()&&plannerAssessmentMatches(a)).sort((a,b)=>planningPriority(b)-planningPriority(a));
    const blocks=[], warnings=[];
    for(const a of candidates){
      const existing=(state.tasks||[]).filter(t=>t.assessmentId===a.id&&t.status!=='done').sort((x,y)=>x.position-y.position);
      const taskDrafts=existing.length?existing:buildTaskDrafts(a);
      for(const task of taskDrafts){
        let left=Math.max(0,Number(task.remaining??task.estimate??0)- (existing.length?plannedMinutesForTask(task.id):0));
        while(left>5 && blocks.length<120){
          const requested=Math.min(preferredSessionMinutes(a),left);
          const slot=findPlanningSlot(a,requested,blocks);
          if(!slot){ warnings.push({assessmentId:a.id,title:a.title,minutes:left,reason:'No remaining slot fits before the deadline without crossing capacity.'}); break; }
          blocks.push({id:uid('preview'),type:'work',status:'preview',courseId:a.courseId,assessmentId:a.id,taskId:existing.length?task.id:'',taskPosition:Number(task.position||0),taskTitle:task.title,title:`${a.title} · ${task.title}`,start:slot.start.toISOString(),end:slot.end.toISOString(),sourceType:'adaptive_planner_v09'});
          left-=slot.duration;
        }
      }
    }
    return {mode:'plan',blocks,warnings,candidates,generatedAt:new Date().toISOString()};
  }
  function plannerPreviewSummary(preview){
    const mins=(preview.blocks||[]).reduce((s,e)=>s+eventMinutes(e),0);
    const unscheduled=(preview.warnings||[]).reduce((s,w)=>s+Number(w.minutes||0),0);
    const weeks=new Set((preview.blocks||[]).map(e=>isoDate(weekStart(e.start))));
    return {mins,unscheduled,weeks:weeks.size};
  }
  function openPlannerPreview(options={}){
    if(!plannerCloudReady||!cloudUser||!cloudSemester){toast('Planner sync is not ready. Open Settings → Technical diagnostics.');return;}
    plannerPreview=buildPlannerPreview(options);
    renderPlannerPreviewModal();
    openModal(qs('#plannerPreviewModal'));
  }
  function openPlannerRepairPreview(){
    if(!plannerCloudReady){toast('Planner cloud is not ready.');return;}
    plannerPreview=plannerRepairPreview();
    renderPlannerPreviewModal();
    openModal(qs('#plannerPreviewModal'));
  }
  function renderPlannerPreviewModal(){
    const host=qs('#plannerPreviewContent'), title=qs('#plannerPreviewTitle'), eyebrow=qs('#plannerPreviewEyebrow'), apply=qs('#applyPlannerPreview');
    if(!host||!plannerPreview)return;
    if(plannerPreview.mode==='repair'){
      eyebrow.textContent='Plan recovery preview'; title.textContent='Review what needs to be rebuilt';
      const items=plannerPreview.remove||[];
      const manual=plannerPreview.manual||[], manualMissed=plannerPreview.manualMissed||[], overBy=Number(plannerPreview.overBy||0), slipped=Number(plannerPreview.slipped||0);
      apply.textContent=slipped?'Clean up & replan':'Apply repair';
      host.innerHTML=`<div class="preview-summary-grid"><div><span>Safe to clean</span><strong>${items.length}</strong></div><div><span>Slipped sessions</span><strong>${slipped}</strong></div><div><span>Manual / legacy blocks</span><strong>${manual.length}</strong></div><div><span>Over capacity</span><strong>${formatMinutes(overBy)}</strong></div></div><div class="preview-explainer"><strong>${items.length?'Recovery is previewed before anything changes':'Why Student Hub did not auto-repair this'}</strong><p>${items.length?`Only Student Hub-generated planner blocks that are missed or no longer valid are eligible. Fixed classes, manual blocks, completed sessions, and deadlines remain untouched. After cleanup, Student Hub will immediately show replacement sessions for review.`:`The overload is coming from manual or legacy work blocks, so Student Hub will not silently remove them. Review those blocks in Planner, or change your weekly capacity.`}</p></div><div class="preview-list">${items.length?items.map(item=>{const e=item.event,c=course(e.courseId);return `<div class="preview-row" style="--row-color:${c?.color||'var(--accent)'}"><span>${fmtDate(e.start,{weekday:'short',month:'short',day:'numeric'})}<small>${fmtTime(e.start)}–${fmtTime(e.end)}</small></span><div><strong>${esc(e.title)}</strong><small>${esc(item.reason)}</small></div><span class="preview-remove">Remove</span></div>`;}).join(''):(manualMissed.length?manualMissed:manual).length?(manualMissed.length?manualMissed:manual).map(e=>{const c=course(e.courseId);return `<div class="preview-row manual-only" style="--row-color:${c?.color||'var(--accent)'}"><span>${fmtDate(e.start,{weekday:'short',month:'short',day:'numeric'})}<small>${fmtTime(e.start)}–${fmtTime(e.end)}</small></span><div><strong>${esc(e.title)}</strong><small>Manual / legacy block · ${eventMinutes(e)}m</small></div><span class="preview-keep">Keep</span></div>`;}).join(''):`<div class="empty-state compact"><div class="empty-icon">✓</div><h3>No repair needed</h3><p>The adaptive blocks already fit their planning windows and capacity.</p></div>`}</div>`;
      apply.disabled=!items.length;
    }else{
      eyebrow.textContent='Smart Plan Preview'; title.textContent='Review the proposed study plan'; apply.textContent='Apply plan';
      const s=plannerPreviewSummary(plannerPreview), blocks=plannerPreview.blocks||[];
      const grouped=new Map(); blocks.forEach(e=>{const k=isoDate(e.start);if(!grouped.has(k))grouped.set(k,[]);grouped.get(k).push(e);});
      host.innerHTML=`<div class="preview-summary-grid"><div><span>New sessions</span><strong>${blocks.length}</strong></div><div><span>Study time placed</span><strong>${formatMinutes(s.mins)}</strong></div><div><span>Weeks used</span><strong>${s.weeks||0}</strong></div><div class="${s.unscheduled?'warning':''}"><span>Could not place</span><strong>${formatMinutes(s.unscheduled)}</strong></div></div><div class="preview-explainer"><strong>Nothing has been saved yet.</strong><p>Sessions are fitted after fixed commitments, inside each assessment's planning window, and under your weekly capacity. Session length also learns from your recorded focus history when available.</p></div>${plannerPreview.warnings?.length?`<div class="preview-warning">${plannerPreview.warnings.length} item${plannerPreview.warnings.length===1?'':'s'} could not fully fit. The remaining work stays on the Unscheduled shelf.</div>`:''}<div class="preview-days">${[...grouped.entries()].sort((a,b)=>a[0].localeCompare(b[0])).map(([date,items])=>`<section><header><strong>${fmtDate(`${date}T12:00:00`,{weekday:'long',month:'short',day:'numeric'})}</strong><span>${formatMinutes(items.reduce((sum,e)=>sum+eventMinutes(e),0))}</span></header>${items.map(e=>{const a=assessment(e.assessmentId),c=course(e.courseId);return `<div class="preview-row" style="--row-color:${c?.color||'var(--accent)'}"><span>${fmtTime(e.start)}<small>${eventMinutes(e)}m</small></span><div><strong>${esc(e.title)}</strong><small>${esc(c?.name||'Course')} · due ${fmtDate(a?.due,{month:'short',day:'numeric'})} · ${priorityDescriptor(a).level} priority</small></div><span class="preview-add">+ Add</span></div>`;}).join('')}</section>`).join('')||'<div class="empty-state compact"><div class="empty-icon">✓</div><h3>No new sessions needed</h3><p>Visible upcoming work is already covered, or no safe slots remain before its deadlines.</p></div>'}</div>`;
      apply.disabled=!blocks.length;
    }
  }
  async function applyPlannerPreview(){
    if(!plannerPreview)return;
    const button=qs('#applyPlannerPreview'); if(button){button.disabled=true;button.textContent=plannerPreview.mode==='repair'?'Repairing…':'Saving…';}
    try{
      if(plannerPreview.mode==='repair'){
        let removed=0;
        for(const item of plannerPreview.remove||[]){
          const e=item.event;
          if(e.cloudId&&window.studentHubCloud.deleteWorkBlock) await window.studentHubCloud.deleteWorkBlock(e.cloudId);
          state.events=state.events.filter(x=>x.id!==e.id); removed++;
        }
        save(); render(); updateCloudStatusCard();
        const replacement=buildPlannerPreview({});
        plannerPreview=replacement;
        if((replacement.blocks||[]).length || (replacement.warnings||[]).length){
          renderPlannerPreviewModal();
          toast(`Cleaned ${removed} outdated planner block${removed===1?'':'s'}. Review the replacement sessions before saving.`);
        }else{
          closeModals(); plannerPreview=null;
          toast(`Plan recovered: ${removed} outdated planner block${removed===1?'':'s'} removed. No replacement sessions are needed.`);
        }
        return;
      }
      const blocks=plannerPreview.blocks||[];
      const taskCache=new Map(); let made=0;
      for(const block of blocks){
        if(!taskCache.has(block.assessmentId)) taskCache.set(block.assessmentId,await ensureTasksForAssessment(assessment(block.assessmentId)));
        const tasks=taskCache.get(block.assessmentId)||[];
        const task=block.taskId?tasks.find(t=>t.id===block.taskId):tasks.find(t=>Number(t.position||0)===Number(block.taskPosition||0))||tasks.find(t=>t.title===block.taskTitle)||tasks[0];
        if(!task) continue;
        const draft={id:uid('wb'),courseId:block.courseId,assessmentId:block.assessmentId,taskId:task.id,title:block.title,type:'work',start:block.start,end:block.end,status:'planned',sourceType:'adaptive_planner_v09'};
        const row=await window.studentHubCloud.createWorkBlock(cloudUser,cloudSemester,draft,draft.id);
        state.events.push(rowToWorkBlock(row)); made++;
      }
      save(); closeModals(); render(); updateCloudStatusCard(); toast(`Smart Plan applied: ${made} study session${made===1?'':'s'} added.`); plannerPreview=null;
    }catch(error){console.error('Planner preview apply failed:',error);toast('Could not finish applying the planner changes. Some earlier sessions may already be saved; refresh Planner and review Plan Health.');renderPlannerPreviewModal();}
    finally{if(button&&!plannerPreview){button.disabled=false;}}
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
    const configured=Number(state.availability?.maxDailyMinutes||0);
    if(configured>0) return clamp(Math.round(configured),30,600);
    return Math.max(90,Math.min(240,Math.round((state.semester.availableMinutesPerWeek||840)/5)));
  }

  function candidateWindowsForDay(day,flexible=false){
    const dow=new Date(day).getDay(), weekend=dow===0||dow===6, a=state.availability||{};
    if(weekend&&a.weekends===false) return [];
    const preferred=weekend?[a.weekendStart||'10:00',a.weekendEnd||'18:00']:[a.weekdayStart||'16:00',a.weekdayEnd||'21:00'];
    if(flexible){
      const widened=weekend?['09:00','20:30']:['08:00','21:30'];
      return [preferred,widened].filter((x,i,arr)=>arr.findIndex(y=>y[0]===x[0]&&y[1]===x[1])===i);
    }
    return [preferred];
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
    if(!plannerCloudReady || !cloudUser || !cloudSemester){ if(!options.silent)toast('Planner sync is not ready. Open Settings → Technical diagnostics.'); return 0; }
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
        else if(made) toast(`Smart plan created ${made} study block${made!==1?'s':''}.`);
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
    openPlannerPreview({courseId:options?.courseId||'',all:true});
    return 0;
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
    }catch(error){ task.remaining=oldRemaining; console.error(error); toast('Could not sync the completed task.'); }
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
          try{ await window.studentHubCloud.updateWorkBlock(ev.cloudId,{start:ev.start,end:ev.end}); toast('Study block moved.'); }
          catch(error){ console.error(error); ev.start=oldStart; ev.end=oldEnd; save(); render(); toast('Could not sync that move. Change reverted.'); }
        }else toast('Study block moved locally.');
      });
    });
  }

  function studyProgressSnapshot(minutes){
    const ctx=state.timer?.context||{};
    const task=(state.tasks||[]).find(t=>t.id===ctx.taskId&&t.status!=='done')||null;
    const a=assessment(ctx.assessmentId||task?.assessmentId)||null;
    const c=course(ctx.courseId||task?.courseId||a?.courseId)||null;
    const remaining=Math.max(0,Number(task?.remaining??a?.remaining??0));
    return {
      minutes:Math.max(1,Math.round(Number(minutes)||1)),
      taskId:task?.id||'',
      assessmentId:a?.id||'',
      courseId:c?.id||ctx.courseId||'',
      topic:ctx.topic||a?.topics?.[0]||task?.title||'Focused study',
      targetTitle:task?(a?`${a.title} · ${task.title}`:task.title):(a?.title||ctx.topic||'Focused study'),
      remainingBefore:remaining,
      outcome:'progress',
      creditedMinutes:Math.min(Math.max(1,Math.round(Number(minutes)||1)),remaining||Math.max(1,Math.round(Number(minutes)||1))),
      extraMinutes:30
    };
  }

  function beginStudyCompletion(minutes){
    const snapshot=studyProgressSnapshot(minutes);
    if(!snapshot.taskId&&!snapshot.assessmentId){
      recordStudySession(snapshot.minutes);
      return;
    }
    pendingStudyReflection=snapshot;
    renderStudyReflectionModal();
    openModal(qs('#studyReflectionModal'));
  }

  function renderStudyReflectionModal(){
    const p=pendingStudyReflection, host=qs('#studyReflectionContent');
    if(!p||!host)return;
    const task=(state.tasks||[]).find(t=>t.id===p.taskId)||null;
    const a=assessment(p.assessmentId)||null;
    const c=course(p.courseId||task?.courseId||a?.courseId)||null;
    const remaining=Math.max(0,Number(task?.remaining??a?.remaining??p.remainingBefore??0));
    p.remainingBefore=remaining;
    p.creditedMinutes=clamp(Math.round(Number(p.creditedMinutes)||0),0,Math.max(remaining,720));
    p.extraMinutes=clamp(Math.round(Number(p.extraMinutes)||0),0,720);
    const projected=p.outcome==='done'?0:Math.max(0,remaining-p.creditedMinutes)+(p.outcome==='more'?p.extraMinutes:0);
    const targetKind=task?'planner task':a?'deadline':'focus target';
    host.innerHTML=`<div class="study-reflection-summary"><div><span>Session</span><strong>${formatMinutes(p.minutes)}</strong></div><div><span>Target</span><strong>${esc(p.targetTitle)}</strong><small>${esc(c?.name||'Study')} · ${targetKind}</small></div><div><span>Before</span><strong>${formatMinutes(remaining)}</strong><small>estimated work left</small></div><div><span>After</span><strong>${formatMinutes(projected)}</strong><small>if you save this check-in</small></div></div>
      <div class="reflection-question"><strong>How should this session change the plan?</strong><p>Choose the closest result. You can adjust the minutes before saving.</p></div>
      <div class="reflection-outcomes">
        <button type="button" class="reflection-choice ${p.outcome==='done'?'active':''}" data-study-outcome="done"><span class="reflection-icon">✓</span><div><strong>Finished</strong><small>Mark this ${task?'task':'deadline'} complete and retire its future study blocks.</small></div></button>
        <button type="button" class="reflection-choice ${p.outcome==='progress'?'active':''}" data-study-outcome="progress"><span class="reflection-icon">→</span><div><strong>Made progress</strong><small>Reduce the work left by the time that actually moved the task forward.</small></div></button>
        <button type="button" class="reflection-choice ${p.outcome==='more'?'active':''}" data-study-outcome="more"><span class="reflection-icon">+</span><div><strong>Needs more time</strong><small>Count this session, then increase the remaining estimate because the work is harder than expected.</small></div></button>
      </div>
      ${p.outcome==='done'?`<div class="reflection-note success"><strong>Planner effect</strong><span>Future auto-generated study blocks for this target will be removed. Other courses and manual calendar items stay unchanged.</span></div>`:`<div class="reflection-adjust-grid"><label><span>Count as progress</span><div class="reflection-input"><input id="reflectionCredit" type="number" min="0" max="720" step="5" value="${p.creditedMinutes}"/><em>min</em></div><small>Defaulted to your ${p.minutes}-minute session.</small></label>${p.outcome==='more'?`<label><span>Add to estimate</span><div class="reflection-input"><input id="reflectionExtra" type="number" min="0" max="720" step="5" value="${p.extraMinutes}"/><em>min</em></div><small>Add only the extra time you now think is still needed.</small></label>`:''}</div>`}
      ${a&&!task?`<div class="reflection-note"><strong>Deadline-level focus</strong><span>If this deadline already has planner tasks, progress is applied across the open tasks in order so the task breakdown and calendar stay consistent.</span></div>`:''}`;
    host.querySelectorAll('[data-study-outcome]').forEach(b=>b.onclick=()=>{p.outcome=b.dataset.studyOutcome;renderStudyReflectionModal();});
    host.querySelector('#reflectionCredit')?.addEventListener('change',e=>{p.creditedMinutes=clamp(Math.round(Number(e.target.value)||0),0,720);renderStudyReflectionModal();});
    host.querySelector('#reflectionExtra')?.addEventListener('change',e=>{p.extraMinutes=clamp(Math.round(Number(e.target.value)||0),0,720);renderStudyReflectionModal();});
  }

  async function retireWorkBlocks(blocks){
    const list=(blocks||[]).filter(Boolean);
    if(!list.length)return 0;
    const retired=new Set();
    for(const block of list){
      if(plannerCloudReady&&block.cloudId) await window.studentHubCloud.updateWorkBlock(block.cloudId,{status:'done'});
      retired.add(block.id);
    }
    state.events=state.events.filter(e=>!retired.has(e.id));
    return retired.size;
  }

  async function reconcileAdaptiveBlocksForTask(task,newRemaining){
    if(!task)return {retired:0,trimmed:0};
    const now=new Date();
    const activeFuture=state.events.filter(e=>e.type==='work'&&e.status!=='done'&&e.taskId===task.id&&new Date(e.end)>now);
    const manualMinutes=activeFuture.filter(e=>!String(e.sourceType||'').startsWith('adaptive_planner')).reduce((sum,e)=>sum+eventMinutes(e),0);
    const adaptive=activeFuture.filter(e=>String(e.sourceType||'').startsWith('adaptive_planner')).sort((a,b)=>new Date(b.start)-new Date(a.start));
    let excess=Math.max(0,adaptive.reduce((sum,e)=>sum+eventMinutes(e),0)-Math.max(0,Number(newRemaining||0)-manualMinutes));
    if(excess<5)return {retired:0,trimmed:0};
    let retired=0, trimmed=0;
    const retire=[];
    for(const block of adaptive){
      if(excess<5)break;
      const mins=eventMinutes(block);
      if(excess>=mins-4){ retire.push(block); excess=Math.max(0,excess-mins); retired++; continue; }
      const keep=Math.max(5,mins-excess);
      const nextEnd=new Date(new Date(block.start).getTime()+keep*60000).toISOString();
      if(plannerCloudReady&&block.cloudId) await window.studentHubCloud.updateWorkBlock(block.cloudId,{end:nextEnd});
      block.end=nextEnd; trimmed++; excess=0;
    }
    if(retire.length)await retireWorkBlocks(retire);
    return {retired,trimmed};
  }

  function taskStatusFromRemaining(task,remaining){
    if(remaining<=0)return 'done';
    return 'in_progress';
  }

  async function setTaskProgress(task,newRemaining,{retireAll=false}={}){
    if(!task)return;
    const remaining=Math.max(0,Math.round(Number(newRemaining)||0));
    const status=taskStatusFromRemaining(task,remaining);
    if(plannerCloudReady&&task.cloudId) await window.studentHubCloud.updateTask(task.cloudId,{remaining,status});
    task.remaining=remaining; task.status=status;
    if(retireAll||remaining===0){
      const blocks=state.events.filter(e=>e.type==='work'&&e.status!=='done'&&e.taskId===task.id);
      await retireWorkBlocks(blocks);
    }else await reconcileAdaptiveBlocksForTask(task,remaining);
  }

  async function syncAssessmentFromTasks(a){
    if(!a)return;
    const linked=(state.tasks||[]).filter(t=>t.assessmentId===a.id);
    if(!linked.length)return;
    const remaining=linked.filter(t=>t.status!=='done').reduce((sum,t)=>sum+Math.max(0,Number(t.remaining||0)),0);
    const status=remaining<=0?'done':linked.some(t=>t.status==='in_progress')?'in_progress':'not_started';
    if(academicCloudReady&&a.cloudId) await window.studentHubCloud.updateAssessment(a.cloudId,{remaining,status});
    a.remaining=remaining; a.status=status;
  }

  async function applyStudyReflectionProgress(){
    const p=pendingStudyReflection;
    if(!p)return {message:'Session saved.'};
    const a=assessment(p.assessmentId)||null;
    const task=(state.tasks||[]).find(t=>t.id===p.taskId)||null;
    const outcome=p.outcome||'progress';
    const credit=Math.max(0,Math.round(Number(p.creditedMinutes)||0));
    const extra=Math.max(0,Math.round(Number(p.extraMinutes)||0));

    if(task){
      const before=Math.max(0,Number(task.remaining||0));
      const after=outcome==='done'?0:Math.max(0,before-credit)+(outcome==='more'?extra:0);
      await setTaskProgress(task,after,{retireAll:outcome==='done'||after===0});
      if(a)await syncAssessmentFromTasks(a);
      return {message:after===0?`${task.title} completed.`:`${formatMinutes(after)} remains for ${task.title}.`};
    }

    if(a){
      const openTasks=(state.tasks||[]).filter(t=>t.assessmentId===a.id&&t.status!=='done').sort((x,y)=>Number(x.position||0)-Number(y.position||0));
      if(openTasks.length){
        if(outcome==='done'){
          for(const t of openTasks)await setTaskProgress(t,0,{retireAll:true});
        }else{
          let left=credit;
          for(const t of openTasks){
            if(left<=0)break;
            const before=Math.max(0,Number(t.remaining||0));
            const used=Math.min(before,left);
            await setTaskProgress(t,before-used,{retireAll:before-used<=0});
            left-=used;
          }
          if(outcome==='more'&&extra>0){
            const target=openTasks.find(t=>t.status!=='done')||openTasks[openTasks.length-1];
            await setTaskProgress(target,Math.max(0,Number(target.remaining||0))+extra);
          }
        }
        await syncAssessmentFromTasks(a);
      }else{
        const before=Math.max(0,Number(a.remaining||0));
        const after=outcome==='done'?0:Math.max(0,before-credit)+(outcome==='more'?extra:0);
        const status=after<=0?'done':'in_progress';
        if(academicCloudReady&&a.cloudId)await window.studentHubCloud.updateAssessment(a.cloudId,{remaining:after,status});
        a.remaining=after; a.status=status;
        if(after===0){
          const blocks=state.events.filter(e=>e.type==='work'&&e.status!=='done'&&e.assessmentId===a.id);
          await retireWorkBlocks(blocks);
        }
      }
      return {message:a.remaining<=0?`${a.title} completed.`:`${formatMinutes(a.remaining)} remains for ${a.title}.`};
    }
    return {message:'Session saved.'};
  }

  async function saveStudyReflection(){
    const p=pendingStudyReflection;
    if(!p)return closeModals();
    const button=qs('#saveStudyReflection');
    if(button){button.disabled=true;button.textContent='Saving…';}
    try{
      const result=await applyStudyReflectionProgress();
      pendingStudyReflection=null;
      closeModals();
      await recordStudySession(p.minutes,{toastMessage:result.message,sourceType:`focus_${p.outcome||'progress'}`});
    }catch(error){
      console.error('Study progress update failed:',error);
      toast('Could not update the plan yet. Your timer is still paused, so you can retry this check-in.');
      if(button){button.disabled=false;button.textContent='Save progress';}
    }
  }

  function toggleTimer(){ state.timer.running=!state.timer.running; save(); if(state.timer.running) startTimer(); else stopTimer(); render(); }
  function startTimer(){ stopTimer(false); state.timer.running=true; if(!state.timer.initialSeconds||state.timer.initialSeconds<state.timer.seconds)state.timer.initialSeconds=state.timer.seconds; timerHandle=setInterval(()=>{ if(!state.timer.running)return; state.timer.seconds=Math.max(0,state.timer.seconds-1); const el=qs('#timerDisplay'); if(el)el.textContent=formatTimer(state.timer.seconds); if(state.timer.seconds===0){ stopTimer(); state.timer.running=false; const minutes=Math.max(1,Math.round((state.timer.initialSeconds||25*60)/60)); beginStudyCompletion(minutes); } },1000); }
  function stopTimer(setFalse=true){ if(timerHandle)clearInterval(timerHandle);timerHandle=null;if(setFalse)state.timer.running=false; }
  function formatTimer(s){ const m=Math.floor(s/60), sec=s%60;return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`; }

  function finishStudySession(){
    const initial=state.timer.initialSeconds||25*60; const elapsed=Math.max(0,initial-state.timer.seconds);
    if(elapsed<5)return toast('Start the focus timer before saving a session.');
    stopTimer(); state.timer.running=false; beginStudyCompletion(Math.max(1,Math.round(elapsed/60)));
  }

  async function recordStudySession(minutes,options={}){
    const draft={id:uid('s'),courseId:state.timer.context.courseId,assessmentId:state.timer.context.assessmentId||'',topic:state.timer.context.topic,completedAt:new Date().toISOString(),minutes,sourceType:options.sourceType||'focus'};
    try{
      if(knowledgeCloudReady&&cloudUser&&cloudSemester){ const row=await window.studentHubCloud.createStudySession(cloudUser,cloudSemester,draft,draft.id); state.studySessions.unshift(rowToStudySession(row)); }
      else state.studySessions.unshift(draft);
      const preferred=Math.max(5*60,state.timer.initialSeconds||25*60); state.timer.seconds=preferred; state.timer.initialSeconds=preferred; state.timer.running=false; save(); render(); updateCloudStatusCard(); toast(options.toastMessage||(knowledgeCloudReady?'Focus session saved.':'Focus session complete.'));
    }catch(error){ console.error('Study session sync failed:',error); state.studySessions.unshift(draft); save(); render(); toast(options.toastMessage?`${options.toastMessage} Session saved locally; cloud study sync failed.`:'Session saved locally; cloud study sync failed.'); }
  }

  function openResourceModal(){
    if(!knowledgeCloudReady){toast('Library sync is not ready yet.');return;}
    if(!state.courses.length){toast('Add a course before adding course material.');return;}
    const form=qs('#addResourceForm'); form?.reset();
    const select=qs('#resourceCourse'); if(select){select.innerHTML=state.courses.map(c=>`<option value="${c.id}">${esc(c.code)} · ${esc(c.name)}</option>`).join(''); if(resourceContextCourseId&&course(resourceContextCourseId))select.value=resourceContextCourseId;}
    const selected=course(select?.value)||state.courses[0];
    qs('#resourceType').value='Note'; qs('#resourceTopic').value=selected?.topics?.[0]||'General';
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
    if(!cloudUser||!cloudSemester||!knowledgeCloudReady)return toast('Library sync is not ready.');
    const type=qs('#resourceType').value;
    const file=qs('#resourceFile')?.files?.[0]||null;
    const draft={id:uid('r'),courseId:qs('#resourceCourse').value,topic:canonicalTopicLabelForCourse(qs('#resourceCourse').value,qs('#resourceTopic').value.trim()||'General'),type,title:qs('#resourceTitle').value.trim(),description:qs('#resourceDescription').value.trim(),url:type==='Link'?qs('#resourceUrl').value.trim():'',sourceType:type==='PDF'?'upload':'manual'};
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
      state.resources.unshift(rowToResource(row)); save(); closeModals(); render(); updateCloudStatusCard(); toast(type==='PDF'?'PDF uploaded securely.':'Resource saved.');
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

  function looksSchedulableCapture(text){
    return /\b(due|exam|midterm|final|quiz|homework|assignment|project|report|problem set|submit|deadline|lab)\b/i.test(text)||/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|today)\b/i.test(text)||/\b20\d{2}-\d{2}-\d{2}\b/.test(text)||/\b\d{1,2}(?::\d{2})?\s*(am|pm)\b/i.test(text);
  }

  async function captureTextToInbox(text,{navigate=false}={}){
    text=String(text||'').trim(); if(!text)return;
    const draft={id:uid('i'),text,created:new Date().toISOString(),processed:false,sourceType:'capture'};
    try{
      if(knowledgeCloudReady&&cloudUser&&cloudSemester){const row=await window.studentHubCloud.createInboxItem(cloudUser,cloudSemester,draft,draft.id);state.inbox.unshift(rowToInbox(row));}
      else state.inbox.unshift(draft);
      if(navigate)state.route='inbox'; save(); render(); updateCloudStatusCard(); toast(knowledgeCloudReady?'Captured to Inbox.':'Captured locally; sync is temporarily unavailable.');
    }catch(error){console.error(error);toast('Could not sync the Inbox capture.');}
  }

  async function captureInboxItem(){
    const el=qs('#inboxInput'); const text=el?.value.trim(); if(!text)return;
    await captureTextToInbox(text);
  }

  async function archiveInboxItem(id){
    const item=state.inbox.find(x=>x.id===id); if(!item)return;
    const processedAt=new Date().toISOString();
    try{ if(knowledgeCloudReady&&item.cloudId)await window.studentHubCloud.updateInboxItem(item.cloudId,{processed:true,processedAt}); item.processed=true; item.processedAt=processedAt; save(); render(); updateCloudStatusCard(); toast('Inbox item archived.'); }
    catch(error){console.error(error);toast('Could not sync the Inbox update.');}
  }

  function openModal(modal){ qs('#modalBackdrop').classList.remove('hidden'); modal.classList.remove('hidden'); }
  function closeModals(){ qsa('.modal').forEach(m=>m.classList.add('hidden')); qs('#modalBackdrop').classList.add('hidden'); }

  function openOnboarding(step=state.onboarding?.step||1){
    if(!state.onboarding) state.onboarding={dismissed:false,step:1};
    state.onboarding.dismissed=false; state.onboarding.step=clamp(Number(step)||1,1,4); save();
    renderOnboardingStep();
    openModal(qs('#onboardingModal'));
  }

  function renderOnboardingStep(){
    const modal=qs('#onboardingModal'), content=qs('#onboardingContent'), progress=qs('#onboardingProgress');
    if(!modal||!content)return;
    const step=clamp(Number(state.onboarding?.step||1),1,4); if(progress)progress.style.width=`${step*25}%`;
    if(step===1){
      content.innerHTML=`<div class="onboarding-step"><span class="onboarding-step-count">1 of 4</span><h3>Set realistic study capacity</h3><p>Student Hub uses this to decide whether a plan is achievable, not just whether calendar space exists.</p><div class="onboarding-fields"><label><span>Semester</span><input id="onboardingSemester" value="${esc(state.semester.name||'My Semester')}" disabled/></label><label><span>Study hours / week</span><input id="onboardingCapacity" type="number" min="1" max="80" step=".5" value="${state.semester.availableMinutesPerWeek/60}"/></label><label><span>Weekday study window</span><div class="inline-time-fields"><input id="onboardingStart" type="time" value="${esc(state.availability?.weekdayStart||'16:00')}"/><span>to</span><input id="onboardingEnd" type="time" value="${esc(state.availability?.weekdayEnd||'21:00')}"/></div></label></div><div class="onboarding-actions"><button class="btn secondary" data-onboarding-skip>Set up later</button><button class="btn primary" id="onboardingSaveCapacity">Continue</button></div></div>`;
    }else if(step===2){
      content.innerHTML=`<div class="onboarding-step"><span class="onboarding-step-count">2 of 4</span><h3>Add your academic context</h3><p>A course is the anchor for deadlines, topics, materials and recurring class time.</p>${state.courses.length?`<div class="onboarding-complete-line"><span>✓</span><div><strong>${state.courses.length} course${state.courses.length===1?'':'s'} added</strong><small>${state.courses.slice(0,3).map(c=>esc(c.code)).join(' · ')}</small></div></div>`:`<div class="onboarding-illustration">Course → deadlines → study plan</div>`}<div class="onboarding-actions"><button class="btn secondary" data-onboarding-back="1">Back</button>${state.courses.length?`<button class="btn secondary" id="onboardingAddAnother">+ Add another</button><button class="btn primary" data-onboarding-next="3">Continue</button>`:`<button class="btn primary" id="onboardingAddCourse">Add first course</button>`}</div></div>`;
    }else if(step===3){
      const assessmentCount=state.assessments.length;
      content.innerHTML=`<div class="onboarding-step"><span class="onboarding-step-count">3 of 4</span><h3>Bring in the syllabus</h3><p>Upload the original PDF. Academic AI extracts course details, deadlines and topics into an editable review before anything is imported.</p>${assessmentCount?`<div class="onboarding-complete-line"><span>✓</span><div><strong>${assessmentCount} deadline${assessmentCount===1?'':'s'} ready</strong><small>You can import more syllabi later from Courses.</small></div></div>`:`<div class="onboarding-illustration">PDF → review → deadlines + topics</div>`}<div class="onboarding-actions"><button class="btn secondary" data-onboarding-back="2">Back</button><button class="btn secondary" data-onboarding-next="4">${assessmentCount?'Continue':'Skip for now'}</button><button class="btn primary" id="onboardingImport">Import syllabus</button></div></div>`;
    }else{
      const candidates=planningCandidates({limit:20});
      content.innerHTML=`<div class="onboarding-step"><span class="onboarding-step-count">4 of 4</span><h3>Turn deadlines into a first plan</h3><p>Smart Plan previews study blocks before writing anything. Fixed class times remain untouched.</p><div class="onboarding-summary"><span><strong>${state.courses.length}</strong><small>courses</small></span><span><strong>${state.assessments.length}</strong><small>deadlines</small></span><span><strong>${candidates.length}</strong><small>need planning</small></span></div><div class="onboarding-actions"><button class="btn secondary" data-onboarding-back="3">Back</button><button class="btn secondary" id="onboardingFinish">Go to Today</button>${candidates.length?`<button class="btn primary" id="onboardingPlan">Preview initial plan</button>`:''}</div></div>`;
    }
    content.querySelectorAll('[data-onboarding-back]').forEach(b=>b.onclick=()=>{state.onboarding.step=Number(b.dataset.onboardingBack);save();renderOnboardingStep();});
    content.querySelectorAll('[data-onboarding-next]').forEach(b=>b.onclick=()=>{state.onboarding.step=Number(b.dataset.onboardingNext);save();renderOnboardingStep();});
    content.querySelectorAll('[data-onboarding-skip]').forEach(b=>b.onclick=dismissOnboarding);
    content.querySelector('#onboardingSaveCapacity')?.addEventListener('click',()=>{state.semester.availableMinutesPerWeek=Math.round(Number(qs('#onboardingCapacity')?.value||14)*60);state.availability.weekdayStart=qs('#onboardingStart')?.value||'16:00';state.availability.weekdayEnd=qs('#onboardingEnd')?.value||'21:00';state.onboarding.step=2;save();renderOnboardingStep();render();});
    content.querySelector('#onboardingAddCourse')?.addEventListener('click',()=>{onboardingPendingCourse=true;closeModals();openCourseModal();});
    content.querySelector('#onboardingAddAnother')?.addEventListener('click',()=>{onboardingPendingCourse=true;closeModals();openCourseModal();});
    content.querySelector('#onboardingImport')?.addEventListener('click',()=>{state.onboarding.step=4;save();closeModals();openImport();});
    content.querySelector('#onboardingFinish')?.addEventListener('click',()=>{dismissOnboarding();setRoute('today');});
    content.querySelector('#onboardingPlan')?.addEventListener('click',()=>{dismissOnboarding();state.route='planner';save();render();setTimeout(()=>openPlannerPreview({all:true}),40);});
  }

  function dismissOnboarding(){
    if(!state.onboarding)state.onboarding={}; state.onboarding.dismissed=true; save(); closeModals();
  }

  function maybeShowOnboarding(){
    if(!cloudUser||state.onboarding?.dismissed)return;
    if(!state.courses.length) setTimeout(()=>openOnboarding(state.onboarding?.step||1),120);
  }
  function openQuickAdd(text='', inboxId=null){
    if(!state.courses.length){state.route='inbox';save();render();setTimeout(()=>{const el=qs('#inboxInput');if(el){el.value=text||'';el.focus();}},40);toast('Capture it first; add a course when you are ready to turn it into a deadline.');return;}
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
      toast(academicCloudReady?'Deadline added and connected across Student Hub.':'Added locally; cloud assessment sync is unavailable.');
    } catch (error) {
      console.error(error);
      toast('Could not save the deadline. Check Sync diagnostics.');
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
    if(!cloudUser||!cloudSemester||!knowledgeCloudReady)return toast('Library sync must be ready before uploading a syllabus.');
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
      toast('Syllabus PDF uploaded securely and ready for Academic AI.');
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


  function cleanLabel(value){
    return String(value||'').trim().replace(/\s+/g,' ');
  }

  function topicKey(value){
    const raw=cleanLabel(value).toLocaleLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
    const aliases={
      'vector spaces':'vector space',
      'vectors spaces':'vector space',
      'eigen value':'eigenvalue',
      'eigen values':'eigenvalue',
      'eigen vector':'eigenvector',
      'eigen vectors':'eigenvector',
      'dynamic programmings':'dynamic programming'
    };
    return aliases[raw]||raw;
  }

  function dedupeTopics(values){
    const out=[]; const seen=new Set();
    for(const value of (Array.isArray(values)?values:[])){
      const clean=cleanLabel(value);
      if(!clean)continue;
      const key=topicKey(clean);
      if(!key||seen.has(key))continue;
      seen.add(key); out.push(clean);
    }
    return out;
  }

  function canonicalTopicLabelForCourse(courseId,value){
    const clean=cleanLabel(value)||'General';
    const c=course(courseId);
    const match=dedupeTopics(c?.topics||[]).find(t=>topicKey(t)===topicKey(clean));
    return match||clean;
  }

  function dedupeAssessmentList(items){
    const out=[];
    for(const item of (items||[]).slice().sort((a,b)=>new Date(a.due)-new Date(b.due))){
      const duplicate=out.some(existing=>isLikelyAssessmentDuplicate(existing,item));
      if(!duplicate) out.push(item);
    }
    return out;
  }

  function canonicalizeStateData(){
    state.courses=(state.courses||[]).map(c=>({...c,code:cleanLabel(c.code),name:cleanLabel(c.name),teacher:cleanLabel(c.teacher),room:cleanLabel(c.room),schedule:cleanLabel(c.schedule),topics:dedupeTopics(c.topics||[])}));
    state.assessments=dedupeAssessmentList((state.assessments||[]).map(a=>({...a,title:cleanLabel(a.title)||'Untitled assessment',type:normalizeAssessmentType(a.type),topics:dedupeTopics(a.topics||[])})));
    state.resources=(state.resources||[]).map(r=>({...r,title:cleanLabel(r.title)||'Untitled resource',topic:canonicalTopicLabelForCourse(r.courseId,r.topic)}));
    state.review=(state.review||[]).map(r=>({...r,topic:canonicalTopicLabelForCourse(r.courseId,r.topic)}));
    state.studySessions=(state.studySessions||[]).map(r=>({...r,topic:canonicalTopicLabelForCourse(r.courseId,r.topic)}));
    return state;
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
    if(!academicCloudReady||!cloudUser||!cloudSemester)return toast('Academic sync must be ready before importing.');
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
        review.innerHTML=`<div class="ai-import-success"><div class="ai-success-icon">✓</div><span class="eyebrow">Import complete</span><h3>${esc(target.name)} is updated</h3><p>${imported} assessment${imported===1?'':'s'} added${skipped?` · ${skipped} duplicate or invalid item${skipped===1?'':'s'} skipped`:''}${addedTopics?` · ${addedTopics} new topic${addedTopics===1?'':'s'} merged`:''}${plannableForCourse?` · ${plannableForCourse} deadline${plannableForCourse===1?' is':'s are'} ready for planning`:''}.</p><div class="button-row ai-success-actions">${state.onboarding&&!state.onboarding.dismissed&&state.onboarding.step===4?`<button class="btn secondary" id="continueSetupAfterImport" type="button">Continue setup</button>`:''}${plannableForCourse?`<button class="btn secondary" id="planImportedCourse" type="button">Build study plan</button>`:''}<button class="btn primary" id="viewImportedCourse" type="button">View course</button></div></div>`;
        review.classList.remove('hidden');
      }
      qs('#importAiSyllabus')?.classList.add('hidden');
      qs('#continueSetupAfterImport')?.addEventListener('click',()=>{closeModals();setTimeout(()=>openOnboarding(4),50);});
      qs('#planImportedCourse')?.addEventListener('click',()=>{
        closeModals(); plannerWeekOffset=0; plannerMonthOffset=0; state.route='planner'; save(); render();
        setTimeout(()=>openPlannerPreview({courseId:target.id,all:true}),40);
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
      toast(`Imported ${imported} assessment${imported!==1?'s':''}${skipped?`, ${skipped} duplicate${skipped===1?'':'s'} skipped`:''}${academicCloudReady?' and synced':''}.`);
      if(state.onboarding && !state.onboarding.dismissed && state.onboarding.step===4)setTimeout(()=>openOnboarding(4),120);
    } catch (error) {
      console.error(error);
      save(); render();
      toast(`Imported ${imported}, then sync failed. Check Settings → Technical diagnostics.`);
    }
  }

  function startFocusForAssessment(id){
    const a=assessment(id); if(!a)return;
    state.timer.context={courseId:a.courseId,assessmentId:a.id,topic:a.topics?.[0]||a.title};
    state.timer.seconds=Math.min(45,Math.max(15,a.remaining||25))*60; state.timer.initialSeconds=state.timer.seconds; state.timer.running=false; save(); setRoute('study');
  }

  function assistantGroup(item){
    if(item.tone==='danger'||item.priority>=90)return 'now';
    if(item.tone==='warning'||item.priority>=50)return 'attention';
    return 'later';
  }
  function renderAssistantPanel(){
    const content=qs('#assistantPanelContent'), count=qs('#assistantPanelCount'); if(!content)return;
    const items=studentAssistantItems();
    if(count)count.textContent=items.length?`${items.length} active`:'All clear';
    const card=item=>`<article class="assistant-item ${item.tone}"><div class="assistant-item-copy"><div class="assistant-item-head"><span class="assistant-kind">${esc(item.kind)}</span><button class="assistant-snooze" data-assist-snooze="${esc(item.key)}" title="Snooze for today" aria-label="Snooze this item for today">×</button></div><strong>${esc(item.title)}</strong>${item.meta?`<small>${esc(item.meta)}</small>`:''}<p>${esc(item.body)}</p></div><button class="btn secondary compact-btn" data-assist-action="${esc(item.key)}">${esc(item.actionLabel||'Review')}</button></article>`;
    if(items.length){
      const groups=[['now','Now'],['attention','Needs attention'],['later','Later']];
      content.innerHTML=groups.map(([key,label])=>{const groupItems=items.filter(item=>assistantGroup(item)===key);return groupItems.length?`<section class="assistant-group" data-assistant-group="${key}"><header><strong>${label}</strong><span>${groupItems.length}</span></header>${groupItems.map(card).join('')}</section>`:'';}).join('');
    }else{
      content.innerHTML=`<div class="assistant-clear"><span>✓</span><h3>Nothing needs attention right now</h3><p>Your deadlines, plan, review queue, Inbox, sync and local data model have no active warnings.</p></div>`;
    }
    qsa('[data-assist-action]',content).forEach(button=>button.onclick=()=>runAssistantAction(button.dataset.assistAction));
    qsa('[data-assist-snooze]',content).forEach(button=>button.onclick=()=>snoozeAssistantItem(button.dataset.assistSnooze));
  }
  function openAssistantPanel(){
    renderAssistantPanel();
    const panel=qs('#assistantPanel'), button=qs('#assistantToggle'); if(!panel)return;
    panel.classList.remove('hidden'); button?.setAttribute('aria-expanded','true');
  }
  function closeAssistantPanel(){ const panel=qs('#assistantPanel'),button=qs('#assistantToggle'); panel?.classList.add('hidden');button?.setAttribute('aria-expanded','false'); }
  function snoozeAssistantItem(key){ ensureAssistantPrefs(); state.assistantState.snoozed[key]=isoDate(new Date()); save(); renderAssistantPanel(); updateBadges(); toast('Snoozed for today.'); }
  function runAssistantAction(key){
    const item=assistantItemByKey(key); if(!item)return; closeAssistantPanel();
    if(item.action==='repair'){openPlannerRepairPreview();return;}
    if(item.action==='preview'){openPlannerPreview({assessmentId:item.targetId});return;}
    if(item.action==='focus'){startFocusForAssessment(item.targetId);return;}
    if(item.action==='review'){const review=(state.review||[]).find(r=>r.id===item.targetId);if(review){state.timer.context={courseId:review.courseId,assessmentId:'',taskId:'',topic:review.topic||'Review'};state.timer.seconds=15*60;state.timer.initialSeconds=15*60;state.timer.running=false;save();}setRoute('study');return;}
    if(item.action==='study'){setRoute('study');return;}
    if(item.action==='inbox'){setRoute('inbox');return;}
    if(item.action==='settings'){setRoute('settings');return;}
    if(item.action==='planner'){setRoute('planner');return;}
  }
  async function maybeSendBrowserAssistanceNotification(){
    const prefs=ensureAssistantPrefs();
    if(!prefs.browser||!('Notification' in window)||Notification.permission!=='granted'||document.visibilityState!=='visible')return;
    const item=studentAssistantItems().find(x=>x.tone==='danger'||x.priority>=90); if(!item)return;
    const today=isoDate(new Date()); if(state.assistantState.notified[item.key]===today)return;
    try{ new Notification(item.title,{body:item.body,tag:`student-hub-${item.key}`}); state.assistantState.notified[item.key]=today; save(); }catch(error){console.warn('Browser reminder failed:',error);}
  }

  function openSearch(){ openModal(qs('#searchModal')); qs('#searchInput').value=''; renderSearch(''); setTimeout(()=>qs('#searchInput').focus(),60); }
  function renderSearch(query){
    const raw=query.trim(), q=raw.toLowerCase(), items=[];
    state.courses.forEach(c=>items.push({kind:'course',type:'Course',icon:'◫',title:c.name,meta:c.code,id:c.id,text:(c.name+' '+c.code+' '+(c.topics||[]).join(' ')).toLowerCase()}));
    state.assessments.forEach(a=>items.push({kind:'assessment',type:a.type,icon:'✓',title:a.title,meta:courseName(a.courseId)+' · '+humanDue(a.due),id:a.id,courseId:a.courseId,text:(a.title+' '+courseName(a.courseId)+' '+(a.topics||[]).join(' ')).toLowerCase()}));
    state.resources.forEach(r=>items.push({kind:'resource',type:r.type,icon:r.type==='PDF'?'▤':'⌁',title:r.title,meta:courseName(r.courseId)+' · '+r.topic,id:r.id,courseId:r.courseId,topic:r.topic,text:(r.title+' '+courseName(r.courseId)+' '+r.topic).toLowerCase()}));
    const filtered=items.filter(i=>!q||i.text.includes(q)).slice(0,10);
    const welcome=!raw?`<div class="command-welcome"><strong>Find or capture anything</strong><small>Search your semester, or type a note/deadline and capture it without choosing where it belongs first.</small><div class="command-suggestions"><button data-command-suggest="midterm">midterm</button><button data-command-suggest="probability">probability</button><button data-command-suggest="lab report Friday 6pm, 2 hours">capture a deadline</button></div></div>`:'';
    const capture=raw?`<button class="search-result command-capture" data-command-capture="${esc(raw)}"><span class="search-result-icon">＋</span><div><strong>Capture “${esc(raw)}”</strong><small>Send this to Quick Add or Inbox and organize it from context.</small></div><small>Capture</small></button>`:'';
    const results=filtered.length?filtered.map(i=>`<button class="search-result" data-search-kind="${i.kind}" data-search-id="${i.id}" data-search-course="${i.courseId||''}" data-search-topic="${esc(i.topic||'')}"><span class="search-result-icon">${i.icon}</span><div><strong>${esc(i.title)}</strong><small>${esc(i.meta)}</small></div><small>${esc(i.type)}</small></button>`).join(''):(raw?`<div class="command-no-match"><small>No existing semester item matches this text.</small></div>`:'');
    qs('#searchResults').innerHTML=welcome+results+capture;
    qsa('[data-command-suggest]').forEach(b=>b.onclick=()=>{qs('#searchInput').value=b.dataset.commandSuggest;renderSearch(b.dataset.commandSuggest);qs('#searchInput').focus();});
    qsa('[data-command-capture]').forEach(b=>b.onclick=()=>{const text=b.dataset.commandCapture;closeModals();if(!state.courses.length||!looksSchedulableCapture(text)){captureTextToInbox(text,{navigate:true});return;}setTimeout(()=>openQuickAdd(text),40);});
    qsa('.search-result[data-search-kind]').forEach(b=>b.onclick=()=>{const kind=b.dataset.searchKind;if(kind==='course'){activeCourseId=b.dataset.searchId;activeCourseTab='overview';state.route='courses';}else if(kind==='resource'){libraryCourseFilter=b.dataset.searchCourse||'all';libraryTopicFilter=b.dataset.searchTopic||'';state.route='library';}else{const a=assessment(b.dataset.searchId);if(a){ensurePlannerPrefs().courseId=a.courseId;ensurePlannerPrefs().lens='deadlines';}state.route='planner';}save();closeModals();render();});
  }

  function humanDue(date){ const d=daysUntil(date); if(d<0)return 'overdue'; if(d<1&&isToday(date))return `today ${fmtTime(date)}`; if(d<2)return 'tomorrow'; if(d<7)return fmtDate(date,{weekday:'short'}); return fmtDate(date,{month:'short',day:'numeric'}); }
  function formatMinutes(m=0){ m=Math.max(0,Math.round(m)); const h=Math.floor(m/60), min=m%60; return h?`${h}h${min?` ${min}m`:''}`:`${min}m`; }
  function formatBytes(bytes=0){ const n=Math.max(0,Number(bytes)||0); if(n<1024)return `${Math.round(n)} B`; if(n<1024*1024)return `${(n/1024).toFixed(1)} KB`; return `${(n/(1024*1024)).toFixed(1)} MB`; }
  function timeAgo(date){ const m=Math.max(0,Math.round((Date.now()-new Date(date))/60000)); if(m<1)return 'just now'; if(m<60)return `${m}m ago`;const h=Math.floor(m/60);if(h<24)return `${h}h ago`;return `${Math.floor(h/24)}d ago`; }
  function toast(msg){ const el=document.createElement('div');el.className='toast';el.textContent=msg;qs('#toastStack').appendChild(el);setTimeout(()=>el.remove(),3200); }
  function updateBadges(){
    const n=(state.inbox||[]).filter(i=>!i.processed).length, inboxBadge=qs('#inboxBadge');
    if(inboxBadge){inboxBadge.textContent=n;inboxBadge.classList.toggle('visible',n>0);}
    const attention=studentAssistantItems().length, badge=qs('#assistantBadge');
    if(badge){badge.textContent=attention>9?'9+':attention;badge.classList.toggle('visible',attention>0);}
    if(!qs('#assistantPanel')?.classList.contains('hidden'))renderAssistantPanel();
  }


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
    return { id:row.$id, cloudId:row.$id, legacyId:row.legacyId||'', courseId:row.courseId, topic:canonicalTopicLabelForCourse(row.courseId,row.topic||'General'), type:row.type||'Note', title:row.title||'Untitled resource', description:row.description||'', url:row.url||'', sourceType:row.sourceType||'library', storageFileId:row.storageFileId||'', fileName:row.fileName||'', mimeType:row.mimeType||'', fileSize:Number(row.fileSize||0), updated:timeAgo(row.$updatedAt||row.$createdAt||new Date()) };
  }

  function rowToInbox(row) {
    return { id:row.$id, cloudId:row.$id, legacyId:row.legacyId||'', text:row.text||'', created:row.$createdAt||new Date().toISOString(), processed:Boolean(row.processed), processedAt:row.processedAt||'', sourceType:row.sourceType||'capture' };
  }

  function rowToStudySession(row) {
    return { id:row.$id, cloudId:row.$id, legacyId:row.legacyId||'', courseId:row.courseId, assessmentId:row.assessmentId||'', topic:canonicalTopicLabelForCourse(row.courseId,row.topic||'General'), minutes:Number(row.minutes||0), completedAt:row.completedAt||row.$createdAt, sourceType:row.sourceType||'focus' };
  }

  function applyCloudPlannerData(payload) {
    const tasks=Array.isArray(payload?.tasks)?payload.tasks:[];
    const blocks=Array.isArray(payload?.workBlocks)?payload.workBlocks:[];
    state.tasks=tasks.map(rowToTask);
    const validCourses=new Set((state.courses||[]).map(c=>c.id));
    const localNonWork=(state.events||[]).filter(e=>e.type!=='work' && (!e.courseId||validCourses.has(e.courseId)));
    state.events=[...localNonWork,...blocks.filter(row=>row.status!=='done').map(rowToWorkBlock)];
    save(); render();
  }


  function applyCloudKnowledgeData(payload){
    state.resources=(Array.isArray(payload?.resources)?payload.resources:[]).map(rowToResource);
    state.inbox=(Array.isArray(payload?.inbox)?payload.inbox:[]).map(rowToInbox);
    state.studySessions=(Array.isArray(payload?.studySessions)?payload.studySessions:[]).map(rowToStudySession).sort((a,b)=>new Date(b.completedAt)-new Date(a.completedAt));
    canonicalizeStateData();
    save(); render();
  }

  function updateCloudStatusCard(){
    const title=qs('#cloudStatusTitle'), text=qs('#cloudStatusText'); if(!title||!text||!cloudUser)return;
    const openInbox=(state.inbox||[]).filter(i=>!i.processed).length;
    if(academicCloudReady&&plannerCloudReady&&knowledgeCloudReady){ title.textContent='Synced'; text.textContent=`${state.semester.name} · ${state.courses.length} courses · ${state.assessments.length} deadlines${openInbox?` · ${openInbox} Inbox`:''}`; }
    else if(academicCloudReady){ title.textContent='Sync needs attention'; text.textContent='Your academic data is available, but one or more planner or knowledge groups are still local.'; }
    else { title.textContent='Connected'; text.textContent=`${state.semester.name} · local mode while academic sync initializes.`; }
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
    state.assessments = dedupeAssessmentList(cloudAssessments.map(rowToAssessment));
    const validCourses=new Set(state.courses.map(c=>c.id));
    const validAssessments=new Set(state.assessments.map(a=>a.id));
    state.events=(state.events||[]).filter(e=>(!e.courseId||validCourses.has(e.courseId))&&(!e.assessmentId||validAssessments.has(e.assessmentId)));
    state.review=(state.review||[]).filter(r=>!r.courseId||validCourses.has(r.courseId));
    state.studySessions=(state.studySessions||[]).filter(r=>!r.courseId||validCourses.has(r.courseId));
    canonicalizeStateData();
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

    render(); updateCloudStatusCard(); maybeShowOnboarding();
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
      toast('Course sync is not ready. Check Settings → Technical diagnostics.');
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
      canonicalizeStateData();
      const resumeOnboarding=onboardingPendingCourse;
      onboardingPendingCourse=false;
      if(resumeOnboarding){state.onboarding={...(state.onboarding||{}),dismissed:false,step:3};}
      save();
      closeModals();
      render();
      updateCloudStatusCard();
      toast(`${draft.name} added.`);
      if(resumeOnboarding)setTimeout(()=>openOnboarding(3),80);
    } catch (error) {
      console.error(error);
      toast('Could not save the course. Please try again or check Sync diagnostics.');
    } finally {
      if(button){button.disabled=false;button.textContent='Add course';}
    }
  }

  function setUserContext(userId, semesterName='') {
    if (!userId) return;
    const nextKey = `${BASE_STORAGE_KEY}.${userId}`;
    if (activeStorageKey !== nextKey) {
      if (!localStorage.getItem(nextKey)) localStorage.setItem(nextKey,JSON.stringify(emptyUserState(semesterName||'My Semester')));
      activeStorageKey = nextKey;
      state = loadState(activeStorageKey);
      if (!Array.isArray(state.tasks)) state.tasks = [];
      if (!Array.isArray(state.events)) state.events = [];
      if (!Array.isArray(state.resources)) state.resources = [];
      if (!Array.isArray(state.inbox)) state.inbox = [];
      if (!Array.isArray(state.studySessions)) state.studySessions = [];
      if (!Array.isArray(state.review)) state.review = [];
      if (!state.timer)state.timer={seconds:25*60,initialSeconds:25*60,running:false,context:{courseId:'',assessmentId:'',topic:'Focused study'}};
      if (!state.timer.initialSeconds) state.timer.initialSeconds = state.timer.seconds || 25*60;
      if (!state.availability || typeof state.availability!=='object') state.availability={weekdayStart:'16:00',weekdayEnd:'21:00',weekendStart:'10:00',weekendEnd:'18:00',maxDailyMinutes:180,weekends:true};
      if (!state.onboarding || typeof state.onboarding!=='object') state.onboarding={dismissed:false,step:1};
      ensurePlannerPrefs();
      ensureAssistantPrefs();
      canonicalizeStateData();
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
    ensurePlannerPrefs();
    ensureAssistantPrefs();
  }

  window.studentHubApp = Object.freeze({
    setUserContext,
    setCloudContext,
    resetUserContext,
    render,
    toast,
    diagnostics:()=>{
      const snapshot=semesterPlanningSnapshot();
      return {
        route:state.route,
        courses:state.courses.length,
        assessments:state.assessments.length,
        tasks:(state.tasks||[]).length,
        events:(state.events||[]).length,
        resources:(state.resources||[]).length,
        inboxOpen:(state.inbox||[]).filter(i=>!i.processed).length,
        slippedBlocks:snapshot.slippedBlocks.length,
        slippedMinutes:snapshot.slippedMinutes,
        dueWorkload:snapshot.dueWorkload,
        plannedStudy:snapshot.plannedStudy,
        capacity:snapshot.capacity,
        overCapacity:snapshot.overCapacity,
        assistantItems:studentAssistantItems().map(item=>({key:item.key,group:assistantGroup(item),tone:item.tone,title:item.title})),
        dataHealth:dataHealthReport()
      };
    }
  });

  qsa('[data-route]').forEach(b=>b.addEventListener('click',()=>setRoute(b.dataset.route)));
  qs('#themeToggle').addEventListener('click',()=>{state.theme=state.theme==='dark'?'light':'dark';save();render();});
  qs('#openQuickAdd')?.addEventListener('click',()=>openQuickAdd());
  qs('#mobileQuickAdd')?.addEventListener('click',()=>openQuickAdd());
  qs('#openSearch')?.addEventListener('click',openSearch);
  qs('#assistantToggle')?.addEventListener('click',()=>{ const panel=qs('#assistantPanel'); if(panel?.classList.contains('hidden'))openAssistantPanel(); else closeAssistantPanel(); });
  qs('#assistantClose')?.addEventListener('click',closeAssistantPanel);
  qs('#dismissOnboarding')?.addEventListener('click',dismissOnboarding);
  qs('#modalBackdrop').addEventListener('click',closeModals);
  qsa('.close-modal').forEach(b=>b.addEventListener('click',closeModals));
  qs('#addCourseForm')?.addEventListener('submit',confirmAddCourse);
  qs('#addResourceForm')?.addEventListener('submit',confirmAddResource);
  qs('#resourceType')?.addEventListener('change',setResourceTypeFields);
  qs('#syllabusCourse')?.addEventListener('change',syncSyllabusSourceSelection);
  qs('#uploadSyllabusFile')?.addEventListener('click',uploadSyllabusPdf);
  qs('#analyzeSyllabusFile')?.addEventListener('click',analyzeStoredSyllabus);
  qs('#importAiSyllabus')?.addEventListener('click',importReviewedAiSyllabus);
  qs('#applyPlannerPreview')?.addEventListener('click',applyPlannerPreview);
  qs('#saveStudyReflection')?.addEventListener('click',saveStudyReflection);
  qs('#fillExample').addEventListener('click',()=>{qs('#quickAddInput').value='Chem lab report Friday 6pm, probably 2 hours';});
  qs('#parseQuickAdd').addEventListener('click',()=>{const text=qs('#quickAddInput').value.trim();if(!text)return toast('Type something to capture first.');quickParsed=parseNatural(text);showQuickPreview(quickParsed);});
  qs('#confirmQuickAdd').addEventListener('click',confirmQuick);
  qs('#parseSyllabus').addEventListener('click',()=>{syllabusParsed=parseSyllabusText(qs('#syllabusInput').value);showSyllabusPreview(syllabusParsed);if(!syllabusParsed.length)toast('No dated assessment lines detected.');});
  qs('#confirmSyllabus').addEventListener('click',confirmSyllabus);
  qs('#searchInput').addEventListener('input',e=>renderSearch(e.target.value));
  document.addEventListener('keydown',e=>{ if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch();} else if(e.key==='Escape'&&focusMode){focusMode=false;document.body.classList.remove('focus-mode');if(document.fullscreenElement&&document.exitFullscreen)document.exitFullscreen().catch(()=>{});render();} else if(e.key==='Escape'&&!qs('#assistantPanel')?.classList.contains('hidden'))closeAssistantPanel(); else if(e.key==='Escape')closeModals(); else if(e.key.toLowerCase()==='q'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)&&!focusMode){e.preventDefault();openQuickAdd();} });
  document.addEventListener('fullscreenchange',()=>{if(focusMode&&!document.fullscreenElement){focusMode=false;document.body.classList.remove('focus-mode');render();}});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')setTimeout(maybeSendBrowserAssistanceNotification,250);});

  window.addEventListener('beforeunload',save);
  if('serviceWorker' in navigator){ window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{})); }
  if(state.timer.running) startTimer();
  render();
})();
