import React, { useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";


export default function BincardFormSetup ({ stock, onBack }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setErrors] = useState({});

  const [formData, setFormData] = useState({
    dateReceived: '',
    risRef: '',
    receiptQty: '',
    issuanceQty: '',
    officialStation: '',
    name: '',
    balance: '',
    issuedBy: '',
  });

    useEffect(() => {
      if (user?.username) {
        setFormData((prev) => ({
          ...prev,
          createdBy: user.username,
        }));
      }
    }, [user]);
  
  const validate = () => {
    const validationErrors = {};
    const exempt = ["risRef", "balance"];
    Object.entries(formData).forEach(([key, val]) => {
      if (!exempt.includes(key) && !val?.toString().trim()) {
        validationErrors[key] = "This field is required.";
      }
    });
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

const handleChange = (e) => {
  const { name, value } = e.target;
  if (e.target.type === 'number' && parseFloat(value) < 0) return; // block negative

  // Convert to integer only for numeric values
  const updatedValue = name === "receiptQty" ? parseInt(value, 10) || "" : value;

  setFormData((prev) => {
    const updatedForm = {
      ...prev,
      [name]: updatedValue,
    };

    // Autofill logic when receiptQty changes
    if (name === "receiptQty") {
      updatedForm.issuanceQty = updatedValue;
      updatedForm.balance = updatedValue;
      updatedForm.name = "Marvin B. Sison";
      updatedForm.officialStation = "POO La Union";
    }

    // Clear name if station is changed manually (if that field still exists)
    if (name === "officialStation") {
      updatedForm.name = "";
    }

    return updatedForm;
  });

  setErrors((prev) => ({ ...prev, [name]: "" }));
};

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
  }

  return (
    <>
      <h2 className="font-bold text-lg mb-4 border-b border-neutral-content py-2">
        Setup Bincard
        <span className="badge badge-neutral ml-2 text-xs px-2">Step 1</span>
      </h2>

      <h2 className="text-lg mb-4 pb-1">
        <div className="flex">
          <span className="w-36">Item:</span>
          <span className="font-bold">{stock?.article || "-"}</span>
        </div>
        <div className="flex">
          <span className="w-36">Description:</span>
          <span className="font-bold">{stock?.description || "-"}</span>
        </div>
        <div className="flex">
          <span className="w-36">Stock No:</span>
          <span className="font-bold">{stock?.stockNo || "-"}</span>
        </div>
      </h2>

      


      <form onSubmit={handleSubmit} className="text-sm pt-4 p-2">

        <div className="mb-4">
        <label className="block">
          <span className="label-text font-semibold">Date Received</span>
          <input
            type="date"
            name="dateReceived"
            value={formData.dateReceived}
            onChange={handleChange}
            className="input input-bordered w-full mt-1"
          />
          {error.dateReceived && <p className="text-error text-xs">{error.dateReceived}</p>}
        </label>
      </div>

        <div className="mb-4">
          <label className="block">
            <span className="label-text font-semibold">Ref.-RIS/Sig.</span>
            <input
              type="text"
              name="risRef"
              value={formData.risRef}
              onChange={handleChange}
              className="input input-bordered w-full mt-1"
            />
          </label>
        </div>

        <div className="mb-4">
            <label className="block">
              <span className="label-text font-semibold">Receipt Quantity</span>
              <input
                type="number"
                name="receiptQty"
                min="0"
                value={formData.receiptQty}
                onChange={handleChange}
                className="input input-bordered w-full mt-1"
              />
              {error.receiptQty && <p className="text-error text-xs">{error.receiptQty}</p>}
          </label>
        </div>

        {/* Auto-filled preview (optional) */}
        <div className="tx-lg mb-4 pb-1">
          <div className="flex">
            <span className="w-48">Issuance Quantity:</span>
            <span className="font-bold">{formData.issuanceQty || "-"}</span>
          </div>
          <div className="flex">
            <span className="w-48">Balance:</span>
            <span className="font-bold">{formData.balance || "-"}</span>
          </div>
          <div className="flex">
            <span className="w-48">Receiver:</span>
            <span className="font-bold">{formData.name || "-"}</span>
          </div>
          <div className="flex">
            <span className="w-48">Official Station:</span>
            <span className="font-bold">{formData.officialStation || "-"}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="modal-action mb-4 py-6 flex justify-center mt-auto">
                    <button
            type="button"
            onClick={onBack}
            className="btn btn-wide mx-2"
            disabled={loading}
          >
            Back
          </button>
          <button
            type="submit"
            className="btn btn-neutral btn-wide mx-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner mr-2" />
                Saving...
              </>
            ) : (
              "Submit"
            )}
          </button>

        </div>
      </form>
    </>
  )
};

