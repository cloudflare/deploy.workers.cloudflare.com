export const onRequest: PagesFunction = async context => {
	const {
		request, // same as existing Worker API
		env, // same as existing Worker API
	} = context;
	const url = new URL(request.url);
	return env.ASSETS.fetch(url.protocol + '//' + url.hostname + '/deploy.svg', request);
};

