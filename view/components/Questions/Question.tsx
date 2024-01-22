import {
  Card,
  CardContent as MuiCardContent,
  CardHeader as MuiCardHeader,
  Typography,
  styled,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { QuestionFragment } from '../../graphql/questions/fragments/gen/Question.gen';
import { TextField } from '../Shared/TextField';

const CardHeader = styled(MuiCardHeader)(() => ({
  paddingTop: '11px',
  paddingBottom: '0px',
}));

const CardContent = styled(MuiCardContent)(() => ({
  paddingTop: '14px',
  '&:last-child': {
    paddingBottom: '6px',
  },
}));

interface Props {
  question: QuestionFragment;
}

const Question = ({ question: { text } }: Props) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader
        title={
          <Typography fontFamily="Inter Medium" fontSize="16px">
            {text}
          </Typography>
        }
      />

      <CardContent>
        <TextField
          autoComplete="off"
          label={t('questions.placeholders.writeAnswer')}
          name="text"
          sx={{ width: '100%' }}
          variant="outlined"
          multiline
        />
      </CardContent>
    </Card>
  );
};

export default Question;
