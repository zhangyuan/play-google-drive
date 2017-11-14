const Drive = require('./drive').Drive;
const {createOAuth2Client} = require('./oauth');
const { readFile } = require('./helpers');
const path = require('path');
const { sequelize } = require('./database');
const { TeamDrive, DriveFile } = require('./models');
const moment = require('moment');

const fetchTeamDrives = async () => {
  const drive = await createDriveClient();
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
      const teamDrive = await TeamDrive.findOne({where: {id: item.id}});
      if(!teamDrive) {
        await TeamDrive.create({
          id: item.id,
          kind: item.kind,
          name: item.name
        });
      }
    }
  }
};

async function fetchFilesFromTeamDrive(driveClient, teamDrive) {
  let pageToken = null;

  while (true) {
    let parameters = {
      pageToken: pageToken,
      corpora: 'teamDrive',
      supportsTeamDrives: true,
      includeTeamDriveItems: true,
      orderBy: 'createdDate',
      teamDriveId: teamDrive.id
    };
    const data = await driveClient.files(parameters);

    if (data.nextPageToken) {
      pageToken = data.nextPageToken;
    } else {
      break;
    }

    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i];

      const driveFile = await DriveFile.findOne({where: {id: item.id}});
      if (!driveFile) {
        await DriveFile.create({
          id: item.id,
          teamDriveId: item.teamDriveId,
          kind: item.kind,
          title: item.title,
          createdDate: moment(item.createdDate),
          modifiedDate: moment(item.modifiedDate),
        })
      }
    }
  }
}

const fetchFiles = async () => {
  const driveClient = await createDriveClient();

  const teamDrives = (await TeamDrive.findAll());
  for(let i = 0; i < teamDrives.length; i ++) {
    await fetchFilesFromTeamDrive(driveClient, teamDrives[i]);
  }
};

async function createDriveClient() {
  let jsonString = await readFile(path.resolve(__dirname, './access-token.json'));
  const accessToken = JSON.parse(jsonString);

  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials(accessToken);
  return new Drive(oauth2Client);
}

const tasks = {
  fetchFiles,
  fetchTeamDrives
};

(async() => {
  process.on('unhandledRejection', (reason) => {
    console.log('Reason: ' + reason);
    process.exit(1);
  });
  await sequelize.sync();
  let task = process.argv[2];
  await tasks[task]();
})();



