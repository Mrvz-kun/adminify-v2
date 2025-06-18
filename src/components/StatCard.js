import {
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";

const iconMap = {
  users: {
    icon: <Users className="w-5 h-5 text-blue-600" />,
    bg: "bg-blue-100",
  },
  check: {
    icon: <CheckCircle className="w-5 h-5 text-green-600" />,
    bg: "bg-green-100",
  },
  clock: {
    icon: <Clock className="w-5 h-5 text-yellow-600" />,
    bg: "bg-yellow-100",
  },
  alert: {
    icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
    bg: "bg-red-100",
  },
};

export default function StatCard({ icon = "users", label, value }) {
  const { icon: IconElement, bg } = iconMap[icon] || iconMap.users;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center gap-4 transition hover:shadow-md">
      <div className={`p-3 rounded-full ${bg} flex items-center justify-center`}>
        {IconElement}
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-800">{value}</div>
        <div className="text-sm text-gray-500 mt-1">{label}</div>
      </div>
    </div>
  );
}
