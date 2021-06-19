interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  exp: number;
}

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  isAuthenticated: boolean;
  __typename: string;
}

interface SignUpInput {
  email: string;
  name: string;
  password: string;
  passwordConfirm: string;
  profilePicture: any;
}

interface SignInInput {
  email: string;
  password: string;
}

interface ValidationError {
  name?: string;
  email?: string;
  password?: string;
  passwordConfirm?: string;
}

interface SelectedUser {
  userId: string;
}
