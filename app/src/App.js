import React, { useContext, useEffect, useState } from "react";
import { Machine } from "xstate";
import { useMachine } from "@xstate/react";

import "./tailwind.css";
import "./main.css";

import { EdgeStateContext } from "./edge_state";
import { Deploy, Embed, Fork, GithubAuth, Templates } from "./components";

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
    let urlToMatch = url;
    if (urlToMatch.endsWith("/")) urlToMatch = urlToMatch.slice(0, -1);

    const repoUrl = urlToMatch && urlToMatch.match(regex);
    // Remove trailing slash if it exists
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
    <div className="bg-gray-100 min-h-screen flex align-content">
      <div className="w-full md:w-2/3 mx-auto md:py-12 md:px-4 md:px-6 lg:px-8">
        <div className="h-full bg-white shadow md:rounded-lg flex flex-col">
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
