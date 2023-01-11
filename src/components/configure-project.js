import { Section } from './index';
import React, { useState } from 'react';

export default ({ current, stepNumber, fields, submit }) => {
	const [state, setState] = useState(fields);

	const onSubmit = event => {
		event.preventDefault();
		submit(state);
	};

	return (
		<Section
			title="Configure Project"
			currentState={current}
			state={['configuring_project']}
			stepNumber={stepNumber}
			inactive={null}
			completed={
				<div>
					<p>Project has been configured.</p>
				</div>
			}
			active={
				<div className="mt-4">
					<form onSubmit={onSubmit}>
						{state.map(({ name, secretName, description, value }, idx) => (
							<div key={secretName}>
								<div className="mb-4">
									<p className="mb-2">{description}:</p>
								</div>
								<div className="mr-8">
									<label htmlFor="account_id" className="block font-medium leading-5 text-gray-1">
										{name}
									</label>
									<div className="mt-1 mb-6 relative">
										<input
											id="account_id"
											className="form-input block w-64 p-2 rounded-md border border-gray-7 sm:text-sm sm:leading-5"
											onChange={({ target: { value } }) => {
												setState(fields => {
													// Copy the Array so that
													// React can detect the change
													// based on ref equality
													const newFields = [...fields];
													newFields[idx].value = value;
													return newFields;
												});
											}}
											placeholder="Enter a value"
											required
											value={value}
										/>
									</div>
								</div>
							</div>
						))}

						<div className="mt-6 mb-4 flex items-center">
							<span className="block mr-4">
								<button
									type="submit"
									className={`flex items-center justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-4 hover:bg-blue-4 focus:outline-none focus:border-blue-4 focus:shadow-outline-indigo active:bg-blue-4 transition duration-150 ease-in-out`}
								>
									Configure
								</button>
							</span>
						</div>
					</form>
				</div>
			}
		/>
	);
};
