import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from '../database/entities/user.entity';
import { AUTH_CONSTANTS } from './constants';
import { AuthResult } from './interfaces/auth-result.interfaces';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUserByEmail(
    email: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return null;
    }
    return user;
  }

  async login(loginDto: LoginDto): Promise<AuthResult> {
    const { email, password } = loginDto;

    const user = await this.validateUserByEmail(email, password);
    if (!user) {
      throw new UnauthorizedException(
        AUTH_CONSTANTS.MESSAGES.INVALID_CREDENTIALS,
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedException(AUTH_CONSTANTS.MESSAGES.ACCOUNT_INACTIVE);
    }

    return this.generateAuthResult(user);
  }

  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const { username, email } = registerDto;

    // Check if user already exists
    const userExists = await this.usersService.checkIfUserExists(
      username,
      email,
    );

    if (userExists) {
      throw new ConflictException(AUTH_CONSTANTS.MESSAGES.USER_EXISTS);
    }

    try {
      await this.usersService.createUser(registerDto);

      return {
        message: AUTH_CONSTANTS.MESSAGES.REGISTRATION_SUCCESS,
      };
    } catch {
      throw new BadRequestException(
        AUTH_CONSTANTS.MESSAGES.USER_CREATION_FAILED,
      );
    }
  }

  private generateAuthResult(user: User): AuthResult {
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role?.name || 'user',
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role?.name || 'user',
      },
    };
  }
}
