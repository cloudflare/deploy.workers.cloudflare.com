import React from "react";

import { ExternalLink, Logo, WorkflowStatus } from "./index";

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
      <div className="h-full bg-white rounded border flex flex-col">
        <div className="px-6 py-4 flex items-center">
          <h1 className="text-header">
            Celebrate! You are now deploying to Workers
          </h1>
        </div>
        <div className="flex-1 px-6 py-4">
          <img
            alt="Completed"
            className="bg-gray-200 object-cover w-full h-64 mb-4"
            lazy="loading"
            src="https://images.unsplash.com/photo-1533243216203-8c08406d4583?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1200&q=80"
          />
          <div className="flex items-center mt-8">
            <span className="text-gray-1 text-lg mr-4">
              Congratulations, {simpleRepoName(url)} is deploying!
            </span>
            <WorkflowStatus repo={forkedRepo} />
          </div>
          <p className="text-gray-1 mt-2 mb-6">
            This could take a little while as Github Actions builds the project.
            Checkout some of the next steps we have below.
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col p-4 border rounded h-64 mb-4">
              <div className="flex-1">
                <h2 className="text-gray-1 text-lg mb-4">Go to Repo</h2>
                <p className="text-gray-3 text-sm">
                  Additional configuration may be required for the project. You
                  may want to consult the README in your repo.
                </p>
              </div>
              <a
                className="self-center bg-blue-4 py-2 px-4 rounded-md text-white flex items-center"
                href={`https://github.com/${forkedRepo}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className="mr-2">GitHub repository</span>
                <ExternalLink fill="white" />
              </a>
            </div>
            <div className="flex flex-col p-4 border rounded h-64 mb-4">
              <div className="flex-1">
                <h2 className="text-gray-1 text-lg mb-4">Go to Worker</h2>
                <p className="text-gray-3 text-sm">
                  Grab the URL for the deployed project and see additional
                  monitoring information for your Worker.
                </p>
              </div>
              <a
                className="self-center text-blue-600 border border-blue-600 px-4 py-2 rounded-md flex items-center"
                href={`https://dash.cloudflare.com/${accountId}/workers`}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className="mr-2">Worker dashboard</span>
                <ExternalLink />
              </a>
            </div>
            <div className="flex flex-col p-4 border rounded h-64">
              <div className="flex-1">
                <h2 className="text-gray-1 text-lg mb-4">Begin Deploying</h2>
                <p className="text-gray-3 text-sm">
                  Configure a local dev environment and learn more about Workers
                  and how to develop with serverless.
                </p>
              </div>
              <a
                className="self-center text-blue-600 border border-blue-600 px-4 py-2 rounded-md flex items-center"
                href={`https://developers.cloudflare.com/workers/quickstart`}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className="mr-2">Quick start</span>
                <ExternalLink />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 border border-blue-6 bg-blue-7 text-blue-1 shadow px-6 py-4 rounded">
        We hope this process went smoothly. If you have any feedback, positive
        or negative, we would love to hear it via this{" "}
        <a
          className="font-semibold underline"
          href="https://docs.google.com/forms/d/e/1FAIpQLScD29hGSr_ArVWuOhn7izRMw9aXfoCbkeud3qGUlZdgw32tFQ/viewform"
          rel="noopener noreferrer"
          target="_blank"
        >
          short feedback survey
        </a>
        .
      </div>
    </div>
  </div>
);
