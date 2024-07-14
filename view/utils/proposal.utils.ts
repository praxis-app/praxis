import { Namespace, TFunction } from 'react-i18next';
import { ProposalActionType } from '../constants/proposal.constants';
import dayjs from 'dayjs';

export const getProposalActionTypeOptions = (
  t: TFunction<Namespace<'ns1'>, undefined>,
) => [
  {
    message: t('proposals.actionTypes.planEvent'),
    value: ProposalActionType.PlanGroupEvent,
  },
  {
    message: t('proposals.actionTypes.changeName'),
    value: ProposalActionType.ChangeGroupName,
  },
  {
    message: t('proposals.actionTypes.changeDescription'),
    value: ProposalActionType.ChangeGroupDescription,
  },
  {
    message: t('proposals.actionTypes.changeSettings'),
    value: ProposalActionType.ChangeGroupSettings,
  },
  {
    message: t('proposals.actionTypes.changeCoverPhoto'),
    value: ProposalActionType.ChangeGroupCoverPhoto,
  },
  {
    message: t('proposals.actionTypes.changeRole'),
    value: ProposalActionType.ChangeGroupRole,
  },
  {
    message: t('proposals.actionTypes.createRole'),
    value: ProposalActionType.CreateGroupRole,
  },
  {
    message: t('proposals.actionTypes.test'),
    value: ProposalActionType.Test,
  },
];

export const getProposalActionLabel = (
  actionType: string,
  t: TFunction<Namespace<'ns1'>, undefined>,
): string => {
  switch (actionType) {
    case ProposalActionType.PlanGroupEvent:
      return t('proposals.actionTypes.planEvent');
    case ProposalActionType.ChangeGroupName:
      return t('proposals.actionTypes.changeName');
    case ProposalActionType.ChangeGroupCoverPhoto:
      return t('proposals.actionTypes.changeCoverPhoto');
    case ProposalActionType.ChangeGroupDescription:
      return t('proposals.actionTypes.changeDescription');
    case ProposalActionType.ChangeGroupSettings:
      return t('proposals.actionTypes.changeSettings');
    case ProposalActionType.CreateGroupRole:
      return t('proposals.actionTypes.createRole');
    case ProposalActionType.ChangeGroupRole:
      return t('proposals.actionTypes.changeRole');
    case ProposalActionType.Test:
      return t('proposals.actionTypes.test');
    default:
      return '';
  }
};

export const formatClosingTime = (closingTime: string) =>
  dayjs(closingTime).format('ddd, MMM D, YYYY [at] h:mm a');
