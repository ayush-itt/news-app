import { IUserInfo } from './user-info.interface';

export interface ILoginResponse {
  message: string;
  accessToken: string;
  user: IUserInfo;
}
