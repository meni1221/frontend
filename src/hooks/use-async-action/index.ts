import { useCallback, useState } from 'react';

type AsyncActionOptions = {
  onError?: (cause: unknown) => void;
};

export const useAsyncAction = () => {
  const [loading, setLoading] = useState(false);

  const run = useCallback(async <T>(action: () => Promise<T> | T, options: AsyncActionOptions = {}) => {
    setLoading(true);

    try {
      return await action();
    } catch (cause) {
      options.onError?.(cause);
      return undefined;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, run };
};
