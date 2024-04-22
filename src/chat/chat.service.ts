import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileUpload } from 'graphql-upload-ts';
import { Repository } from 'typeorm';
import { sanitizeText } from '../common/common.utils';
import { deleteImageFile, saveImage } from '../images/image.utils';
import { Image } from '../images/models/image.model';
import { ServerConfig } from '../server-configs/models/server-config.model';
import { ServerConfigsService } from '../server-configs/server-configs.service';
import { User } from '../users/models/user.model';
import { Conversation } from './models/conversation.model';
import { Message } from './models/message.model';
import { SendMessageInput } from './models/send-message.input';
import { UpdateMessageInput } from './models/update-message.input';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,

    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,

    @InjectRepository(Image)
    private imageRepository: Repository<Image>,

    @InjectRepository(ServerConfig)
    private serverConfigRepository: Repository<ServerConfig>,

    private serverConfigsService: ServerConfigsService,
  ) {}

  async getMessage(messageId: number) {
    return this.messageRepository.findOneOrFail({
      where: { id: messageId },
    });
  }

  async getConversation(conversationId: number) {
    return this.conversationRepository.findOneOrFail({
      where: { id: conversationId },
    });
  }

  async getConversationMessages(conversationId: number) {
    return this.messageRepository.find({
      where: { conversationId },
    });
  }

  async getConversationMembers(conversationId: number) {
    const { members } = await this.conversationRepository.findOneOrFail({
      where: { id: conversationId },
      relations: ['members'],
    });
    return members;
  }

  async getVibeChat() {
    const { id, vibeChatId } =
      await this.serverConfigsService.getServerConfig();

    if (!vibeChatId) {
      const vibeChat = await this.conversationRepository.save({
        name: 'Vibe Chat',
      });
      await this.serverConfigRepository.update(id, {
        vibeChatId: vibeChat.id,
      });
      return { vibeChat };
    }

    const vibeChat = await this.conversationRepository.findOneOrFail({
      where: { id: vibeChatId },
    });
    return { vibeChat };
  }

  async sendMessage(
    { conversationId, body, images }: SendMessageInput,
    currentUser: User,
  ) {
    if (!body && !images?.length) {
      throw new Error('Message body or images are required');
    }
    const sanitizedBody = body ? sanitizeText(body) : undefined;
    const message: Message = await this.messageRepository.save({
      userId: currentUser.id,
      body: sanitizedBody,
      conversationId,
    });
    if (images) {
      try {
        await this.saveMessageImages(message.id, images);
      } catch (err) {
        await this.deleteMessage(message.id);
        throw new Error(err.message);
      }
    }
    return { message };
  }

  async saveMessageImages(messageId: number, images: Promise<FileUpload>[]) {
    for (const image of images) {
      const filename = await saveImage(image);
      await this.imageRepository.save({ messageId, filename });
    }
  }

  async updateMessage({ id, body, images }: UpdateMessageInput) {
    const sanitizedBody = body ? sanitizeText(body) : undefined;
    await this.messageRepository.update(id, {
      body: sanitizedBody,
    });
    if (images) {
      await this.saveMessageImages(id, images);
    }
    const message = await this.getMessage(id);
    return { message };
  }

  async deleteMessage(messageId: number) {
    const images = await this.imageRepository.find({ where: { messageId } });
    for (const { filename } of images) {
      await deleteImageFile(filename);
    }
    await this.messageRepository.delete(messageId);
    return true;
  }
}
