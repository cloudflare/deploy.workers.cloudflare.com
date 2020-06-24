import React, { useContext, useEffect, useState } from "react";
import "./tailwind.css";
import "./main.css";

import { Machine } from "xstate";
import { useMachine } from "@xstate/react";

import { EdgeStateContext } from "./edge_state";
import Embed from "./embed";

const TEMPLATES = [
  "https://github.com/bytesizedxyz/cloudflare-worker-cra",
  "https://github.com/cherry/placeholders.dev/",
  "https://github.com/adamschwartz/web.scraper.workers.dev",
  "https://github.com/signalnerve/workers-graphql-server",
  "https://github.com/wilsonzlin/edgesearch",
  "https://github.com/signalnerve/cloudflare-workers-todos",
  "https://github.com/twoflags-io/twoflags-api",
  "https://github.com/signalnerve/repo-hunt",
];

export const appMachine = Machine({
  id: "app",
  initial: "initial",
  states: {
    initial: {
      on: {
        NO_AUTH: "login",
        AUTH: "templates",
        URL: "configuring",
      },
    },
    login: {},
    templates: {},
    configuring: {
      on: { SUBMIT: "deploying_setup" },
    },
    deploying_setup: {
      on: { ERROR: "error_forking", SETUP: "deploying" },
    },
    deploying: {
      on: { ERROR: "error_forking", COMPLETE: "completed" },
    },
    completed: {
      type: "final",
    },
    error_forking: {},
    error_starting_deploy: {},
  },
});

const GithubAuth = ({ current }) => (
  <div className="py-2">
    <div
      className={[
        `flex items-center text-lg leading-6 font-medium`,
        current.matches("login") ? "text-black" : "text-gray-600",
      ].join(" ")}
    >
      {current.matches("login") ? (
        <>
          <svg fill="currentColor" viewBox="0 0 20 20" class="w-8 h-8 mr-2">
            <path
              fill-rule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clip-rule="evenodd"
            ></path>
          </svg>
          <span>Authenticate with GitHub</span>
        </>
      ) : (
        <>
          <svg fill="currentColor" viewBox="0 0 20 20" class="w-8 h-8 mr-2">
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            ></path>
          </svg>
          <span>Successfully authenticated with GitHub</span>
        </>
      )}
    </div>
    {current.matches("login") && (
      <div className="mt-4">
        <a
          className="inline-flex items-center px-6 py-3 border border-transparent text-base leading-6 font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:border-gray-900 focus:shadow-outline-gray active:bg-gray-900 transition ease-in-out duration-150"
          href="/login"
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
          Login to GitHub
        </a>
      </div>
    )}
  </div>
);

const Fork = ({ current, submit }) => {
  const [accountId, setAccountId] = useState(null);
  const [apiToken, setApiToken] = useState(null);

  return (
    <div className="py-2 text-lg leading-6 font-medium">
      <div
        className={[
          `flex items-center`,
          current.matches("configuring") ? "text-black" : "text-gray-600",
        ].join(" ")}
      >
        {(current.matches("initial") ||
          current.matches("login") ||
          current.matches("configuring")) && (
          <>
            <svg fill="currentColor" viewBox="0 0 20 20" class="w-8 h-8 mr-2">
              <path
                fill-rule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clip-rule="evenodd"
              ></path>
            </svg>
            <span>Configure your application</span>
          </>
        )}
        {(current.matches("deploying") ||
          current.matches("deploying_setup") ||
          current.matches("completed")) && (
          <>
            <svg fill="currentColor" viewBox="0 0 20 20" class="w-8 h-8 mr-2">
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              ></path>
            </svg>
            <span>Forked and configured application</span>
          </>
        )}
      </div>
      {current.matches("configuring") ? (
        <form
          className="py-6"
          onSubmit={(event) => submit({ accountId, apiToken, event })}
        >
          <div>
            <label
              for="api_token"
              class="block text-sm font-medium leading-5 text-gray-700"
            >
              Cloudflare API Token
            </label>
            <div class="mt-1 relative rounded-md shadow-sm">
              <input
                id="api_token"
                class="form-input block w-full sm:text-sm sm:leading-5"
                onChange={({ target: { value } }) => setApiToken(value)}
                placeholder="Cloudflare Workers API Token"
                required
                value={apiToken}
              />
            </div>
          </div>

          <div className="mt-4">
            <label
              for="account_id"
              class="block text-sm font-medium leading-5 text-gray-700"
            >
              Cloudflare Account ID
            </label>
            <div class="mt-1 relative rounded-md shadow-sm">
              <input
                id="account_id"
                class="form-input block w-full sm:text-sm sm:leading-5"
                onChange={({ target: { value } }) => setAccountId(value)}
                placeholder="Cloudflare Workers Account ID"
                required
                value={accountId}
              />
            </div>
          </div>

          <p class="mt-2 text-sm text-indigo-500">
            <a href="https://developers.cloudflare.com/workers/quickstart#configure">
              Learn about finding your Cloudflare Workers Account ID and API
              Token →
            </a>
          </p>

          <div class="mt-6">
            <span class="block w-full rounded-md shadow-sm">
              <button
                type="submit"
                class="w-full flex items-center justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo active:bg-indigo-700 transition duration-150 ease-in-out"
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
                Fork repository
              </button>
            </span>
          </div>
        </form>
      ) : (
        <div></div>
      )}
    </div>
  );
};

