import React, { useRef } from "react";
import { Logo } from "./index";

export default () => {
  const urlRef = useRef("");
  const setUrl = (event) => {
    event.preventDefault();
    const params = new URLSearchParams(window.location.search);
    params.set("url", urlRef.current.value);
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params}`
    );
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center">
      <Logo />
      <div className="max-w-4xl md:w-2/3 mt-8 mx-auto md:pb-12 md:px-4 md:px-6 lg:px-8">
        <div className="h-full bg-white rounded border flex flex-col">
          <div className="px-6 pt-4 flex items-center">
            <h1 className="text-header">We seem to be missing a project</h1>
          </div>
          <div className="flex-1 px-6 pt-4">
            <p className="text-gray-1">
              We can’t seem to find the Github repository that you are trying to
              deploy from. This is usually caused by a misconfigured deployment
              button.
            </p>

            <p className="text-gray-1 mt-2 mb-6">
              If you know your repository URL, you can start the process by
              adding it below. Otherwise, checkout some of our Workers resources
              and other projects.
            </p>

            <form onSubmit={setUrl}>
              <label className="text-gray-1" htmlFor="url">
                Github URL
              </label>
              <div className="flex mt-2">
                <input
                  class="flex-1 border border-gray-1 rounded mr-4 text-gray-1 px-4 py-2"
                  id="url"
                  name="url"
                  placeholder="Ex. https://www.github.com/danimals/repository-name"
                  ref={urlRef}
                />

                <input
                  type="image"
                  name="submit"
                  src="/deploy.svg"
                  alt="Submit"
                />
              </div>
            </form>

            <div className="grid grid-cols-3 gap-4 mt-6 mb-4">
              <div className="flex flex-col p-4 border rounded h-64">
                <div className="flex-1">
                  <h2 className="text-gray-1 text-lg mb-4">
                    Workers Templates
                  </h2>
                  <p className="text-gray-3 text-sm">
                    See some of the Cloudflare created Workers projects that
                    help to demonstrate some of the capabilities of Workers.
                  </p>
                </div>
                <a
                  className="self-center text-blue-600 border border-blue-600 px-4 py-2 rounded-md"
                  href="https://developers.cloudflare.com/docs/templates"
                >
                  Workers Templates
                </a>
              </div>
              <div className="flex flex-col p-4 border rounded h-64">
                <div className="flex-1">
                  <h2 className="text-gray-1 text-lg mb-4">Popular Projects</h2>
                  <p className="text-gray-3 text-sm">
                    Check out what our customers have made with Workers and
                    maybe even deploy from them.
                  </p>
                </div>
                <a
                  className="self-center text-blue-600 border border-blue-600 px-4 py-2 rounded-md"
                  href="https://workers.cloudflare.com/built-with"
                >
                  Popular Projects
                </a>
              </div>
              <div className="flex flex-col p-4 border rounded h-64">
                <div className="flex-1">
                  <h2 className="text-gray-1 text-lg mb-4">Learn more</h2>
                  <p className="text-gray-3 text-sm">
                    Check out why Cloudflare Workers are such a powerful tool to
                    both small and large applications.
                  </p>
                </div>
                <a
                  className="self-center text-blue-600 border border-blue-600 px-4 py-2 rounded-md"
                  href="https://workers.cloudflare.com"
                >
                  Cloudflare Workers
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
