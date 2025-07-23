import { User } from '../../database/entities/user.entity';

export interface IUpdateUserServiceResponse {
  message: string;
  user: User;
}
