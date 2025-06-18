import { useState, useEffect } from 'react';
import axios from 'axios';

export function useAttendance() {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all attendance records
  const fetchAttendances = async () => {
    try {
      const { data } = await axios.get('/api/attendance');
      setAttendances(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch records');
    }
  };

  // Create new attendance
  const createAttendance = async (attendanceData) => {
    try {
      const { data } = await axios.post('/api/attendance', attendanceData);
      setAttendances(prev => [data, ...prev]);
      return data;
    } catch (err) {
      throw err;
    }
  };

  // Update attendance by publicId
  const updateAttendance = async (publicId, updatedData) => {
    try {
      const { data } = await axios.put(`/api/attendance/${publicId}`, updatedData);
      setAttendances(prev =>
        prev.map(att => (att.publicId === publicId ? data : att))
      );
      return data;
    } catch (err) {
      throw err;
    }
  };

  // Delete attendance by publicId
  const deleteAttendance = async (publicId) => {
    try {
      await axios.delete(`/api/attendance/${publicId}`);
      setAttendances(prev => prev.filter(att => att.publicId !== publicId));
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchAttendances();
    const interval = setInterval(fetchAttendances, 5000); // Poll every 5 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return {
    attendances,
    loading,
    error,
    fetchAttendances,
    createAttendance,
    updateAttendance,
    deleteAttendance,
  };
}
