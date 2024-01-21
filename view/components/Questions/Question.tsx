import {
  Button,
  Card,
  CardActions,
  CardContent as MuiCardContent,
  CardHeader as MuiCardHeader,
  Typography,
  styled,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { QuestionFragment } from '../../graphql/questions/fragments/gen/Question.gen';
import { DarkMode } from '../../styles/theme';

const CardHeader = styled(MuiCardHeader)(() => ({
  paddingTop: '14px',
  paddingBottom: '18px',
}));

const CardContent = styled(MuiCardContent)(() => ({
  paddingTop: '11px',
  paddingBottom: '50px',
}));

interface Props {
  question: QuestionFragment;
}

const Question = ({ question: { text, priority } }: Props) => {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader
        title={
          <>
            <Typography color="text.secondary" fontSize="15px">
              {t('questions.headers.questionPriority', {
                priority: priority + 1,
              })}
            </Typography>

            <Typography fontFamily="Inter Bold" fontSize="18px">
              {text}
            </Typography>
          </>
        }
      />

      <CardContent
        sx={{
          backgroundColor: 'background.secondary',
          marginX: 2,
          borderRadius: '8px',
        }}
      >
        <Typography color="text.secondary" fontSize="15px">
          {t('questions.placeholders.writeAnswer')}
        </Typography>
      </CardContent>

      <CardActions sx={{ margin: 1 }}>
        <Button
          sx={{
            textTransform: 'none',
            backgroundColor: '#2F3C5E',
            borderRadius: '6px',
            color: '#C7CDEE',
            flex: 1,

            '&:hover': {
              backgroundColor: '#394666',
            },
          }}
        >
          {t('actions.edit')}
        </Button>
        <Button
          sx={{
            textTransform: 'none',
            backgroundColor: '#353536',
            borderRadius: '6px',
            flex: 1,

            '&:hover': {
              backgroundColor: DarkMode.DeadPixel,
            },
          }}
        >
          {t('actions.delete')}
        </Button>
      </CardActions>
    </Card>
  );
};

export default Question;
