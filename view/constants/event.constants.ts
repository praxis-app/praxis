import { SxProps } from '@mui/material';
import { Blurple } from '../styles/theme';

export enum EventFormFieldName {
  Name = 'name',
  Description = 'description',
  Location = 'location',
  ExternalLink = 'externalLink',
  StartsAt = 'startsAt',
  EndsAt = 'endsAt',
  Online = 'online',
  HostId = 'hostId',
}

export const SHOW_ENDS_AT_BUTTON_STYLES: SxProps = {
  color: Blurple.SkyDancer,
  padding: 0,
  textTransform: 'none',
  width: 'fit-content',
  '&.MuiButtonBase-root:hover': {
    bgcolor: 'transparent',
    textDecoration: 'underline',
  },
  marginBottom: 0.8,
};
