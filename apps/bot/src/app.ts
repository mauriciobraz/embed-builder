import "dotenv/config";

import "@sapphire/plugin-hmr/register";
import "@sapphire/plugin-utilities-store/register";

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { isNonNull } from "remeda";

import { SapphireClient, container } from "@sapphire/framework";
import { IntentsBitField } from "discord.js";

import { logger, sapphireLoggerAdapter } from "$lib/helpers/logger";
import { Environment, __DEV__ } from "$lib/env";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Executes a function and returns its result, or a default value if an error occurs.
 * @returns The result of the function execution, or the default value if an error occurs.
 */
function or<T>(fn: () => T, val: T) {
  try {
    return fn();
  } catch {
    return val;
  }
}

/**
 * Reads all files recursively from the given directory.
 * @param directory Directory to read all files recursively.
 * @param protectedDirs Protected directories to ignore.
 * @returns All files with full paths from the given directory.
 *
 * @example
 * ```typescript
 * const files = readFilesRecursively(join(__dirname, 'mods'));
 * => ['/path/to/your/directory/file1.txt', '/path/to/your/directory/file2.js', ...]
 * ```
 */
function readFilesRecursively(
  directory: string,
  protectedFiles: (string | RegExp)[] = [],
): string[] {
  const filesAndDirs = or(() => readdirSync(directory), []);
  const result: string[] = [];

  for (const fileOrDir of filesAndDirs) {
    const fullPath = join(directory, fileOrDir);
    const stats = statSync(fullPath);

    if (stats.isFile()) {
      if (
        protectedFiles.some((protectedFile) => {
          if (typeof protectedFile === "string")
            return protectedFile === join(directory, fileOrDir);

          return protectedFile.test(fileOrDir);
        })
      ) {
        continue;
      }

      result.push(fullPath);
    } else if (stats.isDirectory()) {
      result.push(...readFilesRecursively(fullPath, protectedFiles));
    }
  }

  return result;
}

/**
 * Extends {@link SapphireClient} functionalities.
 */
export default class CustomSapphireClient extends SapphireClient {
  #MODULES_FOLDER = join(__dirname, "mods");
  #UTILITIES_FOLDER = join(__dirname, "libs", "utilities");

  public override async login(token?: string): Promise<string> {
    await this.loadUtilitiesAsync();
    await this.loadModulesRegistriesAsync();

    return await super.login(token);
  }

  /**
   * Loads all application command registries in the custom modules folder.
   *
   * @example
   * ```typescript
   * await client.loadModulesRegistriesAsync();
   * ```
   */
  private async loadModulesRegistriesAsync() {
    const filesToRegister = readFilesRecursively(this.#MODULES_FOLDER, [
      ...(await this.getFilesWithoutClassesExports(this.#MODULES_FOLDER)),
      /.map$/i,
    ]);

    const foldersWithAtLeastOneClassExport = new Set<string>(
      filesToRegister.map((file) => {
        const dn = dirname(file);
        return dn.substring(0, dn.lastIndexOf("/"));
      }),
    );

    for (const path of foldersWithAtLeastOneClassExport) {
      this.stores.registerPath(path);
    }
  }

  /**
   * Loads all utilities in the custom utilities folder (excluding protected files).
   *
   * @example
   * ```typescript
   * await client.loadUtilitiesAsync();
   * ```
   */
  private async loadUtilitiesAsync() {
    const filesToRegister = readFilesRecursively(this.#UTILITIES_FOLDER, [
      ...(await this.getFilesWithoutClassesExports(this.#UTILITIES_FOLDER)),
      /.map$/i,
    ]);

    const foldersWithAtLeastOneClassExport = new Set<string>(
      filesToRegister.map((file) => dirname(file)),
    );

    for (const folder of foldersWithAtLeastOneClassExport) {
      this.stores.get("utilities").registerPath(folder);
    }
  }

  /**
   * Gets all files without classes exports from the given directory.
   * @returns All files without classes exports from the given directory.
   *
   * @example
   * ```typescript
   * await this.getFilesWithoutClassesExports();
   * => ['/path/to/your/protected1.txt', '/path/to/your/protected2.js', ...]
   * ```
   */
  private async getFilesWithoutClassesExports(dir: string): Promise<string[]> {
    const files = readFilesRecursively(dir)
      .filter((file) => /^.*\.(ts,cts,mts,js,cjs,mjs)$/.test(file))
      .filter((file) => !file.endsWith(".map"));

    const rawProtectedFiles = await Promise.all(
      files.map(async (file) => {
        const content = readFileSync(file).toString();
        return content.includes("export") && content.includes("class")
          ? null
          : file;
      }),
    );

    return rawProtectedFiles.filter(isNonNull);
  }
}

async function run(): Promise<void> {
  const sapphireClient = new CustomSapphireClient({
    intents: [
      IntentsBitField.Flags.Guilds,
      IntentsBitField.Flags.GuildMessages,
      IntentsBitField.Flags.MessageContent,
    ],

    defaultPrefix: "!",
    baseUserDirectory: null,

    caseInsensitiveCommands: true,
    caseInsensitivePrefixes: true,

    loadDefaultErrorListeners: true,
    loadMessageCommandListeners: true,
    loadApplicationCommandRegistriesStatusListeners: false,

    hmr: {
      silent: true,
      enabled: __DEV__,
    },

    logger: {
      level: Environment.LOG_LEVEL,
      instance: sapphireLoggerAdapter,
    },
  });

  container.prettyLogger = logger;
  await sapphireClient.login(Environment.DISCORD_TOKEN);
}

const esMain = import.meta.url.endsWith(basename(process.argv[1]));

if (esMain) {
  // Forcefully enable loading typescript files.
  // https://github.com/sapphiredev/pieces/blob/6370cbfdd5a888465267a4a527ccad41ad842bd3/src/lib/strategies/LoaderStrategy.ts#L43
  process.env.TS_NODE_DEV = "true";

  run();
}
