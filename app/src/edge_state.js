import React from "react";

const isDOMavailable = !!(
  typeof window !== "undefined" &&
  window.document &&
  window.document.createElement
);

const useSSR = (callback, delay) => {
  const [inBrowser, setInBrowser] = React.useState(isDOMavailable);

  React.useEffect(() => {
    setInBrowser(isDOMavailable);
    return () => {
      setInBrowser(false);
    };
  }, []);

  const useSSRObject = React.useMemo(
    () => ({
      isBrowser: inBrowser,
      isServer: !inBrowser,
      canUseWorkers: typeof Worker !== "undefined",
      canUseEventListeners: inBrowser && !!window.addEventListener,
      canUseViewport: inBrowser && !!window.screen
    }),
    [inBrowser]
  );

  return React.useMemo(
    () => Object.assign(Object.values(useSSRObject), useSSRObject),
    [useSSRObject]
  );
};

const parseDocumentState = key => {
  const edgeStateElement = document.querySelector("#edge_state");
  try {
    const jsonData = JSON.parse(edgeStateElement.innerText);
    return key ? jsonData[key] : jsonData;
  } catch (err) {
    return [];
  }
};

export const EdgeStateContext = React.createContext([{}, () => {}]);
export const EdgeStateProvider = ({ children }) => {
  const [state, setState] = React.useState(null);

  const { isBrowser } = useSSR();
  if (!isBrowser) {
    return <>{children}</>;
  }

  const edgeState = parseDocumentState("state");
  if (!state && edgeState) {
    setState(edgeState);
  }

  const updateState = (newState, options = { immutable: true }) =>
    options.immutable
      ? setState([].concat(state, newState))
      : setState(newState);

  return (
    <EdgeStateContext.Provider value={[state, updateState]}>
      {children}
    </EdgeStateContext.Provider>
  );
};
