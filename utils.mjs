export function httpError(statusCode, errorCode, message, err) {
  // check if err is provided, if not create with the message
  let errToThrow = err;
  if (!errToThrow) {
    errToThrow = new Error(message);
    errToThrow.statusCode = statusCode;
    errToThrow.errorCode = errorCode;
    return errToThrow;
  }

  // check if custom message provided, if yes use it
  if (message) errToThrow.message = message;
  errToThrow.statusCode = statusCode;
  errToThrow.errorCode = errorCode;
  return errToThrow;
}
