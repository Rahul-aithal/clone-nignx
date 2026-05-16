import { program } from "commander";
import { validateConfig, parseYAMLConfig } from "./config";
import os from "os";
import { createServer } from "./server";

async function main() {
  program.option("--config <path>");
  program.parse();

  const options = program.opts();
  if (options && "config" in options) {
    const validatedConfig = await validateConfig(
      await parseYAMLConfig(options.config)
    );
    if (validatedConfig) {
      await createServer({
        port: validatedConfig.server.listen,
        workerCount: validatedConfig.server.workers ?? os.cpus().length,
        config: validatedConfig,
      });
    }
  }
}

main();
