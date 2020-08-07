import React, { useEffect } from "react";
import { Machine } from "xstate";
import { useMachine } from "@xstate/react";

import {
  AlertPanel,
  ExternalLink,
  GitHubWorkflow,
  Section,
  Subsection,
} from "./index";

import { get, set } from "../cache";

const machine = Machine({
  id: "deploy",
  initial: "initial",
  states: {
    initial: {
      on: {
        FORK: "forked",
        ERROR: "error",
      },
    },
    error: {
      on: {
        FORK: "forked",
      },
    },
    forked: {
      on: {
        ENABLE_ACTIONS: "confirm_actions_enabled",
      },
    },
    confirm_actions_enabled: {
      on: {
        CONFIRM: "ready_to_deploy",
      },
    },
    ready_to_deploy: {
      on: {
        DEPLOY: "deploying",
      },
    },
    deploying: {
      type: "final",
    },
  },
});

export default ({ accountId, current, deploy, fork, forkedRepo, send }) => {
  const [subcurrent, subsend] = useMachine(machine);

  const submit = (event) => {
    try {
      fork(event);
      subsend("FORK");
      event.preventDefault();
    } catch (err) {
      console.error(err);
      subsend("ERROR");
    }
  };

  const startDeploy = (event) => {
    deploy();
    subsend("DEPLOY");
    send("COMPLETE");
    event.preventDefault();
  };

  const enable = () => {
    subsend("ENABLE_ACTIONS");
    set("actionsEnabled", true);
  };

  useEffect(() => {
    if (forkedRepo) subsend("FORK");
    const enabled = get("actionsEnabled");
    if (enabled) subsend("ENABLE_ACTIONS");
    const deployed = get("deployed");
    if (deployed) send("COMPLETE");
  });

  return (
    <Section
      isFinal
      title="Deploy with GitHub Actions"
      currentState={current}
      state={["deploying", "deploying_setup"]}
      stepNumber={3}
      active={
        <>
          <Subsection
            active={["initial", "error"].includes(subcurrent.value)}
            past={subcurrent.value !== "initial"}
            title="Fork repository"
          >
            <div>
              <p>
                The project repository will be forked so that you can configure
                a build process with Github Actions and deploy to Workers.
              </p>

              <button
                class="mt-2 mb-4 flex items-center justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-4 hover:bg-blue-4 focus:outline-none focus:border-blue-4 focus:shadow-outline-indigo active:bg-blue-4 transition duration-150 ease-in-out"
                onClick={submit}
              >
                Fork the repository
              </button>

              {subcurrent.value === "error" && (
                <AlertPanel>
                  <>
                    Something went wrong while forking the repository. Please
                    try again.
                  </>
                </AlertPanel>
              )}
            </div>
          </Subsection>
          <Subsection
            active={["forked", "confirm_actions_enabled"].includes(
              subcurrent.value
            )}
            past={["ready_to_deploy", "deploying"].includes(subcurrent.value)}
            title="Enable GitHub Actions"
          >
            <div>
              {(current.matches("deploying") ||
                current.matches("deploying_setup")) && (
                <>
                  <p>
                    Navigate to your new repository’s Actions page and enable
                    Github Actions
                  </p>
                  <div className="my-6">
                    <a
                      className="text-blue-4 text-sm font-semibold"
                      href={`https://github.com/${forkedRepo}/actions`}
                      onClick={enable}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <div className="flex items-center">
                        <span className="mr-2">Repository - Actions</span>
                        <ExternalLink />
                      </div>
                      <div
                        className={`mt-2
                  ${
                    subcurrent.value === "confirm_actions_enabled"
                      ? "opacity-50"
                      : ""
                  } `}
                      >
                        <GitHubWorkflow />
                      </div>
                    </a>
                  </div>
                  <button
                    className={[
                      `py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-4 hover:bg-blue-4 focus:outline-none focus:border-blue-4 focus:shadow-outline-indigo active:bg-blue-4 transition duration-150 ease-in-out`,
                      subcurrent.value === "confirm_actions_enabled"
                        ? ""
                        : "opacity-50 cursor-not-allowed",
                    ].join(" ")}
                    disabled={subcurrent.value !== "confirm_actions_enabled"}
                    onClick={() => subsend("CONFIRM")}
                  >
                    Workflows are enabled
                  </button>
                </>
              )}
              {current.matches("completed") && (
                <div className="mt-4">
                  <p>
                    You can go to the Workers dashboard to see information about
                    your deployed application, or go to the GitHub repository to
                    learn more about the project.
                  </p>
                  <div className="my-4">
                    <a
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base leading-6 font-medium rounded-md text-white bg-gray-800 hover:bg-indigo-700 focus:outline-none focus:border-gray-900 focus:shadow-outline-indigo active:bg-gray-900 transition ease-in-out duration-150"
                      href={`https://dash.cloudflare.com/${accountId}/workers/overview`}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <svg
                        class="w-6 mr-4"
                        fill="white"
                        aria-label="Workers"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 16 16"
                      >
                        <path d="M3.775 2.322a1.617 1.617 0 0 1 .231-.29l1.439 2.52-1.562 2.731a1.463 1.463 0 0 0 0 1.434l1.562 2.731-1.439 2.52a1.415 1.415 0 0 1-.231-.295L.828 8.7a1.361 1.361 0 0 1 0-1.395zM10.95 14.385H8.883l3.237-5.668a1.463 1.463 0 0 0 0-1.434L8.873 1.615h2.077a1.473 1.473 0 0 1 1.272.707L15.17 7.3a1.343 1.343 0 0 1 0 1.395l-2.947 4.98a1.473 1.473 0 0 1-1.277.707z"></path>
                        <path d="M5.052 14.385h-.1q1.651-2.907 3.31-5.81a1.145 1.145 0 0 0 0-1.149l-3.32-5.81h2.77l3.527 6.174a.431.431 0 0 1 0 .422L7.7 14.385z"></path>
                      </svg>
                      View the Workers dashboard
                    </a>
                  </div>
                  <div>
                    <a
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base leading-6 font-medium rounded-md text-white bg-indigo-800 hover:bg-indigo-700 focus:outline-none focus:border-indigo-900 focus:shadow-outline-indigo active:bg-indigo-900 transition ease-in-out duration-150"
                      href={`https://github.com/${forkedRepo}`}
                      rel="noopener noreferrer"
                      target="_blank"
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
                    <p className="bg-yellow-100 text-yellow-900 p-4 my-4">
                      There may be additional steps you need to configure before
                      the application is completely ready for deployment — check
                      out the project's README for more details!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Subsection>
          <Subsection
            active={["ready_to_deploy", "deploying"].includes(subcurrent.value)}
            title="Deploy to Workers"
          >
            <div>
              <p>
                This will initiate a deployment and your application will be
                running on Workers shortly.
              </p>
              <p className="text-gray-3 mt-2 text-sm">
                Note: Deploying a Worker with the same wrangler.toml name can
                overwrite an existing Worker.
              </p>
              <div class="my-4">
                <button
                  class="flex items-center justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-4 hover:bg-blue-4 focus:outline-none focus:border-blue-4 focus:shadow-outline-indigo active:bg-blue-4 transition duration-150 ease-in-out"
                  onClick={startDeploy}
                >
                  Deploy
                </button>
              </div>
            </div>
          </Subsection>
        </>
      }
    />
  );
};
