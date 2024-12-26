import React, { useState, useEffect } from "react";
import TableSuper from "./TableSuper";
import back19 from "../../assests/back19.png";
import back15 from "../../assests/back15.png";
import back13 from "../../assests/back13.png";
import { BASE_URL } from "../../constants";
import SuperAdminSidebar from "../SuperAdmin/SuperAdminSidebar";
import TETable from "./TETable";
import AdminLocation from "./AdminLocation";

const AtticDashboard = () => {
  const [manager, setManager] = useState([]);
  const [employee, setEmployee] = useState([]);
  const [viewOption, setViewOption] = useState("manager"); // Default view option

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/manager/getAllManagers`);
        if (response.ok) {
          const data = await response.json();
          setManager(data);
        } else {
          console.error("Failed to fetch managers");
        }
      } catch (error) {
        console.error("Error fetching managers:", error);
      }
    };

    fetchManagers();
  }, []);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/employeeRegistration`);
        if (response.ok) {
          const data = await response.json();
          setEmployee(data);
        } else {
          console.error("Failed to fetch employees");
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEmployees();
  }, []);

  const uniqueBranches = new Set(manager.map((item) => item.branch_name));
  const totalBranches = uniqueBranches.size;

  return (
    <div className="lg:flex block bg-cover bg-center min-h-screen relative bg-[#e8effe]">
      <SuperAdminSidebar />
      <div className="flex-1 p-6 bg-opacity-75 bg-white relative">
        <div className="lg:text-4xl md:text-2xl text-4xl font-bold bg-[#5443c3] h-auto text-white w-full lg:h-24 mb-5 py-5 pl-5 flex flex-col items-left justify-start">
          Attic's Chat-up Dashboard
        </div>

        {/* Dropdown menu for selecting view */}
        <div className="mb-4">
          <label htmlFor="viewOption" className="mr-2 font-semibold">
            View:
          </label>
          <select
            id="viewOption"
            className="p-2 border border-gray-300 rounded"
            value={viewOption}
            onChange={(e) => setViewOption(e.target.value)}
          >
            <option value="manager">Manager</option>
            <option value="TE">TE</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Display different content based on selected view */}
        {viewOption === "manager" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div
              className="p-4 rounded-lg shadow-lg bg-cover"
              style={{ backgroundImage: `url(${back15})` }}
            >
              <div className="lg:text-xl text-lg font-bold text-white">
                No of Registered Employees
              </div>
              <div className="text-2xl text-white">{employee.length}</div>
            </div>
            <div
              className="p-4 rounded-lg shadow-lg  bg-cover"
              style={{ backgroundImage: `url(${back19})` }}
            >
              <div className="lg:text-xl text-lg font-bold text-white">
                No of Registered Branch Managers
              </div>
              <div className="text-2xl text-white">{manager.length}</div>
            </div>
            <div
              className="p-4 rounded-lg shadow-lg  bg-cover"
              style={{ backgroundImage: `url(${back13})` }}
            >
              <div className="lg:text-xl text-lg font-bold text-white">
                No of Branches
              </div>
              <div className="text-2xl text-white">{totalBranches}</div>
            </div>
          </div>
        )}

        {viewOption === "TE" && (
          <div>
            {/* Replace with TE specific content or component */}
            <p>TE Details</p>
          </div>
        )}

        {/* Table or component based on selected view */}
        <div className="w-full">
          {viewOption === "manager" && <TableSuper />}
          {viewOption === "TE" && <TETable />}
          {viewOption === "admin" && <AdminLocation />}
        </div>
      </div>
    </div>
  );
};

export default AtticDashboard;
