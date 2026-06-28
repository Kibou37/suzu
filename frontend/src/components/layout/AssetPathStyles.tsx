import { withBasePath } from '@/lib/base-path';

export function AssetPathStyles() {
  const carsSectionBg = withBasePath('/images/cars-section-bg.jpg');

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `:root{--asset-bg-cars-section:url('${carsSectionBg}');}`,
      }}
    />
  );
}
