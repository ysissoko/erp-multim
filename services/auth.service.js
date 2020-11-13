import * as Axios from "axios";

export default class AuthService
{
  constructor() {}

  login(username, password)
  {
    return Axios.post(`${process.env.NEXT_PUBLIC_BASE_API_URL}/auth/login`, {username: username.trim(), password: password.trim()} );
  }
}