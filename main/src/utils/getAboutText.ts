import { Group as OicqGroup } from '@icqqjs/icqq';
import { Friend, Group } from '../client/QQClient';

export default async function getAboutText(entity: Friend | Group, html: boolean) {
  let text: string;
  if ('uid' in entity) {
    text = `<b>备注：</b>${entity.remark}\n` +
      `<b>昵称：</b>${entity.nickname}\n` +
      `<b>账号：</b>${entity.uid}`;
  }
  else if (entity instanceof OicqGroup) {
    const owner = await entity.pickMember(entity.info.owner_id).renew();
    const self = await entity.pickMember(entity.client.uin).renew();
    text = `<b>群名称：</b>${entity.name}\n` +
      `<b>${entity.info.member_count} 名成员</b>\n` +
      `<b>群号：</b><code>${entity.group_id}</code>\n` +
      (self ? `<b>我的群名片：</b>${self.title ? `「<i>${self.title}</i>」` : ''}${self.card}\n` : '') +
      (owner ? `<b>群主：</b>${owner.title ? `「<i>${owner.title}</i>」` : ''}` +
        `${owner.card || owner.nickname} (<code>${entity.info.owner_id}</code>)` : '') +
      ((entity.is_admin || entity.is_owner) ? '\n<b>可管理</b>' : '');
  }
  // TODO: NapCat Group

  if (!html) {
    text = text.replace(/<\/?\w+>/g, '');
  }
  return text;
}
