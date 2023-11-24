import { Namespace, TFunction } from 'react-i18next';
import { ProposalActionType } from '../constants/proposal.constants';

export const getProposalActionTypeOptions = (
  t: TFunction<Namespace<'ns1'>, undefined>,
) => [
  {
    message: t('proposals.actionTypes.planEvent'),
    value: ProposalActionType.PlanEvent,
  },
  {
    message: t('proposals.actionTypes.changeName'),
    value: ProposalActionType.ChangeName,
  },
  {
    message: t('proposals.actionTypes.changeDescription'),
    value: ProposalActionType.ChangeDescription,
  },
  {
    message: t('proposals.actionTypes.changeCoverPhoto'),
    value: ProposalActionType.ChangeCoverPhoto,
  },
  {
    message: t('proposals.actionTypes.createRole'),
    value: ProposalActionType.CreateRole,
  },
  {
    message: t('proposals.actionTypes.changeRole'),
    value: ProposalActionType.ChangeRole,
  },
  {
    message: t('proposals.actionTypes.test'),
    value: ProposalActionType.Test,
  },

  // TODO: Uncomment after adding support for remaining action types
  // {
  //   message: t("proposals.actionTypes.changeSettings"),
  //   value: ProposalActionType.ChangeSettings,
  // },
];

export const getProposalActionLabel = (
  actionType: string,
  t: TFunction<Namespace<'ns1'>, undefined>,
): string => {
  switch (actionType) {
    case ProposalActionType.PlanEvent:
      return t('proposals.actionTypes.planEvent');
    case ProposalActionType.ChangeName:
      return t('proposals.actionTypes.changeName');
    case ProposalActionType.ChangeCoverPhoto:
      return t('proposals.actionTypes.changeCoverPhoto');
    case ProposalActionType.ChangeDescription:
      return t('proposals.actionTypes.changeDescription');
    case ProposalActionType.ChangeSettings:
      return t('proposals.actionTypes.changeSettings');
    case ProposalActionType.CreateRole:
      return t('proposals.actionTypes.createRole');
    case ProposalActionType.ChangeRole:
      return t('proposals.actionTypes.changeRole');
    case ProposalActionType.Test:
      return t('proposals.actionTypes.test');
    default:
      return '';
  }
};
