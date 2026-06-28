export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** Prefix public asset paths for GitHub Pages (/suzu). External URLs are unchanged. */
export function withBasePath(assetPath: string): string {
  if (!assetPath.startsWith('/')) {
    return assetPath;
  }

  return `${basePath}${assetPath}`;
}
