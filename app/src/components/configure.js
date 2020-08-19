import React from "react";
import { Machine } from "xstate";
import { useMachine } from "@xstate/react";

import Section from "./section";
import Subsection from "./subsection";

import {
  AccountId,
  AlertPanel,
  ApiToken,
  ExternalLink,
  Loading,
} from "./index";

const machine = Machine({
  id: "fork",
  initial: "initial",
  states: {
    initial: {
      on: {
        HAS_ACCOUNT: "form",
      },
    },
    form: {
      on: {
        VERIFYING: "verifying",
      },
    },
    verifying: {
      on: {
        VERIFIED: "verified",
        ERROR: "error",
      },
    },
    verified: {
      type: "final",
    },
    error: {
      on: {
        VERIFYING: "verifying",
      },
    },
  },
});

export default ({
  accountIdState: [accountId, setAccountId],
  apiTokenState: [apiToken, setApiToken],
  complete,
  current,
  isPaid,
}) => {
  const [subcurrent, send] = useMachine(machine);

  const submit = async (event) => {
    event.preventDefault();
    send("VERIFYING");

    try {
      const resp = await fetch(`/verify`, {
        method: "POST",
        body: JSON.stringify({
          accountId,
          apiToken,
        }),
      });

      if (resp.status !== 200) {
        throw new Error(await resp.text());
      }

      send("VERIFIED");
      setAccountId(accountId);
      setApiToken(apiToken);
      complete();
    } catch (err) {
      console.error(err);
      send("ERROR");
    }

    return false;
  };

  return (
    <Section
      currentState={current}
      state="configuring"
      title="Configure Cloudflare Account"
      stepNumber={2}
      active={
        <>
          <Subsection
            title={
              isPaid
                ? "Use an existing Cloudflare account with Workers Bundled or create a new account."
                : "Use an existing Cloudflare account or create a new one"
            }
            active={subcurrent.value === "initial"}
            past={subcurrent.value !== "initial"}
          >
            <div>
              <p className="mb-4">
                {isPaid
                  ? `Note: After you create or upgrade an account, return here to continue.`
                  : `Note: After creating an account, return here to continue.`}
              </p>
              <div className="flex space-x-4">
                {isPaid ? (
                  <>
                    <button
                      className="bg-blue-4 py-2 px-4 rounded-md text-white"
                      onClick={() => send("HAS_ACCOUNT")}
                    >
                      I have a Bundled account
                    </button>
                    <a
                      className="border-2 border-blue-4 flex items-center justify-content text-blue-4 py-2 px-4 rounded-md"
                      href="https://dash.cloudflare.com/?to=/:account/workers/plans"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <span className="mr-2">Upgrade plan</span>
                      <ExternalLink />
                    </a>
                    <a
                      className="border-2 border-blue-4 flex items-center justify-content text-blue-4 py-2 px-4 rounded-md"
                      href="https://dash.cloudflare.com/sign-up/workers"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <span className="mr-2">Create account</span>
                      <ExternalLink />
                    </a>
                  </>
                ) : (
                  <>
                    <button
                      className="bg-blue-4 py-2 px-4 rounded-md text-white"
                      onClick={() => send("HAS_ACCOUNT")}
                    >
                      I have an account
                    </button>
                    <a
                      className="border-2 border-blue-4 flex items-center justify-content text-blue-4 py-2 px-4 rounded-md"
                      href="https://dash.cloudflare.com/sign-up/workers"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <span className="mr-2">Create account</span>
                      <ExternalLink />
                    </a>
                  </>
                )}
              </div>
            </div>
          </Subsection>
          <Subsection
            title="Add account information"
            active={subcurrent.value !== "initial"}
          >
            <form onSubmit={submit}>
              <div className="mb-4">
                <p className="mb-2">
                  Enter your
                  <a
                    href="https://developers.cloudflare.com/workers/quickstart#account-id-and-zone-id"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Account ID and an API Token
                  </a>{" "}
                  with “Edit Workers” permissions.
                </p>
              </div>
              <div className="flex">
                <div className="mr-8">
                  <label
                    htmlFor="account_id"
                    class="block font-medium leading-5 text-gray-1"
                  >
                    Account ID
                  </label>
                  <div class="mt-1 mb-6 relative">
                    <input
                      id="account_id"
                      class="form-input block w-64 p-2 rounded-md border border-gray-7 sm:text-sm sm:leading-5"
                      onChange={({ target: { value } }) => setAccountId(value)}
                      placeholder="Cloudflare Workers Account ID"
                      required
                      value={accountId || ""}
                    />
                  </div>
                  <a
                    className="text-blue-4 text-sm font-semibold"
                    href="https://dash.cloudflare.com/?to=/:account/workers"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <div className="flex items-center">
                      <span className="mr-2">Workers Dashboard</span>
                      <ExternalLink />
                    </div>
                    <div
                      className={`mt-2 transition-opacity duration-150 ease-in-out ${
                        accountId && apiToken ? "opacity-50" : ""
                      }`}
                    >
                      <AccountId />
                    </div>
                  </a>
                </div>

                <div>
                  <label
                    htmlFor="api_token"
                    class="block font-medium leading-5 text-gray-1"
                  >
                    API Token
                  </label>
                  <div class="mt-1 mb-6 relative">
                    <input
                      id="api_token"
                      class="form-input block w-64 p-2 rounded-md border border-gray-7 sm:text-sm sm:leading-5"
                      onChange={({ target: { value } }) => setApiToken(value)}
                      placeholder="Cloudflare Workers API Token"
                      required
                      type="password"
                      value={apiToken || ""}
                    />
                  </div>
                  <a
                    className="text-blue-4 text-sm font-semibold"
                    href="https://dash.cloudflare.com/profile/api-tokens"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <div className="flex items-center">
                      <span className="mr-2">My Profile</span>
                      <ExternalLink />
                    </div>
                    <div
                      className={`mt-2 transition-opacity duration-150 ease-in-out ${
                        accountId && apiToken ? "opacity-50" : ""
                      }`}
                    >
                      <ApiToken />
                    </div>
                  </a>
                </div>
              </div>

              <div class="mt-6 mb-4 flex items-center">
                <span class="block mr-4">
                  <button
                    type="submit"
                    disabled={subcurrent.value === "verifying"}
                    className={`${
                      subcurrent.value === "verifying"
                        ? "cursor-not-allowed opacity-50"
                        : ""
                    } flex items-center justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-4 hover:bg-blue-4 focus:outline-none focus:border-blue-4 focus:shadow-outline-indigo active:bg-blue-4 transition duration-150 ease-in-out`}
                  >
                    Connect account
                  </button>
                </span>

                {subcurrent.value === "verifying" && <Loading />}
              </div>

              {subcurrent.value === "error" ? (
                <AlertPanel>
                  <span>
                    Account ID or API Token are not valid. Check your Account ID
                    is correct and API Token has permissions to Edit Workers
                  </span>
                </AlertPanel>
              ) : (
                <div className="mb-6" />
              )}
            </form>
          </Subsection>
        </>
      }
      inactive={null}
      completed={
        <div>
          <p>
            <strong>Account ID:</strong> {accountId}
          </p>
        </div>
      }
    />
  );
};
