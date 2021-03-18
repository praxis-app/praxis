const validator = require("validator");
const isEmpty = require("is-empty");

function validateLogin(data) {
  let errors: ValidationError = {};

  /* eslint-disable no-param-reassign */
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  /* eslint-enable no-param-reassign */

  if (!validator.isEmail(data.email)) {
    errors.email = "Email is invalid";
  }

  if (validator.isEmpty(data.email)) {
    errors.email = "Email is required";
  }

  if (!validator.isLength(data.password, { min: 4, max: 30 })) {
    errors.password = "Password must have 4 and 30 chars";
  }

  if (validator.isEmpty(data.password)) {
    errors.password = "Password is required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
}

function validateSignup(data) {
  let errors: ValidationError = {};

  /* eslint-disable no-param-reassign */
  data.name = !isEmpty(data.name) ? data.name : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.passwordConfirm = !isEmpty(data.passwordConfirm)
    ? data.passwordConfirm
    : "";
  /* eslint-enable no-param-reassign */

  if (!validator.isLength(data.name, { min: 2, max: 30 })) {
    errors.name = "Name must be between 2 and 30 chars";
  }

  if (validator.isEmpty(data.name)) {
    errors.name = "Name field is required";
  }

  if (!validator.isEmail(data.email)) {
    errors.email = "Email is invalid";
  }

  if (validator.isEmpty(data.email)) {
    errors.email = "Email is required";
  }

  if (!validator.isLength(data.password, { min: 4, max: 30 })) {
    errors.password = "Password must have between 4 and 30 chars";
  }

  if (validator.isEmpty(data.password)) {
    errors.password = "Password is required";
  }

  if (!validator.isLength(data.passwordConfirm, { min: 4, max: 30 })) {
    errors.passwordConfirm = "Password must have between 4 and 30 chars";
  }

  if (!validator.equals(data.password, data.passwordConfirm)) {
    errors.passwordConfirm = "Password and Confirm Password must match";
  }

  if (validator.isEmpty(data.passwordConfirm)) {
    errors.passwordConfirm = "Password is required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
}

export { validateLogin, validateSignup };
