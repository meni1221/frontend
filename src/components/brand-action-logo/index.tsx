type BrandActionLogoProps = {
  brand: 'bit' | 'calendar' | 'waze';
};

export const BrandActionLogo = ({ brand }: BrandActionLogoProps) => {
  if (brand === 'waze') {
    return (
      <span className="brandActionLogo waze" aria-label="Waze">
        <svg viewBox="0 0 36 36" role="img" aria-hidden="true">
          <path d="M8.5 21.5c-2.8-.8-4.5-2.7-4.5-5.6 0-6.2 5.5-11.1 13-11.1 7.7 0 13.2 4.7 13.2 11.3 0 6.7-5.4 11.3-13.2 11.3h-2.4l-5.1 3.8.9-5.7c-.8-1.1-1.4-2.4-1.9-4Z" />
          <circle cx="14" cy="29.5" r="2.4" />
          <circle cx="24.5" cy="29.5" r="2.4" />
          <circle cx="13.5" cy="15.5" r="1.8" />
          <circle cx="22.5" cy="15.5" r="1.8" />
          <path d="M15 20.2c2.2 1.5 4.6 1.5 6.7 0" />
        </svg>
      </span>
    );
  }

  if (brand === 'calendar') {
    return (
      <span className="brandActionLogo calendar" aria-label="Google Calendar">
        <svg viewBox="0 0 36 36" role="img" aria-hidden="true">
          <path className="calendarBlue" d="M7 5h15v5H7z" />
          <path className="calendarGreen" d="M22 5h7v24h-5V10h-2z" />
          <path className="calendarYellow" d="M7 24h17v5H7z" />
          <path className="calendarRed" d="M7 10h5v14H7z" />
          <rect x="10" y="10" width="16" height="16" rx="1.8" />
          <text x="18" y="22.2" textAnchor="middle">31</text>
        </svg>
      </span>
    );
  }

  return (
    <span className="brandActionLogo bit" aria-label="Bit">
      bit
    </span>
  );
};
