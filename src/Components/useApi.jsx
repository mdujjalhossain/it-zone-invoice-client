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
    if (!url) return;

    // If data is already cached for this URL, skip the network request
    if (apiCache[url]) {
      setData(apiCache[url]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch data');
        return res.json();
      })
      .then((result) => {
        if (isMounted) {
          // Universal Smart Unwrapping:
          // If result has { success: true, data: ... }
          let resolvedData = result;
          if (result && typeof result === 'object' && 'success' in result && 'data' in result) {
            // If the inner data is an array (like products/invoices), use it directly.
            // If the inner data is an object (like analytics stats), return result.data or result appropriately.
            resolvedData = result.data;
          }

          // Store the resolved data into the module-scoped cache
          apiCache[url] = resolvedData;
          setData(resolvedData);
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