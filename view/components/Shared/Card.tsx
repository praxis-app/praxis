import {
  Card as MuiCard,
  CardContent as MuiCardContent,
  CardContentProps,
  CardProps,
  styled,
} from '@mui/material';

const CardContent = styled(MuiCardContent)(() => ({
  '&:last-child': {
    paddingBottom: 10,
  },
}));

interface Props extends CardProps {
  contentProps?: CardContentProps;
}

const Card = ({ contentProps, children, ...cardProps }: Props) => (
  <MuiCard {...cardProps}>
    <CardContent {...contentProps}>{children}</CardContent>
  </MuiCard>
);

export default Card;
