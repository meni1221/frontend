import { BrandActionLogo } from '../brand-action-logo';

type BitLogoProps = {
  size?: 'sm' | 'md';
};

export const BitLogo = ({ size = 'sm' }: BitLogoProps) => (
  <span className={size === 'md' ? 'brandLogoSize md' : 'brandLogoSize'}>
    <BrandActionLogo brand="bit" />
  </span>
);