const Deploy = ({ current, deploy, forkedRepo, send }) => (
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
          <span>Application deployed</span>
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
          ) : (
            <div className="mt-4 text-sm">
              <p>GitHub Actions enabled on this repository.</p>
            </div>
          )}
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

const Templates = ({ current }) =>
  current.matches("templates") ? (
    <div className="py-2 text-lg leading-6 font-medium">
      <div className="flex items-center text-black">
        <>
          <svg
            fill="currentColor"
            className="w-8 h-8 mr-2"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path>
          </svg>
          <span>Find a project to deploy to Cloudflare Workers</span>
        </>
      </div>

      <div className="py-8 grid grid-cols-2 gap-8">
        {TEMPLATES.map((template) => (
          <Embed
            key={template}
            linkUrl={`${window.location}?url=${template}`}
            url={template}
          />
        ))}
      </div>
    </div>
  ) : null;

const App = () => {
  const [current, send] = useMachine(appMachine);
  const [url, setUrl] = useState(null);
  const [forkedRepo, setForkedRepo] = useState(null);
  const [edgeState] = useContext(EdgeStateContext);
  const [debug, setDebug] = useState(false);

  useEffect(() => {
    const windowUrl = new URL(window.location);
    const url = windowUrl.searchParams.get("url");
    if (url) setUrl(url);

    if (edgeState && edgeState.accessToken) {
      send(url ? "URL" : "AUTH");
    } else {
      send("NO_AUTH");
    }
  }, []);

  const fork = async ({ accountId, apiToken, event }) => {
    const regex = /github.com\/(?<owner>\w*)\/(?<repo>.*)/;
    const repoUrl = url && url.match(regex);
    event.preventDefault();

    // should move into loading here
    const resp = await fetch(
      `https://api.github.com/repos/${repoUrl.groups.owner}/${repoUrl.groups.repo}/forks`,
      {
        method: "POST",
        headers: {
          Authorization: `token ${edgeState.accessToken}`,
          "User-Agent": "Deploy-to-CF-Workers",
        },
      }
    );
    const repo = await resp.json();
    setForkedRepo(repo.full_name);

    await fetch(`/secret`, {
      body: JSON.stringify({
        repo: repo.full_name,
        secret_key: "CF_ACCOUNT_ID",
        secret_value: accountId,
      }),
      method: "POST",
      headers: {
        Authorization: `token ${edgeState.accessToken}`,
        "User-Agent": "Deploy-to-CF-Workers",
      },
    });

    await fetch(`/secret`, {
      body: JSON.stringify({
        repo: repo.full_name,
        secret_key: "CF_API_TOKEN",
        secret_value: apiToken,
      }),
      method: "POST",
      headers: {
        Authorization: `token ${edgeState.accessToken}`,
        "User-Agent": "Deploy-to-CF-Workers",
      },
    });
    send("SUBMIT");

    return false;
  };

  const dispatchEvent = async () => {
    await fetch(`https://api.github.com/repos/${forkedRepo}/dispatches`, {
      body: JSON.stringify({
        event_type: "deploy_to_cf_workers",
      }),
      method: "POST",
      headers: {
        Authorization: `token ${edgeState.accessToken}`,
        "User-Agent": "Deploy-to-CF-Workers",
      },
    });
    send("COMPLETE");
  };

  // set secret
  // start github action

  return (
    <div className="bg-gray-100 min-h-screen flex items-center align-content">
      <div className="h-screen w-full md:w-2/3 mx-auto md:py-12 md:px-4 md:px-6 lg:px-8">
        <div className="h-full bg-white overflow-hidden shadow md:rounded-lg flex flex-col">
          <div className="border-b border-gray-200 px-4 py-5 sm:px-6 flex items-center">
            <h1
              className="text-2xl font-bold leading-7 sm:text-3xl sm:leading-9 sm:truncate flex-1"
              onClick={() => setDebug(!debug)}
            >
              Deploy to Cloudflare Workers{" "}
            </h1>
            {debug && (
              <p className="p-1 text-right bg-gray-200 font-mono">
                🔧 {current.value}
              </p>
            )}
          </div>
          {url ? (
            <div className="border-b border-gray-200 px-4 py-5 sm:p-6">
              <Embed url={url} />
            </div>
          ) : null}
          <div className="flex-1 px-4 py-5 sm:p-6">
            <>
              <Templates current={current} />
              <GithubAuth current={current} />
              <Fork current={current} submit={fork} />
              <Deploy
                current={current}
                deploy={dispatchEvent}
                forkedRepo={forkedRepo}
                send={send}
              />
            </>
          </div>
          <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
            <p class="text-center text-base leading-6 text-gray-400">
              <a
                className="text-indigo-600 hover:text-indigo-500"
                href="https://github.com/signalnerve/deploy-to-cf-workers/blob/master/DEVELOPERS.md"
              >
                Developer Guide
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
