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
    <div class="h-32 w-full bg-gray-50 overflow-hidden overflow-hidden rounded-lg">
      <a href={linkUrl || url} title={embed.title}>
        <div className="flex h-32">
          <img className="object-cover h-full w-32" src={embed.image} />
          <div class="px-4 py-4 sm:px-6">
            <p className="mb-2 text-gray-800">{embed.title}</p>
            <p className="text-sm leading-5 text-gray-500">
              {(decodedDescription
                ? decodedDescription
                : embed.description
              ).slice(0, 240)}
            </p>
          </div>
        </div>
      </a>
    </div>
  ) : quiet ? null : (
    <div class="text-md leading-5 text-gray-800 pt-6">
      <p>
        <a href={url} target="_blank">
          {url}
        </a>
      </p>
    </div>
  );
};

export default Embed;
