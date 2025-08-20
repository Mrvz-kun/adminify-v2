// components/BincardTable.jsx
"use client";

import { useCallback } from "react";
import { Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import Modal from "../ui/Modal";
import BincardIssueForm from "./BincardIssueForm";
import { staffData } from "../../../public/data/DropdownData";
import { Zoom, toast } from "react-toastify";

export default function Bincard({ stkRefId, stock, updateStockBalance, fetchStocks }) {
  const [bincards, setBincards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openBincardFormModal, setOpenBincardFormModal]  = useState(false);
  const [editingId, setEditingId] = useState(null); // track which row is being edited
  const [editData, setEditData] = useState({});     // holds editable values

  const sortByCreatedAt = (data) =>
    [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const fetchBincards = useCallback(async () => {
    try {
      const res = await fetch(`/api/bincards?stkRefId=${stkRefId}`);
      const data = await res.json();
      setBincards(sortByCreatedAt(data)); // ✅ ensure sorted even after re-fetch
    } catch (err) {
      console.error("Error fetching bincards:", err);
    } finally {
      setLoading(false);
    }
  }, [stkRefId]); // ✅ now it's safe

  useEffect(() => {
    if (!stkRefId) return;
    setLoading(true);
    fetchBincards();
  }, [stkRefId, fetchBincards]); // ✅ no more warning

  if (!stkRefId) return null;

  // 🔁 Unique list of stations
  const officialStations = [...new Set(staffData.map((s) => s.official_station))];

  // ✅ Dynamically filter names based on the selected official station
  const filteredStaff = staffData.filter(
    (staff) => staff.official_station === editData.issuanceOffice
  );

const handleSave = async (bincardId) => {
  try {
    // Fetch the previous latest balance (excluding current entry)
    const response = await fetch(`/api/bincards?stkRefId=${editData.stkRefId}`);
    const bincardEntries = await response.json();

    if (!Array.isArray(bincardEntries)) throw new Error("Invalid bincard data");

    // Sort and find the entry before the one being edited
    const sorted = bincardEntries
      .filter((entry) => entry.bincardId !== bincardId)
      .sort((a, b) => new Date(a.dateReceived) - new Date(b.dateReceived));

    const previous = sorted[sorted.length - 1]; // latest before current
    const previousBalance = previous?.bincardBalance || 0;

    const newBalance =
      Number(previousBalance) +
      Number(editData.receiptQty || 0) -
      Number(editData.issuanceQty || 0);

    // Include recalculated balance in the update
    const payload = {
      ...editData,
      bincardBalance: newBalance,
    };

    const res = await fetch(`/api/bincards/${bincardId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Update failed");

    toast.success("Bincard updated!");
    setEditingId(null);
    fetchBincards(); // refresh UI
    await fetchStocks?.();

  } catch (err) {
    console.error("Save failed:", err);
    toast.error("Failed to update bincard: " + err.message);
  }
};



  return (
    <>
    <div className="w-full p-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <div>
          <h1 className="text-2xl font-bold">BINCARD</h1>
        </div>
        <div className="flex justify-end">
          <button
            className="btn btn-neutral px-8"
            onClick={() => setOpenBincardFormModal(true)}
          >
            <Plus className="size-[1.2em] mr-2" /> Issue Stock
          </button>
        </div>
      </div>

      {/* Item, Description, Stock No - Right Aligned Vertical Stack */}
      <div className="py-4 px-4 flex flex-col text-lg font-black mt-6 mb-4">
        <span>
          <span className="">{stock.article} - {stock.description}</span>
        </span>
        <span>
          <span className="">{stock.stockNo}</span>
        </span>
      </div>

      {/*Table*/}
      <div className="overflow-x-auto max-h-[500px] min-h-[300px] h-1/2 overflow-y-scroll border border-base-300 rounded-md">
        <table className="table table-zebra text-sm w-full">
          <thead className="bg-base-200">
            <tr>
              <th rowSpan={2} className="w-[150px]">Date</th>
              <th rowSpan={2} className="w-[200px]">Ref. RIS</th>
              <th rowSpan={2} className="w-[100px]">Receipt <br/> Quantity</th>
              <th colSpan={3} className="text-center">Issuance</th>
              <th rowSpan={2} className="w-[70px]">Balance</th>
              <th rowSpan={2}>Issued By</th>
              <th rowSpan={2}></th>
            </tr>
            <tr>
              <th  className="w-[70px]">Quantity</th>
              <th className="w-[280px]">Office</th>
              <th className="w-[280px]">Name</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={11} className="text-center text-gray-400 italic py-4">
                  Loading...
                </td>
              </tr>
            ) : bincards.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center text-gray-500 italic py-4">
                  No entries found for this stock.
                </td>
              </tr>
            ) : (
              bincards.map((entry) => (
                <tr key={entry.bincardId}>
                  <td>
                    {editingId === entry.bincardId ? (
                      <input
                        type="date"
                        value={editData.dateReceived?.slice(0, 10) || ""}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            dateReceived: e.target.value,
                          }))
                        }
                        className="input input-bordered w-full"
                      />
                    ) : (
                      new Date(entry.dateReceived).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    )}
                  </td>

                  <td>
                    {editingId === entry.bincardId ? (
                      <input
                        type="text"
                        value={editData.risRef || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, risRef: e.target.value })
                        }
                        className="input input-bordered"
                      />
                    ) : (
                      entry.risRef || "-"
                    )}
                  </td>

                  <td>{entry.receiptQty}</td>
                  
                  <td>
                    {editingId === entry.bincardId ? (
                      <input
                        type="number"
                        value={editData.issuanceQty || 0}
                        onChange={(e) =>
                          setEditData({ ...editData, issuanceQty: Number(e.target.value) })
                        }
                        className="input input-bordered"
                      />
                    ) : (
                      entry.issuanceQty || "-"
                    )}
                  </td>

                  <td>
                    {editingId === entry.bincardId ? (
                      <select
                        value={editData.issuanceOffice || ""}
                        onChange={(e) => {
                          const selectedStation = e.target.value;
                          setEditData((prev) => ({
                            ...prev,
                            issuanceOffice: selectedStation,
                            issuanceName: "", // 🧹 clear name when station changes
                          }));
                        }}
                        className="select select-bordered w-full"
                      >
                        <option value="">Select Office</option>
                        {officialStations.map((station) => (
                          <option key={station} value={station}>
                            {station}
                          </option>
                        ))}
                      </select>
                    ) : (
                      entry.issuanceOffice || "-"
                    )}
                  </td>


                  <td>
                    {editingId === entry.bincardId ? (
                      <select
                        value={editData.issuanceName || ""}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            issuanceName: e.target.value,
                          }))
                        }
                        className="select select-bordered w-full"
                      >
                        <option disabled value="" />
                        {filteredStaff.map(({ staff_id, fullname }) => (
                          <option key={staff_id} value={fullname}>
                            {fullname}
                          </option>
                        ))}
                      </select>
                    ) : (
                      entry.issuanceName || "-"
                    )}
                  </td>

                  <td>{entry.bincardBalance}</td>
                  <td>{entry.issuedBy}</td>
                  <td className="text-center">
                    {entry.issuedBy !== "Jefferson N. Casugay" && (
                      editingId === entry.bincardId ? (
                        <>
                          <button
                            className="btn btn-sm btn-neutral mr-1"
                            onClick={() => handleSave(entry.bincardId)}
                          >
                            Save
                          </button>
                          <button
                            className="btn btn-sm"
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => {
                            setEditingId(entry.bincardId);
                            setEditData(entry); // populate with current data
                          }}
                        >
                          Edit
                        </button>
                      )
                    )}
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Bincard Form Modal */}
      <Modal isOpen={openBincardFormModal} onClose={() => setOpenBincardFormModal(false)}>
        <BincardIssueForm onClose={() => setOpenBincardFormModal(false)} 
        stock={stock}
        onSuccess={(entry) => {
          // Optimistically update table
          setBincards(prev => sortByCreatedAt([entry, ...prev]));

          // Background re-fetch to ensure accuracy
          setTimeout(() => fetchBincards(), 500);

        // ✅ Update stock balance in parent/global list
        updateStockBalance?.(entry.stkRefId, entry.bincardBalance);
        }}
              />
      </Modal>

    </div>
    </>
    
  );
}
