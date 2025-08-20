import { useState, useEffect } from 'react';

export default function useAddStock() {
  const [addStockEntries, setAddStockEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Fetch all AddStock records
  const fetchAddStockEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/addstock');
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to fetch AddStock');
      setAddStockEntries(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Create a new AddStock record
  const createAddStock = async (newData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/addstock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create AddStock');

      // Optimistically update UI
      setAddStockEntries((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Update existing AddStock record
  const updateAddStock = async (addStockId, updatedData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/addstock/${addStockId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update AddStock');

      // Update in local state
      setAddStockEntries((prev) =>
        prev.map((entry) => (entry.addStockId === addStockId ? data : entry))
      );
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete AddStock record
  const deleteAddStock = async (addStockId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/addstock/${addStockId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete AddStock');

      // Remove from local state
      setAddStockEntries((prev) =>
        prev.filter((entry) => entry.addStockId !== addStockId)
      );
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount
  useEffect(() => {
    fetchAddStockEntries();
  }, []);

  return {
    addStockEntries,
    loading,
    error,
    fetchAddStockEntries,
    createAddStock,
    updateAddStock,
    deleteAddStock,
  };
}
