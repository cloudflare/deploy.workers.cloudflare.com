import React, { useContext, useEffect, useState } from 'react';
import { Machine, assign } from 'xstate';
import { useMachine } from '@xstate/react';
import { clear, get, set } from './cache';

import './tailwind.css';
import './main.css';

import { EdgeStateContext } from './edge_state';
import {
	Completed,
	Deploy,
	ConfigureAccount,
	ConfigureProject,
	Embed,
	GithubAuth,
	Logo,
	MissingUrl,
	Sidebar,
} from './components';

function parseField(value) {
	const { name, secret, descr } = JSON.parse(value);
	if (!name || !secret || !descr) {
		throw new Error('misconfigured fields');
	}
	return { name, secretName: secret, description: descr, value: '' };
}

export const appMachine = Machine(
	{
		id: 'app',
		initial: 'initial',
		context: { stepNumber: 1 },
		states: {
			initial: {
				on: {
					LOGIN: {
						target: 'login',
					},
					NO_URL: 'missing_url',
					URL: {
						target: 'configuring_account',
						actions: 'incrementStep',
					},
					LS_FORKED: {
						target: 'deploying_setup',
						actions: ['incrementStep', 'incrementStep'],
					},
				},
			},
			missing_url: {
				on: {
					URL: {
						target: 'configuring_account',
						actions: 'incrementStep',
					},
				},
			},
			login: {
				on: {
					AUTH: {
						target: 'configuring_account',
						actions: 'incrementStep',
					},
				},
			},
			configuring_account: {
				on: {
					SUBMIT_CONFIGURE_PROJECT: {
						target: 'configuring_project',
						actions: 'incrementStep',
					},
					SUBMIT_DEPLOY: {
						target: 'deploying_setup',
						actions: 'incrementStep',
					},
				},
			},
			configuring_project: {
				on: {
					CONFIGURE: {
						target: 'deploying_setup',
						actions: 'incrementStep',
					},
				},
			},
			deploying_setup: {
				on: { ERROR: 'error_forking', COMPLETE: 'completed' },
			},
			completed: {
				type: 'final',
			},
			error_forking: {},
			error_starting_deploy: {},
		},
	},
	{
		actions: {
			incrementStep: assign({
				stepNumber: context => context.stepNumber + 1,
			}),
		},
	}
);

