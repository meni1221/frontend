import { useEffect, useState } from 'react';
import { getSystemLogs, SystemLogEntry, SystemLogQuery } from '../../../../api';
import { useFeedback } from '../../../../components/feedback';
import { useAsyncAction } from '../../../../hooks/use-async-action';
import { getFriendlyErrorMessage } from '../../../../utils/error-message';
import { appLogger } from '../../../../utils/logger';

export const useSystemLogs = (labels: Record<string, string>) => {
  const [logs, setLogs] = useState<SystemLogEntry[]>([]);
  const [query, setQuery] = useState<SystemLogQuery>({});
  const { showFeedback } = useFeedback();
  const loadAction = useAsyncAction();

  const loadLogs = () => {
    void loadAction.run(async () => {
      const result = await getSystemLogs(query);
      setLogs(result.items);
      appLogger.info('logs.loaded', 'System logs loaded', { total: result.total });
    }, {
      onError: (cause) => {
        showFeedback({
          type: 'error',
          title: labels.actionFailed,
          message: getFriendlyErrorMessage(cause, labels),
        });
      },
    });
  };

  const updateQuery = <Key extends keyof SystemLogQuery>(key: Key, value: SystemLogQuery[Key] | null) => {
    setQuery((current) => {
      const nextQuery = { ...current };
      if (!value) {
        delete nextQuery[key];
        return nextQuery;
      }

      nextQuery[key] = value;
      return nextQuery;
    });
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return {
    loading: loadAction.loading,
    logs,
    query,
    loadLogs,
    updateQuery,
  };
};
