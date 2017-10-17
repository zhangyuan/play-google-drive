var google = require('googleapis');

class Drive {
    constructor(oauth2Client) {
        this.oauth2Client = oauth2Client
    }

    list () {
        return new Promise((resolve, reject) => {
            const drive = google.drive({
                version: 'v2',
                auth: this.oauth2Client
            });
            drive.teamdrives.list({}, function (err, resp) {
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
}