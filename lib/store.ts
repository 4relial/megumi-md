import { proto } from "@adiwajshing/baileys";
export class MessageRetryHandler {
  public messagesMap: Record<string, proto.IMessage>;

  constructor() {
    this.messagesMap = {};
  }

  addMessage = async (message: proto.IWebMessageInfo) => {
    const id = message.key.id ?? "";

    console.log(this);

    this.messagesMap[id] = this.cleanMessage(message);

    return message;
  };

  getMessage = (msgKey: string): proto.IMessage => {
    return this.messagesMap[msgKey];
  };

  removeMessage = (msgKey: string) => {
    delete this.messagesMap[msgKey];
  };

  getMessageKeys = (): string[] => {
    return Object.keys(this.messagesMap);
  };

  cleanMessage = (message: proto.IWebMessageInfo): proto.IMessage => {
    const msg = message.message ?? {};
    return msg;
  };

  messageRetryHandler = async (message: proto.IMessageKey) => {
    const msg = this.getMessage(message.id ?? "");
    // Remove msg from map
    this.removeMessage(message.id ?? "");
    return msg;
  };
}