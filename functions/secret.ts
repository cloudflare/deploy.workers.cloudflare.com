import { seal } from "tweetsodium";

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

  try {
    const headers = request.headers;
    const body:any = await request.json();
    if (body.repo && body.secret_key && body.secret_value) {
      const keyResp = await fetch(
        `https://api.github.com/repos/${body.repo}/actions/secrets/public-key`,
        { headers }
      );
      const keyRespJson:any = await keyResp.json();
      const { key, key_id } = keyRespJson;

      const encrypted = seal(
        // @ts-ignore
        Buffer.from(body.secret_value),
        // @ts-ignore
        Buffer.from(key, "base64")
      );

      // @ts-ignore
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
}
