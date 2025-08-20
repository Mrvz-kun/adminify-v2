import { useEffect, useState } from 'react';

export default function useBincard(stockId) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const addEntry = async (entry) => {
    const res = await fetch('/api/bincard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });

    if (!res.ok) throw new Error('Failed to add entry');
    return await res.json();
  };

  useEffect(() => {
    if (!stockId) return;

    const fetchEntries = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/bincard?stockId=${stockId}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setEntries(data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch Bincard entries');
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [stockId]);

  return { entries, loading, error, addEntry };
}
