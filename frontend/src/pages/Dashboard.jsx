import React from "react";
import NavbarAdmin from "../components/NavbarAdmin";

const DashboardLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <NavbarAdmin />

            {/* Main content area */}
            <div className="ml-16">
                {/* Content wrapper with padding */}
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

const Dashboard = () => {
    return (
        <DashboardLayout></DashboardLayout>
    );
};

export default Dashboard;