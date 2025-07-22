import { useSearchParams } from "react-router-dom";
import { useMemo, useCallback } from "react";

export interface UseTabParamsReturn {
  params: Record<string, string>;
  setParams: (newParams: Record<string, string | undefined>) => void;
}

export const useTabParams = (): UseTabParamsReturn => {
  const [searchParams, setSearchParams] = useSearchParams();

  const params = useMemo(() => {
    return Object.fromEntries(searchParams.entries());
  }, [searchParams]);

  const setParams = useCallback(
    (newParams: Record<string, string | undefined>) => {
      const updated = new URLSearchParams(searchParams.toString());
      Object.entries(newParams).forEach(([key, value]) => {
        if (value === undefined) {
          updated.delete(key);
        } else {
          updated.set(key, value);
        }
      });
      setSearchParams(updated, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  return { params, setParams };
};

export default useTabParams;