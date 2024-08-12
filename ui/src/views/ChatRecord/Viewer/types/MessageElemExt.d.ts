import { MessageElem } from "@icqqjs/icqq"

export type MessageElemExt = MessageElem | {
  type: 'video-loop',
  url: string
} | {
  type: 'tgs',
  url: string
}