const App = () => {
	const [current, send] = useMachine(appMachine);
	const [accountId, setAccountId] = useState(null);
	const [apiToken, setApiToken] = useState(null);
	const [url, setUrl] = useState(null);
	const [forkedRepo, setForkedRepo] = useState(null);
	const [edgeState] = useContext(EdgeStateContext);
	const [debug, setDebug] = useState(false);
	const [fields, setFields] = useState([]);
	const [apiTokenTemplate, setApiTokenTemplate] = useState(null);
	const [apiTokenName, setApiTokenName] = useState(null);

	const setAccountIdWithCache = accountId => {
		setAccountId(accountId);
		set('accountId', accountId);
	};

	const setForkedRepoWithCache = forkedRepo => {
		setForkedRepo(forkedRepo);
		set('forkedRepo', forkedRepo);
	};

	// Check for edge case (pun intented) where the Workers fn has successfully
	// validated the user's auth state, even if the KV store hasn't updated to
	// persist the auth data. If that case is found, refresh the page and we
	// should have a persisted auth value
	useEffect(() => {
		const el = document.querySelector('#edge_state');
		if (el && el.innerText) {
			const edgeStateInnerText = el.innerText;
			const _edgeState = JSON.parse(edgeStateInnerText);

			if (_edgeState.state.authed && !_edgeState.state.accessToken) {
				window.location.reload();
			}
		}
	}, []);

	useEffect(() => {
		const windowUrl = new URL(window.location);
		const url = windowUrl.searchParams.get('url');

		// Validate URL query parameter actually legitimate to prevent XSS
		// Also validate that hostname is github.com to prevent loading from other URLs
		try {
			const parsedURL = new URL(url);
			if (parsedURL.protocol !== 'http:' && parsedURL.protocol !== 'https:' || parsedUrl.hostname !== 'github.com') {
				send('NO_URL');
			}
		} catch (_) {
			send('NO_URL');
		}

		const lsUrl = get('url');
		if (url) {
			setUrl(url);

			// New URL found that doesn't match LS,
			// need to clear all cache and start over
			if (lsUrl !== url) {
				clear();
				set('url', url);
			}
		} else {
			lsUrl ? setUrl(lsUrl) : send('NO_URL');
		}

		const lsForkedRepo = get('forkedRepo');
		if (lsForkedRepo) {
			setForkedRepo(lsForkedRepo);
			send('LS_FORKED');
		}

		send('LOGIN');

		const lsAccountId = get('accountId');
		if (lsAccountId) setAccountId(lsAccountId);

		if (edgeState && edgeState.accessToken) {
			send('AUTH');
		} else {
			send('NO_AUTH');
		}

		// Fields
		{
			const cachedFields = get('fields');
			if (cachedFields) {
				setFields(cachedFields);
			} else {
				const fields = windowUrl.searchParams.getAll('fields');
				if (fields.length > 0) {
					set('accountId', accountId);

					const parsedFields = fields.map(parseField);
					setFields(parsedFields);
					set('fields', parsedFields);
				}
			}
		}

		// API Token template and name
		{
			const cachedApiTokenTemplate = get('apiTokenTmpl');
			if (cachedApiTokenTemplate) {
				setApiTokenTemplate(cachedApiTokenTemplate);
			} else {
				const apiTokenTemplate = windowUrl.searchParams.get('apiTokenTmpl');
				if (apiTokenTemplate) {
					setApiTokenTemplate(apiTokenTemplate);
					set('apiTokenTmpl', apiTokenTemplate);
				}
			}

			const cachedApiTokenName = get('apiTokenName');
			if (cachedApiTokenName) {
				setApiTokenName(cachedApiTokenName);
			} else {
				const apiTokenName = windowUrl.searchParams.get('apiTokenName');
				if (apiTokenName) {
					setApiTokenName(apiTokenName);
					set('apiTokenName', apiTokenName);
				}
			}
		}
	}, [send, edgeState]);

	const fork = async ({ accountId, apiToken, event }) => {
		const regex = /github.com\/(?<owner>[^/]+)\/(?<repo>[^/]+)/;
		let urlToMatch = url;
		if (urlToMatch.endsWith('/')) urlToMatch = urlToMatch.slice(0, -1);

		const repoUrl = urlToMatch && urlToMatch.match(regex);
		// Remove trailing slash if it exists
		event.preventDefault();

		// should move into loading here
		const resp = await fetch(
			`https://api.github.com/repos/${repoUrl.groups.owner}/${repoUrl.groups.repo}/forks`,
			{
				method: 'POST',
				headers: {
					'Authorization': `token ${edgeState.accessToken}`,
					'User-Agent': 'Deploy-to-CF-Workers',
				},
			}
		);
		const repo = await resp.json();
		setForkedRepoWithCache(repo.full_name);

		// deprecated secret
		// todo: delete at the end of september
		await fetch(`/secret`, {
			body: JSON.stringify({
				repo: repo.full_name,
				secret_key: 'CF_ACCOUNT_ID',
				secret_value: accountId,
			}),
			method: 'POST',
			headers: {
				'Authorization': `token ${edgeState.accessToken}`,
				'User-Agent': 'Deploy-to-CF-Workers',
			},
		});

		await fetch(`/secret`, {
			body: JSON.stringify({
				repo: repo.full_name,
				secret_key: 'CLOUDFLARE_ACCOUNT_ID',
				secret_value: accountId,
			}),
			method: 'POST',
			headers: {
				'Authorization': `token ${edgeState.accessToken}`,
				'User-Agent': 'Deploy-to-CF-Workers',
			},
		});

		setAccountIdWithCache(accountId);

		// deprecated secret
		// todo: delete at the end of september
		await fetch(`/secret`, {
			body: JSON.stringify({
				repo: repo.full_name,
				secret_key: 'CF_API_TOKEN',
				secret_value: apiToken,
			}),
			method: 'POST',
			headers: {
				'Authorization': `token ${edgeState.accessToken}`,
				'User-Agent': 'Deploy-to-CF-Workers',
			},
		});

		await fetch(`/secret`, {
			body: JSON.stringify({
				repo: repo.full_name,
				secret_key: 'CLOUDFLARE_API_TOKEN',
				secret_value: apiToken,
			}),
			method: 'POST',
			headers: {
				'Authorization': `token ${edgeState.accessToken}`,
				'User-Agent': 'Deploy-to-CF-Workers',
			},
		});

		for (let i = 0, len = fields.length; i < len; i++) {
			const field = fields[i];
			await fetch('/variable', {
				body: JSON.stringify({
					repo: repo.full_name,
					name: field.secretName,
					value: field.value,
				}),
				method: 'POST',
				headers: {
					'Authorization': `token ${edgeState.accessToken}`,
					'User-Agent': 'Deploy-to-CF-Workers',
				},
			});
		}

		send('SUBMIT');
		return false;
	};

	const dispatchEvent = async () => {
		await fetch(`https://api.github.com/repos/${forkedRepo}/dispatches`, {
			body: JSON.stringify({
				event_type: 'deploy_to_cf_workers',
			}),
			method: 'POST',
			headers: {
				'Authorization': `token ${edgeState.accessToken}`,
				'User-Agent': 'Deploy-to-CF-Workers',
			},
		});
		set('deployed', true);
		send('COMPLETE');
	};

	const in_progress = (
		<div className="flex flex-col items-center min-h-screen">
			<a href="https://workers.cloudflare.com" rel="noopener noreferrer" target="_blank">
				<Logo />
			</a>
			<div className="flex">
				<div className="flex-1" />
				<div className="min-w-4xl max-w-4xl flex-2 min-h-full z-10 bg-white rounded-lg border border-gray-7 flex flex-col pt-6 pb-10 px-10">
					<div className="flex items-center">
						<h1 className="text-header flex-1" onClick={() => setDebug(!debug)}>
							Deploy to Workers{' '}
						</h1>
						{debug && (
							<p className="p-1 text-right bg-gray-200 font-mono">
								<span role="img" aria-label="Wrench">
									🔧
								</span>{' '}
								{current.value}
							</p>
						)}
					</div>
					<div className="py-4">{url ? <Embed url={url} /> : null}</div>
					<div className="pt-4 flex-1 max-w-2xl">
						<>
							<GithubAuth current={current} url={url} />
							<ConfigureAccount
								accountIdState={[accountId, setAccountIdWithCache]}
								apiTokenState={[apiToken, setApiToken]}
								complete={() => {
									if (fields.length > 0) {
										send('SUBMIT_CONFIGURE_PROJECT');
									} else {
										send('SUBMIT_DEPLOY');
									}
								}}
								current={current}
								apiTokenTemplate={apiTokenTemplate}
								apiTokenName={apiTokenName}
							/>
							{fields.length > 0 ? (
								<ConfigureProject
									current={current}
									stepNumber={3}
									fields={fields}
									submit={fields => {
										setFields(fields);
										send('CONFIGURE');
									}}
								/>
							) : (
								''
							)}
							<Deploy
								accountId={accountId}
								current={current}
								deploy={dispatchEvent}
								fork={event => fork({ accountId, apiToken, event })}
								forkedRepo={forkedRepo}
								send={send}
								stepNumber={fields.length > 0 ? 4 : 3}
							/>
						</>
					</div>
				</div>
				<Sidebar />
			</div>
		</div>
	);

	switch (current.value) {
		case 'missing_url':
			return <MissingUrl />;
		case 'completed':
			return <Completed accountId={accountId} forkedRepo={forkedRepo} url={url} />;
		default:
			return in_progress;
	}
};

export default App;
