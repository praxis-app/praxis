// TODO: Add remaining layout and functionality - below is a WIP

import { QuestionnaireTicketFragment } from '../../graphql/questions/fragments/gen/QuestionnaireTicket.gen';
import AnsweredQuestion from './AnsweredQuestion';

interface Props {
  questionnaireTicket: QuestionnaireTicketFragment;
}

const QuestionnaireTicket = ({ questionnaireTicket: { questions } }: Props) => {
  return (
    <>
      {questions.map((question) => (
        <AnsweredQuestion key={question.id} question={question} />
      ))}
    </>
  );
};

export default QuestionnaireTicket;
