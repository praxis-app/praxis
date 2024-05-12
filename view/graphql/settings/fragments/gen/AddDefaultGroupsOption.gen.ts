import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { GroupAvatarFragmentDoc } from '../../../groups/fragments/gen/GroupAvatar.gen';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type AddDefaultGroupsOptionFragment = {
  __typename?: 'Group';
  id: number;
  isDefault: boolean;
  name: string;
  coverPhoto?: { __typename?: 'Image'; id: number } | null;
};

export const AddDefaultGroupsOptionFragmentDoc = gql`
  fragment AddDefaultGroupsOption on Group {
    id
    ...GroupAvatar
    isDefault
  }
  ${GroupAvatarFragmentDoc}
`;
