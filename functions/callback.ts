import { JWK, JWE } from "node-jose";
import { cookieKey } from "../helpers/validateCookie";

export const onRequest: PagesFunction<{ AUTH_STORE: KVNamespace, CLIENT_ID: string, CLIENT_SECRET: string }> = async (context) => {
  // Contents of context object
  const {
    request, // same as existing Worker API
    env, // same as existing Worker API
    params, // if filename includes [id] or [[path]]
    waitUntil, // same as ctx.waitUntil in existing Worker API
    next, // used for middleware or to fetch assets
    data, // arbitrary space for passing data between middlewares
  } = context;

  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      client_id: env.CLIENT_ID,
      client_secret: env.CLIENT_SECRET,
      code,
    }),
  });

  const result:any = await response.json();

  if (result.error) {
    return Response.redirect(url.origin);
  }

  const key = await JWK.createKey("oct", 256, { alg: "A256GCM" });
  const jsonKey = key.toJSON(true);
  await env.AUTH_STORE.put(`keys:${jsonKey.kid}`, JSON.stringify(jsonKey), {
    expirationTtl: 3600,
  });

  const encrypted = await JWE.createEncrypt(key)
    .update(JSON.stringify(result))
    .final();

  await env.AUTH_STORE.put(`auth:${jsonKey.kid}`, JSON.stringify(encrypted), {
    expirationTtl: 3600,
  });

  const headers = {
    Location: url.origin + `?authed=true`,
    "Set-cookie": `${cookieKey}=${jsonKey.kid}; Max-Age=3600; Secure; SameSite=Lax;`,
  };

  return new Response(null, {
    headers,
    status: 301,
  });
}