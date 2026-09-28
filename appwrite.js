(() => {
  'use strict';

  const CONFIG = Object.freeze({
    endpoint: 'https://fra.cloud.appwrite.io/v1',
    projectId: '6ab9533600167cfe8598',
    databaseId: 'student_hub',
    semestersTableId: 'semesters',
    coursesTableId: 'courses',
    assessmentsTableId: 'assessments'
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
    try {
      return await account.get();
    } catch (error) {
      if (error?.code === 401) return null;
      throw error;
    }
  }

  async function signUp({ name, email, password }) {
    return account.create({
      userId: Appwrite.ID.unique(),
      email,
      password,
      name
    });
  }

  async function signIn({ email, password }) {
    return account.createEmailPasswordSession({ email, password });
  }

  async function signOut() {
    return account.deleteSession({ sessionId: 'current' });
  }

  async function listRows(tableId, limit = 100) {
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

    if (month <= 5) {
      return {
        name: `Spring ${year}`,
        startDate: `${year}-01-15T00:00:00.000Z`,
        endDate: `${year}-06-30T23:59:59.000Z`
      };
    }

    return {
      name: `Fall ${year}`,
      startDate: `${year}-08-01T00:00:00.000Z`,
      endDate: `${year}-12-31T23:59:59.000Z`
    };
  }

  async function createSemesterForUser(user) {
    const semester = getDefaultSemesterData();

    return tablesDB.createRow({
      databaseId: CONFIG.databaseId,
      tableId: CONFIG.semestersTableId,
      rowId: Appwrite.ID.unique(),
      data: {
        userId: user.$id,
        name: semester.name,
        startDate: semester.startDate,
        endDate: semester.endDate,
        isActive: true
      },
      permissions: privatePermissions(user.$id)
    });
  }

  async function ensureSemester(user) {
    const result = await listSemesters();
    const rows = Array.isArray(result?.rows) ? result.rows : [];
    const existing = rows.find(row => row.isActive) || rows[0];
    if (existing) return existing;
    return createSemesterForUser(user);
  }

  function cleanTopics(topics) {
    return Array.isArray(topics)
      ? topics.map(value => String(value || '').trim()).filter(Boolean).slice(0, 40)
      : [];
  }

  function coursePayload(user, semester, course, legacyId = '') {
    return {
      userId: user.$id,
      semesterId: semester.$id,
      legacyId: String(legacyId || course.legacyId || ''),
      code: String(course.code || 'COURSE').slice(0, 32),
      name: String(course.name || 'Untitled course').slice(0, 120),
      teacher: String(course.teacher || '').slice(0, 120),
      room: String(course.room || '').slice(0, 80),
      color: String(course.color || '#6d63ed').slice(0, 16),
      schedule: String(course.schedule || '').slice(0, 160),
      grade: Number.isFinite(Number(course.grade)) ? Number(course.grade) : 0,
      target: Number.isFinite(Number(course.target)) ? Number(course.target) : 0,
      topics: cleanTopics(course.topics)
    };
  }

  function assessmentPayload(user, semester, assessment, courseId, legacyId = '') {
    return {
      userId: user.$id,
      semesterId: semester.$id,
      legacyId: String(legacyId || assessment.legacyId || ''),
      courseId: String(courseId || assessment.courseId || ''),
      title: String(assessment.title || 'Untitled assessment').slice(0, 200),
      type: String(assessment.type || 'Assignment').slice(0, 32),
      due: new Date(assessment.due).toISOString(),
      effort: Math.max(0, Math.round(Number(assessment.effort) || 0)),
      remaining: Math.max(0, Math.round(Number(assessment.remaining ?? assessment.effort) || 0)),
      status: String(assessment.status || 'not_started').slice(0, 32),
      weight: Number.isFinite(Number(assessment.weight)) ? Number(assessment.weight) : 0,
      topics: cleanTopics(assessment.topics),
      sourceType: String(assessment.sourceType || 'manual').slice(0, 32)
    };
  }

  async function listCourses(semesterId) {
    const rows = await listRows(CONFIG.coursesTableId);
    return rows.filter(row => row.semesterId === semesterId);
  }

  async function listAssessments(semesterId) {
    const rows = await listRows(CONFIG.assessmentsTableId);
    return rows.filter(row => row.semesterId === semesterId);
  }

  async function createCourse(user, semester, course, legacyId = '') {
    return tablesDB.createRow({
      databaseId: CONFIG.databaseId,
      tableId: CONFIG.coursesTableId,
      rowId: Appwrite.ID.unique(),
      data: coursePayload(user, semester, course, legacyId),
      permissions: privatePermissions(user.$id)
    });
  }

  async function createAssessment(user, semester, assessment, courseId, legacyId = '') {
    return tablesDB.createRow({
      databaseId: CONFIG.databaseId,
      tableId: CONFIG.assessmentsTableId,
      rowId: Appwrite.ID.unique(),
      data: assessmentPayload(user, semester, assessment, courseId, legacyId),
      permissions: privatePermissions(user.$id)
    });
  }

  async function updateCourse(rowId, patch) {
    return tablesDB.updateRow({
      databaseId: CONFIG.databaseId,
      tableId: CONFIG.coursesTableId,
      rowId,
      data: patch
    });
  }

  async function updateAssessment(rowId, patch) {
    return tablesDB.updateRow({
      databaseId: CONFIG.databaseId,
      tableId: CONFIG.assessmentsTableId,
      rowId,
      data: patch
    });
  }

  async function syncAcademicSeed(user, semester, localCourses = [], localAssessments = []) {
    let cloudCourses = await listCourses(semester.$id);

    const existingCourseIds = new Set(cloudCourses.map(row => row.$id));
    const existingCourseLegacy = new Set(cloudCourses.map(row => row.legacyId).filter(Boolean));

    for (const course of localCourses) {
      const localId = String(course.id || '');
      if (existingCourseIds.has(localId) || existingCourseLegacy.has(localId)) continue;
      await createCourse(user, semester, course, localId);
    }

    cloudCourses = await listCourses(semester.$id);

    const courseIdMap = new Map();
    cloudCourses.forEach(row => {
      courseIdMap.set(row.$id, row.$id);
      if (row.legacyId) courseIdMap.set(row.legacyId, row.$id);
    });

    let cloudAssessments = await listAssessments(semester.$id);
    const existingAssessmentIds = new Set(cloudAssessments.map(row => row.$id));
    const existingAssessmentLegacy = new Set(cloudAssessments.map(row => row.legacyId).filter(Boolean));

    for (const assessment of localAssessments) {
      const localId = String(assessment.id || '');
      if (existingAssessmentIds.has(localId) || existingAssessmentLegacy.has(localId)) continue;
      const cloudCourseId = courseIdMap.get(assessment.courseId) || assessment.courseId;
      if (!cloudCourseId) continue;
      await createAssessment(user, semester, assessment, cloudCourseId, localId);
    }

    cloudAssessments = await listAssessments(semester.$id);

    return {
      courses: cloudCourses,
      assessments: cloudAssessments
    };
  }

  window.studentHubCloud = Object.freeze({
    ready: true,
    config: CONFIG,
    client,
    account,
    tablesDB,
    getCurrentUser,
    signUp,
    signIn,
    signOut,
    listSemesters,
    ensureSemester,
    listCourses,
    listAssessments,
    createCourse,
    createAssessment,
    updateCourse,
    updateAssessment,
    syncAcademicSeed
  });
})();
