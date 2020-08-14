import React from "react";
import { Logo, Templates, Sidebar } from "./index";

export default () => {
  return (
    <div className="flex flex-col items-center min-h-screen">
      <Logo />
      <div className="flex">
        <div className="flex-1" />
        <div className="min-w-4xl max-w-4xl flex-2 min-h-full z-10 bg-white rounded border flex flex-col pt-6 pb-10 px-10">
          <div className="px-6 pt-4 flex items-center">
            <h1 className="text-header">Deploy a new project to Workers</h1>
          </div>
          <div className="flex-1 px-6 pt-4 max-w-2xl">
            <p>
              Check out some of these great projects that are configured to
              quickly deploy to the Cloudflare Workers platform.
            </p>

            <p className="text-gray-1 text-sm mt-2 mb-6">
              Note: if you landed here from a "Deploy to Workers" button, the
              button may be configured incorrectly.
            </p>

            <div className="flex flex-col">
              <Templates />
            </div>

            
          </div>
        </div>
        <Sidebar />
      </div>
      <div className="min-w-3xl max-w-3xl w-full">
        <div className="flex-1 mt-2 text-right">
          <a
            className="font-semibold text-blue-4 mt-2 text-sm"
            href="https://docs.google.com/forms/d/e/1FAIpQLScD29hGSr_ArVWuOhn7izRMw9aXfoCbkeud3qGUlZdgw32tFQ/viewform"
            rel="noopener noreferrer"
            target="_blank"
          >
            Feedback survey
          </a>
        </div>
      </div>
    </div>
  );
};
