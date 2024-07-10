// here below for the function input consts
export const VALID_USER_REGISTER_INPUTS_1 = {
  EMAIL: 'admin@email.com',
  PASSWORD: 'password1',
  FIRSTNAME: 'Idk',
  LASTNAME: 'Idk',
};

export const VALID_USER_REGISTER_INPUTS_2 = {
  EMAIL: 'user@email.com',
  PASSWORD: 'password1',
  FIRSTNAME: 'Idk',
  LASTNAME: 'Idk',
};

export const VALID_QUIZ_CREATE_INPUTS_1 = {
  NAME: 'ValidQuizName',
  DESCRIPTION: 'ValidDescription'
};

export const NEW_VALID_EMAIL = 'newValidEmail@gmail.com';

// here below for the success return consts
export const USER_DETAIL_UPDATED_SUCCESSFUL = {
  statusCode: 200,
  jsonBody: {}
};

export const CLEAR_SUCCESSFUL = {
  statusCode: 200,
  jsonBody: {}
};

// here below for the error return consts
export const ERROR400 = {
  statusCode: 400,
  jsonBody: { error: expect.any(String) }
};

export const ERROR401 = {
  statusCode: 401,
  jsonBody: { error: expect.any(String) }
};

export const ERROR403 = {
  statusCode: 403,
  jsonBody: { error: expect.any(String) }
};
