import React, { useState, useEffect } from 'react'
import useAuth from "@/hooks/useAuth";
import useAddStock from '@/hooks/useAddStock';
import { articleData, unitMeasureData } from "../../../public/data/Stocks";
import { Zoom, toast } from "react-toastify";
import { nanoid } from "nanoid";

export default function AddStockForm({ stock, onClose, onStockAdded }) {
    const { user } = useAuth();
    const { createAddStock } = useAddStock();

    const [formData, setFormData] = useState(() => ({
        dateReceived: "",
        risNo: "",
        stockNo: "",
        addQty: "",
        remarks: "",
    }));

    useEffect(() => {
    if (user) {
        setFormData((prev) => ({
        ...prev,
        createdBy: user.username || 'Unknown',
        }));
    }
    }, [user]);

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = async (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    const validate = () => {
        const validationErrors = {};
        const exempt = ["remarks"];
        Object.entries(formData).forEach(([key, val]) => {
        if (!exempt.includes(key) && !val?.toString().trim()) {
            console.log(`⚠️ Missing or empty: ${key}`);
            validationErrors[key] = "This field is required.";
        }
        });

        const qty = Number(formData.addQty);
        console.log("🔍 Validating addQty:", formData.addQty, "→", qty);

        // ✅ Specific validation for addQty
        if (
            !formData.addQty ||
            isNaN(Number(formData.addQty)) ||
            Number(formData.addQty) <= 0
        ) {
            validationErrors.addQty = 'Quantity must be a number greater than 0';
        }

        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;
        setLoading(true);

        const newEntry = {
            stockRefId: stock.stockId,
            ...formData,
            createdBy: user.username || "Unknown",
        };

        const result = await createAddStock(newEntry);

        if (result) {
            try {
            // 1. PATCH stock balance
            const patchRes = await fetch(`/api/stocks/${stock.stockId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ addQty: Number(formData.addQty) }),
            });

            const patchData = await patchRes.json();
            if (!patchRes.ok) {
                throw new Error(patchData.error || "Stock balance update failed");
            }

            // 2. Calculate new bincard balance = latest balance + addQty
            const latestBalance = stock.stockBalance || 0;
            const addQty = Number(formData.addQty);
            const updatedBalance = latestBalance + addQty;

            // 3. POST to /api/bincard
            const bincardRes = await fetch("/api/bincards", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                stkRefId: stock.stockId,
                dateReceived: formData.dateReceived,
                risRef: formData.risNo,
                receiptQty: addQty,
                issuanceQty: addQty,
                issuanceOffice: "POO La Union",
                issuanceName: "Marvin B. Sison",
                bincardBalance: updatedBalance,
                issuedBy: "Jefferson N. Casugay",
                bincardId: `bin-${nanoid(6)}`,
                }),
            });

            const bincardData = await bincardRes.json();
            if (!bincardRes.ok) {
                throw new Error(bincardData.error || "Failed to record Bincard");
            }

            toast.success("Stock added & Bincard recorded!");
            onStockAdded?.();
            onClose();

            } catch (err) {
            toast.error("Stock updated, but Bincard failed.");
            console.error("Bincard error:", err);
            }
        } else {
            toast.error("Failed to add stock.");
        }

        setLoading(false);
    };


    return (
        <>
            <h2 className="sticky top-0 z-10 bg-base-100 mb-4 border-b border-neutral-content py-2">
                <div className="font-bold text-lg">
                    {stock.article}
                    <span className="badge badge-neutral ml-2 text-xs px-2">Add</span>
                </div>
                <div className="text-sm font-normal mt-1">
                    {stock.description}
                </div>
                <div className="text-sm font-normal mt-1">
                    {stock.stockNo}
                </div>
            </h2>
                
            <form  onSubmit={handleSubmit} className="text-sm pt-4 p-2">

                {/* Date Received*/}
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

                {/* RIS Number */}
                <div className="mb-4">
                    <label className="block">
                    <span className="label-text font-semibold">RIS Number</span>
                    <input
                        value={formData.risNo}
                        onChange={handleChange}
                        name="risNo"
                        type="text"
                        className="input input-bordered w-full mt-1"
                    />
                    {errors.risNo && <p className="text-error text-xs">{errors.risNo}</p>}
                    </label>
                </div>

                {/* Stock Number */}
                <div className="mb-4">
                    <label className="block">
                    <span className="label-text font-semibold">Stock Number </span><span className='text-xs'>(Other)</span>
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
        
                {/* Quantity */}
                <div className="mb-4">
                    <label className="block">
                        <span className="label-text font-semibold">Quantity</span>
                    </label>
                    <input
                        type="number"
                        name="addQty"
                        value={formData.addQty ?? ""}
                        onChange={handleChange}
                        className="input input-bordered w-full mt-1"
                    />
                    {errors.addQty && <p className="text-error text-xs">{errors.addQty}</p>}
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

                {/* Actions */}
                <div className="modal-action mb-4 py-6 flex justify-center mt-auto">
                    <button
                        type="submit"
                        className="btn btn-neutral btn-wide mx-2"
                        disabled={loading}
                    >
                        Submit
                    </button>
                    <button
                        type="button"
                        className="btn btn-wide mx-2"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                </div>

            </form> 
        </>
    )
}