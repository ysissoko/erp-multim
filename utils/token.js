const jwt_decode = require("jwt-decode");

function getToken()
{
  const token = localStorage.getItem("access_token");

  if (!token)
    return null;

  const payload = jwt_decode(token);
  const expireDate = new Date(payload.exp * 1000)
  const now = new Date();

  if (now > expireDate)
    return null;

  return token;
}

export {getToken};