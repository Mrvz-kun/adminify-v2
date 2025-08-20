import { useState, useEffect } from "react";

export const useStock = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
  console.log("🌀 Initial fetchStocks triggered");
  fetchStocks();
}, []);

  // ✅ Fetch all stocks
  const fetchStocks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stocks");
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      setStocks(data);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load stocks.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add a new stock
  const addStock = async (stockData) => {
    try {
      const res = await fetch("/api/stocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stockData),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setStocks((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      throw err;
    }
  };

  // ✅ Update stock by stockId
  const updateStock = async (stockId, updates) => {
    try {
      const res = await fetch(`/api/stocks/${stockId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setStocks((prev) =>
        prev.map((s) => (s.stockId === stockId ? data : s))
      );
      return data;
    } catch (err) {
      throw err;
    }
  };

  // ✅ Delete stock by stockId
  const deleteStock = async (stockId) => {
    try {
      const res = await fetch(`/api/stocks/${stockId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setStocks((prev) => prev.filter((s) => s.stockId !== stockId));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  return {
    stocks,
    loading,
    error,
    fetchStocks,
    setStocks,
    addStock,
    updateStock,
    deleteStock,
  };
};
