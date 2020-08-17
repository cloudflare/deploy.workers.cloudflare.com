import React from "react";
import Embed from "./embed";

const TEMPLATES = [
  "https://github.com/bytesizedxyz/cloudflare-worker-cra",
  "https://github.com/cherry/placeholders.dev",
  "https://github.com/adamschwartz/web.scraper.workers.dev",
  "https://github.com/signalnerve/workers-graphql-server",
  "https://github.com/wilsonzlin/edgesearch",
];

export default (deployable) => (
  <div className="grid grid-cols-1 gap-4">
    {TEMPLATES.map((template) => (
      <Embed key={template} url={template} deployable={deployable} />
    ))}
  </div>
);
