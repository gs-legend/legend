import { useMemo } from 'react';

const MIN_PASSWORD_LENGTH = 6;

const required = () => ({
  required: true,
  message: 'Field is required',
});

const email = () => ({
  type: 'email',
  message: 'E-mail is not valid'
});

const passwordMinLength = () => ({
  min: MIN_PASSWORD_LENGTH,
  message: 'Password must contain at least {{minLength}} characters'
});

const useFormRules = () => {

  return useMemo(
    () => ({
      required: required(),
      email: email(),
      passwordMinLength: passwordMinLength(),
    }),
    []
  );
};

export default useFormRules;
