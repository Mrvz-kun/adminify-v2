'use client'

import { useState } from "react";
import { staffData } from "../../../public/data/DropdownData";
import { toast, Zoom, ToastContainer } from "react-toastify";
import useAuth from '@/hooks/useAuth';
import { useActivityLog } from '@/context/LogContext';

export default function PrintAttendance({ attendances = [], loading, error }) {
  const [selectedStation, setSelectedStation] = useState("");
  const [selectedStations, setSelectedStations] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const { user } = useAuth();
  const { addLog } = useActivityLog();

  const officialStations = [...new Set(staffData.map((s) => s.official_station))];

  const handleAddStation = () => {
    if (!selectedStation) return;

    if (selectedStations.includes(selectedStation)) {
      toast.info(`"${selectedStation}" already added.`, {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: true,
        theme: "dark",
        transition: Zoom,
      });
      return;
    }

    const namesInStation = staffData
      .filter((s) => s.official_station === selectedStation)
      .map((s) => s.fullname);

    const newRecords = attendances.filter(
      (a) =>
        namesInStation.includes(a.name) &&
        !filteredRecords.some((existing) => existing.publicId === a.publicId)
    );

    setFilteredRecords((prev) => [...prev, ...newRecords]);
    setSelectedStations((prev) => [...prev, selectedStation]);
    setSelectedStation("");

    toast.success(`${newRecords.length} record(s) added from "${selectedStation}"`, {
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: true,
      theme: "dark",
      transition: Zoom,
    })
  };

  const handleRemoveStation = (stationToRemove) => {
    setSelectedStations((prev) => prev.filter((s) => s !== stationToRemove));

    const namesToRemove = staffData
      .filter((s) => s.official_station === stationToRemove)
      .map((s) => s.fullname);

    setFilteredRecords((prev) =>
      prev.filter((rec) => !namesToRemove.includes(rec.name))
    );
  };

  const PrintAttendanceReport = async () => {
    if (typeof window === "undefined") return;

    const printJS = (await import("print-js")).default;

    printJS({
      printable: 'pdf-area',
      type: 'html',
      style: `
        body, table {
          font-family: Arial, sans-serif;
        }
        table {
          border-collapse: collapse;
          width: 100%;
          font-size: 12px;
        }
        th, td {
          border: 1px solid #ccc;
          padding: 6px;
          text-align: left;
        }
        th {
          background-color: #f3f4f6;
        }
        h2 {
          padding-top: 20px;
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 12px;
        }
      `,
      scanStyles: false,
      documentTitle: `Attendance_Report_${selectedMonth || 'all'}`,
    });
    addLog(`${user.username} printed attendance record for ${selectedStations.join(", ")}`);
  };

  const generateMonthOptions = () => {
    const months = new Set();

    filteredRecords.forEach((record) => {
      const date = new Date(record.inclusiveDate);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.add(key);
    });

    return Array.from(months)
      .sort((a, b) => b.localeCompare(a)) // latest first
      .map((key) => {
        const [year, month] = key.split("-");
        const label = new Date(`${year}-${month}-01`).toLocaleDateString("en-PH", {
          year: "numeric",
          month: "long",
        });
        return (
          <option key={key} value={key}>
            {label}
          </option>
        );
      });
  };

  const getMonthFilteredRecords = () => {
    return filteredRecords.filter((a) => {
      if (!selectedMonth) return true;
      const date = new Date(a.inclusiveDate);
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return yearMonth === selectedMonth;
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  const displayedRecords = getMonthFilteredRecords();

  return (
    <div className="pb-10 p-10">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold">Print Attendance Record</h2>
      </div>

      {/* Controls (not shown in print) */}
      <div className="no-print p-10">
        {/* Station Selection */}
        <div className="flex items-end gap-4 mb-4">
          <div className="flex-1">
            <label className="block">
              <span className="label-text font-semibold">Official Station</span>
              <select
                value={selectedStation}
                onChange={(e) => setSelectedStation(e.target.value)}
                className="select select-bordered w-full mt-1"
              >
                <option disabled value="" />
                {officialStations.map((station) => (
                  <option key={station} value={station}>
                    {station}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button className="btn btn-neutral btn-wide mt-6" onClick={handleAddStation}>
            Add
          </button>
        </div>

        {/* Dynamic Record Count */}
        {selectedStation && (
          <div className="my-2 pb-4 text-sm text-gray-600">
            {(() => {
              const namesInStation = staffData
                .filter((s) => s.official_station === selectedStation)
                .map((s) => s.fullname);

              const matchingRecords = attendances.filter(
                (a) =>
                  namesInStation.includes(a.name) &&
                  !filteredRecords.some((existing) => existing.publicId === a.publicId)
              );

              return matchingRecords.length > 0
                ? `${matchingRecords.length} record(s) found under "${selectedStation}"`
                : `No records available under "${selectedStation}"`;
            })()}
          </div>
        )}

        {/* Selected Station Badges */}
        {selectedStations.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedStations.map((station) => (
              <div
                key={station}
                className="badge badge-neutral gap-2 py-4 px-4 cursor-pointer"
                onClick={() => handleRemoveStation(station)}
                title="Remove"
              >
                {station} <span className="text-xs ml-2">✕</span>
              </div>
            ))}
          </div>
        )}

        {/* Month Filter Dropdown */}
        {filteredRecords.length > 0 && (
          <div className="w-60 mb-4">
            <label className="block">
              <span className="label-text font-semibold">Filter by Month</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="select select-bordered w-full mt-1"
              >
                <option value="">-- Show All --</option>
                {generateMonthOptions()}
              </select>
            </label>
          </div>
        )}

        {/* Print Button */}
        {displayedRecords.length > 0 && (
          <div className="flex justify-end gap-2 mb-4">
            <button className="btn btn-neutral" onClick={PrintAttendanceReport}>
              Print
            </button>
          </div>
        )}
      </div>

      {/* Printable Area */}
      <div id="pdf-area" className="p-4 bg-white text-black">
          {selectedStations.length > 0 && (
            <h2 className="font-semibold mb-4">
              Official Station: {selectedStations.join(", ")}
            </h2>
          )}

        <div className="overflow-x-auto border border-base-300 rounded-md">

          <table className="table w-full text-sm ">
            <thead className="bg-base-300 border-b">
              <tr>
                <th>Name</th>
                <th>Activity</th>
                <th>Details</th>
                <th>Inclusive Date</th>
                <th>AFL Verification</th>
              </tr>
            </thead>
            <tbody>
              {displayedRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500 italic">
                    No records selected.
                  </td>
                </tr>
              ) : (
                displayedRecords.map((a) => (
                  <tr key={a.publicId} className="">
                    <td>{a.name}</td>
                    <td>{a.activity}</td>
                    <td>{a.details}</td>
                    <td>
                      {new Date(a.inclusiveDate).toLocaleDateString("en-PH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </td>
                    <td>{a.AFLVerification}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast notifications */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}
