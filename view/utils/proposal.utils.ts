import dayjs from 'dayjs';
import { Namespace, TFunction } from 'react-i18next';
import { ProposalActionType } from '../graphql/gen';

interface ProposalActionTypeOption {
  message: string;
  value: ProposalActionType;
}

export const getProposalActionTypeOptions = (
  t: TFunction<Namespace<'ns1'>, undefined>,
  isGroupProposal = true,
): ProposalActionTypeOption[] => {
  const sharedOptions: ProposalActionTypeOption[] = [
    {
      message: t('proposals.actionTypes.changeRole'),
      value: 'ChangeRole',
    },
    {
      message: t('proposals.actionTypes.createRole'),
      value: 'CreateRole',
    },
    {
      message: t('proposals.actionTypes.test'),
      value: 'Test',
    },
  ];
  if (!isGroupProposal) {
    return sharedOptions;
  }
  return [
    {
      message: t('proposals.actionTypes.planEvent'),
      value: 'PlanEvent',
    },
    {
      message: t('proposals.actionTypes.changeName'),
      value: 'ChangeName',
    },
    {
      message: t('proposals.actionTypes.changeDescription'),
      value: 'ChangeDescription',
    },
    {
      message: t('proposals.actionTypes.changeSettings'),
      value: 'ChangeSettings',
    },
    {
      message: t('proposals.actionTypes.changeCoverPhoto'),
      value: 'ChangeCoverPhoto',
    },
    ...sharedOptions,
  ];
};

export const getProposalActionLabel = (
  actionType: ProposalActionType,
  t: TFunction<Namespace<'ns1'>, undefined>,
): string => {
  switch (actionType) {
    case 'PlanEvent':
      return t('proposals.actionTypes.planEvent');
    case 'ChangeName':
      return t('proposals.actionTypes.changeName');
    case 'ChangeCoverPhoto':
      return t('proposals.actionTypes.changeCoverPhoto');
    case 'ChangeDescription':
      return t('proposals.actionTypes.changeDescription');
    case 'ChangeSettings':
      return t('proposals.actionTypes.changeSettings');
    case 'CreateRole':
      return t('proposals.actionTypes.createRole');
    case 'ChangeRole':
      return t('proposals.actionTypes.changeRole');
    case 'Test':
      return t('proposals.actionTypes.test');
    default:
      return '';
  }
};

export const formatClosingTime = (closingTime: string) =>
  dayjs(closingTime).format('ddd, MMM D, YYYY [at] h:mm a');
