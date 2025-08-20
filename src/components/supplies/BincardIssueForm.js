import React, { useState, useEffect } from "react";
import useAuth from "@/hooks/useAuth";
import { Zoom, toast } from "react-toastify";
import { staffData } from "../../../public/data/DropdownData";

export default function BincardIssueForm({ stock, loading, onClose, onSuccess, fetchStocks }) {
    const { user } = useAuth();
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState(() => ({
        dateReceived: "",
        risRef: "",
        issuanceQty: "",
        issuanceOffice: "",
        issuanceName: "",
    }));

    useEffect(() => {
    if (user) {
        setFormData((prev) => ({
        ...prev,
        issuedBy: user.username || 'Unknown',
        }));
    }
    }, [user]);

    const officialStations = [...new Set(staffData.map(s => s.official_station))];
    // Filter names based on selected official station
    const filteredStaff = staffData.filter(
        (staff) => staff.official_station === formData.issuanceOffice
    );


    const validate = () => {
        const validationErrors = {};
        const exempt = ["remarks", "risRef"];
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

        setFormData((prev) => ({
            ...prev,
            [name]: value,
            ...(name === "issuanceOffice" ? { issuanceName: "" } : {}) 
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        const prevBalance = Number(stock?.stockBalance);
        const issuedQty = Number(formData.issuanceQty);

        if (isNaN(prevBalance) || isNaN(issuedQty)) {
            toast.error("Invalid stock balance or issuance quantity.", { transition: Zoom });
            return;
        }

        const newBalance = prevBalance - issuedQty;

        if (newBalance < 0) {
            toast.error("Issuance quantity exceeds available stock.", { transition: Zoom });
            return;
        }

        const entry = {
            ...formData,
            stkRefId: stock?.stockId,               // required by your backend for updating stock
            bincardBalance: newBalance,             // ✅ will be saved into Bincard.bincardBalance
            issuedBy: user?.username ?? "Unknown",              // stored in Bincard.issuedBy
            encodedAt: new Date().toISOString(),    // optional tracking (can be removed if unused)
        };

        try {
            console.log("📦 Bincard Entry Payload:", entry);
            const res = await fetch("/api/bincards", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(entry),
            });

            if (!res.ok) throw new Error("Failed to save Bincard entry.");
            const savedEntry = await res.json();

            toast.success("Bincard entry saved and stock balance updated.", { transition: Zoom });
            onSuccess?.(savedEntry);  // ✅ hybrid method trigger
            setTimeout(() => {
                fetchStocks?.(); // ✅ force refresh in the background
            }, 1000);
            onClose?.(); // Close modal or form
        } catch (err) {
            console.error("❌ Error saving Bincard entry:", err);
            toast.error("Error saving Bincard entry. Please try again.", { transition: Zoom });
        }
    };


    return (
        <>
            <h2 className="mb-4 border-b border-neutral-content py-2">
                <div className="font-bold text-lg">
                    Issue {stock.article}
                    <span className="badge badge-neutral ml-2 text-xs px-2">New</span>
                </div>
                <div className="text-sm font-normal mt-1">
                    {stock.description}
                </div>
            </h2>

            <form onSubmit={handleSubmit} className="text-sm pt-4 p-2">

                {/* Date */}
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

                {/*RIS Ref*/}
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

                {/* Issuance Qty */}
                <div className="mb-4">
                    <label className="block">
                        <span className="label-text font-semibold">Quantity</span>
                    </label>
                    <input
                        type="number"
                        name="issuanceQty"
                        value={formData.issuanceQty ?? ""}
                        onChange={handleChange}
                        className="input input-bordered w-full mt-1"
                    />
                    {errors.issuanceQty && <p className="text-error text-xs">{errors.issuanceQty}</p>}
                </div>

                {/* Issuance Office */}
                <div className="mb-4">
                    <label className="block">
                    <span className="label-text font-semibold">Official Station</span>
                    <select
                        value={formData.issuanceOffice}
                        onChange={handleChange}
                        name="issuanceOffice"
                        className="select select-bordered w-full mt-1"
                    >
                        <option disabled value="" />
                            {officialStations.map((station, index) => (
                            <option key={index} value={station}>
                                {station}
                            </option>
                            ))}
                    </select>
                    {errors.issuanceOffice && (
                        <p className="text-error text-xs">{errors.issuanceOffice}</p>
                    )}
                    </label>
                </div>

                {/* Issuance Name */}
                <div className="mb-4">
                    <label className="block">
                    <span className="label-text font-semibold">Name</span>
                    <select
                        value={formData.issuanceName}
                        onChange={handleChange}
                        name="issuanceName"
                        className="select select-bordered w-full mt-1"
                    >
                        <option disabled value="" />
                        {filteredStaff.map(({ staff_id, fullname }) => (
                        <option key={staff_id} value={fullname}>
                            {fullname}
                        </option>
                        ))}
                    </select>
                    {errors.issuanceName && (
                        <p className="text-error text-xs">{errors.issuanceName}</p>
                    )}
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