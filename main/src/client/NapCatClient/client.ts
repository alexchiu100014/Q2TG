import { CreateQQClientParamsBase, Friend, Group, QQClient } from '../QQClient';
import random from '../../utils/random';
import { getLogger, Logger } from 'log4js';
import posthog from '../../models/posthog';
import type { WSSendParam, WSSendReturn } from 'node-napcat-ts';
import { NapCatFriend, NapCatGroup } from './entity';

export interface CreateNapCatParams extends CreateQQClientParamsBase {
  type: 'napcat';
  wsUrl: string;
}

export class NapCatClient extends QQClient {
  private constructor(id: number, private readonly wsUrl: string) {
    super(id);
    this.logger = getLogger(`NapCatClient - ${id}`);
    this.ws = new WebSocket(wsUrl);
    this.ws.onmessage = (e) => this.handleWebSocketMessage(e.data);
  }

  private readonly ws: WebSocket;
  private readonly logger: Logger;

  public static async create(params: CreateNapCatParams) {
    const instance = new this(params.id, params.wsUrl);
    return new Promise<NapCatClient>((resolve, reject) => {
      instance.ws.onopen = async () => {
        instance.logger.info('WS 连接成功');
        instance.ws.onerror = null;
        await instance.refreshSelf();
        resolve(instance);
      };
      instance.ws.onerror = (e) => {
        instance.logger.error('WS 连接出错', e);
        posthog.capture('WS 连接出错', { error: e });
        reject(e);
      };
    });
  }

  private readonly echoMap: { [key: string]: { resolve: (result: any) => void; reject: (result: any) => void } } = {};

  public async callApi<T extends keyof WSSendReturn>(action: T, params?: WSSendParam[T]): Promise<WSSendReturn[T]> {
    return new Promise<WSSendReturn[T]>((resolve, reject) => {
      const echo = `${new Date().getTime()}${random.int(100000, 999999)}`;
      this.echoMap[echo] = { resolve, reject };
      this.ws.send(JSON.stringify({ action, params, echo }));
      this.logger.trace('send', JSON.stringify({ action, params, echo }));
    });
  }

  private async handleWebSocketMessage(message: string) {
    this.logger.trace('receive', message);
    const data = JSON.parse(message);
    if (data.echo) {
      const promise = this.echoMap[data.echo];
      if (!promise) return;
      if (data.status === 'ok') {
        promise.resolve(data.data);
      }
      else {
        promise.reject(data.message);
      }
      return;
    }
  }

  public uin: number;
  public nickname: string;

  public async refreshSelf() {
    const data = await this.callApi('get_login_info');
    this.uin = data.user_id;
    this.nickname = data.nickname;
  }

  public async isOnline(): Promise<boolean> {
    const data = await this.callApi('get_status');
    return data.online;
  }

  public async getFriendsWithCluster(): Promise<{ name: string; friends: Friend[]; }[]> {
    const data = await this.callApi('get_friends_with_category');
    return data.map(it => ({
      name: it.categoryName,
      friends: it.buddyList.map(friend => NapCatFriend.createExisted(this, {
        nickname: friend.nick,
        uid: parseInt(friend.uin),
        remark: friend.remark,
      })),
    }));
  }

  public pickFriend(uin: number): Promise<Friend> {
    return NapCatFriend.create(this, uin);
  }

  public async getGroupList(): Promise<Group[]> {
    const data = await this.callApi('get_group_list');
    return data.map(it => NapCatGroup.createExisted(this, {
      gid: it.group_id,
      name: it.group_name,
    }));
  }

  public pickGroup(groupId: number): Promise<Group> {
    return NapCatGroup.create(this, groupId);
  }
}
