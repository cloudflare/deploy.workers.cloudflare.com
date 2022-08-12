import React, { useEffect, useState } from "react";

const Embed = ({ quiet = false, url, linkUrl = null }) => {
  const [embed, setEmbed] = useState(null);
  const [decodedDescription, setDecodedDescription] = useState(null);
  useEffect(() => {
    const getEmbed = async () => {
      try {
        const resp = await fetch(
          `https://mbed.signalnerve.workers.dev/?url=${url}`
        );
        const body = await resp.json();
        setEmbed(body);
        function decodeHtml(html) {
          var txt = document.createElement("textarea");
          txt.innerHTML = html;
          return txt.value;
        }

        if (body.description) {
          setDecodedDescription(decodeHtml(body.description));
        }
      } catch (err) {
        console.error(err);
      }
    };
    getEmbed();
  }, [url]);

  return embed && embed.image ? (
    <div class="project-card h-24 max-w-2xl w-full border border-gray-7 overflow-hidden overflow-hidden rounded-lg">
      <a
        href={linkUrl || url}
        title={embed.title}
        rel="noopener noreferrer"
        target="_blank"
      >
        <div className="flex h-full">
          <img
            alt={embed.title}
            className="object-cover w-32 border-r border-gray-7"
            src={embed.image}
          />
          <div class="px-4 py-2 flex flex-col justify-content">
            <p className="text-black flex-1">{embed.title}</p>
            <p className="text-sm leading-5 text-gray-3">
              {(decodedDescription
                ? decodedDescription
                : embed.description
              ).slice(0, 128)}
            </p>
          </div>
        </div>
      </a>
    </div>
  ) : quiet ? null : (
    <div class="text-md leading-5 text-gray-800 pt-6">
      <p>
        <a href={url} rel="noopener noreferrer" target="_blank">
          {url}
        </a>
      </p>
    </div>
  );
};

export default Embed;
