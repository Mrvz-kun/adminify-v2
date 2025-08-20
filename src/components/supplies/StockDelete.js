import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function StockDelete({ stock, onClose, onDeleted }) {
  const [bincardCount, setBincardCount] = useState(null);
  const [addStockCount, setAddStockCount] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(true);

  useEffect(() => {
    if (!stock) return;

    const fetchCounts = async () => {
      try {
        setLoadingInfo(true);

        const [bincardRes, addStockRes] = await Promise.all([
          fetch(`/api/bincards?stkRefId=${stock.stockId}`),
          fetch(`/api/addstock?stockRefId=${stock.stockId}`)
        ]);

        const bincards = await bincardRes.json();
        const addStocks = await addStockRes.json();

        setBincardCount(Array.isArray(bincards) ? bincards.length : 0);
        setAddStockCount(Array.isArray(addStocks) ? addStocks.length : 0);
      } catch (err) {
        console.error("Failed to fetch related records:", err);
        toast.error("Error fetching stock details.");
      } finally {
        setLoadingInfo(false);
      }
    };

    fetchCounts();
  }, [stock]);

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/stocks/${stock.stockId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error?.message || "Failed to archive stock.");
      }

      toast.success("Stock successfully archived!");
      onClose();
      onDeleted?.();
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to archive stock.");
    }
  };

  if (!stock) return null;

  return (
    <div className="space-y-4 p-2 text-sm">
      <h2 className="text-lg font-bold text-error">Archive Stock</h2>

      <div>
        <p>
          You are about to archive stock:
          <br />
          <span className="font-semibold">{stock.stockNo}</span> —{" "}
          <span className="italic">{stock.description}</span>
        </p>

        <ul className="mt-2 list-disc list-inside text-gray-700">
          <li>
            <strong>Current balance:</strong>{" "}
            {stock.stockBalance ?? 0} units
          </li>
          <li>
            <strong>Bincard entries:</strong>{" "}
            {loadingInfo ? "Loading..." : `${bincardCount} record(s)`}
          </li>
          <li>
            <strong>Stock replenishments:</strong>{" "}
            {loadingInfo ? "Loading..." : `${addStockCount} record(s)`}
          </li>
        </ul>
      </div>

      <p className="text-sm text-warning mt-2">
        This will <strong>hide</strong> the stock from your inventory, but keep its related records for auditing.
      </p>

      <div className="flex justify-end gap-2 mt-4">
        <button className="btn btn-sm" onClick={onClose}>
          Cancel
        </button>
        <button className="btn btn-error btn-sm" onClick={handleDelete}>
          Archive
        </button>
      </div>
    </div>
  );
}
