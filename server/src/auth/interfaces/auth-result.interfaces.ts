export interface AuthResult {
  access_token: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}
