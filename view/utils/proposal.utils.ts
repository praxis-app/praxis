import { Namespace, TFunction } from 'react-i18next';
import dayjs from 'dayjs';
import { ProposalActionType } from '../graphql/gen';

interface ProposalActionTypeOption {
  message: string;
  value: ProposalActionType;
}

export const getProposalActionTypeOptions = (
  t: TFunction<Namespace<'ns1'>, undefined>,
): ProposalActionTypeOption[] => [
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

export const getProposalActionLabel = (
  actionType: string,
  t: TFunction<Namespace<'ns1'>, undefined>,
): string => {
  switch (actionType) {
    case 'PLAN_EVENT':
      return t('proposals.actionTypes.planEvent');
    case 'CHANGE_NAME':
      return t('proposals.actionTypes.changeName');
    case 'CHANGE_COVER_PHOTO':
      return t('proposals.actionTypes.changeCoverPhoto');
    case 'CHANGE_DESCRIPTION':
      return t('proposals.actionTypes.changeDescription');
    case 'CHANGE_SETTINGS':
      return t('proposals.actionTypes.changeSettings');
    case 'CREATE_ROLE':
      return t('proposals.actionTypes.createRole');
    case 'CHANGE_ROLE':
      return t('proposals.actionTypes.changeRole');
    case 'TEST':
      return t('proposals.actionTypes.test');
    default:
      return '';
  }
};

export const formatClosingTime = (closingTime: string) =>
  dayjs(closingTime).format('ddd, MMM D, YYYY [at] h:mm a');
