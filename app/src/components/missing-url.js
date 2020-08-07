import React from "react";
import { Logo, Templates } from "./index";

export default () => {
  return (
    <div className="flex flex-col items-center">
      <Logo />
      <div className="max-w-4xl md:w-2/3 mt-8 mx-auto md:pb-12 md:px-4 md:px-6 lg:px-8">
        <div className="h-full bg-white rounded border flex flex-col">
          <div className="px-6 pt-4 flex items-center">
            <h1 className="text-header">Deploy a new project to Workers</h1>
          </div>
          <div className="flex-1 px-6 pt-4">
            <p className="">
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

            <div className="text-center py-6">
              <a
                className="font-semibold text-blue-4"
                rel="noopener noreferrer"
                target="_blank"
                href="https://workers.cloudflare.com/built-with"
              >
                View more projects
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
