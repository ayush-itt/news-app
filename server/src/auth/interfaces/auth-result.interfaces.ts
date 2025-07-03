export interface AuthResult {
  accessToken: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}
