declare class RoleDto {
    name: string;
    priority?: number;
}
export declare class CreateUserDto {
    username: string;
    password?: string;
    name: string;
    cedula?: string;
    email?: string;
    roles: RoleDto[];
}
export {};
