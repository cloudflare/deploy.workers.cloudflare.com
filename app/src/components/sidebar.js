import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "./index";

export default () => {
  const [expanded, setExpanded] = useState(false);
  const classes =
    "-ml-2 flex-1 w-full bg-orange-9 border-4 border-orange-5 rounded-md hidden md:flex z-0 text-gray-1 duration-500 ease-in-out transition-transform transform ";
  return (
    <div
      className={[
        classes,
        expanded
          ? "p-6"
          : "p-2 max-w-sm -translate-x-sidebar md:-translate-x-sidebar-md lg:-translate-x-sidebar-lg xl:-translate-x-sidebar-xl",
      ].join("")}
    >
      <div className={expanded ? "" : "opacity-0"}>
        <div
          className="cursor-pointer float-right"
          onClick={() => setExpanded(false)}
        >
          <ChevronLeft />
        </div>

        <h2 className="mb-4 font-semibold text-2xl">Why Workers?</h2>

        <h3 className="mb-2 font-semibold text-lg">Distributed network</h3>
        <p>
          Deploy serverless code to Cloudflare’s edge network across 200 cities
          and 95 countries.
        </p>

        <h3 className="mt-6 font-semibold mb-2 text-lg">Fast start</h3>
        <p>Cold start under 5ms. 50 times faster than other platforms.</p>

        <h3 className="mt-6 font-semibold mb-2 text-lg">Free Tier</h3>
        <p>
          First 100,000 requests each day are free and paid plans start at just
          $5 per 10 million requests.
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
      <div className={`py-4 text-gray-3 ${expanded ? "hidden" : ""}`}>
        <div className="cursor-pointer" onClick={() => setExpanded(true)}>
          <ChevronRight />
          <span className="mt-4 rotate">Why Workers</span>
        </div>
      </div>
    </div>
  );
};
