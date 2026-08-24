/**
 * Formats a public asset URL properly considering Vite base path (e.g. GitHub Pages repo subfolder)
 */
export const getPublicAssetUrl = (path: string): string => {
  const base = import.meta.env.BASE_URL || './';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return encodeURI(`${cleanBase}${cleanPath}`);
};
