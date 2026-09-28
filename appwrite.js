(() => {
  'use strict';

  const CONFIG = Object.freeze({
    endpoint: 'https://fra.cloud.appwrite.io/v1',
    projectId: '6ab9533600167cfe8598',
    databaseId: 'student_hub',
    semestersTableId: 'semesters',
    coursesTableId: 'courses',
    assessmentsTableId: 'assessments',
    tasksTableId: 'tasks',
    workBlocksTableId: 'work_blocks'
  });

  if (!window.Appwrite) {
    console.error('Student Hub: Appwrite SDK did not load.');
    window.studentHubCloud = { ready: false, config: CONFIG };
    return;
  }

  const client = new Appwrite.Client()
    .setEndpoint(CONFIG.endpoint)
    .setProject(CONFIG.projectId);

  const account = new Appwrite.Account(client);
  const tablesDB = new Appwrite.TablesDB(client);

  const privatePermissions = userId => [
    Appwrite.Permission.read(Appwrite.Role.user(userId)),
    Appwrite.Permission.update(Appwrite.Role.user(userId)),
    Appwrite.Permission.delete(Appwrite.Role.user(userId))
  ];

  async function getCurrentUser() {
    try { return await account.get(); }
    catch (error) { if (error?.code === 401) return null; throw error; }
  }

  async function signUp({ name, email, password }) {
    return account.create({ userId: Appwrite.ID.unique(), email, password, name });
  }
  async function signIn({ email, password }) { return account.createEmailPasswordSession({ email, password }); }
  async function signOut() { return account.deleteSession({ sessionId: 'current' }); }

  async function listRows(tableId, limit = 200) {
    const result = await tablesDB.listRows({
      databaseId: CONFIG.databaseId,
      tableId,
      queries: [Appwrite.Query.limit(limit)]
    });
    return Array.isArray(result?.rows) ? result.rows : [];
  }

  async function listSemesters() {
    return tablesDB.listRows({
      databaseId: CONFIG.databaseId,
      tableId: CONFIG.semestersTableId,
      queries: [Appwrite.Query.limit(100)]
    });
  }

  function getDefaultSemesterData() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return month <= 5
      ? { name:`Spring ${year}`, startDate:`${year}-01-15T00:00:00.000Z`, endDate:`${year}-06-30T23:59:59.000Z` }
      : { name:`Fall ${year}`, startDate:`${year}-08-01T00:00:00.000Z`, endDate:`${year}-12-31T23:59:59.000Z` };
  }

  async function createSemesterForUser(user) {
    const semester = getDefaultSemesterData();
    return tablesDB.createRow({
      databaseId: CONFIG.databaseId,
      tableId: CONFIG.semestersTableId,
      rowId: Appwrite.ID.unique(),
      data: { userId:user.$id, name:semester.name, startDate:semester.startDate, endDate:semester.endDate, isActive:true },
      permissions: privatePermissions(user.$id)
    });
  }

  async function ensureSemester(user) {
    const result = await listSemesters();
    const rows = Array.isArray(result?.rows) ? result.rows : [];
    const existing = rows.find(row => row.isActive) || rows[0];
    return existing || createSemesterForUser(user);
  }

  function cleanTopics(topics) {
    return Array.isArray(topics) ? topics.map(v=>String(v||'').trim()).filter(Boolean).slice(0,40) : [];
  }

  function coursePayload(user, semester, course, legacyId='') {
    return {
      userId:user.$id, semesterId:semester.$id, legacyId:String(legacyId || course.legacyId || ''),
      code:String(course.code || 'COURSE').slice(0,32), name:String(course.name || 'Untitled course').slice(0,120),
      teacher:String(course.teacher || '').slice(0,120), room:String(course.room || '').slice(0,80),
      color:String(course.color || '#6d63ed').slice(0,16), schedule:String(course.schedule || '').slice(0,160),
      grade:Number.isFinite(Number(course.grade)) ? Number(course.grade) : 0,
      target:Number.isFinite(Number(course.target)) ? Number(course.target) : 0,
      topics:cleanTopics(course.topics)
    };
  }

  function assessmentPayload(user, semester, assessment, courseId, legacyId='') {
    return {
      userId:user.$id, semesterId:semester.$id, legacyId:String(legacyId || assessment.legacyId || ''),
      courseId:String(courseId || assessment.courseId || ''), title:String(assessment.title || 'Untitled assessment').slice(0,200),
      type:String(assessment.type || 'Assignment').slice(0,32), due:new Date(assessment.due).toISOString(),
      effort:Math.max(0,Math.round(Number(assessment.effort)||0)),
      remaining:Math.max(0,Math.round(Number(assessment.remaining ?? assessment.effort)||0)),
      status:String(assessment.status || 'not_started').slice(0,32),
      weight:Number.isFinite(Number(assessment.weight)) ? Number(assessment.weight) : 0,
      topics:cleanTopics(assessment.topics), sourceType:String(assessment.sourceType || 'manual').slice(0,32)
    };
  }

  function taskPayload(user, semester, task, legacyId='') {
    return {
      userId:user.$id, semesterId:semester.$id, legacyId:String(legacyId || task.legacyId || ''),
      courseId:String(task.courseId || ''), assessmentId:String(task.assessmentId || ''),
      title:String(task.title || 'Untitled task').slice(0,200),
      estimate:Math.max(0,Math.round(Number(task.estimate)||0)),
      remaining:Math.max(0,Math.round(Number(task.remaining ?? task.estimate)||0)),
      status:String(task.status || 'not_started').slice(0,32),
      position:Math.max(0,Math.round(Number(task.position)||0)),
      sourceType:String(task.sourceType || 'planner').slice(0,32)
    };
  }

  function workBlockPayload(user, semester, block, legacyId='') {
    return {
      userId:user.$id, semesterId:semester.$id, legacyId:String(legacyId || block.legacyId || ''),
      courseId:String(block.courseId || ''), assessmentId:String(block.assessmentId || ''),
      taskId:String(block.taskId || ''), title:String(block.title || 'Work block').slice(0,200),
      start:new Date(block.start).toISOString(), end:new Date(block.end).toISOString(),
      status:String(block.status || 'planned').slice(0,32),
      sourceType:String(block.sourceType || 'planner').slice(0,32)
    };
  }

  async function listCourses(semesterId) { return (await listRows(CONFIG.coursesTableId)).filter(r=>r.semesterId===semesterId); }
  async function listAssessments(semesterId) { return (await listRows(CONFIG.assessmentsTableId)).filter(r=>r.semesterId===semesterId); }
  async function listTasks(semesterId) { return (await listRows(CONFIG.tasksTableId)).filter(r=>r.semesterId===semesterId); }
  async function listWorkBlocks(semesterId) { return (await listRows(CONFIG.workBlocksTableId)).filter(r=>r.semesterId===semesterId); }

  async function createCourse(user, semester, course, legacyId='') {
    return tablesDB.createRow({ databaseId:CONFIG.databaseId, tableId:CONFIG.coursesTableId, rowId:Appwrite.ID.unique(), data:coursePayload(user,semester,course,legacyId), permissions:privatePermissions(user.$id) });
  }
  async function createAssessment(user, semester, assessment, courseId, legacyId='') {
    return tablesDB.createRow({ databaseId:CONFIG.databaseId, tableId:CONFIG.assessmentsTableId, rowId:Appwrite.ID.unique(), data:assessmentPayload(user,semester,assessment,courseId,legacyId), permissions:privatePermissions(user.$id) });
  }
  async function createTask(user, semester, task, legacyId='') {
    return tablesDB.createRow({ databaseId:CONFIG.databaseId, tableId:CONFIG.tasksTableId, rowId:Appwrite.ID.unique(), data:taskPayload(user,semester,task,legacyId), permissions:privatePermissions(user.$id) });
  }
  async function createWorkBlock(user, semester, block, legacyId='') {
    return tablesDB.createRow({ databaseId:CONFIG.databaseId, tableId:CONFIG.workBlocksTableId, rowId:Appwrite.ID.unique(), data:workBlockPayload(user,semester,block,legacyId), permissions:privatePermissions(user.$id) });
  }

  async function updateCourse(rowId, patch) { return tablesDB.updateRow({ databaseId:CONFIG.databaseId, tableId:CONFIG.coursesTableId, rowId, data:patch }); }
  async function updateAssessment(rowId, patch) { return tablesDB.updateRow({ databaseId:CONFIG.databaseId, tableId:CONFIG.assessmentsTableId, rowId, data:patch }); }
  async function updateTask(rowId, patch) { return tablesDB.updateRow({ databaseId:CONFIG.databaseId, tableId:CONFIG.tasksTableId, rowId, data:patch }); }
  async function updateWorkBlock(rowId, patch) { return tablesDB.updateRow({ databaseId:CONFIG.databaseId, tableId:CONFIG.workBlocksTableId, rowId, data:patch }); }

  async function syncAcademicSeed(user, semester, localCourses=[], localAssessments=[]) {
    let cloudCourses = await listCourses(semester.$id);
    const courseIds = new Set(cloudCourses.map(r=>r.$id));
    const courseLegacy = new Set(cloudCourses.map(r=>r.legacyId).filter(Boolean));
    for (const course of localCourses) {
      const localId=String(course.id||'');
      if (courseIds.has(localId) || courseLegacy.has(localId)) continue;
      await createCourse(user,semester,course,localId);
    }
    cloudCourses = await listCourses(semester.$id);
    const courseIdMap = new Map();
    cloudCourses.forEach(r=>{ courseIdMap.set(r.$id,r.$id); if(r.legacyId) courseIdMap.set(r.legacyId,r.$id); });

    let cloudAssessments = await listAssessments(semester.$id);
    const assessmentIds = new Set(cloudAssessments.map(r=>r.$id));
    const assessmentLegacy = new Set(cloudAssessments.map(r=>r.legacyId).filter(Boolean));
    for (const assessment of localAssessments) {
      const localId=String(assessment.id||'');
      if (assessmentIds.has(localId) || assessmentLegacy.has(localId)) continue;
      const cloudCourseId=courseIdMap.get(assessment.courseId)||assessment.courseId;
      if (cloudCourseId) await createAssessment(user,semester,assessment,cloudCourseId,localId);
    }
    cloudAssessments = await listAssessments(semester.$id);
    return { courses:cloudCourses, assessments:cloudAssessments };
  }

  async function syncPlannerSeed(user, semester, localTasks=[], localWorkBlocks=[]) {
    let cloudTasks = await listTasks(semester.$id);
    const taskIds = new Set(cloudTasks.map(r=>r.$id));
    const taskLegacy = new Set(cloudTasks.map(r=>r.legacyId).filter(Boolean));
    for (const task of localTasks) {
      const localId=String(task.id||'');
      if (taskIds.has(localId) || taskLegacy.has(localId)) continue;
      await createTask(user,semester,task,localId);
    }
    cloudTasks = await listTasks(semester.$id);
    const taskIdMap = new Map();
    cloudTasks.forEach(r=>{ taskIdMap.set(r.$id,r.$id); if(r.legacyId) taskIdMap.set(r.legacyId,r.$id); });

    let cloudBlocks = await listWorkBlocks(semester.$id);
    const blockIds = new Set(cloudBlocks.map(r=>r.$id));
    const blockLegacy = new Set(cloudBlocks.map(r=>r.legacyId).filter(Boolean));
    for (const block of localWorkBlocks) {
      const localId=String(block.id||'');
      if (blockIds.has(localId) || blockLegacy.has(localId)) continue;
      const payload={...block,taskId:taskIdMap.get(block.taskId)||block.taskId||''};
      await createWorkBlock(user,semester,payload,localId);
    }
    cloudBlocks = await listWorkBlocks(semester.$id);
    return { tasks:cloudTasks, workBlocks:cloudBlocks };
  }

  window.studentHubCloud = Object.freeze({
    ready:true, config:CONFIG, client, account, tablesDB,
    getCurrentUser, signUp, signIn, signOut, listSemesters, ensureSemester,
    listCourses, listAssessments, listTasks, listWorkBlocks,
    createCourse, createAssessment, createTask, createWorkBlock,
    updateCourse, updateAssessment, updateTask, updateWorkBlock,
    syncAcademicSeed, syncPlannerSeed
  });
})();
