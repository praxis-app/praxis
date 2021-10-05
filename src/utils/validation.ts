import validator from "validator";
import isEmpty from "is-empty";
import Messages from "./messages";
import { NameValidation, PasswordValidation } from "../constants/user";

export const validateLogin = (data: SignInInput) => {
  const errors: ValidationError = {};

  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";

  if (!validator.isEmail(data.email)) {
    errors.email = Messages.users.validation.invalidEmail();
  }

  if (validator.isEmpty(data.email)) {
    errors.email = Messages.users.validation.emailRequired();
  }

  if (
    !validator.isLength(data.password, {
      min: PasswordValidation.Min,
      max: PasswordValidation.Max,
    })
  ) {
    errors.password = Messages.users.validation.passwordLength(
      PasswordValidation.Min,
      PasswordValidation.Max
    );
  }

  if (validator.isEmpty(data.password)) {
    errors.password = Messages.users.validation.passwordRequired();
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};

export const validateSignup = (data: SignUpInput) => {
  const errors: ValidationError = {};

  data.name = !isEmpty(data.name) ? data.name : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.passwordConfirm = !isEmpty(data.passwordConfirm)
    ? data.passwordConfirm
    : "";

  if (
    !validator.isLength(data.name, {
      min: NameValidation.Min,
      max: NameValidation.Max,
    })
  ) {
    errors.name = Messages.users.validation.nameLength(
      NameValidation.Min,
      NameValidation.Max
    );
  }

  if (validator.isEmpty(data.name)) {
    errors.name = Messages.users.validation.nameRequired();
  }

  if (!validator.isEmail(data.email)) {
    errors.email = Messages.users.validation.invalidEmail();
  }

  if (validator.isEmpty(data.email)) {
    errors.email = Messages.users.validation.emailRequired();
  }

  if (
    !validator.isLength(data.password, {
      min: PasswordValidation.Min,
      max: PasswordValidation.Max,
    })
  ) {
    errors.password = Messages.users.validation.passwordLength(
      PasswordValidation.Min,
      PasswordValidation.Max
    );
  }

  if (validator.isEmpty(data.password)) {
    errors.password = Messages.users.validation.passwordRequired();
  }

  if (
    !validator.isLength(data.passwordConfirm, {
      min: PasswordValidation.Min,
      max: PasswordValidation.Max,
    })
  ) {
    errors.passwordConfirm = Messages.users.validation.passwordLength(
      PasswordValidation.Min,
      PasswordValidation.Max
    );
  }

  if (!validator.equals(data.password, data.passwordConfirm)) {
    errors.passwordConfirm = Messages.users.validation.passwordConfirmMatch();
  }

  if (validator.isEmpty(data.passwordConfirm)) {
    errors.passwordConfirm = Messages.users.validation.passwordRequired();
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};

export const validateUpdateUser = (data: UpdateUserInput) => {
  const errors: ValidationError = {};

  data.name = !isEmpty(data.name) ? data.name : "";
  data.email = !isEmpty(data.email) ? data.email : "";

  if (
    !validator.isLength(data.name, {
      min: NameValidation.Min,
      max: NameValidation.Max,
    })
  ) {
    errors.name = Messages.users.validation.nameLength(
      NameValidation.Min,
      NameValidation.Max
    );
  }

  if (validator.isEmpty(data.name)) {
    errors.name = Messages.users.validation.nameRequired();
  }

  if (!validator.isEmail(data.email)) {
    errors.email = Messages.users.validation.invalidEmail();
  }

  if (validator.isEmpty(data.email)) {
    errors.email = Messages.users.validation.emailRequired();
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};

export const validationError = (errors: ValidationError): string => {
  if (errors.email) return errors.email;
  if (errors.name) return errors.name;
  if (errors.password) return errors.password;
  if (errors.passwordConfirm) return errors.passwordConfirm;
  return JSON.stringify(errors);
};
