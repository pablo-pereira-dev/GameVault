import type { ConfigService } from '@nestjs/config';

const config = (values: Record<string, string | undefined>) =>
  ({ get: (key: string) => values[key] }) as unknown as ConfigService;

describe('AuthModule JWT configuration (ID17)', () => {
  it('should refuse to boot when JWT_SECRET is missing', async () => {
    const { jwtModuleOptionsFactory } = await import('./auth.module.js');

    expect(() => jwtModuleOptionsFactory(config({ JWT_SECRET: undefined }))).toThrow(/JWT_SECRET/);
  });

  it('should refuse to boot when JWT_SECRET is blank', async () => {
    const { jwtModuleOptionsFactory } = await import('./auth.module.js');

    expect(() => jwtModuleOptionsFactory(config({ JWT_SECRET: '   ' }))).toThrow(/JWT_SECRET/);
  });

  it('should register a signing secret and a finite expiry, configurable via JWT_EXPIRES_IN', async () => {
    const { jwtModuleOptionsFactory } = await import('./auth.module.js');

    const fallback = jwtModuleOptionsFactory(config({ JWT_SECRET: 'test-secret' }));
    expect(fallback.secret).toBe('test-secret');
    expect(fallback.signOptions.expiresIn).toBe('15m');

    const configured = jwtModuleOptionsFactory(
      config({ JWT_SECRET: 'test-secret', JWT_EXPIRES_IN: '30m' }),
    );
    expect(configured.signOptions.expiresIn).toBe('30m');
  });
});
