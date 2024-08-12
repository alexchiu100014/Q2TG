import { getLogger } from 'log4js';
import env from '../models/env';
import richHeader from './richHeader';
import telegramAvatar from './telegramAvatar';
import '@bogeychan/elysia-polyfills/node/index.js';
import { Elysia } from 'elysia';
import ui from './ui';

const log = getLogger('Web Api');

let app = new Elysia()
  .onError(log.error.bind(log))
  .get('/', () => {
    return { hello: 'Q2TG' };
  })
  .mount('/telegramAvatar', telegramAvatar)
  .mount('/richHeader', richHeader)
  .mount('/ui', ui);

export default {
  startListening() {
    app.listen(env.LISTEN_PORT);
    log.info('Listening on', env.LISTEN_PORT);
  },
};
