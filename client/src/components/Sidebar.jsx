import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ items }) => {
  const { logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-title">City Care Hospital</div>
      <nav>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")}
          >
            {item.label}
          </NavLink>
        ))}
        <button className="sidebar-link logout-btn" onClick={logout}>
          Logout
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
