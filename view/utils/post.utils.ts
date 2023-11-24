import { ApolloCache, FetchResult } from '@apollo/client';
import { TypeNames } from '../constants/shared.constants';
import { toastVar } from '../graphql/cache';
import { DeletePostMutation } from '../graphql/posts/mutations/gen/DeletePost.gen';

export const removePost =
  (postId: number) =>
  (cache: ApolloCache<any>, { errors }: FetchResult<DeletePostMutation>) => {
    if (errors) {
      toastVar({ status: 'error', title: errors[0].message });
      return;
    }
    const postCacheId = cache.identify({
      __typename: TypeNames.Post,
      id: postId,
    });
    cache.evict({ id: postCacheId });
    cache.gc();
  };
