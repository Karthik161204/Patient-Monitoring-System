import { useAuth } from "../context/AuthContext";

const Navbar = ({ title }) => {
  const { user } = useAuth();

  return (
    <header className="topbar">
      <h2>{title}</h2>
      {user && <span className="topbar-user">{user.name}</span>}
    </header>
  );
};

export default Navbar;
