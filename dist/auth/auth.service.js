"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = require("bcryptjs");
const users_service_1 = require("../users/users.service");
let AuthService = class AuthService {
    constructor(usersService, jwtService, configService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async login(loginDto) {
        const user = await this.usersService.findByUsername(loginDto.username);
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        const expiresIn = 3600;
        const payload = {
            sub: user._id.toString(),
            username: user.username,
            roles: user.roles,
        };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign({ sub: user._id.toString() }, {
            secret: this.configService.get('REFRESH_TOKEN_SECRET'),
            expiresIn: '7d',
        });
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
    async refresh(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('REFRESH_TOKEN_SECRET'),
            });
            const user = await this.usersService.findById(payload.sub);
            if (!user) {
                throw new common_1.UnauthorizedException('Usuario no encontrado');
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
        }
        catch {
            throw new common_1.UnauthorizedException('Refresh token inválido o expirado');
        }
    }
    async getMe(userId) {
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new common_1.UnauthorizedException('Usuario no encontrado');
        }
        const userObj = user.toObject();
        const id = userObj._id.toString();
        delete userObj.password;
        delete userObj._id;
        delete userObj.__v;
        return { id, ...userObj };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map