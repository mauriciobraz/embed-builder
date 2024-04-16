import "@sapphire/pieces";
import "@sapphire/framework";

import "@sapphire/plugin-hmr";
import "@sapphire/plugin-utilities-store";

import type { Logger as TSLogger } from "tslog";
import type { ILogger as SapphireLogger } from "@sapphire/framework";

declare module "@sapphire/framework" {
  interface Preconditions {}
}

declare module "@sapphire/plugin-utilities-store" {
  interface Utilities {}
}

declare module "@sapphire/pieces" {
  interface Container {
    prettyLogger: TSLogger<unknown>;
  }
}
