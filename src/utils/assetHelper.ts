/**
 * Formats a public asset URL properly considering Vite base path (e.g. GitHub Pages repo subfolder)
 */
export const getPublicAssetUrl = (path: string): string => {
  const base = import.meta.env.BASE_URL || './';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return encodeURI(`${cleanBase}${cleanPath}`);
};

/**
 * Returns WebP url for raster PNG assets to drastically reduce bandwidth and load time
 */
export const getWebpUrl = (path: string): string => {
  const webpPath = path.replace(/\.png$/i, '.webp');
  return getPublicAssetUrl(webpPath);
};

