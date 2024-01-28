// TODO: Add remaining layout and functionality - below is a WIP

import { QuestionnaireTicketFragment } from '../../graphql/questions/fragments/gen/QuestionnaireTicket.gen';

interface Props {
  questionnaireTicket: QuestionnaireTicketFragment;
}

const QuestionnaireTicket = ({ questionnaireTicket }: Props) => {
  return <>{JSON.stringify(questionnaireTicket)}</>;
};

export default QuestionnaireTicket;
