const Drive = require('./drive').Drive;
const {createOAuth2Client} = require('./oauth');
const { readFile } = require('./helpers');
const path = require('path');
const { sequelize } = require('./database');
const { TeamDrive } = require('./models');

const fetchTeamDrives = async () => {
  await sequelize.sync({});

  let jsonString = await readFile(path.resolve(__dirname, './access-token.json'));
  const accessToken = JSON.parse(jsonString);

  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials(accessToken);
  const drive = new Drive(oauth2Client);
  let pageToken = null;

  while (true) {
    const data = await drive.list(pageToken);
    if (data.nextPageToken) {
      pageToken = data.nextPageToken;
    } else {
      break;
    }

    for(let i = 0; i < data.items.length; i ++) {
      const item = data.items[i];
      await TeamDrive.create({
        id: item.id,
        kind: item.kind,
        name: item.name
      })
    }
  }
};

(async() => {
  await fetchTeamDrives();
})();
