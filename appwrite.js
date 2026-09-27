const client = new Appwrite.Client();

client
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("6ab9533600167cfe8598");

const account = new Appwrite.Account(client);
const tablesDB = new Appwrite.TablesDB(client);

window.studentHubBackend = {
  client,
  account,
  tablesDB
};
