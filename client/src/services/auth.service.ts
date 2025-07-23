import { ApiService } from "./api.service";
import { AppStateService } from "./app-state.service";
import { ILoginRequest, ILoginResponse } from "../interfaces";
import { ConsoleUI } from "../utils/console-ui";

export class AuthService {
  private apiService: ApiService;
  private appState: AppStateService;

  constructor() {
    this.apiService = ApiService.getInstance();
    this.appState = AppStateService.getInstance();
  }

  public async login(credentials: ILoginRequest): Promise<boolean> {
    try {
      const response = await this.apiService.post<ILoginResponse>(
        "/auth/login",
        credentials
      );

      if (
        response.message === "Login successful" &&
        response.accessToken &&
        response.user
      ) {
        // Convert server response to client user format
        const user = {
          id: response.user.id,
          email: response.user.email,
          username: response.user.username,
          role: {
            id: response.user.role === "admin" ? 2 : 1,
            name: response.user.role,
          },
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        this.appState.setUserState(user, response.accessToken);
        ConsoleUI.success(`Logged in as ${user.username} (${user.role.name})`);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  public async logout(): Promise<void> {
    try {
      await this.apiService.post("/auth/logout");
      this.appState.clearState();
      ConsoleUI.success("Logged out successfully");
    } catch (error) {
      // Clear state anyway
      this.appState.clearState();
      ConsoleUI.info("Logged out");
    }
  }

  public async register(userData: any): Promise<boolean> {
    try {
      const response = await this.apiService.post("/users/register", userData);
      ConsoleUI.success("Registration successful! Please login.");
      return true;
    } catch (error) {
      return false;
    }
  }
}
