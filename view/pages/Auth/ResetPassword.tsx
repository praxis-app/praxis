import { useParams } from 'react-router-dom';

const ResetPassword = () => {
  const { token } = useParams();

  return <>{token}</>;
};

export default ResetPassword;
