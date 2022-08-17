import cookie from 'cookie';

export const cookieKey = 'Authed-User';

export const algo = {
	name: 'AES-GCM',
	length: 256,
};

export const validateCookie = async (env, request) => {
	try {
		const cookieHeader = request.headers.get('Cookie') || request.headers.get('Set-cookie') || ''; // cookie.parse accepts string only, undefined throws error
		const cookies = cookie.parse(cookieHeader);
		const auth = cookies[cookieKey];

		if (!auth) {
			return {
				authed: false,
				redirectUrl: `https://github.com/login/oauth/authorize?client_id=${env.CLIENT_ID}&scope=public_repo`,
			};
		}

		const kvKey = await env.AUTH_STORE.get(`keys:${auth}`, 'json');
		const storedAuth = await env.AUTH_STORE.get(`auth:${auth}`, 'arrayBuffer');

		const key = await crypto.subtle.importKey('jwk', kvKey.jwk, algo, true, ['decrypt']);

		const decrypted = await crypto.subtle.decrypt(
			{ name: algo.name, iv: base64_to_buf(kvKey.iv) },
			key,
			storedAuth
		);

		const { access_token: accessToken } = JSON.parse(new TextDecoder().decode(decrypted));

		const tokenResp = await fetch('https://api.github.com/user', {
			headers: {
				'Authorization': `token ${accessToken}`,
				'User-Agent': 'Deploy-to-CF-Workers',
			},
		});

		if (tokenResp.status > 201) {
			throw new Error('GitHub API response was invalid');
		}
		return { accessToken, authed: true };
	} catch (error) {
		console.log(error);
		return {
			authed: false,
			error,
		};
	}
};

export const buff_to_base64 = buff => btoa(String.fromCharCode.apply(null, buff));
export const base64_to_buf = b64 => Uint8Array.from(atob(b64), c => c.charCodeAt(null));
