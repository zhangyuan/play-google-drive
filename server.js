const Koa = require('koa');
const app = new Koa();
const _ = require('koa-route');

const queryString = require('query-string');
var google = require('googleapis');
const session = require('koa-session');

const Drive = require('./drive').Drive;
const {createOAuth2Client, getAccessToken} = require('./oauth');

app.keys = ['some secret hurr'];
app.use(session({}, app));

const scopes = [
    'https://www.googleapis.com/auth/drive'
];

app.use(_.get('/auth/authorize', async (ctx) => {
    const authorizeUrl = createOAuth2Client().generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
    });

    ctx.redirect(authorizeUrl);
}));

app.use(_.get('/auth/callback', async (ctx) => {
    const querystring = ctx.request.querystring;
    const parsed = queryString.parse(querystring);
    const code = parsed.code;
    const oauth2Client =  createOAuth2Client()
    const accessToken = await getAccessToken(oauth2Client, code);
    ctx.session.accessToken = accessToken

    ctx.body = {
        access_token: accessToken
    }
}));

app.use(_.get('/api/self', (ctx) => {
    const accessToken = ctx.session.accessToken
    ctx.body = {
        access_token: accessToken
    }
}));

app.use(_.get('/api/teamdrives', async (ctx) => {
    const accessToken = ctx.session.accessToken
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials(accessToken);
    const drive = new Drive(oauth2Client);
    const response = await drive.list();
    ctx.body = response;
}));



app.listen(parseInt(process.env.PORT) || 9999);