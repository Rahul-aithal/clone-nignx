import fs from "fs/promises";
import { rootConfigSchema } from "./config-schema";
import { parse } from "yaml";

export async function parseYAMLConfig(files: string) {
  const configFileContent = await fs.readFile(files, "utf8");
  const configPaserd = parse(configFileContent);
  return JSON.stringify(configPaserd);
}

export async function validateConfig(config: string) {
  const validateConfig = await rootConfigSchema.parseAsync(JSON.parse(config));
  return validateConfig;
}
