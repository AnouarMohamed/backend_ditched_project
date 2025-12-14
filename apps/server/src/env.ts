import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 chars"),
});

export type Env = z.infer<typeof EnvSchema>;

export function validateEnv(config: Record<string, unknown>) {
  const parsed = EnvSchema.safeParse(config);
  if (!parsed.success) {
    const msg = parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`❌ Invalid environment variables:\n${msg}`);
  }
  return parsed.data;
}
