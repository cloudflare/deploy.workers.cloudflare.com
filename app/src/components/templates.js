import React from "react";
import Embed from "./embed";

const TEMPLATES = [
  "https://github.com/signalnerve/workers-graphql-server",
  "https://github.com/bytesizedxyz/cloudflare-worker-cra",
  "https://github.com/adamschwartz/web.scraper.workers.dev",
  "https://github.com/cherry/placeholders.dev",
  "https://github.com/davidtsong/worker-speedtest-template",
];

export default () => (
  <div className="grid grid-cols-1 gap-4">
    {TEMPLATES.map((template) => (
      <Embed key={template} url={template} />
    ))}
  </div>
);
