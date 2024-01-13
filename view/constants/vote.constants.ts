import { SxProps } from '@mui/material';
import { Blurple } from '../styles/theme';

export enum VoteTypes {
  Agreement = 'agreement',
  Disagreement = 'disagreement',
  Reservations = 'reservations',
  StandAside = 'stand-aside',
  Block = 'block',
}

export const VOTE_BADGE_STYLES: SxProps = {
  backgroundColor: Blurple.Marina,
  borderRadius: '50%',
  display: 'inline-flex',
  justifyContent: 'center',
};
