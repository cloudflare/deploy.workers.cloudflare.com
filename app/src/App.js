import React, { useContext, useEffect, useState } from "react";
import { Machine, assign } from "xstate";
import { useMachine } from "@xstate/react";

import "./tailwind.css";
import "./main.css";

import { EdgeStateContext } from "./edge_state";
import {
  Completed,
  Deploy,
  ChevronLeft,
  ChevronRight,
  Configure,
  Embed,
  GithubAuth,
  Logo,
  MissingUrl,
} from "./components";

export const appMachine = Machine(
  {
    id: "app",
    initial: "initial",
    context: { stepNumber: 1 },
    states: {
      initial: {
        on: {
          LOGIN: {
            target: "login",
          },
          NO_URL: "missing_url",
          URL: {
            target: "configuring",
            actions: "incrementStep",
          },
        },
      },
      missing_url: {
        on: {
          URL: {
            target: "configuring",
            actions: "incrementStep",
          },
        },
      },
      login: {
        on: {
          AUTH: {
            target: "configuring",
            actions: "incrementStep",
          },
        },
      },
      configuring: {
        on: {
          SUBMIT: {
            target: "deploying_setup",
            actions: "incrementStep",
          },
        },
      },
      deploying_setup: {
        on: { ERROR: "error_forking", COMPLETE: "completed" },
      },
      completed: {
        type: "final",
      },
      error_forking: {},
      error_starting_deploy: {},
    },
  },
  {
    actions: {
      incrementStep: assign({
        stepNumber: (context) => context.stepNumber + 1,
      }),
    },
  }
);

const Info = () => {
  const [expanded, setExpanded] = useState(false);
  const classes =
    "-ml-2 flex-1 w-full bg-orange-9 border-4 border-orange-5 rounded-md flex z-0 text-gray-1 ";
  return (
    <div className={[classes, expanded ? "p-6" : "p-2"].join("")}>
      {expanded ? (
        <div>
          <div className="float-right" onClick={() => setExpanded(false)}>
            <ChevronLeft />
          </div>

          <h2 className="mb-4 font-semibold text-2xl">Why Workers?</h2>

          <h3 className="mb-2 font-semibold text-lg">Distributed network</h3>
          <p>
            Deploy serverless code to Cloudflare’s edge network across 200
            cities and 95 countries.
          </p>

          <h3 className="mt-6 font-semibold mb-2 text-lg">Fast start</h3>
          <p>Cold start under 5ms. 50 times faster than other platforms.</p>

          <h3 className="mt-6 font-semibold mb-2 text-lg">Free Tier</h3>
          <p>
            First 100,000 requests each day are free and paid plans start at
            just $5 per 10 million requests.
          </p>

          <div className="mt-6">
            <a
              className="font-semibold text-blue-4"
              href="https://workers.cloudflare.com"
              rel="noopener noreferrer"
              target="_blank"
            >
              Learn more about Cloudflare Workers
            </a>
          </div>
        </div>
      ) : (
        <div className="py-4 text-gray-3">
          <div onClick={() => setExpanded(true)}>
            <ChevronRight />
          </div>
          <span className="mt-4 rotate">Why Workers</span>
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [current, send] = useMachine(appMachine);
  const [accountId, setAccountId] = useState(null);
  const [apiToken, setApiToken] = useState(null);
  const [url, setUrl] = useState(null);
  const [forkedRepo, setForkedRepo] = useState(null);
  const [edgeState] = useContext(EdgeStateContext);
  const [debug, setDebug] = useState(false);

  useEffect(() => {
    const windowUrl = new URL(window.location);
    const url = windowUrl.searchParams.get("url");
    if (url) {
      setUrl(url);
    } else {
      send("NO_URL");
    }
    send("LOGIN");

    if (edgeState && edgeState.accessToken) {
      send("AUTH");
    } else {
      send("NO_AUTH");
    }
  }, [send, edgeState]);

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

    setAccountId(accountId);

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
    localStorage.removeItem("url");
    send("COMPLETE");
  };

  // set secret
  // start github action

  const in_progress = (
    <div className="flex flex-col items-center min-h-screen">
      <Logo />
      <div className="flex">
        <div className="flex-1" />
        <div className="min-w-4xl max-w-4xl flex-2 min-h-full z-10 bg-white rounded border flex flex-col pt-6 pb-10 px-10">
          <div className="flex items-center">
            <h1 className="text-header flex-1" onClick={() => setDebug(!debug)}>
              Deploy to Workers{" "}
            </h1>
            {debug && (
              <p className="p-1 text-right bg-gray-200 font-mono">
                <span role="img" aria-label="Wrench">
                  🔧
                </span>{" "}
                {current.value}
              </p>
            )}
          </div>
          <div className="pt-6 pb-10">{url ? <Embed url={url} /> : null}</div>
          <div className="flex-1 max-w-2xl">
            <>
              <GithubAuth current={current} />
              <Configure
                accountIdState={[accountId, setAccountId]}
                apiTokenState={[apiToken, setApiToken]}
                complete={() => send("SUBMIT")}
                current={current}
              />
              <Deploy
                accountId={accountId}
                current={current}
                deploy={dispatchEvent}
                fork={(event) => fork({ accountId, apiToken, event })}
                forkedRepo={forkedRepo}
                send={send}
              />
            </>
          </div>
        </div>
        <Info />
      </div>
      <div className="min-w-3xl max-w-3xl w-full">
        <div className="px-10 flex-1 mt-2 text-right">
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

  switch (current.value) {
    case "missing_url":
      return <MissingUrl />;
    case "completed":
      return (
        <Completed accountId={accountId} forkedRepo={forkedRepo} url={url} />
      );
    default:
      return in_progress;
  }
};

export default App;
