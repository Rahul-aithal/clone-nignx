import { z } from "zod";

// Define the upstream schema
const upstreamSchema = z.object({
  id: z.string(),
  url: z.string(),
});

// Define the header schema (optional for your case)
const headerSchema = z.object({
  key: z.string(),
  value: z.string(),
});

// Define the rule schema
const ruleSchema = z.object({
  path: z.string(), // Fixed typo from 'paht'
  upstream: z.array(z.string()), // Array of upstream strings
});

// Define the server schema
const serverSchema = z.object({
  listen: z.number().int().positive().default(3000), // Correct key and default
  workers: z.number().int().positive().default(1), // Workers should be numeric
  upstream: z.array(upstreamSchema), // Fixed typo from 'upsteram'
  headers: z.array(headerSchema).optional(),
  rules: z.array(ruleSchema),
});

// Root schema for configuration
const rootConfigSchema = z.object({
  server: serverSchema, // Ensures the 'server' object is required
});

export { rootConfigSchema };
export type ConfigSchema = z.infer<typeof rootConfigSchema>;
