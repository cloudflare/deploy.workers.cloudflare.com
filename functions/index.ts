import { validateCookie } from "../helpers/validateCookie"

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

  const response = await next()

  const { accessToken, authed, error, redirectUrl } = await validateCookie(
    env,
    request
  );

  if (error) {
    response.headers.set("Set-cookie", "Authed-User=null; Max-Age=0");
  }

  if (url.pathname === "/") {
    //response.headers.set("Cache-Control", "no-store")
    const rewriter = new HTMLRewriter().on("body", new EdgeStateEmbed({ accessToken, authed }));
    return rewriter.transform(response);
  } else {
    return response
  }
}

class EdgeStateEmbed {
  _state: {
    accessToken: string,
    authed: boolean
  }

  constructor(state) {
    this._state = state;
  }

  element(element) {
    const edgeStateElement = `
      <script id='edge_state' type='application/json'>
        ${JSON.stringify({ state: { ...this._state } })}
      </script>
    `;
    element.prepend(edgeStateElement, { html: true });
  }
}

