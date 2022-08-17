import React from 'react';

import Section from './section';

export default ({ current }) => (
	<Section
		currentState={current}
		state="login"
		stepNumber={1}
		title="Authorize GitHub with Workers"
		active={
			<>
				<p className="mt-2 max-w-lg text-gray-1">
					Allow Workers to fork the project from Github and deploy it using GitHub Actions.
				</p>
				<div className="mt-6 mb-8">
					<a
						className="inline-flex items-center px-6 py-3 border border-transparent text-base leading-6 font-medium rounded-md text-white bg-blue-4 hover:bg-blue-4 focus:outline-none focus:border-blue-4 focus:shadow-outline-gray active:bg-blue-4 transition ease-in-out duration-150"
						href="/login"
					>
						Authorize Workers
					</a>
				</div>
			</>
		}
		inactive={<></>}
		completed={<p>Workers authorized on GitHub</p>}
	/>
);
