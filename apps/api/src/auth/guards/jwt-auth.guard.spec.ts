import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../../../generated/prisma/enums.js';
import { Public } from '../decorators/public.decorator.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

class GuardedController {
  protectedRoute(this: void) {}

  @Public()
  publicRoute(this: void) {}
}

const makeContext = (handler: () => void, authorization?: string) => {
  const request = { headers: authorization ? { authorization } : {} } as Record<string, any>;
  const context = {
    getHandler: () => handler,
    getClass: () => GuardedController,
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  return { context, request };
};

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwt: { verify: ReturnType<typeof vi.fn> };

  const payload = { sub: 'user-1', email: 'ada@example.com', role: Role.USER };

  beforeEach(() => {
    jwt = { verify: vi.fn().mockReturnValue(payload) };
    guard = new JwtAuthGuard(new Reflector(), jwt as unknown as JwtService);
  });

  it('lets a @Public() route through without a token (ID9)', () => {
    const { context, request } = makeContext(GuardedController.prototype.publicRoute);

    expect(guard.canActivate(context)).toBe(true);
    expect(jwt.verify).not.toHaveBeenCalled();
    expect(request).not.toHaveProperty('user');
  });

  it('rejects a protected route without an Authorization header with 401 (CA8)', () => {
    const { context } = makeContext(GuardedController.prototype.protectedRoute);

    let error: unknown;
    try {
      guard.canActivate(context);
    } catch (caught) {
      error = caught;
    }

    expect(error).toBeInstanceOf(UnauthorizedException);
    expect((error as UnauthorizedException).getStatus()).toBe(401);
    expect(jwt.verify).not.toHaveBeenCalled();
  });

  it('rejects a non-Bearer authorization scheme with 401 (CA8)', () => {
    const { context } = makeContext(GuardedController.prototype.protectedRoute, 'Basic user:pass');

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('rejects an expired token with 401 (CA8)', () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('jwt expired');
    });
    const { context } = makeContext(GuardedController.prototype.protectedRoute, 'Bearer expired.token');

    let error: unknown;
    try {
      guard.canActivate(context);
    } catch (caught) {
      error = caught;
    }

    expect(error).toBeInstanceOf(UnauthorizedException);
    expect((error as UnauthorizedException).getStatus()).toBe(401);
  });

  it('rejects an adulterated token with 401 (CA8)', () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('invalid signature');
    });
    const { context } = makeContext(GuardedController.prototype.protectedRoute, 'Bearer tampered.token');

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('attaches the verified payload to request.user for the next guard and the controller (ID9)', () => {
    const { context, request } = makeContext(
      GuardedController.prototype.protectedRoute,
      'Bearer valid.jwt.token',
    );

    expect(guard.canActivate(context)).toBe(true);
    expect(jwt.verify).toHaveBeenCalledWith('valid.jwt.token');
    expect(request.user).toEqual(payload);
  });
});
