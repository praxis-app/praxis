// TODO: Add remaining layout and functionality - below is a WIP

import { QuestionnaireTicketFragment } from '../../graphql/questions/fragments/gen/QuestionnaireTicket.gen';
import AnsweredQuestion from './AnsweredQuestion';
import QuestionnaireTicketEntry from './QuestionnaireTicketEntry';

interface Props {
  questionnaireTicket: QuestionnaireTicketFragment;
}

const QuestionnaireTicket = ({ questionnaireTicket }: Props) => {
  const { questions } = questionnaireTicket;
  return (
    <>
      <QuestionnaireTicketEntry questionnaireTicket={questionnaireTicket} />

      {questions.map((question) => (
        <AnsweredQuestion key={question.id} question={question} />
      ))}
    </>
  );
};

export default QuestionnaireTicket;
