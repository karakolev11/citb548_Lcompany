import { User } from "./user.model";

export interface LoginRequest {
    username: string;
    password: string;
}

export interface AuthResponse {
    user: User;
    token?: string;
    [key: string]: any;
}