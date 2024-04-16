import { z } from "zod";
import { parseEnv } from "znv";

export const Environment = parseEnv(process.env, {
  NODE_ENV: z.enum(["development", "production"]),

  LOG_LEVEL: z.number().int(),
  DATABASE_URL: z.string().url(),
  DISCORD_TOKEN: z.string().min(1),
});

export const __DEV__ = Environment.NODE_ENV === "development";
export const __PROD__ = Environment.NODE_ENV === "production";
