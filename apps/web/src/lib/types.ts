import type * as Kit from "@sveltejs/kit";

export type RequestHandler = (
  event: Kit.RequestEvent<object, string | null>,
) => Kit.MaybePromise<Response>;
