import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponse, LogoutResponse } from './dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AUTH } from '@/common/constants/auth.constants';
import { Auth } from './decorators';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully logged in',
    type: LoginResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials or inactive account',
  })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginRequest: LoginDto): Promise<LoginResponse> {
    const result = await this.authService.login(loginRequest);
    return {
      message: AUTH.MESSAGES.LOGIN_SUCCESS,
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @ApiOperation({ summary: 'Logout current user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully logged out',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  @Auth()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(): LogoutResponse {
    return { message: AUTH.MESSAGES.LOGOUT_SUCCESS };
  }
}
