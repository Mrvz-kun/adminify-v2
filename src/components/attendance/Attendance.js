import React, { useState, useEffect } from "react";
import { staffData, activityData } from "../../../public/data/DropdownData";
import { useAttendance } from "@/hooks/useAttendance";
import AttendanceTable from "../attendance/AttendanceTable";
import { Zoom, toast } from 'react-toastify';
import { Pencil, Printer } from "lucide-react";
import useAuth from '@/hooks/useAuth';
import { useActivityLog } from '@/context/LogContext';


export default function AttendancePage({ setActiveTab }) {
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
    attendances: hookAttendances,
    loading,
    error,
    createAttendance,
    deleteAttendance,
    updateAttendance,
    fetchAttendances,
  } = useAttendance();

  const [attendances, setAttendances] = useState([]);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    inclusiveDate: "",
    activity: "",
    details: "",
    remarks: "",
    AFLVerification: "",
  });

  // Fetch attendance list on mount and when hookAttendances changes
  useEffect(() => {
    // Sync local attendances state with hook data
    setAttendances(hookAttendances);
  }, [hookAttendances]);

  const resetForm = () => {
    setFormData({
      name: "",
      inclusiveDate: "",
      activity: "",
      details: "",
      remarks: "",
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      let updatedForm = { ...prev, [name]: value };

      // When activity changes, set AFLVerification accordingly
      if (name === "activity") {
        updatedForm.AFLVerification = value === "On Leave" ? "Pending" : "N/A";
      }

      return updatedForm;
    });

    setErrors((prev) => ({ ...prev, [name]: "" }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate fields (except remarks)
    let validationErrors = {};
    Object.keys(formData).forEach((key) => {
      if (key !== "remarks" && !formData[key]?.toString().trim()) {
        validationErrors[key] = "Please fill out this field.";
      }
    });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;


    try {
      const dataToSend = {
        ...formData,
        AFLVerification: formData.activity === "On Leave" ? "Pending" : "N/A",
        inclusiveDate: new Date(formData.inclusiveDate).toISOString(),
        remarks: formData.remarks || "",
        encodedBy: user?.username || "Unknown", 
      };

      // Create attendance record via hook fn
      const newRecord = await createAttendance(dataToSend);
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

      // Update local attendances state to add new record at the top
      setAttendances((prev) => [newRecord, ...prev]);

      resetForm();
      document.getElementById("modal").close();
      addLog(`${user.username} created attendance record for ${formData.name}`);

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
      await deleteAttendance(publicId);
      setAttendances((prev) => prev.filter((a) => a.publicId !== publicId));
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

const handleUpdate = async (publicId, updatedData) => {
  try {
    const AFLVerification =
      updatedData.activity === "On Leave"
        ? updatedData.AFLVerification || "Pending"
        : "N/A"; // ✅ Force "N/A" if not On Leave

    const updatedRecord = await updateAttendance(publicId, {
      ...updatedData,
      AFLVerification,
    });

    setAttendances((prev) =>
      prev.map((a) => (a.publicId === publicId ? updatedRecord : a))
    );
  } catch (err) {
    alert("Update failed: " + err.message);
  }
};



  return (
    <>
      <div className="w-full p-6">
        <div className="flex justify-end gap-4">
          <button
            className="btn btn-neutral"
            onClick={() => document.getElementById("modal").showModal()}
          >
            <Pencil className="size-[1.2em] mr-2" />
            Compose
          </button>
          <button
            className="btn btn-neutral px-8"
            onClick={() => setActiveTab('print')}
          >
            <Printer className="size-[1.2em]" />
            Print
          </button>
        </div>

        {/*Attendance Entry Modal */}
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

            <div id="modal-contents" className="p-2 flex-grow overflow-y-auto">
              <h2 className="font-bold text-lg mb-4 border-b border-neutral-content py-2">
                Attendance 
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
                    <span className="label-text font-semibold">Activity</span>
                    <select
                      value={formData.activity}
                      onChange={handleChange}
                      name="activity"
                      className="select select-bordered w-full mt-1"
                    >
                      <option disabled value="" />
                      {activityData.map(({ activity_id, activity }) => (
                        <option key={activity_id} value={activity}>
                          {activity}
                        </option>
                      ))}
                    </select>
                    {errors.activity && (
                      <p className="text-error text-xs">{errors.activity}</p>
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


        {/* Pass current attendances and handlers to AttendanceTable */}
        <AttendanceTable
          attendances={attendances}
          loading={loading}
          error={error}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
        />
      </div>
    </>
  );
}
