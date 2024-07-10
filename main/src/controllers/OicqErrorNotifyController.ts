import Instance from '../models/Instance';
import OicqClient from '../client/OicqClient';
import { throttle } from '../utils/highLevelFunces';
import { QQClient } from '../client/QQClient';

export default class OicqErrorNotifyController {
  private sendMessage = throttle((message: string) => {
    return this.instance.ownerChat.sendMessage(message);
  }, 1000 * 60);

  public constructor(private readonly instance: Instance,
                     private readonly oicq: QQClient) {
    if (oicq instanceof OicqClient) {
      oicq.oicq.on('system.offline', async ({ message }) => {
        await this.sendMessage(`<i>QQ 机器人掉线</i>\n${message}`);
      });
    }
    // TODO: NapCat
  }
}
