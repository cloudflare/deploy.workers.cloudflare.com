import React from 'react';
import { Alert } from './index';
export default ({ children }) => (
	<div className="mb-6 border border-red-3 bg-red-5 text-red-1 shadow px-6 py-4 rounded flex">
		<Alert className="w-8 h-8 mr-4" />
		<span>{children}</span>
	</div>
);
