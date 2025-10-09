import { z } from 'zod';

/**
 * Zod validation schemas for masked inputs
 */

// +996 700 000 000 (allow optional spaces between groups)
export const phoneSchema = z.string().regex(/^\+996\s?\d{3}\s?\d{3}\s?\d{3}$/, 'Неверный формат телефона. Пример: +996 700 000 000');

// ENI: XXX-XXX-XXX-XXX (digits)
export const eniSchema = z.string().regex(/^\d{3}-\d{3}-\d{3}-\d{3}$/, 'Неверный формат ЕНИ. Пример: 123-456-789-012');

// Cadastral number: XX-XXX-XXX-XXX (digits)
export const cadastralSchema = z.string().regex(/^\d{2}-\d{3}-\d{3}-\d{3}$/, 'Неверный формат кадастрового номера. Пример: 01-001-001-001');

/**
 * AntD validator factory using Zod schema
 */
export const zodRule =
  <T extends z.ZodTypeAny>(schema: T) =>
  async (_: unknown, value: unknown) => {
    // Allow empty/undefined values to pass; use a separate { required: true } rule for required fields
    if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
      return Promise.resolve();
    }
    const result = schema.safeParse(value);
    if (result.success) return Promise.resolve();
    const first = result.error.issues[0];
    return Promise.reject(new Error(first?.message || 'Неверный формат'));
  };
