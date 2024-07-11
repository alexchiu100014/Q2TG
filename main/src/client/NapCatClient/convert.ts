import type { Receive, Send } from 'node-napcat-ts';
import { SendableElem } from '../QQClient';
import { MessageElem, segment } from '@icqqjs/icqq';

export const messageElemToNapCatSendable = (elem: SendableElem): Send[keyof Send] => {
  switch (elem.type) {
    case 'at':
      return {
        type: elem.type,
        data: elem,
      };
    case 'text':
      return {
        type: elem.type,
        data: elem,
      };
    case 'face':
      return {
        type: elem.type,
        data: elem,
      };
    case 'rps':
    case 'dice':
      return {
        type: elem.type,
        data: {
          result: elem.id,
        },
      };
    // TODO: 文件落本地
    case 'image':
      if (elem.file !== 'string') {
        throw new Error('TODO');
      }
      return {
        type: elem.type,
        data: {
          file: elem.file,
          summary: '图片',
          name: '图片',
        },
      };
    case 'record':
      if (elem.file !== 'string') {
        throw new Error('TODO');
      }
      return {
        type: elem.type,
        data: {
          file: elem.file,
          name: '语音',
        },
      };
    case 'video':
      if (elem.file !== 'string') {
        throw new Error('TODO');
      }
      return {
        type: elem.type,
        data: {
          file: elem.file,
          name: '视频',
        },
      };
    case 'sface':
    default:
      throw new Error('不支持此元素');
  }
};

export const napCatReceiveToMessageElem = (data: Receive[keyof Receive]): MessageElem | Receive['forward'] => {
  switch (data.type) {
    case 'text':
      return {
        ...data.data,
        type: data.type,
      };
    case 'face':
      return {
        ...data.data,
        type: data.type,
      };
    case 'mface':
      return {
        type: 'image',
        url: data.data.url,
        file: data.data.url,
      };
    case 'at':
      return {
        ...data.data,
        type: data.type,
      };
    case 'image':
      return {
        ...data.data,
        type: data.type,
      };
    case 'record':
      return {
        ...data.data,
        type: data.type,
      };
    case 'file':
      return {
        ...data.data,
        type: 'file',
        duration: 0,
        name: data.data.file,
        fid: data.data.file_id,
        size: data.data.file_size,
        md5: '',
      };
    case 'video':
      return {
        type: data.type,
        // 我们不需要 fileId，直接能拿到 url，url 进 getVideoUrl 转一圈拿回来自己，保持兼容性
        fid: data.data.url,
        file: data.data.url,
      };
    case 'json':
      return {
        ...data.data,
        type: data.type,
      };
    case 'dice':
    case 'rps':
      return {
        id: data.data.result,
        type: data.type,
      };
    case 'markdown':
      return {
        ...data.data,
        type: data.type,
      };
    case 'forward':
      return data;
    case 'reply':
      throw new Error('不出意外这个应该提前处理');
    case 'music':
    case 'customMusic':
      throw new Error('这个真的能被收到吗');
    default:
      throw new Error('不支持此元素');
  }
};
