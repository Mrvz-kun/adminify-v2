import { useState, useEffect } from 'react';
import axios from 'axios';

export function useAFL() {
  const [AFLs, setAFLs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all AFL records
  const fetchAFLs = async () => {
    try {
      const { data } = await axios.get('/api/AFL');
      setAFLs(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch records');
    }
  };

  // Create new AFL
  const createAFL = async (AFLData) => {
    try {
      const { data } = await axios.post('/api/AFL', AFLData);
      setAFLs(prev => [data, ...prev]);
      return data;
    } catch (err) {
      throw err;
    }
  };

  // Update AFL by publicId
  const updateAFL = async (publicId, updatedData) => {
    try {
      const { data } = await axios.put(`/api/AFL/${publicId}`, updatedData);
      setAFLs(prev =>
        prev.map(att => (att.publicId === publicId ? data : att))
      );
      return data;
    } catch (err) {
      throw err;
    }
  };

  // Delete AFL by publicId
  const deleteAFL = async (publicId) => {
    try {
      const response = await axios.delete(`/api/AFL/${publicId}`);
      console.log('Delete response:', response.status, response.data);
      setAFLs(prev => prev.filter(att => att.publicId !== publicId));
    } catch (err) {
      console.error('Delete error:', err.response?.data || err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchAFLs();
    const interval = setInterval(fetchAFLs, 5000); // Poll every 5 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return {
    AFLs,
    loading,
    error,
    fetchAFLs,
    createAFL,
    updateAFL,
    deleteAFL,
  };
}
