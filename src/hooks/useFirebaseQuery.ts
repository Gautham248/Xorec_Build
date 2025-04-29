import { useState, useEffect } from 'react';
import { fetchWithCache } from '@/utils/cache';

const FETCH_TIMEOUT = 30000; // 30 seconds timeout
const INITIAL_RETRY_DELAY = 2000; // 2 seconds

export const useFirebaseQuery = (
  collectionName: string,
  queryConstraints: any[] = [],
  options = { cacheKey: '', enabled: true }
) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!options.enabled) return;

    let timeoutId: NodeJS.Timeout;
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Set up timeout with retry mechanism
        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error('Request timed out after 30 seconds'));
          }, FETCH_TIMEOUT);
        });

        // Race between the fetch and the timeout
        const result = await Promise.race([
          fetchWithCache(collectionName, queryConstraints, options.cacheKey),
          timeoutPromise
        ]);

        if (isMounted) {
          setData(result as any[]);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Query error:', err);
          setError(err as Error);
          // Keep existing data if available
          if (data.length === 0) {
            await delay(INITIAL_RETRY_DELAY);
            fetchData(); // Retry once
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
        clearTimeout(timeoutId);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [collectionName, options.enabled]);

  return { data, loading, error };
};