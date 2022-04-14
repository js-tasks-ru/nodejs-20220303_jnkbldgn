const path = require('path');
const Koa = require('koa');
const app = new Koa();

app.use(require('koa-static')(path.join(__dirname, 'public')));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const {constants: {HTTP_STATUS_OK}} = require('http2');
const router = new Router();

let messageResolver;

router.get('/subscribe', async (ctx, next) => {
  const message = new Promise((resolve) => {
    messageResolver = resolve;
  });

  const text = await message;

  ctx.body = text;
  ctx.status = HTTP_STATUS_OK;
});

router.post('/publish', async (ctx, next) => {
  messageResolver(ctx.request.body.message);

  ctx.status = HTTP_STATUS_OK;
});

app.use(router.routes());

module.exports = app;
