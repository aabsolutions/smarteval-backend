import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        user: any;
        token: {
            access_token: string;
            token_type: string;
            expires_in: number;
            refresh_token: string;
        };
    }>;
    refresh(body: {
        refresh_token: string;
    }): Promise<{
        access_token: string;
        token_type: string;
        expires_in: number;
    }>;
    getProfile(req: any): Promise<{
        user: any;
    }>;
}
