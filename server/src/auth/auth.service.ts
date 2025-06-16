import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { User } from '../database/entities/user.entity';
import { AUTH } from '@/common/constants/auth.constants';
import { AuthResult } from './interfaces/auth-result.interfaces';
import { RoleEnum } from '../common/enums/roles.enum';

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
      throw new UnauthorizedException(AUTH.MESSAGES.INVALID_CREDENTIALS);
    }

    if (!user.isActive) {
      throw new UnauthorizedException(AUTH.MESSAGES.ACCOUNT_INACTIVE);
    }

    return this.generateAuthResult(user);
  }

  private generateAuthResult(user: User): AuthResult {
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role?.name || RoleEnum.USER,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role?.name || RoleEnum.USER,
      },
    };
  }
}
