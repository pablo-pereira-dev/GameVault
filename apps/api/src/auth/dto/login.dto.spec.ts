import { ValidationPipe } from '@nestjs/common';
import { LoginDto } from './login.dto.js';

const pipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
});

const validate = (value: unknown) => pipe.transform(value, { type: 'body', metatype: LoginDto });

const validPayload = {
  email: 'ada@example.com',
  password: 'secret123',
};

describe('LoginDto', () => {
  it('should accept a valid payload', async () => {
    const dto = await validate(validPayload);

    expect(dto).toBeInstanceOf(LoginDto);
    expect(dto).toEqual(validPayload);
  });

  it('should normalize the email exactly like the register DTO (CA4)', async () => {
    const dto = await validate({ ...validPayload, email: '  Ada@Example.COM  ' });

    expect(dto.email).toBe('ada@example.com');
  });

  it('should share one single e-mail normalization rule with RegisterDto (ID7)', async () => {
    // The rule is account identity: if the two DTOs ever diverge, a user
    // registered with one spelling can no longer log in with another.
    const { normalizeEmailValue } = await import(
      '../../common/decorators/normalize-email.decorator.js'
    );
    const { RegisterDto } = await import('./register.dto.js');
    const registerPipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });

    for (const rawEmail of ['  Ada@Example.COM  ', 'ADA@example.com', 'ada@example.com']) {
      const loginDto = await validate({ ...validPayload, email: rawEmail });
      const registerDto = await registerPipe.transform(
        { name: 'Ada Lovelace', email: rawEmail, password: validPayload.password },
        { type: 'body', metatype: RegisterDto },
      );

      expect(normalizeEmailValue({ value: rawEmail })).toBe('ada@example.com');
      expect(loginDto.email).toBe(registerDto.email);
    }
  });

  it('should reject a payload without email (CA5)', async () => {
    const { email: _email, ...withoutEmail } = validPayload;

    await expect(validate(withoutEmail)).rejects.toThrow();
  });

  it('should reject a malformed email (CA5)', async () => {
    await expect(validate({ ...validPayload, email: 'ada-at-example.com' })).rejects.toThrow();
  });

  it('should reject a payload without password (CA5)', async () => {
    const { password: _password, ...withoutPassword } = validPayload;

    await expect(validate(withoutPassword)).rejects.toThrow();
  });

  it('should reject a password shorter than 6 characters (CA5)', async () => {
    await expect(validate({ ...validPayload, password: '12345' })).rejects.toThrow();
  });

  it('should reject a blank password (CA5)', async () => {
    await expect(validate({ ...validPayload, password: '   ' })).rejects.toThrow();
  });

  it('should reject unknown properties (ID7)', async () => {
    await expect(validate({ ...validPayload, role: 'ADMIN' })).rejects.toThrow();
  });
});
