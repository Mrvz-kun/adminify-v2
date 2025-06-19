'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const ActivityLogContext = createContext();

export const ActivityLogProvider = ({ children }) => {
  const [logs, setLogs] = useState([]);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();

      // ✅ Store raw fields instead of JSX
      const formattedLogs = data.map((log) => ({
        id: log._id,
        action: log.action,
        timestamp: log.timestamp,
        type: log.type || null,
      }));

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
