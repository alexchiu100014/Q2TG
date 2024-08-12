import { Elysia, t } from 'elysia';
import db from '../../models/db';
import { Pair } from '../../models/Pair';

const forwardCache = new Map<string, any>();

let app = new Elysia()
  .post('/Q2tgServlet/GetForwardMultipleMessageApi', async ({ body }) => {
    // @ts-ignore
    const uuid = body.uuid;
    if (!forwardCache.has(uuid)) {
      const data = await db.forwardMultiple.findFirst({
        where: { id: uuid },
      });
      const pair = Pair.getByDbId(data.fromPairId);
      forwardCache.set(uuid, await pair.qq.getForwardMsg(data.resId, data.fileName));

      setTimeout(() => {
        forwardCache.delete(uuid);
      }, 1000 * 60 * 15);
    }
    return forwardCache.get(uuid);
  }, {
    body: t.Object({
      // 不许注入
      uuid: t.String({ format: 'uuid' }),
    }),
  });

export default app;
