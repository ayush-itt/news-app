import { IUserInfo } from './user-info.interface';

export interface IAuthResult {
  accessToken: string;
  user: IUserInfo;
}
