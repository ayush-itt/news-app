import { ApiService } from "../api.service";
import { IUser } from "../../interfaces";

export class AdminUserService {
  private apiService: ApiService;

  constructor() {
    this.apiService = ApiService.getInstance();
  }

  async getAllUsers(): Promise<IUser[]> {
    return this.apiService.get<IUser[]>("/users");
  }

  async getUserById(id: number): Promise<IUser> {
    return this.apiService.get<IUser>(`/users/${id}`);
  }
}
