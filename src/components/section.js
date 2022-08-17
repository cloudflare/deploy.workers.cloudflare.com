import React from 'react';

const MAX_STEP = 3;

export default ({ active, completed, currentState, inactive, stepNumber, state, title }) => {
	if (!currentState) return null;

	const isActive =
		typeof state === 'object' ? state.includes(currentState.value) : currentState.value === state;
	const isComplete = currentState.context.stepNumber > stepNumber;
	const isLast = stepNumber === MAX_STEP;

	const baseContainerClasses =
		'font-bold -mt-1 -ml-4 mr-6 w-8 h-8 flex items-center justify-center font-mono font-semibold rounded-full';

	const fillClasses = `bg-blue-4 text-white`;
	const unreadClasses = `text-white bg-gray-4`;

	return (
		<>
			<div className={`border-l flex -mt-1 ml-4 ${isActive || isLast ? '' : 'pb-8'}`}>
				<div
					className={[
						baseContainerClasses,
						isComplete ? fillClasses : isActive ? fillClasses : unreadClasses,
					].join(' ')}
				>
					{isComplete ? (
						<svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
								clip-rule="evenodd"
							></path>
						</svg>
					) : (
						stepNumber
					)}
				</div>
				<div className="flex-1">
					<div
						className={`flex items-center font-semibold ${
							isActive || isComplete ? 'text-gray-1' : 'text-gray-3'
						}`}
					>
						<span>{title}</span>
					</div>
					{isComplete ? (
						<div className="mt-2 text-gray-1">{completed}</div>
					) : isActive ? (
						active
					) : (
						inactive
					)}
				</div>
			</div>
		</>
	);
};
