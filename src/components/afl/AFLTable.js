import React, { useState, useEffect } from "react";
import { staffData, leaveData, rpmoReceiverData } from "../../../public/data/DropdownData";
import {  Ellipsis, ChevronsLeft, ChevronsRight, CircleX} from "lucide-react";
import useAuth from '@/hooks/useAuth';
import { useActivityLog } from '@/context/LogContext';

export default function AFLTable({ AFLs, loading, error, onDelete, onUpdate }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedForDelete, setSelectedForDelete] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const { user } = useAuth();
  const { addLog } = useActivityLog();

  const isRecent = (dateString) => {
    const created = new Date(dateString);
    const now = new Date();
    const diffMs = now - created;
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours <= 2;
  };

const filtered = AFLs.filter((afl) => {
  // Filter by statusFilter based on boolean verified
  const matchStatus =
    statusFilter === "all" ||
    (statusFilter === "unverified" && afl.verified === false) ||
    (statusFilter === "verified" && afl.verified === true);

  // Filter by search term on multiple fields
  const lowerSearch = searchTerm.toLowerCase();
  const matchSearch =
    afl.publicId.toLowerCase().includes(lowerSearch) ||
    afl.name.toLowerCase().includes(lowerSearch) ||
    afl.typeOfLeave.toLowerCase().includes(lowerSearch);


  return matchStatus && matchSearch;
});


  const totalPages = Math.ceil(filtered.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + recordsPerPage);

  useEffect(() => {
  setCurrentPage(1); // Reset to page 1 on filter/search change
}, [searchTerm, statusFilter]);

  const openEditModal = (record) => {
    setEditData({ ...record });
    setOriginalData({ ...record });  // save original data
    setIsEditing(false);  
    setEditModalOpen(true);

  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditData(null);
  };

  const handleCancelEdit = () => {
  setEditData(originalData);  // revert changes
  setIsEditing(false);        // back to view mode
};

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const submitEdit = (e) => {
  e.preventDefault(); // Prevent page reload

  // Extract and sanitize fields
  const {
    name = "",
    dateReceived = "",
    typeOfLeave = "",
    details = "",
    inclusiveDate = "",
    dateTransmitted = "",
    rpmoReceiver = "",
    remarks = ""
  } = editData;

  // Validate required fields
  if (
    !name.trim() ||
    !dateReceived.trim() ||
    !typeOfLeave.trim() ||
    !details.trim() ||
    !inclusiveDate.trim()
  ) {
    alert("Please fill all required fields");
    return;
  }

  onUpdate(editData.publicId, editData);
  closeEditModal();
  addLog(`${user.username} updated AFL record for ${editData.name}`);
};


  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-error">Error: {error}</div>;

  return (
    <>
      
      {/* Top Row: Search Left, Info + Pagination Right */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 mt-10">
        {/* Search bar aligned left */}
        <div className="flex-1">
          <input
            type="text"
            placeholder={`Search in ${AFLs.length} records...`}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="input input-bordered w-full max-w-md input-sm italic"
          />
        </div>

        {/* Right side: Badges + Filter + Pagination */}
        <div className="flex items-center gap-4 flex-wrap justify-end">
          {/* Info badges */}
          <div className="flex gap-3 items-center mr-4">
            <h5 className="text-sm">
              Unverified {" "}
              <span className="badge badge-sm badge-error text-white p-3.5 rounded-full">
                {
                  AFLs.filter((a) => !a.verified).length
                }
              </span>
            </h5>
          </div>

          {/* Dropdown filter */}
          <div className="min-w-[130px]">
            <select
              className="select select-sm select-bordered w-full"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="unverified">Unverified</option>
              <option value="verified">Verified</option>
            </select>
          </div>

          {/* Pagination buttons */}
          <div className="flex items-center gap-2 min-w-[100px] justify-end">
            <button
              className="btn btn-square btn-sm btn-neutral"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              style={{ visibility: totalPages > 1 ? "visible" : "hidden" }}
            >
              <ChevronsLeft className="size-[1.6em]" />
            </button>
            <button
              className="btn btn-square btn-sm btn-neutral"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              style={{ visibility: totalPages > 1 ? "visible" : "hidden" }}
            >
              <ChevronsRight className="size-[1.6em]" />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}          
      <div className="overflow-x-auto max-h-1/2 min-h-[300px] h-1/2 overflow-y-scroll border border-base-300 rounded-md">
        <table className="table w-full">
          <thead className="sticky top-0 bg-base-300 z-10">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Type of Leave</th>
              <th>Inclusive Date</th>
              <th>Date Transmitted</th>
              <th>Receiver</th>
              <th>Remarks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center italic py-4 text-gray-500">
                  No records found.
                </td>
              </tr>
            ) : (
              paginated.map((afl) => (
                <tr key={afl.publicId} className={!afl.verified ? "text-error" : ""}>
                  <td>{afl.publicId}</td>
                  <td>
                    <span className="inline-flex items-center gap-2">
                      {afl.name}
                      {isRecent(afl.createdAt) && (
                        <span className="relative -top-1 inline-flex items-center animate-bounce">
                          <div className="status status-info " title="Recently added" />
                          <span className="text-xs text-info ml-1">New</span>
                        </span>
                      )}
                    </span>
                  </td>
                  <td>{afl.typeOfLeave}</td>
                  <td>{new Date(afl.inclusiveDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</td>
                  <td>
                    {(() => {
                      const date = afl.dateTransmitted
                        ? new Date(afl.dateTransmitted)
                        : null;
                      return date && !isNaN(date)
                        ? date.toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "";
                    })()}
                  </td>

                  <td>{afl.rpmoReceiver}</td>
                  <td>{afl.remarks}</td>
                  <td>
                    <div className="dropdown dropdown-end relative text-base-content">
                      <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
                        <Ellipsis className="size-[1.2em]" />
                      </div>
                      <ul
                        tabIndex={0}
                        className="dropdown-content menu bg-base-100 rounded-box z-[1000] absolute top-full right-0 w-24 p-2 shadow-sm text-sm"
                      >
                        <li className=""><a onClick={() => openEditModal(afl)}>View/Edit</a></li>
                        <li>
                          <a
                            onClick={() => {
                              setSelectedForDelete(afl);
                              document.getElementById("delete-modal").showModal();
                            }}
                          >
                            Delete
                          </a>
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editModalOpen && editData && (
  <dialog open id="modal" className="modal">
    <div className="modal-box w-6/12 max-w-2xl h-5/6 flex flex-col">
      
      {/* Modal Header */}
      <div className="p-4 border-b border-neutral-content flex justify-between items-center">
        <h2 className="font-bold text-lg">
          Edit Record
          <span className="badge badge-neutral font-normal ml-2">
            {editData?.publicId}
          </span>
        </h2>

        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="btn btn-sm btn-outline"
          >
            Edit
          </button>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="p-4 flex-grow overflow-y-auto text-sm">

        {/* Name */}
        <div className="mb-4">
          <span className="label-text font-semibold">Name</span>
          {isEditing ? (
            <select
              name="name"
              value={editData.name || ""}
              onChange={handleEditChange}
              className="select select-bordered w-full mt-1"
            >
              <option disabled value="" />
              {staffData.map(({ staff_id, fullname }) => (
                <option key={staff_id} value={fullname}>{fullname}</option>
              ))}
            </select>
          ) : (
            <div className="mt-1">{editData.name || <em>No data</em>}</div>
          )}
        </div>

        {/* Date Received */}
        <div className="mb-4">
          <span className="label-text font-semibold">Date Received</span>
          {isEditing ? (
            <input
              type="date"
              name="dateReceived"
              value={editData.dateReceived?.slice(0, 10) || ""}
              onChange={handleEditChange}
              className="input input-bordered w-full mt-1"
            />
          ) : (
            <div className="mt-1">{editData.dateReceived?.slice(0, 10) || <em>No data</em>}</div>
          )}
        </div>

        {/* Type of Leave */}
        <div className="mb-4">
          <span className="label-text font-semibold">Type of Leave</span>
          {isEditing ? (
            <select
              name="typeOfLeave"
              value={editData.typeOfLeave || ""}
              onChange={handleEditChange}
              className="select select-bordered w-full mt-1"
            >
              <option disabled value="" />
              {leaveData.map(({ leave_id, typeOfLeave }) => (
                <option key={leave_id} value={typeOfLeave}>{typeOfLeave}</option>
              ))}
            </select>
          ) : (
            <div className="mt-1">{editData.typeOfLeave || <em>No data</em>}</div>
          )}
        </div>

        {/* Details */}
        <div className="mb-4">
          <span className="label-text font-semibold">Details</span>
          {isEditing ? (
            <input
              type="text"
              name="details"
              value={editData.details || ""}
              onChange={handleEditChange}
              className="input input-bordered w-full mt-1"
            />
          ) : (
            <div className="mt-1">{editData.details || <em>No data</em>}</div>
          )}
        </div>

        {/* Inclusive Date */}
        <div className="mb-4">
          <span className="label-text font-semibold">Inclusive Date</span>
          {isEditing ? (
            <input
              type="date"
              name="inclusiveDate"
              value={editData.inclusiveDate?.slice(0, 10) || ""}
              onChange={handleEditChange}
              className="input input-bordered w-full mt-1"
            />
          ) : (
            <div className="mt-1">{editData.inclusiveDate?.slice(0, 10) || <em>No data</em>}</div>
          )}
        </div>

        {/* Date Transmitted */}
        <div className="mb-4">
          <span className="label-text font-semibold">Date Transmitted</span>
          {isEditing ? (
            <input
              type="date"
              name="dateTransmitted"
              value={editData.dateTransmitted?.slice(0, 10) || ""}
              onChange={handleEditChange}
              className="input input-bordered w-full mt-1"
            />
          ) : (
            <div className="mt-1">{editData.dateTransmitted?.slice(0, 10) || <em>No data</em>}</div>
          )}
        </div>

        {/* RPMO Receiver */}
        <div className="mb-4">
          <span className="label-text font-semibold">Receiver (RPMO)</span>
          {isEditing ? (
            <select
              name="rpmoReceiver"
              value={editData.rpmoReceiver || ""}
              onChange={handleEditChange}
              className="select select-bordered w-full mt-1"
            >
              <option disabled value="" />
              {rpmoReceiverData.map(({ rpmoReceiver_id, rpmoReceiver }) => (
                <option key={rpmoReceiver_id} value={rpmoReceiver}>
                  {rpmoReceiver}
                </option>
              ))}
            </select>
          ) : (
            <div className="mt-1">{editData.rpmoReceiver || <em>No data</em>}</div>
          )}
        </div>

        {/* Remarks */}
        <div className="mb-4">
          <span className="label-text font-semibold">Remarks</span>
          {isEditing ? (
            <textarea
              name="remarks"
              value={editData.remarks || ""}
              onChange={handleEditChange}
              className="textarea textarea-bordered textarea-sm w-full mt-1"
            />
          ) : (
            <div className="mt-1 whitespace-pre-line">{editData.remarks || <em>No data</em>}</div>
          )}
        </div>
      </div>

      {/* Modal Footer */}
      <div className="modal-action mt-2 pb-4 px-4 flex justify-center">
        {isEditing ? (
          <>
            <button
              type="submit"
              onClick={submitEdit}
              className="btn btn-neutral btn-wide mx-2"
              form="editAFL-form"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="btn btn-outline btn-wide mx-2"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={closeEditModal}
            className="btn btn-wide mx-2"
          >
            Close
          </button>
        )}
      </div>

    </div>
  </dialog>
)}

      {/* Delete Modal */}
      <dialog id="delete-modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <CircleX />
            Confirm Deletion
          </h3>
          <p className="py-4">
            Delete{" "}
            <span className="font-semibold">{selectedForDelete?.typeOfLeave}</span> record of{" "}
            <span className="font-semibold">{selectedForDelete?.name}</span> on{" "}
            <span className="font-semibold">
              {selectedForDelete?.inclusiveDate &&
                new Date(selectedForDelete.inclusiveDate).toLocaleDateString()}
            </span>
            ?
          </p>
          <div className="modal-action">
            <form method="dialog" className="flex gap-2">
              <button className="btn" onClick={() => setSelectedForDelete(null)}>
                Cancel
              </button>
              <button
                className="btn btn-error"
                onClick={async () => {
                  if (selectedForDelete) {
                    try {
                      await onDelete(selectedForDelete.publicId);
                      addLog(`${user.username} deleted AFL record for ${selectedForDelete.name}`);
                    } catch (e) {
                      alert("Delete failed: " + e.message);
                    }
                    setSelectedForDelete(null);
                  }
                }}
              >
                Delete
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}
