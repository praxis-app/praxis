export const EMAIL_MAX_LENGTH = 254;

export const GENERATED_NAME_SEPARATOR = '_';
export const VALID_NAME_REGEX = new RegExp(
  `^[a-z0-9${GENERATED_NAME_SEPARATOR}]+$`,
);

export const NAME_MIN_LENGTH = 3;
export const NAME_MAX_LENGTH = 15;

export const DISPLAY_NAME_MIN_LENGTH = 4;
export const DISPLAY_NAME_MAX_LENGTH = 30;

export const BIO_MAX_LENGTH = 500;

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 64;
