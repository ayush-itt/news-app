export interface IUser {
  id: number;
  email: string;
  username: string;
  role: {
    id: number;
    name: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IUserInfo {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface IUserState {
  user: IUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface ILoginResponse {
  message: string;
  accessToken: string;
  user: IUserInfo;
}
