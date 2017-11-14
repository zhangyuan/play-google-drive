const Koa = require('koa');
const app = new Koa();
const _ = require('koa-route');
const fs = require('fs');

const queryString = require('query-string');
const session = require('koa-session');

const path = require('path');

const Drive = require('./drive').Drive;
const {createOAuth2Client, getTokensByCode, refreshTokens} = require('./oauth');
const {saveFile, readFile, fileExists} = require('./helpers');

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

app.use(_.get('/auth/refresh', async (ctx) => {
  const oauth2Client = createOAuth2Client();
  const oldTokens = JSON.parse(await readFile(path.resolve(__dirname, 'tokens.json')));
  oauth2Client.setCredentials(oldTokens);

  const tokens = await refreshTokens(oauth2Client);

  sendTokens(ctx, tokens);
}));

function sendTokens(ctx, tokens) {
  ctx.session.tokens = tokens;

  ctx.body = {
    tokens: tokens
  };
}

app.use(_.get('/auth/callback', async (ctx) => {
  let tokensPath = path.resolve(__dirname, 'tokens.json');

  if (await fileExists(tokensPath)) {
    ctx.body = {message: 'tokens.json exists. Please remove it first.'};
    return;
  }

  const querystring = ctx.request.querystring;
  const parsed = queryString.parse(querystring);
  const code = parsed.code;
  const oauth2Client = createOAuth2Client();
  const tokens = await getTokensByCode(oauth2Client, code);

  sendTokens(ctx, tokens);
  await saveFile(tokensPath, JSON.stringify(tokens, null, 4));
}));

app.use(_.get('/api/self', (ctx) => {
  const tokens = ctx.session.tokens;
  ctx.body = {
    tokens: tokens
  }
}));

app.use(_.get('/api/teamdrives', async (ctx) => {
  const tokens = ctx.session.tokens;
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials(tokens);
  const drive = new Drive(oauth2Client);
  const response = await drive.list();
  ctx.body = response;
}));

app.listen(parseInt(process.env.PORT) || 9999);