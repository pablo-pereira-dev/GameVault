import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../../generated/prisma/enums.js';
import { Roles } from '../decorators/roles.decorator.js';
import { RolesGuard } from './roles.guard.js';

class GuardedController {
  @Roles(Role.ADMIN)
  adminRoute(this: void) {}

  openRoute(this: void) {}
}

const makeContext = (handler: () => void, user?: { sub: string; role: Role }) => {
  const request = user ? { user } : {};
  const context = {
    getHandler: () => handler,
    getClass: () => GuardedController,
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  return context;
};

describe('RolesGuard', () => {
  let guard: RolesGuard;

  beforeEach(() => {
    guard = new RolesGuard(new Reflector());
  });

  it('lets an ADMIN through on a @Roles(Role.ADMIN) route (ID9)', () => {
    const context = makeContext(GuardedController.prototype.adminRoute, {
      sub: 'admin-1',
      role: Role.ADMIN,
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('denies a USER on a @Roles(Role.ADMIN) route, which Nest answers with 403 Forbidden (CA6)', () => {
    const context = makeContext(GuardedController.prototype.adminRoute, {
      sub: 'user-1',
      role: Role.USER,
    });

    // A guard signals denial by returning false; Nest turns it into 403.
    expect(guard.canActivate(context)).toBe(false);
  });

  it('lets a USER through on a route without @Roles() (ID9)', () => {
    const context = makeContext(GuardedController.prototype.openRoute, {
      sub: 'user-1',
      role: Role.USER,
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('denies a request with no authenticated user on a role-protected route (CA6)', () => {
    const context = makeContext(GuardedController.prototype.adminRoute);

    expect(guard.canActivate(context)).toBe(false);
  });
});
