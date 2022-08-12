import React from "react";

import { ExternalLink, Logo, WorkflowStatus } from "./index";
import { startOver } from "../cache";

const simpleRepoName = (urlString) => {
  if (urlString && urlString.length) {
    const urlParts = urlString.split("/");
    return urlParts[urlParts.length - 1];
  } else {
    return "";
  }
};

export default ({ accountId, forkedRepo, url }) => (
  <div className="flex flex-col items-center">
    <a
      href="https://workers.cloudflare.com"
      rel="noopener noreferrer"
      target="_blank"
    >
      <Logo />
    </a>
    <div className="max-w-4xl md:w-2/3 mt-8 mx-auto md:pb-12 md:px-4 md:px-6 lg:px-8">
      <div className="min-w-4xl max-w-4xl flex-2 min-h-full z-10 bg-white rounded-lg border border-gray-7 flex flex-col pt-6 pb-10 px-10">
        <div className="px-6 py-4 flex flex-wrap items-center">
          <WorkflowStatus repo={forkedRepo} />
        </div>
        <div className="flex-1 px-6 pb-4">
          <div className="flex items-center">
            <span className="text-gray-1 text-lg">
              Congratulations, <strong>{simpleRepoName(url)}</strong> is now
              deploying!
            </span>
          </div>
          <p className="text-gray-1 my-4">
            This may take a few minutes. Check your project repository, visit
            your new Worker, or learn more about Workers below.
          </p>
          <img
            className="object-cover w-full my-8"
            alt="Completed"
            lazy="loading"
            src="/success-graphic.svg"
          />
          <div className="w-full lg:grid grid-cols-3 gap-4">
            <div className="flex flex-col p-4 border rounded h-48 lg:h-64 mb-4">
              <div className="flex-1">
                <h2 className="text-gray-1 text-lg mb-4">GitHub Repository</h2>
                <p className="text-gray-3 text-sm">
                  Clone your project, complete additional configurations, and
                  start developing.
                </p>
              </div>
              <a
                className="self-center bg-blue-4 py-2 px-4 rounded-md text-white flex items-center"
                href={`https://github.com/${forkedRepo}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className="mr-2">GitHub repo</span>
                <ExternalLink fill="white" />
              </a>
            </div>
            <div className="flex flex-col p-4 border rounded h-48 lg:h-64 mb-4">
              <div className="flex-1">
                <h2 className="text-gray-1 text-lg mb-4">Your new Worker</h2>
                <p className="text-gray-3 text-sm">
                  Visit your Worker to monitor its status, configure additional
                  routes, and to see your deployment live.
                </p>
              </div>
              <a
                className="self-center text-blue-600 border border-blue-600 px-4 py-2 rounded-md flex items-center"
                href={`https://dash.cloudflare.com/${accountId}/workers`}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className="mr-2">Worker dash</span>
                <ExternalLink />
              </a>
            </div>
            <div className="flex flex-col p-4 border rounded h-48 lg:h-64">
              <div className="flex-1">
                <h2 className="text-gray-1 text-lg mb-4">
                  Developing with Workers
                </h2>
                <p className="text-gray-3 text-sm">
                  Now that you have your project, learn how to efficiently
                  develop and deploy with Workers.
                </p>
              </div>
              <a
                className="self-center text-blue-600 border border-blue-600 px-4 py-2 rounded-md flex items-center"
                href={`https://developers.cloudflare.com/workers/quickstart`}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className="mr-2">Workers docs</span>
                <ExternalLink />
              </a>
            </div>
          </div>
          <div className=" flex w-full justify-center">
            <button
              className="flex font-semibold text-blue-4 text-sm"
              onClick={startOver}
            >
              <span className="ml-2">See other deployable projects</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);
