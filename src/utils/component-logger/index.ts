import { useEffect, useRef } from 'react';
import { appLogger } from '../logger';

const isComponentLoggingEnabled = () =>
  import.meta.env.DEV && import.meta.env.VITE_COMPONENT_LOGS !== 'false';

export const useComponentLogger = (componentName: string, meta?: Record<string, unknown>) => {
  const renderCount = useRef(0);
  renderCount.current += 1;

  useEffect(() => {
    if (!isComponentLoggingEnabled()) {
      return undefined;
    }

    appLogger.component(componentName, 'mounted', {
      ...meta,
      renderCount: renderCount.current,
    });

    return () => {
      appLogger.component(componentName, 'unmounted', {
        ...meta,
        renderCount: renderCount.current,
      });
    };
  }, []);

  useEffect(() => {
    if (!isComponentLoggingEnabled() || renderCount.current === 1) {
      return;
    }

    appLogger.component(componentName, 'rendered', {
      ...meta,
      renderCount: renderCount.current,
    });
  });
};
