import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRoles } from 'src/common/enums/user-roles.enum';
import { ROLES_KEY } from './roles.decorator';

const ROLE_ID_TO_ENUM: Record<number, UserRoles> = {
  1: UserRoles.ADMIN,
  2: UserRoles.EMPLOYEE,
  3: UserRoles.CUSTOMER,
};

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRoles[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const roleId: number | undefined = request.user?.roleId;
    const role = roleId ? ROLE_ID_TO_ENUM[roleId] : undefined;

    if (!role || !requiredRoles.includes(role)) {
      throw new ForbiddenException('Insufficient role permissions');
    }

    return true;
  }
}
