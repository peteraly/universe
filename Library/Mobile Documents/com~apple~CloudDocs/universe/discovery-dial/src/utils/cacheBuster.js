// URGENT: Cache Busting Utility - FORCE COMPASS DIAL VISIBILITY
export const CACHE_VERSION = Date.now() + Math.random() * 1000;

export const getCacheBustedUrl = (url) => {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${CACHE_VERSION}`;
};

// Force reload if old version detected
export const forceReloadIfOld = () => {
  const lastVersion = localStorage.getItem('discovery-dial-version');
  if (!lastVersion || lastVersion !== CACHE_VERSION.toString()) {
    localStorage.setItem('discovery-dial-version', CACHE_VERSION.toString());
    if (lastVersion) {
      // Only reload if we had a previous version
      window.location.reload(true);
    }
  }
};
