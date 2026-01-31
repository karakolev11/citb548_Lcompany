import { UserRoles } from "src/common/enums/user-roles.enum";

export class CreateUserDto {
    username: string;
    password: string;
    email: string;
    fullName?: string;
    role?: UserRoles;
}
