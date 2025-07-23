import { Outlet } from 'react-router-dom';
// import Sidebar from '../components/Sidebar';

const DashboardLayout = () => {
    return (
        <div className="dashboard-layout">
            {/* <Sidebar /> */}
            <div className="content">
                <Outlet />
            </div>
        </div>
    );
};

export default DashboardLayout;