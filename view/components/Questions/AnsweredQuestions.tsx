import { AnsweredQuestionsFragment } from '../../graphql/questions/fragments/gen/AnsweredQuestions.gen';
import AnsweredQuestion from './AnsweredQuestion';

interface Props {
  questionnaireTicket: AnsweredQuestionsFragment;
}

const AnsweredQuestions = ({ questionnaireTicket: { questions } }: Props) => {
  return (
    <>
      {questions.map((question: any) => (
        <AnsweredQuestion key={question.id} question={question} />
      ))}
    </>
  );
};

export default AnsweredQuestions;
