import Loader from "../ui/Loader";
import { useState } from "react";
import { toast, Zoom } from "react-toastify";

export default function StockRegInfo({ data, onBack, closePreview, onStockAdded }) {
    const [loadingMessage, setLoadingMessage] = useState("");

  const handleSubmit = async () => {
  try {
    // Show loader for stock
    setLoadingMessage("Registering New Stock...");
    const stockRes = await fetch("/api/stocks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        stockNo: data.stockNo,
        article: data.article,
        description: data.description,
        unitMeasure: data.unitMeasure,
        stockBalance: Number(data.stockBalance),
        remarks: data.remarks,
        createdBy: data.createdBy,
    }),
    });

    const stockResult = await stockRes.json();
    console.log("Stock API Response:", stockResult);

    if (!stockRes.ok) {
    throw new Error(stockResult.message || "Failed to register stock");
    }

    const { stockId } = stockResult; // ✅ Correct variable name

    if (!stockId) throw new Error("Stock ID not returned by backend.");

    // Show loader for bincard
    setLoadingMessage("Setting up Bincard...");
    const bincardRes = await fetch("/api/bincards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stkRefId: stockId, // ✅ assign the generated ID
        dateReceived: new Date(data.dateReceived),
        risRef: data.risRef,
        receiptQty: Number(data.receiptQty),
        issuanceQty: Number(data.issuanceQty),
        issuanceOffice: data.issuanceOffice,
        issuanceName: data.issuanceName,
        issuedBy: data.issuedBy,
        bincardBalance: Number(data.bincardBalance),
      }),
    });
        console.log("Submitting Bincard with:", {
        supplyId: stockId,
        dateReceived: data.dateReceived,
        risRef: data.risRef,
        receiptQty: Number(data.receiptQty),
        issuanceQty: Number(data.issuanceQty),
        issuanceOffice: data.issuanceOffice,
        issuanceName: data.issuanceName,
        issuedBy: data.issuedBy,
        balance: Number(data.bincardBalance),
        });

    if (!bincardRes.ok) throw new Error("Failed to setup bincard");

      toast.success("Stock & Bincard Successfully Created", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: "light",
      transition: Zoom,
      });
    
      
      setTimeout(() => {
        if (onStockAdded) onStockAdded(); // ✅ refetch the stock list
        closePreview(); // ✅ Closes modal all the way to parent
      }, 500); // optional delay so toast shows briefly

  } catch (err) {


    toast.error("Something went wrong while saving.", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: "light",
      transition: Zoom,
      });
    console.error(err);

  } finally {
    setLoadingMessage("");
  }
};


  if (loadingMessage) return <Loader message={loadingMessage} />;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-6 border-b border-neutral-content pb-3">
        Stock Registration Details
      </h2>

      {/* Stock Info Card */}
      <div className="bg-base-200 rounded-xl shadow p-4 mb-6">
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <span className="font-medium text-neutral">Stock No:</span><span>{data.stockNo}</span>
          <span className="font-medium text-neutral">Article:</span><span>{data.article}</span>
          <span className="font-medium text-neutral">Description:</span><span>{data.description}</span>
          <span className="font-medium text-neutral">Unit Measure:</span><span>{data.unitMeasure}</span>
          <span className="font-medium text-neutral">Created By:</span><span>{data.createdBy}</span>
          <span className="font-medium text-neutral">Remarks:</span><span>{data.remarks || "-"}</span>
        </div>
      </div>


      <h2 className="text-xl font-bold mb-6 border-b border-neutral-content pb-3">
        Bincard Setup Details
      </h2>
      {/* Bincard Info Card */}
      <div className="bg-base-200 rounded-xl shadow p-4 mb-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <span className="font-medium text-neutral">Item:</span><span>{data.article}</span>
          <span className="font-medium text-neutral">Description:</span><span>{data.description}</span>
          <span className="font-medium text-neutral">Stock No:</span><span>{data.stockNo}</span>
          <span className="font-medium text-neutral">Date Received:</span><span>{data.dateReceived}</span>
          <span className="font-medium text-neutral">RIS Ref:</span><span>{data.risRef || "-"}</span>
          <span className="font-medium text-neutral">Receipt Qty:</span><span>{data.receiptQty || "-"}</span>
          <span className="font-medium text-neutral">Issuance Qty:</span><span>{data.issuanceQty || "-"}</span>
          <span className="font-medium text-neutral">Issued To:</span><span>{data.issuanceName}</span>
          <span className="font-medium text-neutral">Official Station:</span><span>{data.issuanceOffice}</span>
          <span className="font-medium text-neutral">Balance:</span><span>{data.bincardBalance}</span>
          <span className="font-medium text-neutral">Issued by:</span><span>{data.issuedBy}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <button
          onClick={onBack}
          className="btn btn-outline btn-wide"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          className="btn btn-neutral btn-wide"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
