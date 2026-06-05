import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly configService;
    constructor(usersService: UsersService, jwtService: JwtService, configService: ConfigService);
    login(loginDto: LoginDto): Promise<{
        user: any;
        token: {
            access_token: string;
            token_type: string;
            expires_in: number;
            refresh_token: string;
        };
    }>;
    refresh(refreshToken: string): Promise<{
        access_token: string;
        token_type: string;
        expires_in: number;
    }>;
    getMe(userId: string): Promise<any>;
}
