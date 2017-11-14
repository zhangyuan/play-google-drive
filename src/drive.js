const google = require('googleapis');
const { refreshTokens } = require('./oauth');

class Drive {
    constructor(oauth2Client) {
        this.oauth2Client = oauth2Client
    }

    async files (options = {}) {
      await this.refreshTokensIfNecessary();
      return new Promise((resolve, reject) => {

        const drive = google.drive({
          version: 'v2',
          auth: this.oauth2Client
        });

        drive.files.list(options, (err, resp) => {
            if(err) {
                return reject(err);
            }
            return resolve(resp);
        })
      })
    }

    async refreshTokensIfNecessary () {
      const unixTime = new Date() / 1;
      let shouldRefresh = unixTime + (15 * 1000 * 1000) > this.oauth2Client.credentials.expiry_date;

      if(shouldRefresh) {
        const tokens = await refreshTokens(this.oauth2Client);
        this.oauth2Client.setCredentials(tokens);
      }
    }

    async list (pageToken = null) {
      await this.refreshTokensIfNecessary();
      return new Promise((resolve, reject) => {
          const drive = google.drive({
              version: 'v2',
              auth: this.oauth2Client
          });
          drive.teamdrives.list({
            pageToken: pageToken
          }, function (err, resp) {
              if(err) {
                  return reject(err)
              }
              return resolve(resp)
          });
      })
    }
}

module.exports = {
    Drive
};