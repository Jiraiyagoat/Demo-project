(() => {
  'use strict';

  const CONFIG = Object.freeze({
    endpoint: 'https://fra.cloud.appwrite.io/v1',
    projectId: '6ab9533600167cfe8598',
    databaseId: 'student_hub',
    semestersTableId: 'semesters'
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

  async function listSemesters() {
    return tablesDB.listRows({
      databaseId: CONFIG.databaseId,
      tableId: CONFIG.semestersTableId
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
      permissions: [
        Appwrite.Permission.read(Appwrite.Role.user(user.$id)),
        Appwrite.Permission.update(Appwrite.Role.user(user.$id)),
        Appwrite.Permission.delete(Appwrite.Role.user(user.$id))
      ]
    });
  }

  async function ensureSemester(user) {
    const result = await listSemesters();
    const rows = Array.isArray(result?.rows) ? result.rows : [];
    const existing = rows.find(row => row.isActive) || rows[0];
    if (existing) return existing;
    return createSemesterForUser(user);
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
    ensureSemester
  });
})();
