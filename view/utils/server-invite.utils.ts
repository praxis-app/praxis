export const copyInviteLink = async (token: string) => {
  const inviteLink = `${window.location.origin}/i/${token}`;
  await navigator.clipboard.writeText(inviteLink);
};
