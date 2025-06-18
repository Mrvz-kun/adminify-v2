import { useState, useEffect } from 'react';
import axios from 'axios';

export function useAttendance() {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all attendance records
  const fetchAttendances = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/attendance');
      setAttendances(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch records');
    } finally {
      setLoading(false);
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
