import React, { useContext, useEffect, useState } from "react";
import { Machine, assign } from "xstate";
import { useMachine } from "@xstate/react";
import { clear, get, set } from "./cache";

import "./tailwind.css";
import "./main.css";

import { EdgeStateContext } from "./edge_state";
import {
  Completed,
  Deploy,
  Configure,
  Embed,
  GithubAuth,
  Logo,
  MissingUrl,
  Sidebar,
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

  // Check for edge case (pun intented) where the Workers fn has successfully
  // validated the user's auth state, even if the KV store hasn't updated to
  // persist the auth data. If that case is found, refresh the page and we
  // should have a persisted auth value
  useEffect(() => {
    const el = document.querySelector("#edge_state")
    if (el && el.innerText) {
      const edgeStateInnerText = el.innerText
      const _edgeState = JSON.parse(edgeStateInnerText);

      if (_edgeState.state.authed && !_edgeState.state.accessToken) {
        window.location.reload();
      }
    }
  }, []);

  useEffect(() => {
    const windowUrl = new URL(window.location);
    const url = windowUrl.searchParams.get("url");

    // Validate URL query parameter actually legitimate to prevent XSS
    try {
      const parsedURL = new URL(url);
      if (parsedURL.protocol !== "http:" && parsedURL.protocol !== "https:") {
        send("NO_URL");
      }
    } catch (_) {
      send("NO_URL");
    }

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
        <div className="min-w-4xl max-w-4xl flex-2 min-h-full z-10 bg-white rounded-lg border border-gray-7 flex flex-col pt-6 pb-10 px-10">
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
          <div className="pt-4 flex-1 max-w-2xl">
            <>
              <GithubAuth current={current} />
              <Configure
                accountIdState={[accountId, setAccountIdWithCache]}
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
        <Sidebar />
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
