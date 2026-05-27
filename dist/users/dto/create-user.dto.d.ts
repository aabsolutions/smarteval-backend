declare class RoleDto {
    name: string;
    priority?: number;
}
export declare class CreateUserDto {
    username: string;
    password?: string;
    name: string;
    email?: string;
    roles: RoleDto[];
}
export {};
