import { ValidationPipe } from '@nestjs/common';
import { RegisterDto } from './register.dto.js';

const pipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
});

const validate = (value: unknown) => pipe.transform(value, { type: 'body', metatype: RegisterDto });

const validPayload = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  password: 'secret123',
};

describe('RegisterDto', () => {
  it('should accept a valid payload', async () => {
    const dto = await validate(validPayload);

    expect(dto).toBeInstanceOf(RegisterDto);
    expect(dto).toEqual(validPayload);
  });

  it('should reject a payload without name (CA5)', async () => {
    const { name: _name, ...withoutName } = validPayload;

    await expect(validate(withoutName)).rejects.toThrow();
  });

  it('should reject a blank name (CA5)', async () => {
    await expect(validate({ ...validPayload, name: '' })).rejects.toThrow();
  });

  it('should reject a name made only of whitespace (CA5)', async () => {
    await expect(validate({ ...validPayload, name: '   ' })).rejects.toThrow();
  });

  it('should trim the name before it reaches the service (ID7)', async () => {
    const dto = await validate({ ...validPayload, name: '  Ada Lovelace  ' });

    expect(dto.name).toBe('Ada Lovelace');
  });

  it('should normalize the email case and surrounding whitespace (ID7)', async () => {
    const dto = await validate({ ...validPayload, email: '  Ada@Example.COM  ' });

    expect(dto.email).toBe('ada@example.com');
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

  it('should reject unknown properties (ID7)', async () => {
    await expect(validate({ ...validPayload, role: 'ADMIN' })).rejects.toThrow();
  });
});
