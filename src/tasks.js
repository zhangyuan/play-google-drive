const Drive = require('./drive').Drive;
const {createOAuth2Client} = require('./oauth');
const { readFile } = require('./helpers');
const path = require('path');

const main = async () => {
  let jsonString = await readFile(path.resolve(__dirname, './access-token.json'));
  const accessToken = JSON.parse(jsonString);

  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials(accessToken);
  const drive = new Drive(oauth2Client);
  let pageToken = null;
  const teamdrives = []
  while (true) {
    const data = await drive.list(pageToken);
    if (data.nextPageToken) {
      pageToken = data.nextPageToken;
    } else {
      break;
    }

    console.log(data.items);
  }
};

(async() => {
  await main();
})();
