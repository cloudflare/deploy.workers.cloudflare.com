import React from 'react';
import Embed from './embed';

const TEMPLATES = [
	'https://github.com/signalnerve/workers-graphql-server',
	'https://github.com/adamschwartz/web.scraper.workers.dev',
	'https://github.com/Cherry/placeholders.dev',
	'https://github.com/GregBrimble/cf-workers-typescript-template',
	'https://github.com/eidam/cf-workers-status-page',
];

export default () => (
	<div className="grid grid-cols-1 gap-6">
		{TEMPLATES.map(template => (
			<Embed key={template} url={template} />
		))}
	</div>
);
