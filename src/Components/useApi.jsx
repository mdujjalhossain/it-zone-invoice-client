import { useState, useEffect } from 'react';

// Module-scoped cache object. Persists across component mounts and unmounts,
// but clears automatically on a full browser reload.
const apiCache = {};

export default function useApi(url) {
  // Initialize state with cached data if available to avoid initial flash/loading states
  const [data, setData] = useState(() => apiCache[url] || null);
  const [loading, setLoading] = useState(!apiCache[url]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If data is already cached for this URL, skip the network request
    if (apiCache[url]) {
      setData(apiCache[url]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    fetch(url)
      .then((res) => res.json())
      .then((result) => {
        if (isMounted) {
          // Store the resolved data into the module-scoped cache
          apiCache[url] = result;
          setData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to fetch data');
          setLoading(false);
        }
      });

    // Cleanup function to prevent state updates on unmounted components
    return () => {
      isMounted = false;
    };
  }, [url]);

  return { data, setData, loading, error };
}