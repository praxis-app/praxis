import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './models/conversation.model';
import { Message } from './models/message.model';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,

    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
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
}
