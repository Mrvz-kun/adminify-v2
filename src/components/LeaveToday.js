import { useEffect, useState } from 'react';

export default function LeaveToday() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/attendance/leaveToday')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((json) => {
        setRecords(Array.isArray(json) ? json : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        setError(true);
        setRecords([]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="rounded-xl bg-gradient-to-br from-gray-100 to-white shadow-md p-2 min-h-[500px] flex flex-col gap-2 sm:p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        {loading && <span className="text-xs text-gray-400">Loading...</span>}
      </div>

      {error ? (
        <p className="text-xs text-red-500 text-center">Error loading data.</p>
      ) : (
        <>
          <div className='mb-4'>
            <h2 className="text-lg font-semibold text-base-content">
              Attendance Monitor
            </h2>
          </div>
          <div className="text-center mb-2">
            <p className="text-6xl font-bold text-info">{records.length}</p>
            <p className="-mt-1">
              On Leave Today –{' '}
              {new Date().toLocaleDateString('en-PH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          {records.length > 0 ? (
            <div className="mt-4">
              <ul className="space-y-0.5 text-sm text-base-content">
                {records.map((entry, idx) => (
                  <li
                    key={entry._id || idx}
                    className="px-2 py-0.5 rounded hover:bg-base-300 transition text-sm"
                  >
                    <span className="font-medium">{idx + 1}. {entry.name}</span>
                    {entry.details && (
                      <span className="ml-1 text-base-content/50 italic text-xs">
                        ({entry.details})
                      </span>
                    )}
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
