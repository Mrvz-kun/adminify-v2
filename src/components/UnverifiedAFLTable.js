import React, { useState } from "react";
import { useAFL } from "../hooks/useAFL";


export default function UnverifiedAFLTable({ AFLs, loading, error, onSelectAFL, currentRecord }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const { updateAFL } = useAFL();

  const filtered = (AFLs || [])
    .filter((afl) => afl.verified === false)
    .filter(
      (afl) =>
        afl.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        afl.typeOfLeave.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleSelect = async (publicId) => {
    try {
      { /* await updateAFL(publicId, { verified: true }); */}
      onSelectAFL?.(publicId);

      setSelectedId(null);
    } catch (err) {
      console.error("Failed to verify AFL:", err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  function AvatarPlaceholder({ name = "?" }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="w-24 h-24 rounded-full bg-neutral text-white flex items-center justify-center text-3xl font-bold shadow-md">
      {initials}
    </div>
  );
}

  return (
    <div>
      { /* Current record info */ }
      {currentRecord && (
          <div className="mb-4 p-3 pl-4 flex items-center gap-4">
            {/* Avatar Circle */}
              <div className="avatar">
                <div className="ring-neutral ring-offset-base-100 w-24 rounded-full ring-2 ring-offset-2">
                      <AvatarPlaceholder name={currentRecord.name} />
                </div>
              </div>
            {/* Text Info */}
            <div>
              <div className="font-bold text-xl">{currentRecord.name}</div>
              <div className="text-md font-semibold text-gray-600">
                {currentRecord.activity} —{" "}
                {new Date(currentRecord.inclusiveDate).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>
          )}

      
      {/* Search input */}
      <div className="mb-4 flex">
        <input
          type="text"
          placeholder="Search by name or type of leave..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input input-bordered w-full"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[430px] overflow-y-scroll border border-base-300 rounded-md">
        <table className="table w-full">
          <thead className="sticky top-0 bg-base-300 z-10">
            <tr>
              <th>Name</th>
              <th>Type of Leave</th>
              <th>Inclusive Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-4 text-gray-500 italic">
                  No unverified AFL records found.
                </td>
              </tr>
            ) : (
              filtered.map((afl) => (
                <tr
                  key={afl.publicId}
                  className={`cursor-pointer ${selectedId === afl.publicId ? "bg-base-200" : ""}`}
                  onClick={() => setSelectedId(afl.publicId)}
                >
                  <td>{afl.name}</td>
                  <td>{afl.typeOfLeave}</td>
                  <td>{new Date(afl.inclusiveDate).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-neutral btn-outline"
                      onClick={() => handleSelect(afl.publicId)}
                    >
                      Select
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
