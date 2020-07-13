import { getAssetFromKV } from "@cloudflare/kv-asset-handler";
import cookie from "cookie";
import jose from "node-jose";
import { seal } from "tweetsodium";

import { hydrateEdgeState } from "./edge_state";

const cookieKey = "Authed-User";

addEventListener("fetch", (event) => {
  try {
    event.respondWith(handleEvent(event));
  } catch (e) {
    event.respondWith(new Response(e.toString(), { status: 500 }));
  }
});

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

function str2ab(str) {
  var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

async function handleEvent(event) {
  const { request } = event;
  const url = new URL(request.url);

  if (url.pathname === "/button") {
    return await getAssetFromKV(event, {
      mapRequestToAsset: (req) =>
        new Request(`${new URL(req.url).origin}/deploy.svg`, req),
    });
  }

  if (url.pathname === "/callback") {
    return handleCallback(event);
  }

  if (url.pathname === "/secret") {
    return handleSecret(event);
  }

  const { accessToken, authed, error, redirectUrl } = await validateCookie(
    event
  );

  if (error) {
    return new Response(error, { status: 500 });
  }

  if (url.pathname === "/login" && !authed && redirectUrl) {
    return Response.redirect(redirectUrl);
  }

  // hard-refresh for kv consistency fun
  if (url.searchParams.get("authed")) {
    return Response.redirect(url.origin);
  }

  return renderApp(event, { state: { accessToken } });
}

const handleSecret = async (event) => {
  try {
    const headers = event.request.headers;
    const body = await event.request.json();
    if (body.repo && body.secret_key && body.secret_value) {
      const keyResp = await fetch(
        `https://api.github.com/repos/${body.repo}/actions/secrets/public-key`,
        { headers }
      );
      const keyRespJson = await keyResp.json();
      const { key, key_id } = keyRespJson;
      const encrypted = seal(
        Buffer.from(body.secret_value),
        Buffer.from(key, "base64")
      );
      const encrypted_value = Buffer.from(encrypted).toString("base64");
      const secretResp = await fetch(
        `https://api.github.com/repos/${body.repo}/actions/secrets/${body.secret_key}`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify({
            encrypted_value,
            key_id,
          }),
        }
      );
      return new Response(null, { status: secretResp.status });
    } else {
      return new Response(null, { status: 400 });
    }
  } catch (err) {
    return new Response(err.toString());
  }
};

const validateCookie = async (event) => {
  try {
    const { request } = event;
    const cookieHeader = request.headers.get("Cookie");
    const cookies = cookie.parse(cookieHeader);
    const auth = cookies[cookieKey];

    if (!auth) {
      return {
        authed: false,
        redirectUrl: `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=public_repo`,
      };
    }

    const jsonKey = await AUTH_STORE.get(`keys:${auth}`);
    const key = await jose.JWK.asKey(JSON.parse(jsonKey));

    const storedAuth = await AUTH_STORE.get(`auth:${auth}`);
    const { payload } = await jose.JWE.createDecrypt(key).decrypt(
      JSON.parse(storedAuth)
    );

    const { access_token: accessToken } = JSON.parse(payload);
    return { accessToken, authed: true };
  } catch (error) {
    return {
      authed: false,
      error,
    };
  }
};

const handleCallback = async (event) => {
  const url = new URL(event.request.url);
  const code = url.searchParams.get("code");

  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
    }),
  });

  const result = await response.json();

  if (result.error) {
    return new Response(JSON.stringify(result), { status: 401 });
  }

  const key = await jose.JWK.createKey("oct", 256, { alg: "A256GCM" });
  const jsonKey = key.toJSON(true);
  await AUTH_STORE.put(`keys:${jsonKey.kid}`, JSON.stringify(jsonKey), {
    expirationTtl: 3600,
  });

  const encrypted = await jose.JWE.createEncrypt(key)
    .update(JSON.stringify(result))
    .final();

  await AUTH_STORE.put(`auth:${jsonKey.kid}`, JSON.stringify(encrypted), {
    expirationTtl: 3600,
  });

  const headers = {
    Location: url.origin + `?authed=true`,
    "Set-cookie": `${cookieKey}=${jsonKey.kid}; Max-Age=3600; Secure; SameSite=Strict;`,
  };

  return new Response(null, {
    headers,
    status: 301,
  });
};

const renderApp = async (event, state = {}) => {
  let options = {};
  try {
    const response = await getAssetFromKV(event, options);
    return hydrateEdgeState({ response, state });
  } catch (e) {
    let notFoundResponse = await getAssetFromKV(event, {
      mapRequestToAsset: (req) =>
        new Request(`${new URL(req.url).origin}/404.html`, req),
    });

    return new Response(notFoundResponse.body, {
      ...notFoundResponse,
      status: 404,
    });
  }
};
