import { getLogger } from 'log4js';
import env from '../models/env';
import richHeader from './richHeader';
import telegramAvatar from './telegramAvatar';
import '@bogeychan/elysia-polyfills/node/index.js';
import { Elysia } from 'elysia';
import { staticPlugin } from '@elysiajs/static';

const log = getLogger('Web Api');

let app = new Elysia()
  .get('/', () => {
    return { hello: 'Q2TG' };
  })
  .mount('/telegramAvatar', telegramAvatar)
  .mount('/richHeader', richHeader);

if (env.UI_PROXY) {
  app = app.mount('/ui', (req) => {
    const url = new URL(req.url);
    const baseUrl = new URL(env.UI_PROXY);
    url.hostname = baseUrl.hostname;
    url.port = baseUrl.port;
    url.protocol = baseUrl.protocol;
    url.pathname = '/ui' + url.pathname;
    return fetch(url.toString(), req);
  });
}
else if (env.UI_PATH) {
  app = app.use(staticPlugin({
    prefix: '/ui',
    assets: env.UI_PATH,
    indexHTML: true,
  }));
}

export default {
  startListening() {
    app.listen(env.LISTEN_PORT);
    log.info('Listening on', env.LISTEN_PORT);
  },
};
