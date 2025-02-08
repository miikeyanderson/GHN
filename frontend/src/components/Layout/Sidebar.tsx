import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const Sidebar = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <NavLink to="/" className="sidebar-item" end>
          Dashboard
        </NavLink>
        <NavLink to="/resources" className="sidebar-item">
          Resources
        </NavLink>
        {user?.role === 'admin' && (
          <NavLink to="/admin" className="sidebar-item">
            Admin
          </NavLink>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
