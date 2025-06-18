import React, { useState, useEffect } from "react";
import { staffData, activityData } from "../../public/data/DropdownData";
import { useAFL } from "@/hooks/useAFL";
import UnverifiedAFLTable from "./UnverifiedAFLTable";

import useAuth from '@/hooks/useAuth';
import { useActivityLog } from '@/context/LogContext';
import { ToastContainer } from "react-toastify";

import { SquarePen, Trash2, CircleX, ChevronsLeft, ChevronsRight } from "lucide-react";

export default function AttendanceTable({ attendances, onDelete, onUpdate }) {
  const { AFLs, loading, error, updateAFL } = useAFL();
  const [statusFilter, setStatusFilter] = useState("all");
  const [pendingAFLVerification, setPendingAFLVerification] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [selectedForDelete, setSelectedForDelete] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
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


  // Step 1: Clean up AFLVerification if the linked AFL no longer exists
  const usedAFLIds = AFLs.map((afl) => afl.publicId);

const cleanedAttendances = attendances.map((att) => {
  if (!att.AFLVerification || att.AFLVerification === "N/A") return att;

  const isLikelyValid =
    att.AFLVerification.startsWith("afl-") || att.AFLVerification === "N/A";

  return {
    ...att,
    AFLVerification: isLikelyValid ? att.AFLVerification : "Pending",
  };
});


  // Step 2: Apply your existing search filter logic to cleaned data
    const filtered = cleanedAttendances.filter((att) => {
    const verification = att.AFLVerification || ""; // prevent undefined errors

    const matchesSearch =
      att.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      att.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      att.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && verification === "Pending") ||
      (statusFilter === "verified" && verification.startsWith("afl-")) ||
      (statusFilter === "n/a" && verification === "N/A");
    return matchesSearch && matchesStatus;
  });


  const totalPages = Math.ceil(filtered.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + recordsPerPage);

  useEffect(() => {
  setCurrentPage(1); // Reset pagination when filters change
}, [searchTerm, statusFilter]);

