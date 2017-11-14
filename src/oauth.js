var google = require('googleapis');
const clientSecret = require('./client-secret.json');
var OAuth2 = google.auth.OAuth2;

const createOAuth2Client = () => {
    return new OAuth2(
        clientSecret.web.client_id,
        clientSecret.web.client_secret,
        'http://localhost:9999/auth/callback'
    );
};

const getTokensByCode = (oauth2Client, code) => {
    return new Promise((resolve, reject) => {
        oauth2Client.getToken(code, (err, tokens) => {
            if(err) {
                return reject(err);
            }
            return resolve(tokens);
        })
    })
};

const refreshTokens = (oauth2Client) => {
  return new Promise((resolve, reject) => {
    oauth2Client.refreshAccessToken((err, tokens) => {
      if(err) {
        return reject(err);
      }
      return resolve(tokens);
    })
  })
};

module.exports = {
  createOAuth2Client,
  refreshTokens,
  getTokensByCode
};