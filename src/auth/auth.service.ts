import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByUsername(loginDto.username);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const expiresIn = 3600; // 1 hora en segundos

    const payload = {
      sub: user._id.toString(),
      username: user.username,
      roles: user.roles,
    };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(
      { sub: user._id.toString() },
      {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
        expiresIn: '7d',
      },
    );

    const userObj = user.toObject();
    const id = userObj._id.toString();
    delete userObj.password;
    delete userObj._id;
    delete userObj.__v;

    return {
      user: { id, ...userObj },
      token: {
        access_token: accessToken,
        token_type: 'bearer',
        expires_in: expiresIn,
        refresh_token: refreshToken,
      },
    };
  }



  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      const newPayload = {
        sub: user._id.toString(),
        username: user.username,
        roles: user.roles,
      };

      const newAccessToken = this.jwtService.sign(newPayload);

      return {
        access_token: newAccessToken,
        token_type: 'bearer',
        expires_in: 3600,
      };
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  async getMe(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    const userObj = user.toObject();
    const id = userObj._id.toString();
    delete userObj.password;
    delete userObj._id;
    delete userObj.__v;
    return { id, ...userObj };
  }
}