const startEdit = (record) => {
  setEditingId(record.publicId);
  setEditData({ ...record }); // shallow copy to prevent mutation
};

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const submitEdit = async () => {
    if (!editData.name || !editData.activity || !editData.inclusiveDate) {
      alert("Please fill required fields");
      return;
    }
    const updatedRecord = { ...editData }; // Add this if needed

    await onUpdate(editingId, editData); // await update before exiting edit mode

    console.log("EditData on Save:", editData);
    addLog(`${user.username} updated attendance record for ${editData.name}`);
    cancelEdit();
  };

  const openModal = (aflVerification) => {
    setModalContent(aflVerification);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalContent(null);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-error">Error: {error}</div>;

const handleAFLSelect = async (selectedId) => {
  if (!editingId) {
    alert("No attendance record is selected for editing.");
    return;
  }

  try {
    const prevId = editData.AFLVerification;

    const isValidId = (id) =>
      id && id !== "Pending" && typeof id === "string" && id.length > 5;

    // Unverify previously verified AFL
    if (isValidId(prevId) && prevId !== selectedId) {
      await updateAFL(prevId, { verified: false });
    }

    // Verify newly selected AFL
    await updateAFL(selectedId, { verified: true });

    // Just update local editData (defer save to submitEdit)
    setEditData((prev) => ({
      ...prev,
      AFLVerification: selectedId,
    }));

    setPendingAFLVerification(selectedId);

    alert("AFL selected. Click 'Save' to confirm the update.");
  } catch (err) {
    alert("Error updating AFL verification: " + err.message);
    console.error("Update failed:", err);
  }

  setModalOpen(false);
};



  return (
    <>
    
      {/* Toast container to render all toasts */}
      <ToastContainer position="top-right" autoClose={5000} />

      {/* Top Row: Search Left, Info + Pagination Right */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 mt-10">
        {/* Search bar aligned left */}
        <div className="flex-1">
          <input
            type="text"
            placeholder={`Search in ${attendances.length} records...`}
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
              Pending Verification{" "}
              <span className="badge badge-sm badge-error text-white p-3.5 rounded-full">
                {
                  attendances.filter(
                    (a) => a.AFLVerification && a.AFLVerification === "Pending"
                  ).length
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
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="n/a">N/A</option>
            </select>
          </div>

          {/* Pagination buttons (reserve space) */}
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
      <div className="overflow-x-auto max-h-1/2 h-1/2 overflow-y-scroll border border-base-300 rounded-md">
        <table className="table w-full">
          <thead className="sticky top-0 bg-base-300 z-10">
            <tr>
              <th style={{ width: "18%" }}>Name</th>
              <th style={{ width: "10%" }}>Inclusive Date</th>
              <th style={{ width: "10%" }}>Activity</th>
              <th style={{ width: "15%" }}>Details</th>
              <th style={{ width: "15%" }}>Remarks</th>
              <th style={{ width: "10%" }}>AFL Verification</th>
              <th style={{ width: "10%" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500 italic">
                  No records found. Try a different search term.
                </td>
              </tr>
            ) : (
              paginated.map((att) =>
                editingId === att.publicId ? (
                  // ✅ EDITING ROW
                  <tr
                    key={att.publicId}
                    className="bg-base-200 cursor-pointer"
                    onDoubleClick={() => openModal(editData.AFLVerification || "No verification info available.")}
                  >
                    <td>
                      <div className="relative">
                        <select
                          name="name"
                          value={editData.name}
                          onChange={handleEditChange}
                          className="select select-bordered w-full"
                        >
                          <option disabled value="" />
                          {staffData.map(({ staff_id, fullname }) => (
                            <option key={staff_id} value={fullname}>
                              {fullname}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    <td>
                      <input
                        type="date"
                        name="inclusiveDate"
                        value={editData.inclusiveDate.slice(0, 10)}
                        onChange={handleEditChange}
                        className="input input-bordered w-full"
                      />
                    </td>
                    <td>
                      <select
                        value={editData.activity}
                        onChange={handleEditChange}
                        name="activity"
                        className="select select-bordered w-full"
                      >
                        <option disabled value="" />
                        {activityData.map(({ activity_id, activity }) => (
                          <option key={activity_id} value={activity}>
                            {activity}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        name="details"
                        value={editData.details}
                        onChange={handleEditChange}
                        className="input input-bordered w-full"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="remarks"
                        value={editData.remarks}
                        onChange={handleEditChange}
                        className="input input-bordered w-full"
                      />
                    </td>
                    <td>
                      <button
                        onClick={() => openModal(editData.AFLVerification || "No verification info available.")}
                        className={editData.AFLVerification === "Pending" ? "text-error cursor-pointer" : "cursor-pointer"}
                      >
                        {editData.AFLVerification || "Edit Verification"}
                      </button>
                    </td>
                    <td>
                      <button onClick={submitEdit} className="btn btn-sm btn-neutral mr-1">
                        Save
                      </button>
                      <button onClick={cancelEdit} className="btn btn-sm">
                        Cancel
                      </button>
                    </td>
                  </tr>
                ) : (
                  // ✅ READ-ONLY ROW
                  <tr key={att.publicId} className="">
                    <td>
                      <span className="inline-flex items-center gap-2">
                        {att.name}
                        {isRecent(att.createdAt) && (
                          <span className="relative -top-1 inline-flex items-center animate-bounce">
                            <div className="status status-info" title="Recently added" />
                            <span className="text-xs text-info ml-1">New</span>
                          </span>
                        )}
                      </span>
                    </td>
                    <td>{new Date(att.inclusiveDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</td>
                    <td>{att.activity}</td>
                    <td>{att.details}</td>
                    <td>{att.remarks}</td>
                    <td className={att.AFLVerification === "Pending" ? "text-error" : ""}>
                      {att.AFLVerification}
                    </td>
                    <td>
                      <button
                        className="btn btn-square btn-sm btn-ghost mr-1"
                        onClick={() => startEdit(att)}
                      >
                        <SquarePen className="size-[1.6em]" strokeWidth={2} />
                      </button>
                      <button
                        className="btn btn-square btn-sm btn-ghost ml-1"
                        onClick={() => {
                          setSelectedForDelete(att);
                          document.getElementById("delete-modal").showModal();
                        }}
                      >
                        <Trash2 className="size-[1.6em]" strokeWidth={2} />
                      </button>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>

        </table>   
      </div>


      {/* Delete Modal */}
      <dialog id="delete-modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <CircleX />
            Confirm Deletion
          </h3>
          <p className="py-4">
            Delete attendance for{" "}
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
                      addLog(`${user.username} deleted attendance record for ${selectedForDelete.name}`);
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

      {/* AFLVerificationTable Modal */}
      {modalOpen && (
        <dialog open className="modal" onClose={closeModal}>
          <div className="modal-box w-8/12 max-w-4xl h-5/6 flex flex-col relative p-0">
            {/* Scrollable Content */}
            <div className="overflow-y-auto p-6 flex-1">
              <UnverifiedAFLTable
                AFLs={AFLs.filter(afl => {
                  const usedAFLIds = attendances.map(att => att.AFLVerification);
                  return !usedAFLIds.includes(afl.publicId);
                })}
                loading={loading}
                error={error}
                onSelectAFL={handleAFLSelect}
                currentRecord={editData}
              />
            </div>

            {/* Sticky Footer Button */}
            <div className="sticky bottom-0 bg-base-100 p-4 flex justify-center border-t border-base-300">
              <form method="dialog">
                <button className="btn btn-neutral w-40" onClick={closeModal}>
                  Close
                </button>
              </form>
            </div>
          </div>
        </dialog>
      )}
    </>
  );
}
