import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <div className="app-layout">
      <Navbar />
      <div className="main-content">
        {isAuthenticated && <Sidebar />}
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
