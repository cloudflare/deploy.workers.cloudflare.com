import {JWK, JWE} from "node-jose";
import cookie from "cookie";

export const cookieKey = "Authed-User";

export const validateCookie = async (env, request) => {
  try {
    const cookieHeader =
      request.headers.get("Cookie") || request.headers.get("Set-cookie") || "";  // cookie.parse accepts string only, undefined throws error
    const cookies = cookie.parse(cookieHeader);
    const auth = cookies[cookieKey];

    if (!auth) {
      return {
        authed: false,
        redirectUrl: `https://github.com/login/oauth/authorize?client_id=${env.CLIENT_ID}&scope=public_repo`,
      };
    }

    const jsonKey = await env.AUTH_STORE.get(`keys:${auth}`);
    const key = await JWK.asKey(JSON.parse(jsonKey));

    const storedAuth = await env.AUTH_STORE.get(`auth:${auth}`);
    const { payload } = await JWE.createDecrypt(key).decrypt(
      JSON.parse(storedAuth)
    );

    const { access_token: accessToken } = JSON.parse(payload);

    const tokenResp = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `token ${accessToken}`,
        "User-Agent": "Deploy-to-CF-Workers",
      },
    });

    if (tokenResp.status > 201) {
      throw new Error("GitHub API response was invalid");
    }
    return { accessToken, authed: true };
  } catch (error) {
    return {
      authed: false,
      error,
    };
  }
};