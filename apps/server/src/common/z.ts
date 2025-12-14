import { z } from "zod";

/**
 * Helper: validate unknown input with a schema and return typed data.
 */
export function parseOrThrow<T>(schema: z.ZodType<T>, value: unknown): T {
  const r = schema.safeParse(value);
  if (!r.success) {
    const msg = r.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join(", ");
    throw new Error(msg);
  }
  return r.data;
}
