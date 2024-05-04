import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PubSub } from 'graphql-subscriptions';
import { FileUpload } from 'graphql-upload-ts';
import { In, MoreThan, Not, Repository } from 'typeorm';
import { paginate, sanitizeText } from '../common/common.utils';
import { deleteImageFile, saveImage } from '../images/image.utils';
import { Image } from '../images/models/image.model';
import {
  NotificationStatus,
  NotificationType,
} from '../notifications/notifications.constants';
import { NotificationsService } from '../notifications/notifications.service';
import { ServerConfig } from '../server-configs/models/server-config.model';
import { ServerConfigsService } from '../server-configs/server-configs.service';
import { ServerRole } from '../server-roles/models/server-role.model';
import { User } from '../users/models/user.model';
import { ConversationMember } from './models/conversation-member.model';
import { Conversation } from './models/conversation.model';
import { Message } from './models/message.model';
import { SendMessageInput } from './models/send-message.input';
import { UpdateMessageInput } from './models/update-message.input';

const VIBE_CHAT_NAME = 'Vibe Chat';

@Injectable()
export class ChatService {
  constructor(
    @Inject('PUB_SUB') private pubSub: PubSub,

    @InjectRepository(Message)
    private messageRepository: Repository<Message>,

    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,

    @InjectRepository(ConversationMember)
    private conversationMemberRepository: Repository<ConversationMember>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Image)
    private imageRepository: Repository<Image>,

    @InjectRepository(ServerConfig)
    private serverConfigRepository: Repository<ServerConfig>,

    @InjectRepository(ServerRole)
    private serverRoleRepository: Repository<ServerRole>,

    private serverConfigsService: ServerConfigsService,
    private notificationsService: NotificationsService,
  ) {}

  async getMessage(messageId: number) {
    return this.messageRepository.findOneOrFail({
      where: { id: messageId },
    });
  }

  async getMessageSender(messageId: number) {
    const { user } = await this.messageRepository.findOneOrFail({
      where: { id: messageId },
      relations: ['user'],
    });
    return user;
  }

  async getMessageImages(messageId: number) {
    const { images } = await this.messageRepository.findOneOrFail({
      where: { id: messageId },
      relations: ['images'],
    });
    return images;
  }

  async getConversation(conversationId: number) {
    return this.conversationRepository.findOneOrFail({
      where: { id: conversationId },
    });
  }

  // TODO: Determine wheather reverse() is necessary
  async getConversationMessages(
    conversationId: number,
    currentUserId: number,
    offset?: number,
    limit?: number,
  ) {
    const messages = await this.messageRepository.find({
      where: { conversationId },
      order: { createdAt: 'DESC' },
    });

    // Set the last read message ID for the current user
    if (messages.length > 0) {
      const filteredMessages = messages.filter(
        (message) => message.userId !== currentUserId,
      );
      if (filteredMessages.length > 0) {
        await this.conversationMemberRepository.update(
          { conversationId, userId: currentUserId },
          { lastMessageReadId: messages[0].id },
        );
      }
    }

    if (offset === undefined) {
      return messages.reverse();
    }

    const paginatedMessages = paginate(messages, offset, limit);
    return paginatedMessages.reverse();
  }

  async getConversationMembers(conversationId: number) {
    return this.userRepository.find({
      where: {
        conversationMembers: { conversationId },
      },
    });
  }

  async getUnreadMessageCount(conversationId: number, userId: number) {
    const conversationMember =
      await this.conversationMemberRepository.findOneOrFail({
        where: { conversationId, userId },
      });

    if (!conversationMember.lastMessageReadId) {
      return this.messageRepository.count({
        where: { conversationId, userId: Not(userId) },
      });
    }
    return this.messageRepository.count({
      where: {
        id: MoreThan(conversationMember.lastMessageReadId),
        userId: Not(userId),
        conversationId,
      },
    });
  }

  async getVibeChat() {
    const { id, vibeChatId } =
      await this.serverConfigsService.getServerConfig();

    if (!vibeChatId) {
      const vibeChat = await this.conversationRepository.save({
        name: VIBE_CHAT_NAME,
      });
      await this.serverConfigRepository.update(id, {
        vibeChatId: vibeChat.id,
      });
      return vibeChat;
    }

    return this.conversationRepository.findOneOrFail({
      where: { id: vibeChatId },
    });
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

    // Send the message to all conversation members except the sender
    const members = await this.getConversationMembers(conversationId);
    for (const member of members) {
      if (member.id === currentUser.id) {
        continue;
      }
      await this.pubSub.publish(`new-message-${conversationId}-${member.id}`, {
        newMessage: message,
      });

      // Notify conversation member of new message if they
      // haven't been notified in the last week
      const recentNotificationCount =
        await this.notificationsService.getNotificationsCount({
          createdAt: MoreThan(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
          notificationType: NotificationType.NewMessage,
          status: NotificationStatus.Unread,
          userId: member.id,
          conversationId,
        });
      if (recentNotificationCount === 0) {
        await this.notificationsService.createNotification({
          notificationType: NotificationType.NewMessage,
          otherUserId: currentUser.id,
          userId: member.id,
          conversationId,
        });
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

  async syncVibeChatMembersWithRoles() {
    const vibeChat = await this.getVibeChat();
    const chatMembers = await this.getConversationMembers(vibeChat.id);
    const vibeCheckerRole = await this.serverRoleRepository.findOneOrFail({
      where: { permission: { manageQuestionnaireTickets: true } },
      relations: ['members'],
      select: ['members'],
    });

    const chatMemberIds = chatMembers.map(({ id }) => id);
    const vibeCheckerIds = vibeCheckerRole.members.map(({ id }) => id);
    const membersToAdd = vibeCheckerIds.filter(
      (id) => !chatMemberIds.includes(id),
    );
    const membersToRemove = chatMemberIds.filter(
      (id) => !vibeCheckerIds.includes(id),
    );

    if (membersToAdd.length) {
      await this.conversationMemberRepository.save(
        membersToAdd.map((userId) => ({
          conversationId: vibeChat.id,
          userId,
        })),
      );
    }
    if (membersToRemove.length) {
      await this.conversationMemberRepository.delete({
        conversationId: vibeChat.id,
        userId: In(membersToRemove),
      });
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
