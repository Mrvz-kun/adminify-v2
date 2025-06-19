'use client';
import { useActivityLog } from '@/context/LogContext';
import { useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default function FooterActivity() {
  const { logs } = useActivityLog();
  const [modalOpen, setModalOpen] = useState(false);

  const latestLog = logs[0];

  return (
    <>
      <footer className="bg-base-200 px-4 py-2 flex items-center justify-between text-xs border-t border-base-300">
        <div
          className="flex items-center gap-1 hover:cursor-pointer"
          onClick={() => setModalOpen(true)}
        >
          <div className="relative w-3 h-3 ml-8 mx-2">
            <span className="absolute inset-0 status status-info animate-ping"></span>
            <span className="absolute inset-0 status status-info"></span>
          </div>

          {latestLog ? (
            <span className="text-xs whitespace-nowrap text-base-content/50">
              {latestLog.action}
            </span>
          ) : (
            <span className="text-xs text-base-content/50">No recent activity</span>
          )}
        </div>
      </footer>

      {/* Modal */}
      {modalOpen && (
        <div className="modal modal-open">
          <div className="modal-box w-10/12 sm:max-w-2xl h-[80vh] flex flex-col">
            <h3 className="font-bold text-lg mb-4 pb-2">Activity Log</h3>

            <div className="overflow-y-auto flex-1 pr-1">
              {logs.length > 0 ? (
                <ul className="space-y-3 text-sm">
                  {logs.map((log) => (
                    <li key={log.id} className="flex items-start gap-2 text-xs">
                      <div className="relative w-3 h-3 mt-1">
                        <div className="status animate-ping absolute inset-0"></div>
                        <div className="status absolute inset-0"></div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                        <span>{log.action}</span>
                        <span className="text-[10px] text-base-content/50 whitespace-nowrap">
                          · {dayjs(log.timestamp).fromNow()}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No logs found.</p>
              )}
            </div>

            <div className="modal-action pt-4">
              <button className="btn btn-sm" onClick={() => setModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
