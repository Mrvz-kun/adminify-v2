'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const ActivityLogContext = createContext();

export const ActivityLogProvider = ({ children }) => {
  const [logs, setLogs] = useState([]);

useEffect(() => {
  fetch('/api/logs')
    .then((res) => res.json())
    .then((data) => {
      const formatted = data.map((log) => {
        const formattedTimestamp = new Date(log.timestamp).toLocaleString('en-US', {
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
              &nbsp;&nbsp;: &nbsp;&nbsp;&nbsp;&nbsp;
              <span className="text-base-content/50">{log.action}</span>
            </span>
          ),
        };
      });
      setLogs(formatted);
    })
    .catch(() => {});
}, []);


  const addLog = async (actionMessage, type = 'success') => {
    const now = new Date();
    const timestamp = now.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const rawLog = {
      action: actionMessage,
      timestamp,
      type,
    };

    // Save to DB
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rawLog),
      });
    } catch (err) {
      console.error('Failed to save log:', err);
    }

    // Add to local state (frontend render)
    const newLog = {
      id: Date.now(),
      type,
      message: (
        <span>
          <span className="text-base-content/50">{timestamp}</span>
          &nbsp;&nbsp;: &nbsp;&nbsp;
          <span className="text-info">{actionMessage}</span>
        </span>
      ),
    };

    setLogs((prevLogs) => [newLog, ...prevLogs]);
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
