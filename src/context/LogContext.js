'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const ActivityLogContext = createContext();

export const ActivityLogProvider = ({ children }) => {
  const [logs, setLogs] = useState([]);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();

      const formattedLogs = data.map((log) => {
        const timestamp = new Date(log.timestamp);
        const formattedTimestamp = timestamp.toLocaleString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });

        return {
          id: log._id,
          type: log.type,
          message: (
            <span>
              <span className="text-base-content/50">{formattedTimestamp}</span>
              <span className={`flex items-end`}>{log.action}</span>
            </span>
          ),
        };
      });

      setLogs(formattedLogs);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    }
  };

  useEffect(() => {
    fetchLogs(); // fetch on load

    const interval = setInterval(() => {
      fetchLogs();
    }, 5000); // every 5 seconds

    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  const addLog = async (actionMessage, type = 'success') => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action: actionMessage,
      type,
    };

    await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logEntry),
    });

    fetchLogs(); // refresh after posting
  };

  return (
    <ActivityLogContext.Provider value={{ logs, addLog }}>
      {children}
    </ActivityLogContext.Provider>
  );
};

export const useActivityLog = () => {
  const context = useContext(ActivityLogContext);
  if (!context) {
    throw new Error('useActivityLog must be used within an ActivityLogProvider');
  }
  return context;
};
