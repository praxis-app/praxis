import copy from 'copy-to-clipboard';

export const copyInviteLink = async (token: string) => {
  const inviteLink = `${window.location.origin}/i/${token}`;
  copy(inviteLink);
};
