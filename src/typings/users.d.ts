interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  exp: number;
}

interface ValidationError {
  name?: string;
  email?: string;
  password?: string;
  passwordConfirm?: string;
}
