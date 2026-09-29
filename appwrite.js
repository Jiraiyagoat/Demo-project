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
    workBlocksTableId: 'work_blocks',
    resourcesTableId: 'resources',
    inboxTableId: 'inbox_items',
    studySessionsTableId: 'study_sessions',
    aiJobsTableId: 'ai_jobs',
    academicFilesBucketId: 'academic_files',
    academicAiFunctionId: 'academic-ai'
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
  const storage = new Appwrite.Storage(client);
  const functions = new Appwrite.Functions(client);

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


  function resourcePayload(user, semester, resource, legacyId='') {
    const data = {
      userId:user.$id, semesterId:semester.$id, legacyId:String(legacyId || resource.legacyId || ''),
      courseId:String(resource.courseId || ''), topic:String(resource.topic || 'General').slice(0,120),
      type:String(resource.type || 'Note').slice(0,32), title:String(resource.title || 'Untitled resource').slice(0,200),
      description:String(resource.description || '').slice(0,500), url:String(resource.url || '').slice(0,500),
      sourceType:String(resource.sourceType || 'library').slice(0,32)
    };
    if (resource.storageFileId) data.storageFileId = String(resource.storageFileId).slice(0,64);
    if (resource.fileName) data.fileName = String(resource.fileName).slice(0,255);
    if (resource.mimeType) data.mimeType = String(resource.mimeType).slice(0,120);
    if (Number.isFinite(Number(resource.fileSize)) && Number(resource.fileSize) >= 0) data.fileSize = Math.round(Number(resource.fileSize));
    return data;
  }

  function inboxPayload(user, semester, item, legacyId='') {
    const data = {
      userId:user.$id, semesterId:semester.$id, legacyId:String(legacyId || item.legacyId || ''),
      text:String(item.text || '').slice(0,10000), processed:Boolean(item.processed),
      sourceType:String(item.sourceType || 'capture').slice(0,32)
    };
    if (item.processedAt) data.processedAt = new Date(item.processedAt).toISOString();
    return data;
  }

  function studySessionPayload(user, semester, session, legacyId='') {
    return {
      userId:user.$id, semesterId:semester.$id, legacyId:String(legacyId || session.legacyId || ''),
      courseId:String(session.courseId || ''), assessmentId:String(session.assessmentId || ''),
      topic:String(session.topic || 'General').slice(0,120),
      minutes:Math.max(1,Math.round(Number(session.minutes)||1)),
      completedAt:new Date(session.completedAt || new Date()).toISOString(),
      sourceType:String(session.sourceType || 'focus').slice(0,32)
    };
  }

  async function listCourses(semesterId) { return (await listRows(CONFIG.coursesTableId)).filter(r=>r.semesterId===semesterId); }
  async function listAssessments(semesterId) { return (await listRows(CONFIG.assessmentsTableId)).filter(r=>r.semesterId===semesterId); }
  async function listTasks(semesterId) { return (await listRows(CONFIG.tasksTableId)).filter(r=>r.semesterId===semesterId); }
  async function listWorkBlocks(semesterId) { return (await listRows(CONFIG.workBlocksTableId)).filter(r=>r.semesterId===semesterId); }
  async function listResources(semesterId) { return (await listRows(CONFIG.resourcesTableId)).filter(r=>r.semesterId===semesterId); }
  async function listInboxItems(semesterId) { return (await listRows(CONFIG.inboxTableId)).filter(r=>r.semesterId===semesterId); }
  async function listStudySessions(semesterId) { return (await listRows(CONFIG.studySessionsTableId)).filter(r=>r.semesterId===semesterId); }

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
  async function createResource(user, semester, resource, legacyId='') {
    return tablesDB.createRow({ databaseId:CONFIG.databaseId, tableId:CONFIG.resourcesTableId, rowId:Appwrite.ID.unique(), data:resourcePayload(user,semester,resource,legacyId), permissions:privatePermissions(user.$id) });
  }
  async function createInboxItem(user, semester, item, legacyId='') {
    return tablesDB.createRow({ databaseId:CONFIG.databaseId, tableId:CONFIG.inboxTableId, rowId:Appwrite.ID.unique(), data:inboxPayload(user,semester,item,legacyId), permissions:privatePermissions(user.$id) });
  }
  async function createStudySession(user, semester, session, legacyId='') {
    return tablesDB.createRow({ databaseId:CONFIG.databaseId, tableId:CONFIG.studySessionsTableId, rowId:Appwrite.ID.unique(), data:studySessionPayload(user,semester,session,legacyId), permissions:privatePermissions(user.$id) });
  }


  function validatePdf(file) {
    if (!file) throw new Error('Choose a PDF file first.');
    const name = String(file.name || '').toLowerCase();
    const isPdf = file.type === 'application/pdf' || name.endsWith('.pdf');
    if (!isPdf) throw new Error('Only PDF files are supported in v0.6.');
    const maxBytes = 20 * 1024 * 1024;
    if (Number(file.size || 0) > maxBytes) throw new Error('PDF must be 20 MB or smaller.');
  }

  async function uploadAcademicFile(user, semester, file, folder='resources') {
    validatePdf(file);
    const safeFolder = `${folder}/${user.$id}/${semester.$id}`;
    return storage.createFile({
      bucketId: CONFIG.academicFilesBucketId,
      fileId: Appwrite.ID.unique(),
      file,
      permissions: privatePermissions(user.$id),
      folder: safeFolder
    });
  }

  function getAcademicFileView(fileId) {
    return storage.getFileView({ bucketId: CONFIG.academicFilesBucketId, fileId });
  }

  function getAcademicFileDownload(fileId) {
    return storage.getFileDownload({ bucketId: CONFIG.academicFilesBucketId, fileId });
  }

  async function deleteAcademicFile(fileId) {
    if (!fileId) return;
    return storage.deleteFile({ bucketId: CONFIG.academicFilesBucketId, fileId });
  }


  async function callAcademicAI(action, payload={}) {
    const execution = await functions.createExecution({
      functionId: CONFIG.academicAiFunctionId,
      body: JSON.stringify({ action, ...payload }),
      async: false,
      path: '/',
      method: 'POST',
      headers: { 'content-type': 'application/json' }
    });
    let parsed = null;
    try { parsed = execution?.responseBody ? JSON.parse(execution.responseBody) : null; } catch (_) {}
    if ((execution?.responseStatusCode || 500) >= 400 || parsed?.ok === false) {
      const message = parsed?.error || execution?.errors || `Academic AI failed with HTTP ${execution?.responseStatusCode || 'unknown'}.`;
      const err = new Error(message);
      err.code = execution?.responseStatusCode || 500;
      throw err;
    }
    return parsed || {};
  }

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  async function createAiJob(user, semester, resourceId) {
    try {
      return await tablesDB.createRow({
        databaseId: CONFIG.databaseId,
        tableId: CONFIG.aiJobsTableId,
        rowId: Appwrite.ID.unique(),
        data: {
          userId: user.$id,
          semesterId: semester.$id,
          resourceId: String(resourceId || ''),
          status: 'queued'
        },
        permissions: privatePermissions(user.$id)
      });
    } catch (error) {
      if (error?.code === 404 || /table/i.test(String(error?.message || ''))) {
        throw new Error('AI background jobs are not configured yet. Create the ai_jobs table from APPWRITE_V074_SETUP.md.');
      }
      throw error;
    }
  }

  async function getAiJob(jobId) {
    return tablesDB.getRow({
      databaseId: CONFIG.databaseId,
      tableId: CONFIG.aiJobsTableId,
      rowId: jobId
    });
  }

  async function deleteAiJob(jobId) {
    if (!jobId) return;
    return tablesDB.deleteRow({
      databaseId: CONFIG.databaseId,
      tableId: CONFIG.aiJobsTableId,
      rowId: jobId
    });
  }

  async function analyzeSyllabusResource(resourceId, user, semester) {
    if (!user?.$id || !semester?.$id) throw new Error('Sign in and load a semester before using Academic AI.');

    const job = await createAiJob(user, semester, resourceId);
    let executionStarted = false;

    try {
      await functions.createExecution({
        functionId: CONFIG.academicAiFunctionId,
        body: JSON.stringify({
          action: 'analyzeSyllabusAsync',
          resourceId,
          jobId: job.$id
        }),
        async: true,
        path: '/',
        method: 'POST',
        headers: { 'content-type': 'application/json' }
      });
      executionStarted = true;

      const deadline = Date.now() + 180000;
      while (Date.now() < deadline) {
        await sleep(1800);
        const fresh = await getAiJob(job.$id);
        const status = String(fresh?.status || '').toLowerCase();

        if (status === 'completed') {
          let result = null;
          try { result = fresh?.result ? JSON.parse(fresh.result) : null; } catch (_) {}
          try { await deleteAiJob(job.$id); } catch (_) {}
          if (!result || result?.ok === false) {
            throw new Error(result?.error || 'Academic AI completed without a readable result.');
          }
          return result;
        }

        if (status === 'failed') {
          const message = fresh?.error || 'Academic AI background job failed.';
          try { await deleteAiJob(job.$id); } catch (_) {}
          const err = new Error(message);
          err.code = 500;
          throw err;
        }
      }

      throw new Error('Academic AI is still processing after 3 minutes. Check the latest Function execution and ai_jobs row.');
    } catch (error) {
      if (!executionStarted) {
        try { await deleteAiJob(job.$id); } catch (_) {}
      }
      throw error;
    }
  }

  async function getPrivateFileUrl(resourceId) {
    return callAcademicAI('fileUrl', { resourceId });
  }

  async function checkAcademicAI() {
    return callAcademicAI('health');
  }

  async function deleteResource(rowId) {
    return tablesDB.deleteRow({ databaseId:CONFIG.databaseId, tableId:CONFIG.resourcesTableId, rowId });
  }

  async function updateCourse(rowId, patch) { return tablesDB.updateRow({ databaseId:CONFIG.databaseId, tableId:CONFIG.coursesTableId, rowId, data:patch }); }
  async function updateAssessment(rowId, patch) { return tablesDB.updateRow({ databaseId:CONFIG.databaseId, tableId:CONFIG.assessmentsTableId, rowId, data:patch }); }
  async function updateTask(rowId, patch) { return tablesDB.updateRow({ databaseId:CONFIG.databaseId, tableId:CONFIG.tasksTableId, rowId, data:patch }); }
  async function updateWorkBlock(rowId, patch) { return tablesDB.updateRow({ databaseId:CONFIG.databaseId, tableId:CONFIG.workBlocksTableId, rowId, data:patch }); }
  async function updateResource(rowId, patch) { return tablesDB.updateRow({ databaseId:CONFIG.databaseId, tableId:CONFIG.resourcesTableId, rowId, data:patch }); }
  async function updateInboxItem(rowId, patch) { return tablesDB.updateRow({ databaseId:CONFIG.databaseId, tableId:CONFIG.inboxTableId, rowId, data:patch }); }

  async function syncAcademicSeed(user, semester) {
    // Cloud is the source of truth for signed-in users. New accounts start empty;
    // sample/demo data must never be copied into a real semester automatically.
    const [courses, assessments] = await Promise.all([
      listCourses(semester.$id),
      listAssessments(semester.$id)
    ]);
    return { courses, assessments };
  }

  async function syncPlannerSeed(user, semester) {
    const [tasks, workBlocks] = await Promise.all([
      listTasks(semester.$id),
      listWorkBlocks(semester.$id)
    ]);
    return { tasks, workBlocks };
  }

  async function syncKnowledgeSeed(user, semester) {
    const [resources, inbox, studySessions] = await Promise.all([
      listResources(semester.$id),
      listInboxItems(semester.$id),
      listStudySessions(semester.$id)
    ]);
    return { resources, inbox, studySessions };
  }

  window.studentHubCloud = Object.freeze({
    ready:true, config:CONFIG, client, account, tablesDB, storage, functions,
    getCurrentUser, signUp, signIn, signOut, listSemesters, ensureSemester,
    listCourses, listAssessments, listTasks, listWorkBlocks, listResources, listInboxItems, listStudySessions,
    createCourse, createAssessment, createTask, createWorkBlock, createResource, createInboxItem, createStudySession,
    updateCourse, updateAssessment, updateTask, updateWorkBlock, updateResource, updateInboxItem, deleteResource,
    uploadAcademicFile, getAcademicFileView, getAcademicFileDownload, deleteAcademicFile,
    callAcademicAI, analyzeSyllabusResource, getPrivateFileUrl, checkAcademicAI,
    syncAcademicSeed, syncPlannerSeed, syncKnowledgeSeed
  });
})();
