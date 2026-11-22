import { Transform } from 'class-transformer';

/**
 * Single source of truth for e-mail identity (ID7): trim + lowercase.
 * Used by both RegisterDto and LoginDto so an account created with one
 * spelling can always be found when logging in with another.
 */
export const normalizeEmailValue = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export const NormalizeEmail = () => Transform(normalizeEmailValue);
