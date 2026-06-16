import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppTab } from '../../data';
import { dictionaries, directionByLocale, Locale } from '../../i18n';
import { useDashboardState } from '../../app/hooks/use-dashboard-state';

type AppContextValue = {
  activeTab: AppTab;
  dashboardState: ReturnType<typeof useDashboardState>;
  dir: 'ltr' | 'rtl';
  labels: Record<string, string>;
  locale: Locale;
  logout: () => void;
  setActiveTab: (tab: AppTab) => void;
  toggleLocale: () => void;
};

type AppProviderProps = {
  children: ReactNode;
};

const AppContext = createContext<AppContextValue | null>(null);

const appTabs: AppTab[] = [
  'events',
  'guests',
  'seating',
  'invitations',
  'guest',
  'whatsapp',
  'system_overview',
  'owner',
  'logs',
  'terms',
  'settings',
];

const defaultTab: AppTab = 'events';

const isAppTab = (value: string | undefined): value is AppTab =>
  Boolean(value && appTabs.includes(value as AppTab));

const getTabFromPath = (): AppTab => {
  const [, section, tab] = window.location.pathname.split('/');

  if (section === 'dashboard' && isAppTab(tab)) {
    return tab;
  }

  return defaultTab;
};

const getTabPath = (tab: AppTab) => `/dashboard/${tab}`;

const isPublicInvitePath = () => window.location.pathname.startsWith('/invite/');

export const AppProvider = ({ children }: AppProviderProps) => {
  const [activeTab, setActiveTabState] = useState<AppTab>(getTabFromPath);
  const [locale, setLocale] = useState<Locale>('he');
  const dashboardState = useDashboardState();

  const labels = dictionaries[locale];
  const dir = directionByLocale[locale];

  const setActiveTab = useCallback((tab: AppTab) => {
    setActiveTabState(tab);

    const nextPath = getTabPath(tab);
    if (window.location.pathname !== nextPath) {
      window.history.pushState({ tab }, '', nextPath);
    }
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale((currentLocale) => (currentLocale === 'he' ? 'en' : 'he'));
  }, []);

  const logout = useCallback(() => {
    dashboardState.clearSession();
    setActiveTabState(defaultTab);
    if (!isPublicInvitePath()) {
      window.history.pushState({}, '', '/');
    }
  }, [dashboardState]);

  useEffect(() => {
    const handlePopState = () => {
      setActiveTabState(getTabFromPath());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!dashboardState.session || isPublicInvitePath()) {
      return;
    }

    if (!window.location.pathname.startsWith('/dashboard/')) {
      window.history.replaceState({ tab: activeTab }, '', getTabPath(activeTab));
    }
  }, [activeTab, dashboardState.session]);

  const value = useMemo<AppContextValue>(
    () => ({
      activeTab,
      dashboardState,
      dir,
      labels,
      locale,
      logout,
      setActiveTab,
      toggleLocale,
    }),
    [activeTab, dashboardState, dir, labels, locale, logout, toggleLocale],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used inside AppProvider');
  }

  return context;
};
