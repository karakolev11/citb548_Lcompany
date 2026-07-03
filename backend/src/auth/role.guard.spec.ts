import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleGuard } from './role.guard';
import { UserRoles } from 'src/common/enums/user-roles.enum';

describe('RoleGuard', () => {
  const createExecutionContext = (roleId?: number) =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user: roleId ? { roleId } : {} }),
      }),
    } as any);

  it('should allow requests when no roles are required', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(undefined),
    } as unknown as Reflector;
    const guard = new RoleGuard(reflector);

    expect(guard.canActivate(createExecutionContext())).toBe(true);
  });

  it('should allow user with required role', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([UserRoles.ADMIN]),
    } as unknown as Reflector;
    const guard = new RoleGuard(reflector);

    expect(guard.canActivate(createExecutionContext(1))).toBe(true);
  });

  it('should reject user with missing or wrong role', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([UserRoles.ADMIN]),
    } as unknown as Reflector;
    const guard = new RoleGuard(reflector);

    expect(() => guard.canActivate(createExecutionContext(3))).toThrow(ForbiddenException);
    expect(() => guard.canActivate(createExecutionContext())).toThrow(ForbiddenException);
  });
});
