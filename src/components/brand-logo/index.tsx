import { Image } from '@mantine/core';

type BrandLogoProps = {
  size?: 'header' | 'auth';
};

export const BrandLogo = ({ size = 'header' }: BrandLogoProps) => (
  <Image
    className={`brandLogo ${size}`}
    src="/brand/ishru-logo.jpeg"
    alt="אישרו?"
    fit="contain"
  />
);
