import { persisted } from "$lib/helpers/persisted";
import type { APIMessage } from "discord-api-types/v10";

export type APIWebhook = {
  nickname: string;
  avatarURL: string;
  webhookURL: string;

  messageID?: string;
};

export const currentMessage = persisted<Partial<APIMessage> | null>(
  "__CM",
  null,
);

export const currentWebhook = persisted<Partial<APIWebhook> | null>("__CW", {
  avatarURL: "https://cdn.discordapp.com/embed/avatars/0.png",
  nickname: "Embed Builder",
});
