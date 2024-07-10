import type { ForwardMessage, MessageRet, Quotable, Sendable } from '@icqqjs/icqq';
import { GfsFileStat } from '@icqqjs/icqq/lib/gfs';
import { Gender, GroupRole } from '@icqqjs/icqq/lib/common';

export interface QQEntity {
  readonly dm: boolean;

  getForwardMsg(resid: string, fileName?: string): Promise<ForwardMessage[]>;

  getVideoUrl(fid: string, md5: string | Buffer): Promise<string>;

  recallMsg(paramOrMessageId: number, rand?: number, timeOrPktNum?: number): Promise<boolean>;

  sendMsg(content: Sendable, source?: Quotable): Promise<MessageRet>;

  getForwardMsg(resid: string, fileName?: string): Promise<ForwardMessage[]>;

  getFileUrl(fid: string): Promise<string>;
}

export interface QQUser extends QQEntity {
  readonly uid: number;
}

export interface Friend extends QQUser {
  readonly nickname: string;
  readonly remark: string;

  poke(self?: boolean): Promise<boolean>;

  sendFile(file: string | Buffer | Uint8Array, filename?: string, callback?: (percentage: string) => void): Promise<string>;
}

export interface Group extends QQEntity {
  readonly gid: number;
  readonly name: string;
  readonly is_owner: boolean;
  readonly is_admin: boolean;
  readonly fs: GroupFs;

  pickMember(uid: number, strict?: boolean): GroupMember;

  pokeMember(uid: number): Promise<boolean>;

  muteMember(uid: number, duration?: number): Promise<void>;

  setCard(uid: number, card?: string): Promise<boolean>;
}

export interface GroupFs {
  upload(file: string | Buffer | Uint8Array, pid?: string, name?: string, callback?: (percentage: string) => void): Promise<GfsFileStat>;
}

export interface GroupMember extends QQUser {
}

export interface GroupMemberInfo {
  readonly card: string;
  readonly nickname: string;
  readonly sex: Gender;
  readonly age: number;
  readonly join_time: number;
  readonly last_sent_time: number;
  readonly role: GroupRole;
  readonly title: string;
}
