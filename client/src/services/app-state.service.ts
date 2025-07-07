import { IUser, IUserState } from "../interfaces";

export class AppStateService {
  private static instance: AppStateService;
  private state: IUserState;

  private constructor() {
    this.state = {
      user: null,
      accessToken: null,
      isAuthenticated: false,
    };
  }

  public static getInstance(): AppStateService {
    if (!AppStateService.instance) {
      AppStateService.instance = new AppStateService();
    }
    return AppStateService.instance;
  }

  public setUserState(user: IUser, accessToken: string): void {
    this.state = {
      user,
      accessToken,
      isAuthenticated: true,
    };
  }

  public getUserState(): IUserState {
    return { ...this.state };
  }

  public getUser(): IUser | null {
    return this.state.user;
  }

  public getAccessToken(): string | null {
    return this.state.accessToken;
  }

  public isAuthenticated(): boolean {
    return this.state.isAuthenticated;
  }

  public isAdmin(): boolean {
    return this.state.user?.role?.name === "admin";
  }

  public clearState(): void {
    this.state = {
      user: null,
      accessToken: null,
      isAuthenticated: false,
    };
  }
}
