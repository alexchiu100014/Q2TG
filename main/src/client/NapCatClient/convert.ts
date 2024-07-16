import type { Receive, Send } from 'node-napcat-ts';
import { SendableElem } from '../QQClient';
import { MessageElem } from '@icqqjs/icqq';
import { file as createTempFileBase, FileResult } from 'tmp-promise';
import fsP from 'fs/promises';
import env from '../../models/env';
import fs from 'fs';
import { Readable } from 'node:stream';

const createTempFile = (options: Parameters<typeof createTempFileBase>[0] = {}) => createTempFileBase({
  tmpdir: env.CACHE_DIR,
  ...options,
});

export const messageElemToNapCatSendable = async (elem: SendableElem): Promise<{ elem: Send[keyof Send], tempFiles: FileResult[] }> => {
  const noTmp = (elem: Send[keyof Send]) => ({
    elem,
    tempFiles: [],
  });
  switch (elem.type) {
    case 'at':
    case 'text':
    case 'face':
      return noTmp({
        type: elem.type,
        data: elem,
      } as any);
    case 'rps':
    case 'dice':
      return noTmp({
        type: elem.type,
        data: {
          result: elem.id,
        },
      });
    case 'image':
    case 'record':
    case 'video':
      const tempFiles: FileResult[] = [];
      if (Buffer.isBuffer(elem.file)) {
        const file = await createTempFile({ postfix: '.tmp' });
        tempFiles.push(file);
        await fsP.writeFile(file.path, elem.file);
        elem.file = file.path;
      }
      else if (typeof elem.file === 'object' && 'pipe' in elem.file) {
        const file = await createTempFile({ postfix: '.tmp' });
        tempFiles.push(file);
        await new Promise((resolve, reject) => {
          const writeStream = fs.createWriteStream(file.path);
          writeStream.on('error', reject);
          writeStream.on('finish', resolve);
          (elem.file as Readable).pipe(writeStream);
        });
        elem.file = file.path;
      }
      if (!/^(https?|file):\/\//.test(elem.file) && elem.file.startsWith('/')) {
        elem.file = `file://${elem.file}`;
      }
      return {
        elem: {
          type: elem.type,
          data: {
            file: elem.file,
            summary: 'Q2TG ' + elem.type,
            name: elem.type,
          },
        } as any,
        tempFiles,
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
