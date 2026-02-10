import { User } from "./user.model";

export interface LoginRequest {
    username: string;
    password: string;
}

export interface AuthResponse {
    user: User;
    access_token?: string;
    [key: string]: any;
}