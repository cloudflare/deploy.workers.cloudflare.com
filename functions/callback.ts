import { algo, cookieKey } from '../helpers/validateCookie';

export const onRequest: PagesFunction<{
	AUTH_STORE: KVNamespace;
	CLIENT_ID: string;
	CLIENT_SECRET: string;
}> = async context => {
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
	const code = url.searchParams.get('code');

	const response = await fetch('https://github.com/login/oauth/access_token', {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			'accept': 'application/json',
		},
		body: JSON.stringify({
			client_id: env.CLIENT_ID,
			client_secret: env.CLIENT_SECRET,
			code,
		}),
	});

	const result: any = await response.json();

	if (result.error) {
		return Response.redirect(url.origin);
	}

	const kid = crypto.randomUUID();
	const key = await crypto.subtle.generateKey(algo, true, ['encrypt', 'decrypt']);

	const iv = crypto.getRandomValues(new Uint8Array(12));
	const jwk = await crypto.subtle.exportKey('jwk', key);

	await env.AUTH_STORE.put(
		`keys:${kid}`,
		JSON.stringify({ jwk, iv: new TextDecoder().decode(iv) }),
		{
			expirationTtl: 3600,
		}
	);

	const encrypted = await crypto.subtle.encrypt(
		{ name: algo.name, iv },
		key,
		new TextEncoder().encode(JSON.stringify(result))
	);

	await env.AUTH_STORE.put(`auth:${kid}`, new TextDecoder().decode(encrypted), {
		expirationTtl: 3600,
	});

	const headers = {
		'Location': url.origin + `?authed=true`,
		'Set-cookie': `${cookieKey}=${kid}; Max-Age=3600; Secure; SameSite=Lax;`,
	};

	return new Response(null, {
		headers,
		status: 301,
	});
};
