import { seal } from 'tweetsodium';
import type { PluginData } from '@cloudflare/pages-plugin-sentry';
import { base64 } from 'rfc4648';

export const onRequest: PagesFunction<any, any, PluginData> = async ({ request, data }) => {
	try {
		const headers = request.headers;
		const body: any = await request.json();
		if (body.repo && body.name && body.value) {
			const resp = await fetch(`https://api.github.com/repos/${body.repo}/actions/variables`, {
				method: 'POST',
				headers,
				body: JSON.stringify({
					name: body.name,
					value: body.value,
				}),
			});
			return new Response(null, { status: resp.status });
		} else {
			return new Response(null, { status: 400 });
		}
	} catch (err) {
		data.sentry.captureException(err);
		return new Response(err.toString());
	}
};
