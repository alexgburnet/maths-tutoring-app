// routesConfig.js
import { FiHome, FiBookmark, FiCalendar, FiShield, FiBook, FiList } from "react-icons/fi";

export const ROUTES = [
  {
    label: "Dashboard",
    path: "/dashboard",
    roles: ["user", "admin"],
    icon: FiHome, // Not JSX
  },
  {
    label: "Book A Session",
    path: "/make-booking",
    roles: ["user", "admin"],
    icon: FiBookmark,
  },
  {
    label: "Your Bookings",
    path: "/your-bookings",
    roles: ["user", "admin"],
    icon: FiCalendar,
  },
  {
    label: "Notes",
    path: "/notes",
    roles: ["user", "admin"],
    icon: FiBook,
  },
  {
    label: "Worksheets",
    path: "/worksheets",
    roles: ["user","admin"],
    icon: FiList,
  },
  {
    label: "Admin Panel",
    path: "/admin",
    roles: ["admin"],
    icon: FiShield,
  },
];