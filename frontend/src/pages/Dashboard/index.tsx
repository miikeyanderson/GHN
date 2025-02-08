import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const Dashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="dashboard">
      <h1>Welcome, {user?.name}!</h1>
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Resources</h3>
          <p>Access and manage health resources</p>
        </div>
        <div className="dashboard-card">
          <h3>Network</h3>
          <p>Connect with healthcare professionals</p>
        </div>
        <div className="dashboard-card">
          <h3>Analytics</h3>
          <p>View health data and insights</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
