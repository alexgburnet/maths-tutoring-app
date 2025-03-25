// routesConfig.js
import { FaTachometerAlt, FaCalendarAlt, FaShieldAlt } from "react-icons/fa";

export const ROUTES = [
  {
    label: "Dashboard",
    path: "/dashboard",
    roles: ["user", "admin"],
    icon: FaTachometerAlt, // Not JSX
  },
  {
    label: "Bookings",
    path: "/bookings",
    roles: ["user", "admin"],
    icon: FaCalendarAlt,
  },
  {
    label: "Admin Panel",
    path: "/admin",
    roles: ["admin"],
    icon: FaShieldAlt,
  },
];