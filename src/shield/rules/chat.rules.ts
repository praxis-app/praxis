import { rule } from 'graphql-shield';
import { UNAUTHORIZED } from '../../common/common.constants';
import { Context } from '../../context/context.types';
import { Conversation } from '../../chat/models/conversation.model';

export const isConversationMember = rule({ cache: 'strict' })(async (
  parent: Conversation | undefined,
  args: { id?: number; conversationId?: number },
  { services: { chatService }, user }: Context,
) => {
  if (!user) {
    return UNAUTHORIZED;
  }
  const conversationId = args.id || args.conversationId || parent?.id;
  return chatService.isConversationMember(conversationId!, user.id);
});
