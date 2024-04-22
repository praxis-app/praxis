import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileUpload } from 'graphql-upload-ts';
import { Repository } from 'typeorm';
import { sanitizeText } from '../common/common.utils';
import { deleteImageFile, saveImage } from '../images/image.utils';
import { Image } from '../images/models/image.model';
import { User } from '../users/models/user.model';
import { Conversation } from './models/conversation.model';
import { Message } from './models/message.model';
import { SendMessageInput } from './models/send-message.input';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,

    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,

    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
  ) {}

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

  async deleteMessage(messageId: number) {
    const images = await this.imageRepository.find({ where: { messageId } });
    for (const { filename } of images) {
      await deleteImageFile(filename);
    }
    await this.messageRepository.delete(messageId);
    return true;
  }
}
