import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import {
  AuthResponse,
  RegistrationResponse,
  LogoutResponse,
} from './dto/auth-response.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Response } from 'express';
import { AUTH_CONSTANTS } from './constants';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user account' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully registered',
    type: RegistrationResponse,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Username or email already exists',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() registerRequest: RegisterDto,
  ): Promise<RegistrationResponse> {
    const result = await this.authService.register(registerRequest);
    return { message: result.message };
  }

  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully logged in',
    type: AuthResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials or inactive account',
  })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginRequest: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const result = await this.authService.login(loginRequest);
    res.cookie(AUTH_CONSTANTS.COOKIE_NAME, result.access_token, {
      ...AUTH_CONSTANTS.COOKIE_OPTIONS,
      secure: process.env.NODE_ENV === 'production',
    });
    return { message: AUTH_CONSTANTS.MESSAGES.LOGIN_SUCCESS };
  }

  @ApiOperation({ summary: 'Logout current user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully logged out',
    type: LogoutResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response): LogoutResponse {
    res.clearCookie(AUTH_CONSTANTS.COOKIE_NAME, {
      httpOnly: true,
      sameSite: 'lax',
    });
    return { message: AUTH_CONSTANTS.MESSAGES.LOGOUT_SUCCESS };
  }
}
