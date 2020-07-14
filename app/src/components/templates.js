import React from "react";
import Embed from "./embed";

const TEMPLATES = [
  "https://github.com/bytesizedxyz/cloudflare-worker-cra",
  "https://github.com/cherry/placeholders.dev",
  "https://github.com/adamschwartz/web.scraper.workers.dev",
  "https://github.com/signalnerve/workers-graphql-server",
  "https://github.com/wilsonzlin/edgesearch",
  "https://github.com/signalnerve/cloudflare-workers-todos",
  "https://github.com/twoflags-io/twoflags-api",
  "https://github.com/signalnerve/repo-hunt",
];

export default ({ current }) =>
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

      <div className="py-8 grid grid-cols-1 xl:grid-cols-2 gap-8">
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
