const path = require('path');
const Koa = require('koa');
const app = new Koa();

app.use(require('koa-static')(path.join(__dirname, 'public')));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const {constants: {HTTP_STATUS_OK}} = require('http2');
const router = new Router();

let messageResolvers = [];

router.get('/subscribe', async (ctx, next) => {
  const message = new Promise((resolve) => {
    messageResolvers.push(resolve);
  });

  const text = await message;

  ctx.body = text;
  ctx.status = HTTP_STATUS_OK;

  return next();
});

router.post('/publish', async (ctx, next) => {
  if (!ctx.request.body.message) {
    return next();
  }

  messageResolvers.forEach((resolver) => resolver(ctx.request.body.message));
  messageResolvers = [];

  ctx.status = HTTP_STATUS_OK;

  return next();
});

app.use(router.routes());

module.exports = app;
