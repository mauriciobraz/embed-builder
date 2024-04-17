import { json, error } from "@sveltejs/kit";

import { DISCORD_API_TOKEN } from "$env/static/private";
import type { RequestHandler } from "$lib/types";

export const GET: RequestHandler = async ({ request }) => {
  return error(501, { message: "Not implemented yet." });
};

export const POST: RequestHandler = async ({ request }) => {
  return error(501, { message: "Not implemented yet." });
};

export const PATCH: RequestHandler = async ({ request }) => {
  return error(501, { message: "Not implemented yet." });
};

export const DELETE: RequestHandler = async ({ request }) => {
  return error(501, { message: "Not implemented yet." });
};
