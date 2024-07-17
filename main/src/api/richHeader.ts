import { FastifyPluginCallback } from 'fastify';
import { Pair } from '../models/Pair';
import ejs from 'ejs';
import fs from 'fs';
import { Group as OicqGroup, Member as OicqMember } from '@icqqjs/icqq';
import { format } from 'date-and-time';
import { Group, GroupMemberInfo } from '../client/QQClient';
import { NapCatGroupMember } from '../client/NapCatClient';

const template = ejs.compile(fs.readFileSync('./assets/richHeader.ejs', 'utf-8'));

export default ((fastify, opts, done) => {
  fastify.get<{
    Params: { apiKey: string, userId: string }
  }>('/:apiKey/:userId', async (request, reply) => {
    const pair = Pair.getByApiKey(request.params.apiKey);
    if (!pair) {
      reply.code(404);
      return 'Group not found';
    }
    const group = pair.qq as Group;
    const member = group.pickMember(Number(request.params.userId), true);
    if (!member) {
      reply.code(404);
      return 'Member not found';
    }
    const profile = group instanceof OicqGroup ? await group.client.getProfile(member.uid) : ({} as any); // TODO
    let memberInfo: GroupMemberInfo;
    if (member instanceof OicqMember) {
      memberInfo = member.info;
    }
    else if (member instanceof NapCatGroupMember) {
      memberInfo = await member.renew();
    }
    if (!memberInfo) {
      memberInfo = {} as any;
    }

    reply.type('text/html');
    return template({
      userId: request.params.userId,
      title: memberInfo.title,
      name: memberInfo.card || memberInfo.nickname,
      role: memberInfo.role,
      joinTime: format(new Date(memberInfo.join_time * 1000), 'YYYY-MM-DD HH:mm'),
      lastSentTime: format(new Date(memberInfo.last_sent_time * 1000), 'YYYY-MM-DD HH:mm'),
      regTime: format(new Date(profile.regTimestamp * 1000), 'YYYY-MM-DD HH:mm'),
      location: [profile.country, profile.province, profile.city].join(' ').trim(),
      nickname: memberInfo.nickname,
      email: profile.email,
      qid: profile.QID,
      signature: profile.signature,
      birthday: (profile.birthday || []).join('/'),
    });
  });

  done();
}) as FastifyPluginCallback;
