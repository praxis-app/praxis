import { rule } from 'graphql-shield';
import { Context } from '../../context/context.types';
import { Like } from '../../likes/models/like.model';

export const isPublicLike = rule({ cache: 'strict' })(
  async (parent: Like, _args, { services: { likesService } }: Context) =>
    likesService.isPublicLike(parent.id),
);
