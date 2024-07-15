import { Namespace, TFunction } from 'react-i18next';
import dayjs from 'dayjs';

export const getProposalActionTypeOptions = (
  t: TFunction<Namespace<'ns1'>, undefined>,
) => [
  {
    message: t('proposals.actionTypes.planEvent'),
    value: 'PLAN_EVENT',
  },
  {
    message: t('proposals.actionTypes.changeName'),
    value: 'CHANGE_NAME',
  },
  {
    message: t('proposals.actionTypes.changeDescription'),
    value: 'CHANGE_DESCRIPTION',
  },
  {
    message: t('proposals.actionTypes.changeSettings'),
    value: 'CHANGE_SETTINGS',
  },
  {
    message: t('proposals.actionTypes.changeCoverPhoto'),
    value: 'CHANGE_COVER_PHOTO',
  },
  {
    message: t('proposals.actionTypes.changeRole'),
    value: 'CHANGE_ROLE',
  },
  {
    message: t('proposals.actionTypes.createRole'),
    value: 'CREATE_ROLE',
  },
  {
    message: t('proposals.actionTypes.test'),
    value: 'TEST',
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
