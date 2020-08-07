import React, { useContext, useEffect, useState } from "react";
import { Machine, assign } from "xstate";
import { useMachine } from "@xstate/react";
import { clear, get, set, startOver } from "./cache";

import "./tailwind.css";
import "./main.css";

import { EdgeStateContext } from "./edge_state";
import {
  Completed,
  Deploy,
  Configure,
  Embed,
  GithubAuth,
  Info as InfoIcon,
  Logo,
  MissingUrl,
  Sidebar,
  Refresh,
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
          LS_FORKED: {
            target: "deploying_setup",
            actions: ["incrementStep", "incrementStep"],
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

const App = () => {
  const [current, send] = useMachine(appMachine);
  const [accountId, setAccountId] = useState(null);
  const [apiToken, setApiToken] = useState(null);
  const [isPaid, setIsPaid] = useState(null);
  const [url, setUrl] = useState(null);
  const [forkedRepo, setForkedRepo] = useState(null);
  const [edgeState] = useContext(EdgeStateContext);
  const [debug, setDebug] = useState(false);

  const setAccountIdWithCache = (accountId) => {
    setAccountId(accountId);
    set("accountId", accountId);
  };

  const setForkedRepoWithCache = (forkedRepo) => {
    setForkedRepo(forkedRepo);
    set("forkedRepo", forkedRepo);
  };

  useEffect(() => {
    if (document.cookie.includes("Authed-User")) {
      const edge_state = JSON.parse(
        document.querySelector("#edge_state").innerText
      );

      if (!Object.keys(edge_state.state).length) {
        window.location.reload();
      }
    }
  }, []);

  useEffect(() => {
    const windowUrl = new URL(window.location);
    const isPaidParam = windowUrl.searchParams.get("paid");
    const lsIsPaid = get("isPaid");
    if ((lsIsPaid || isPaidParam) === "true") {
      setIsPaid(true);
      set("isPaid", true);
    }
    const url = windowUrl.searchParams.get("url");
    const lsUrl = get("url");
    if (url) {
      setUrl(url);

      // New URL found that doesn't match LS,
      // need to clear all cache and start over
      if (lsUrl !== url) {
        clear();
        set("url", url);
      }
    } else {
      lsUrl ? setUrl(lsUrl) : send("NO_URL");
    }

    const lsForkedRepo = get("forkedRepo");
    if (lsForkedRepo) {
      setForkedRepo(lsForkedRepo);
      send("LS_FORKED");
    }

    send("LOGIN");

    const lsAccountId = get("accountId");
    if (lsAccountId) setAccountId(lsAccountId);

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
    setForkedRepoWithCache(repo.full_name);

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

    setAccountIdWithCache(accountId);

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
    set("deployed", true);
    send("COMPLETE");
  };

  const in_progress = (
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
          <div className="py-4">{url ? <Embed url={url} /> : null}</div>
          {isPaid ? (
            <div className="text-gray-1 mx-2 mb-4 flex items-center">
              <InfoIcon className="w-4 h-4" />
              <div className="ml-2">
                This project requires Workers KV, available only in the{" "}
                <a
                  className="font-semibold text-blue-4"
                  href="https://workers.cloudflare.com/#plans"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Workers Bundled Plan
                </a>
                .
              </div>
            </div>
          ) : null}
          <div className="pt-4 flex-1 max-w-2xl">
            <>
              <GithubAuth current={current} />
              <Configure
                accountIdState={[accountId, setAccountIdWithCache]}
                apiTokenState={[apiToken, setApiToken]}
                complete={() => send("SUBMIT")}
                current={current}
                isPaid={isPaid}
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
        <Sidebar />
      </div>
      <div className="min-w-3xl mt-2 max-w-3xl w-full flex">
        <div className="flex-1 text-left">
          <button
            className="font-semibold text-blue-4 text-sm flex items-center"
            onClick={startOver}
          >
            <Refresh />
            <span className="ml-2">Start over</span>
          </button>
        </div>
        <div className="flex-1 text-right">
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
