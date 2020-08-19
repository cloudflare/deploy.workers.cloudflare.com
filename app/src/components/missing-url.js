import React from "react";
import { Logo, Templates, Sidebar } from "./index";

export default () => {
  return (
    <div className="flex flex-col items-center min-h-screen">
      <a
        href="https://workers.cloudflare.com"
        rel="noopener noreferrer"
        target="_blank"
      >
        <Logo />
      </a>
      <div className="flex">
        <div className="flex-1" />
        <div className="min-w-4xl max-w-4xl flex-2 min-h-full z-10 bg-white rounded border flex flex-col pt-6 pb-10 px-10">
          <div className="px-6 pt-4 flex items-center">
            <h1 className="text-header">Welcome to Deploy to Workers</h1>
          </div>
          <div className="flex-1 px-6 pt-4 max-w-2xl">
            <p className="mb-6">
              Try quickly deploying one of these great projects to the Cloudflare Workers platform.
            </p>

            <div className="flex flex-col">
              <Templates />
            </div>

            
          </div>
        </div>
        <Sidebar />
      </div>
      <div class="min-w-3xl mt-2 max-w-3xl w-full flex text-left">
          <a
            className="font-semibold text-blue-4 text-sm"
            href="https://docs.google.com/forms/d/e/1FAIpQLScD29hGSr_ArVWuOhn7izRMw9aXfoCbkeud3qGUlZdgw32tFQ/viewform"
            rel="noopener noreferrer"
            target="_blank"
          >
            Feedback survey
          </a>
      </div>
    </div>
  );
};
