import { Events, Listener } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";

import type { Client } from "discord.js";

@ApplyOptions<Listener.Options>({
  event: Events.ClientReady,
  once: true,
})
export default class ReadyListener extends Listener {
  public override async run(client: Client<true>) {
    this.container.logger.info(`Initialized as "${client.user.tag}"`, {
      commands: this.container.stores.get("commands").size,
      listeners: this.container.stores.get("listeners").size,

      interactions: this.container.stores.get("interaction-handlers").size,
      preconditions: this.container.stores.get("preconditions").size,
    });
  }
}
