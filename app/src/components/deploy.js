import React from "react";
import WorkflowStatus from "./workflow-status";

export default ({ current, deploy, forkedRepo, send }) => (
  <div className="py-2">
    <div
      className={[
        `flex items-center text-lg leading-6 font-medium`,
        current.matches("deploying") || current.matches("deploying_setup")
          ? "text-black"
          : "text-gray-600",
      ].join(" ")}
    >
      {current.matches("completed") ? (
        <>
          <svg fill="currentColor" viewBox="0 0 20 20" class="w-8 h-8 mr-2">
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            ></path>
          </svg>
          <span>Deployment configured</span>
        </>
      ) : (
        <>
          <svg fill="currentColor" viewBox="0 0 20 20" class="w-8 h-8 mr-2">
            <path
              fill-rule="evenodd"
              d="M2 10a4 4 0 004 4h3v3a1 1 0 102 0v-3h3a4 4 0 000-8 4 4 0 00-8 0 4 4 0 00-4 4zm9 4H9V9.414l-1.293 1.293a1 1 0 01-1.414-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 9.414V14z"
              clip-rule="evenodd"
            ></path>
          </svg>
          <span>Deploy with GitHub Actions</span>
        </>
      )}
    </div>
    <div className="mt-4">
      {(current.matches("deploying") || current.matches("deploying_setup")) && (
        <>
          {current.matches("deploying_setup") ? (
            <div className="mt-4 text-sm">
              <p>
                First, you'll need to go to your repository, and enable GitHub
                Actions.
              </p>
              <p className="mt-2">
                <a
                  className="text-indigo-500"
                  href={`https://github.com/${forkedRepo}/actions`}
                  onClick={() => send("SETUP")}
                  target="_blank"
                >
                  Enable GitHub Actions →
                </a>
              </p>
            </div>
          ) : null}
          <div class="mt-6">
            <span class="block w-full rounded-md shadow-sm">
              <button
                class={[
                  `w-full flex items-center justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo active:bg-indigo-700 transition duration-150 ease-in-out`,
                  current.matches("deploying_setup")
                    ? "opacity-50 cursor-not-allowed"
                    : "",
                ].join(" ")}
                disabled={current.matches("deploying_setup")}
                onClick={deploy}
              >
                <svg
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  class="w-6 h-6 mr-2"
                >
                  <path
                    fill-rule="evenodd"
                    d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                Deploy
              </button>
            </span>
          </div>
        </>
      )}
      {current.matches("completed") && (
        <div className="mt-4">
          <WorkflowStatus repo={forkedRepo} />
          <a
            className="inline-flex items-center px-6 py-3 border border-transparent text-base leading-6 font-medium rounded-md text-white bg-indigo-800 hover:bg-indigo-700 focus:outline-none focus:border-indigo-900 focus:shadow-outline-indigo active:bg-indigo-900 transition ease-in-out duration-150"
            href={`https://github.com/${forkedRepo}`}
          >
            <svg
              role="img"
              fill="white"
              className="w-6 mr-4"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>GitHub icon</title>
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            View your project on GitHub
          </a>
        </div>
      )}
    </div>
  </div>
);
