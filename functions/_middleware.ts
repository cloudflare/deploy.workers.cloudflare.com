import sentryPlugin from '@cloudflare/pages-plugin-sentry';

export const onRequest: PagesFunction<{
	SENTRY_DSN: string;
	CF_ACCESS_CLIENT_ID: string;
	CF_ACCESS_CLIENT_SECRET: string;
}> = context => {
	return sentryPlugin({
		dsn: context.env.SENTRY_DSN,
		transportOptions: {
			headers: {
				'CF-Access-Client-Id': context.env.CF_ACCESS_CLIENT_ID,
				'CF-Access-Client-Secret': context.env.CF_ACCESS_CLIENT_SECRET,
			},
		},
	})(context);
};
