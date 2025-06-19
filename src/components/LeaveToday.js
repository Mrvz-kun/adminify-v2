import { useEffect, useState } from 'react';
import { Users, Clock } from 'lucide-react';

export default function LeaveToday() {
  const [data, setData] = useState({ count: 0, names: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/AFL/leaveToday')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((json) => {
        setData({
          count: json.count || 0,
          names: Array.isArray(json.names) ? json.names : []
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        setError(true);
        setData({ count: 0, names: [] });
        setLoading(false);
      });
  }, []);

  return (
    <div className="rounded-xl bg-gradient-to-br from-gray-100 to-white shadow-md p-2 min-h-[300px] flex flex-col gap-2 sm:p-4 md:p-6 lg:p-8">
  <div className="flex items-center justify-between mb-2">
    {loading && <span className="text-xs text-gray-400">Loading...</span>}
  </div>

  {error ? (
    <p className="text-xs text-red-500 text-center">Error loading data.</p>
  ) : (
    <>
      <div className="text-center mb-2">
        <p className="text-6xl font-bold text-info">{data.count}</p>
        <p className="text-xs text-base-content/50 -mt-1">
          On Leave Today – {new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {data.names.length > 0 ? (
        <div className="max-h-32">
          <ul className="space-y-0.5 text-sm text-base-content">
            {data.names.map((entry, idx) => (
              <li
                key={idx}
                className="px-2 py-0.5 rounded hover:bg-base-300 transition text-sm"
              >
                <span className="font-medium">{entry.name}</span>
                <span className="ml-1 text-base-content/50 italic text-xs">({entry.typeOfLeave})</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        !loading && (
          <p className="text-xs text-gray-400 text-center mt-2">
            No one is on leave today.
          </p>
        )
      )}
    </>
  )}
</div>

  );
}
