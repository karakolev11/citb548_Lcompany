export interface AuthenticatedUserDto {
    id: number;
    username: string;
    email: string;
    roleId: number;
}

export interface JwtTokenDto {
    access_token: string;
    user: AuthenticatedUserDto;
}