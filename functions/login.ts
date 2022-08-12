import { validateCookie } from '../helpers/validateCookie';

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

	const { authed, redirectUrl } = await validateCookie(env, request);

	if (url.pathname === '/login' && !authed && redirectUrl) {
		return Response.redirect(redirectUrl);
	}
};
