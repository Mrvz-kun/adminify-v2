"use client";

import React, { useEffect, useState } from "react";
import { Zoom, toast } from "react-toastify";
import { articleData, unitMeasureData } from "../../../public/data/Stocks";
import useAuth from "@/hooks/useAuth";
import StockRegInfo from "./StockRegisterInfo";

export default function StockRegisterForm({ onCancel, onClose, onStockAdded }) {
  const { user } = useAuth();

  const [formData, setFormData] = useState(() => ({
    stockNo: "",
    article: "",
    description: "",
    unitMeasure: "",
    stockBalance: "",
    remarks: "",
    
    /*Bincard Formdata*/
    dateReceived: '',
    risRef: '',
    receiptQty: '',
    issuanceQty: '',
    issuanceOffice: '',
    issuanceName: '',
    bincardBalance: '',
    issuedBy: '',
  }));

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);


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
    const exempt = ["remarks", "risRef"];
    Object.entries(formData).forEach(([key, val]) => {
      if (!exempt.includes(key) && !val?.toString().trim()) {
        console.log(`⚠️ Missing or empty: ${key}`);
        validationErrors[key] = "This field is required.";
      }
    });
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleConfirm = async (e) => {
     e.preventDefault();
    const isValid = validate();
    if (!isValid) {
      toast.warn("Please fill all require fields", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Zoom,
      });
      console.log("Validation failed:", errors);
      return;
    }

    console.log("Validation passed. Switching to preview...");
    setLoading(true);

    // Optional: delay for animation effect
    setTimeout(() => {
      setLoading(false);
      setShowPreview(true);
    }, 500); // 0.5s delay to simulate loading spinner
  };



const handleChange = (e) => {
  const { name, value } = e.target;

  setFormData((prev) => {
    const updated = { ...prev, [name]: value };

    // Sync other values based on bincardBalance
    if (name === "bincardBalance") {
      updated.stockBalance = value;
      updated.receiptQty = value;
      updated.issuanceQty = value;
    }

    // Set fixed values
    updated.issuanceOffice = "POO La Union";
    updated.issuanceName = "Marvin B. Sison";
    updated.issuedBy = "Jefferson N. Casugay"

    return updated;
  });

  setErrors((prev) => ({ ...prev, [name]: "" }));
};


if (showPreview) {
  return (
    <>
      <StockRegInfo
        data={formData}
        onBack={() => setShowPreview(false)}
        closePreview={() => {
          setShowPreview(false);
          onClose(); // ✅ also closes modal from parent
        }}
        onStockAdded={onStockAdded}
  />
    </>
  );
}


  return (
    <div>
      <h2 className="font-bold text-lg mb-4 border-b border-neutral-content py-2">
        Register Stock
        <span className="badge badge-neutral ml-2 text-xs px-2">New</span>
      </h2>

      <form onSubmit={handleConfirm} className="text-sm pt-4 p-2">
        {/* Stock Number */}
        <div className="mb-4">
          <label className="block">
            <span className="label-text font-semibold">Stock Number</span>
            <input
              value={formData.stockNo}
              onChange={handleChange}
              name="stockNo"
              type="text"
              className="input input-bordered w-full mt-1"
            />
            {errors.stockNo && <p className="text-error text-xs">{errors.stockNo}</p>}
          </label>
        </div>

        {/* Article */}
        <div className="mb-4">
          <label className="block">
            <span className="label-text font-semibold">Article</span>
            <select
              value={formData.article}
              onChange={handleChange}
              name="article"
              className="select select-bordered w-full mt-1"
            >
              <option disabled value="" />
              {articleData.map(({ id, articleName }) => (
                <option key={id} value={articleName}>
                  {articleName}
                </option>
              ))}
            </select>
            {errors.article && <p className="text-error text-xs">{errors.article}</p>}
          </label>
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block">
            <span className="label-text font-semibold">Description</span>
            <input
              value={formData.description}
              onChange={handleChange}
              name="description"
              type="text"
              className="input input-bordered w-full mt-1"
            />
            {errors.description && <p className="text-error text-xs">{errors.description}</p>}
          </label>
        </div>

        {/* Unit of Measure */}
        <div className="mb-4">
          <label className="block">
            <span className="label-text font-semibold">Unit of Measure</span>
            <select
              value={formData.unitMeasure}
              onChange={handleChange}
              name="unitMeasure"
              className="select select-bordered w-full mt-1"
            >
              <option disabled value="" />
              {unitMeasureData.map(({ id, unitMeasureName }) => (
                <option key={id} value={unitMeasureName}>
                  {unitMeasureName}
                </option>
              ))}
            </select>
            {errors.unitMeasure && <p className="text-error text-xs">{errors.unitMeasure}</p>}
          </label>
        </div>
        

        {/* Remarks */}
        <div className="mb-4 ">
          <label className="block">
            <span className="label-text font-semibold">Remarks</span>
            <input
              value={formData.remarks}
              onChange={handleChange}
              name="remarks"
              type="text"
              className="input input-bordered w-full mt-1"
            />
            {errors.remarks && <p className="text-error text-xs">{errors.remarks}</p>}
          </label>
        </div>

        {/* BINCARD */}
        <h2 className="font-bold text-lg my-8 py-2 mt-12 border-b border-neutral-content">
          Bincard 
          <span className="badge badge-neutral ml-2 text-xs px-2">Setup</span>
        </h2>
        
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
            {errors.dateReceived && <p className="text-error text-xs">{errors.dateReceived}</p>}
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
            {errors.risRef && <p className="text-error text-xs">{errors.risRef}</p>}
          </label>
        </div>

        {/* Balance */}
        <div className="mb-4">
          <label className="block">
            <span className="label-text font-semibold">Balance</span>
          </label>
          <input
            type="number"
            name="bincardBalance"
            value={formData.bincardBalance ?? ""}
            onChange={handleChange}
            className="input input-bordered w-full mt-1"
          />
          {errors.bincardBalance && <p className="text-error text-xs">{errors.bincardBalance}</p>}
        </div>
        

        {/* Actions */}
        <div className="modal-action mb-4 py-6 flex justify-center mt-auto">
          <button
            type="submit"
            className="btn btn-neutral btn-wide mx-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner mr-2" />
                Preparing Preview
              </>
            ) : (
              "Confirm"
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-wide mx-2"
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
