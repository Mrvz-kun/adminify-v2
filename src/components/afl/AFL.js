import React, { useState, useEffect } from "react";
import { Zoom, toast } from 'react-toastify';
import useAuth from '@/hooks/useAuth';
import { useActivityLog } from '@/context/LogContext';
import { staffData, leaveData, rpmoReceiverData } from "../../../public/data/DropdownData";
import AFLTable from "./AFLTable";
import { useAFL } from "@/hooks/useAFL";
import { Pencil } from "lucide-react";

export default function AFLPage() {
    const { user } = useAuth();
    const { addLog } = useActivityLog();
    
      useEffect(() => {
      if (user) {
        setFormData((prev) => ({
          ...prev,
          encodedBy: user.username || 'Unknown',
        }));
      }
    }, [user]);

  const {
    AFLs: hookAFLs,

    loading,
    error,
    createAFL,
    deleteAFL,
    updateAFL,
    fetchAFLs,
  } = useAFL();

  const [AFLs, setAFLs] = useState([]);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    dateReceived: "",
    typeOfLeave: "",
    details: "",
    inclusiveDate: "",
    dateTransmitted: "",
    rpmoReceiver: "",
    remarks: "",
    verified: false,
    
  });


  // Fetch attendance list on mount and when hookAttendances changes
  useEffect(() => {
    // Sync local AFLs state with hook data
    setAFLs(hookAFLs);
  }, [hookAFLs]);

  const resetForm = () => {
    setFormData({
      name: "",
      dateReceived: "",
      typeOfLeave: "",
      details: "",
      inclusiveDate: "",
      dateTransmitted: "",
      rpmoReceiver: "",
      remarks: "",
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate fields (except remarks)
    let validationErrors = {};
    const exemptKeys = ["remarks", "dateTransmitted", "rpmoReceiver"]; // Add any fields to exempt here

    Object.keys(formData).forEach((key) => {
      if (!exemptKeys.includes(key) && !formData[key]?.toString().trim()) {
        validationErrors[key] = "Please fill out this field.";
      }
    });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      const dataToSend = {
        ...formData,
        inclusiveDate: new Date(formData.inclusiveDate).toISOString(),
        dateTransmitted: formData.dateTransmitted || "",
        rpmoReceiverData: formData.rpmoReceiver || "",
        remarks: formData.remarks || "",
        encodedBy: user?.username || "Unknown",
      };

      // Create attendance record via hook fn
      const newRecord = await createAFL(dataToSend);

      toast("Record successfully created!", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Zoom,
      });

      // Update local AFLs state to add new record at the top
      setAFLs((prev) => [newRecord, ...prev]);

      resetForm();
      document.getElementById("modal").close();
      addLog(`${user.username} created AFL record for ${formData.name}`);
    } catch (err) {
        console.error("Submit failed:", err);
        toast("Failed to save record. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Zoom,
        });
    }
  };

  // Pass delete and update handlers down to the table, wrapped to update local state
  const handleDelete = async (publicId) => {
    try {
      await deleteAFL(publicId);
      setAFLs((prev) => prev.filter((a) => a.publicId !== publicId));
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  const handleUpdate = async (publicId, updatedData) => {
    try {
      const updatedRecord = await updateAFL(publicId, updatedData);
      setAFLs((prev) =>
        prev.map((a) => (a.publicId === publicId ? updatedRecord : a))
      );
    } catch (err) {
      alert("Update failed: " + err.message);
    }
  };

  return (
    <>
      <div className="w-full p-6">
        <div className="flex justify-end">
          <button
            className="btn btn-neutral"
            onClick={() => document.getElementById("modal").showModal()}
          >
            <Pencil className="size-[1.2em] mr-2" />
            Compose
          </button>
        </div>

        {/* Modal */}
        <dialog id="modal" className="modal">
          <div className="modal-box w-6/12 max-w-2xl h-5/6 flex flex-col">
            <form method="dialog">
              <button
                id="modal-closebtn"
                className="btn btn-sm rounded-lg btn-ghost absolute right-2 top-2"
              >
                ✕
              </button>
            </form>

            <div id="modal-contents" className="p-2 flex-grow overflow-y-auto ">
              <h2 className="font-bold text-lg mb-4 border-b border-neutral-content py-2">
                Application for Leave (AFL)
                <span className="badge badge-neutral badge-outline ml-2">New</span>
              </h2>

              <form
                onSubmit={handleSubmit}
                name="attendance-form"
                className="text-sm pt-4 p-2"
              >
                <div className="mb-4">
                  <label className="block">
                    <span className="label-text font-semibold">Name</span>
                    <select
                      value={formData.name}
                      onChange={handleChange}
                      name="name"
                      className="select select-bordered w-full mt-1"
                    >
                      <option disabled value="" />
                      {staffData.map(({ staff_id, fullname }) => (
                        <option key={staff_id} value={fullname}>
                          {fullname}
                        </option>
                      ))}
                    </select>
                    {errors.name && (
                      <p className="text-error text-xs">{errors.name}</p>
                    )}
                  </label>
                </div>
                <div className="mb-4 ">
                  <label className="block">
                    <span className="label-text font-semibold">Date Received</span>
                    <input
                      value={formData.dateReceived}
                      onChange={handleChange}
                      name="dateReceived"
                      type="date"
                      className="input input-bordered w-full mt-1"
                    />
                    {errors.dateReceived && (
                      <p className="text-error text-xs">{errors.dateReceived}</p>
                    )}
                  </label>
                </div>
                <div className="mb-4 ">
                  <label className="block">
                    <span className="label-text font-semibold">Type of Leave</span>
                    <select
                      value={formData.typeOfLeave}
                      onChange={handleChange}
                      name="typeOfLeave"
                      className="select select-bordered w-full mt-1"
                    >
                      <option disabled value="" />
                      {leaveData.map(({ leave_id, typeOfLeave }) => (
                        <option key={leave_id} value={typeOfLeave}>
                          {typeOfLeave}
                        </option>
                      ))}
                    </select>
                    {errors.typeOfLeave && (
                      <p className="text-error text-xs">{errors.typeOfLeave}</p>
                    )}
                  </label>
                </div>
                <div className="mb-4 ">
                  <label className="block">
                    <span className="label-text font-semibold">Details</span>
                    <input
                      value={formData.details}
                      onChange={handleChange}
                      name="details"
                      type="text"
                      className="input input-bordered w-full mt-1"
                    />
                    {errors.details && (
                      <p className="text-error text-xs">{errors.details}</p>
                    )}
                  </label>
                </div>
                <div className="mb-4 ">
                  <label className="block">
                    <span className="label-text font-semibold">Inclusive Date</span>
                    <input
                      value={formData.inclusiveDate}
                      onChange={handleChange}
                      name="inclusiveDate"
                      type="date"
                      className="input input-bordered w-full mt-1"
                    />
                    {errors.inclusiveDate && (
                      <p className="text-error text-xs">{errors.inclusiveDate}</p>
                    )}
                  </label>
                </div>
                <div className="mb-4 ">
                  <label className="block">
                    <span className="label-text font-semibold">Date Transmitted</span>
                    <input
                      value={formData.dateTransmitted}
                      onChange={handleChange}
                      name="dateTransmitted"
                      type="date"
                      className="input input-bordered w-full mt-1"
                    />
                    {errors.dateTransmitted && (
                      <p className="text-error text-xs">{errors.dateTransmitted}</p>
                    )}
                  </label>
                </div>
                <div className="mb-4 ">
                  <label className="block">
                    <span className="label-text font-semibold">Receiver (RPMO)</span>
                    <select
                      value={formData.rpmoReceiver}
                      onChange={handleChange}
                      name="rpmoReceiver"
                      className="select select-bordered w-full mt-1"
                    >
                      <option disabled value="" />
                      {rpmoReceiverData.map(({ rpmoReceiver_id, rpmoReceiver }) => (
                        <option key={rpmoReceiver_id} value={rpmoReceiver}>
                          {rpmoReceiver}
                        </option>
                      ))}
                    </select>
                    {errors.rpmoReceiver && (
                      <p className="text-error text-xs">{errors.rpmoReceiver}</p>
                    )}
                  </label>
                </div>
                <div className="mb-4 ">
                  <label className="block">
                    <span className="label-text font-semibold">Remarks</span>
                    <textarea
                      value={formData.remarks}
                      onChange={handleChange}
                      name="remarks"
                      className="textarea textarea-bordered textarea-sm w-full mt-1"
                    ></textarea>
                    {errors.remarks && (
                      <p className="text-error text-xs">{errors.remarks}</p>
                    )}
                  </label>
                </div>

                {/* Action Buttons at the bottom */}
                <div className="modal-action mb-4 py-6 flex justify-center mt-auto">
                  <button
                    id="submit-button"
                    type="submit"
                    className="btn btn-neutral btn-wide mx-2"
                  >
                    Submit
                  </button>
                  <button
                    id="close-button"
                    type="button"
                    onClick={() => {
                      resetForm();
                      document.getElementById("modal").close();
                    }}
                    className="btn btn-wide mx-2"
                  >
                    Close
                  </button>
                </div>
              </form>
            </div>
          </div>
        </dialog>

        {/* Pass current AFLs and handlers to AFLTable */}
        <AFLTable
          AFLs={AFLs}
          loading={loading}
          error={error}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
        />
      </div>
    </>
  );
}
