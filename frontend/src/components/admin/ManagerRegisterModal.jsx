import React, { useState } from "react";
import Sidebar from "./Sidebar";
import ManagerDetails from "../manager/ManagerDetails";
import { BASE_URL } from "../../constants";
import CsvFileUpload from '../utility/CsvFileUpload';
import axios from "axios";
import Swal from "sweetalert2";

const ManagerRegisterModal = () => {
  const [formData, setFormData] = useState({
    manager_Id: "",
    manager_name: "",
    manager_email: "",
    manager_password: "",
    manager_phone: "",
    manager_address: "",
    branch_city: "",
    branch_state: "",
    branch_pincode: "",
    branch_name: "",
    branch_address: "",
    group: [{ name: "", grade: "" }],
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const [field, index] = name.split("-");
    if (index !== undefined) {
      const updatedGroup = [...formData.group];
      updatedGroup[index][field] = value;
      setFormData({ ...formData, group: updatedGroup });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleAddGroup = () => {
    setFormData({ ...formData, group: [...formData.group, { name: "", grade: "" }] });
  };

  const handleRemoveGroup = (index) => {
    const updatedGroup = formData.group.filter((_, i) => i !== index);
    setFormData({ ...formData, group: updatedGroup });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/api/manager/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        console.log("Registration Successful");
        setIsModalOpen(false);
        window.location.reload();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Registration failed");
      }
    } catch (error) {
      setError("An error occurred: " + error.message);
    }
  };

  const handleDelete = async () => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to delete users with the Logistic role?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
      });

      if (result.isConfirmed) {
        const response = await axios.delete(`${BASE_URL}/api/manager/managerdelete`);
  
        if (response) {
          Swal.fire('Deleted!', 'Users have been deleted.', 'success');
          window.location.reload();
        } else {
          const errorData = response.data;
          Swal.fire('Failed!', errorData.message || 'Deletion failed', 'error');
        }
      }
    } catch (error) {
      Swal.fire('Error!', 'An error occurred: ' + error.message, 'error');
    }
  };

  return (
    <div className="lg:flex block bg-[#f6f5fb]">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="flex justify-between mb-4 flex-col lg:flex-row">
          <h1 className="text-xl sm:text-2xl font-bold text-[#5443c3]">Manager Details</h1>
          <div className="flex justify-center items-center content-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#5443c3] hover:bg-blue-700 text-white font-bold lg:px-4 py-1 px-2 lg:text-xl text-xs lg:rounded-full w-full h-12 mr-2 mt-4 lg:mt-0"
            >
              Open Registration Form
            </button>
            <CsvFileUpload endpoint="/api/manager/register" />
          </div>
        </div>
        <ManagerDetails />
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 w-full max-w-4xl mx-2 sm:mx-4 md:mx-6 lg:mx-auto xl:mx-auto">
              <h2 className="lg:text-2xl text-xl font-bold mb-4 text-[#5443c3]">Register for Manager</h2>
              {error && <div className="text-red-500 mb-4">{error}</div>}
              <form onSubmit={handleSubmit} className="w-full">
                <div className="flex flex-col md:flex-row md:space-x-4">
                  <div className="md:w-1/2">
                    {[
                      { label: "Manager ID", name: "manager_Id", type: "text" },
                      { label: "Manager Name", name: "manager_name", type: "text" },
                      { label: "Manager Email", name: "manager_email", type: "email" },
                      { label: "Manager Password", name: "manager_password", type: "password" },
                      { label: "Manager Phone", name: "manager_phone", type: "text" },
                      { label: "Manager Address", name: "manager_address", type: "text" }
                    ].map((field, index) => (
                      <div className="mb-4" key={index}>
                        <label className="block text-[#5443c3] text-sm font-bold lg:mb-2" htmlFor={field.name}>
                          {field.label}
                        </label>
                        <input
                          className="shadow appearance-none border rounded w-full lg:py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          id={field.name}
                          type={field.type}
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    ))}
                  </div>
                  <div className="md:w-1/2">
                    {[
                      { label: "Branch City", name: "branch_city", type: "text" },
                      { label: "Branch State", name: "branch_state", type: "text" },
                      { label: "Branch Pincode", name: "branch_pincode", type: "text" },
                      { label: "Branch Name", name: "branch_name", type: "text" },
                      { label: "Branch Address", name: "branch_address", type: "text" }
                    ].map((field, index) => (
                      <div className="mb-4" key={index}>
                        <label className="block text-[#5443c3] text-sm font-bold mb-2" htmlFor={field.name}>
                          {field.label}
                        </label>
                        <input
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          id={field.name}
                          type={field.type}
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <button
                    type="submit"
                    className="bg-[#5443c3] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Register
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Cancel
                  </button>
                  
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerRegisterModal;
