import { rule } from 'graphql-shield';
import { UNAUTHORIZED } from '../../common/common.constants';
import { Context } from '../../context/context.types';

export const isConversationMember = rule({ cache: 'strict' })(async (
  _parent,
  args: { id?: number; conversationId?: number },
  { services: { chatService }, user }: Context,
) => {
  if (!user) {
    return UNAUTHORIZED;
  }
  return chatService.isConversationMember(
    args.id || args.conversationId!,
    user.id,
  );
});
