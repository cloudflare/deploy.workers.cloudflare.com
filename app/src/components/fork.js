import React, { useState } from "react";

export default ({ current, submit }) => {
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
            <span>Application forked</span>
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
                type="password"
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
            <a
              href="https://developers.cloudflare.com/workers/quickstart#configure"
              target="_blank"
            >
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
