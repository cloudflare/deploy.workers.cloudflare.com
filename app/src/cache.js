import lscache from "lscache";

// Set expiration in seconds
lscache.setExpiryMilliseconds(1000);

// Expire in 60^2 seconds - one hour
const DEFAULT_EXPIRY = 60 * 60;

export const refresh = (key) => {
  const value = lscache.get(key);
  lscache.remove(key);
  set(key, value);
};

export const clear = () => lscache.flush();

export const get = (key) => {
  const value = lscache.get(key);
  if (value) refresh(key);
  return value;
};

export const set = (key, value) => lscache.set(key, value, DEFAULT_EXPIRY);

export const startOver = () => {
  clear();
  window.location.search = "";
};
