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
        <DashboardLayout>
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h1 className="text-2xl font-bold mb-4" style={{fontFamily: 'Poppins, sans-serif'}}>¡Bienvenido de nuevo, Miguel!</h1>
                <p className="text-gray-600" style={{fontFamily: 'Poppins, sans-serif'}}>¡Han pasado muchas cosas mientras no has estado!</p>
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;