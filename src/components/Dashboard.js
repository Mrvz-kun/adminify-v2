import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import LeaveToday from "./LeaveToday";
import { useAFL } from "../hooks/useAFL";

export default function Dashboard() {
  const [attendances, setAttendances] = useState([]);
  const { AFLs, loading: loadingAFLs } = useAFL();


  // Fetch attendance records
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await fetch("/api/attendance"); // Replace with real endpoint
        const data = await res.json();
        setAttendances(data);
      } catch (err) {
        console.error("Failed to fetch attendances:", err.message);
      }
    };

    fetchAttendance();
  }, []);

  // Data processing
  const totalStaff = new Set(attendances.map((a) => a.name)).size;
  const onLeaveToday = attendances.filter((a) => {
    const today = new Date().toDateString();
    return (
      a.activity === "On Leave" &&
      new Date(a.inclusiveDate).toDateString() === today
    );
  }).length;

  const pendingVerifications = attendances.filter(
    (a) => a.AFLVerification === "Pending"
  ).length;

  const verifiedAFLs = (AFLs || []).filter((a) => a.verified).length;

  const stats = [
    { label: "Total Staff", value: totalStaff, icon: "users" },
    { label: "Pending Verifications", value: pendingVerifications, icon: "alert" },
    { label: "Verified AFLs", value: verifiedAFLs, icon: "check" },
    { label: "On Leave Today", value: onLeaveToday, icon: "clock" },
  ];

  return (
    <>
          <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
          
        ))}
        <LeaveToday />
      </div>
    </>
  );
}
