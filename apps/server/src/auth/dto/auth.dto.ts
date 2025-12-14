import { z } from "zod";

export const LoginPinDto = z.object({
  userId: z.string().min(1),
  pin: z.string().min(4).max(12),
});

export type LoginPinDto = z.infer<typeof LoginPinDto>;

export const LoginPasswordDto = z.object({
  userId: z.string().min(1),
  password: z.string().min(6).max(200),
});

export type LoginPasswordDto = z.infer<typeof LoginPasswordDto>;
