import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../constants";
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AiOutlineSearch } from "react-icons/ai";

const Modal = ({ show, onClose, employee, onUpdate }) => {
  const [formData, setFormData] = useState({
    ...employee,
    group: employee.group || [],
  });
  const [groupOptions, setGroupOptions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/groups`);
        const data = await response.json();

        const filterGroup = data.filter((group)=>group.department==="Employee")

        if (filterGroup) {
          setGroupOptions(filterGroup); // Load group filterGroup from API
        }
      } catch (error) {
        console.error("Error fetching group data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setFormData({ ...employee, group: employee.group || [] });
  }, [employee]);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleGroupChange = (index, e) => {
    const { name, value } = e.target;
    const updatedGroup = [...formData.group];
    updatedGroup[index][name] = value;

    // Reset grade when group changes
    if (name === "name") {
      updatedGroup[index].grade = "";
    }

    setFormData({
      ...formData,
      group: updatedGroup,
    });
  };

  const addGroup = () => {
    setFormData({
      ...formData,
      group: [...formData.group, { name: "", grade: "" }],
    });
  };

  const removeGroup = (index) => {
    const updatedGroup = formData.group.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      group: updatedGroup,
    });
  };

  const handleUpdate = () => {
    onUpdate(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-20 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[80%] max-w-md">
        <h2 className="lg:text-2xl text-xl font-bold mb-4 text-[#5443c3]">
          Edit Employee Details
        </h2>
        <form>
          {/* Employee Name */}
          <div className="mb-4">
            <label className="block text-[#5443c3] text-sm font-bold mb-2">
              Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          {/* Group and Grade */}
          {formData.group.map((group, index) => (
            <div key={index} className="mb-4">
              {/* Group Name */}
              <div className="mb-2">
                <label className="block text-[#5443c3] text-sm font-bold mb-2">
                  Group Name
                </label>
                <select
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                  name="name"
                  value={group.name}
                  onChange={(e) => handleGroupChange(index, e)}
                >
                  <option value="">Select Group Name</option>
                  {groupOptions.map((option) => (
                    <option key={option._id} value={option.group}>
                      {option.group}
                    </option>
                  ))}
                </select>
              </div>

              {/* Grade */}
              <div className="mb-2">
                <label className="block text-[#5443c3] text-sm font-bold mb-2">
                  Grade
                </label>
                <select
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                  name="grade"
                  value={group.grade}
                  onChange={(e) => handleGroupChange(index, e)}
                  disabled={!group.name}
                >
                  <option value="">Select Grade</option>
                  {groupOptions
                    .filter((option) => option.group === group.name)
                    .map((option) => (
                      <option key={`${option._id}-${option.grade}`} value={option.grade}>
                        {option.grade}
                      </option>
                    ))}
                </select>
              </div>

              {/* Remove Group Button */}
              <button
                type="button"
                onClick={() => removeGroup(index)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Remove Group
              </button>
            </div>
          ))}

          {/* Add Group Button */}
          <button
            type="button"
            onClick={addGroup}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Add Group
          </button>

          {/* Update and Close Buttons */}
          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={handleUpdate}
              className="mr-2 bg-[#5443c3] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Update
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


const EmployeeDetails = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/employeeRegistration`);
        setEmployees(res.data);
        setFilteredEmployees(res.data);
      } catch (error) {
        console.error("Error fetching employees", error);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    const results = employees.filter((employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmployees(results);
  }, [searchTerm, employees]);

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const handleDelete = async (employeeId) => {
    try {
      alert("Are you sure? The data will be deleted permanently.");
      await axios.delete(`${BASE_URL}/api/employeeRegistration/${employeeId}`);
      const updatedEmployees = employees.filter(
        (employee) => employee.employeeId !== employeeId
      );
      setEmployees(updatedEmployees);
      setFilteredEmployees(updatedEmployees);
      toast.success("Employee deleted successfully");
    } catch (error) {
      console.error("Error deleting employee", error);
      toast.error("Failed to delete employee");
    }
  };

  const handleUpdate = async (updatedEmployee) => {
    try {
      const res = await axios.put(
        `${BASE_URL}/api/employeeRegistration/${updatedEmployee.employeeId}`,
        updatedEmployee
      );
      const updatedEmployees = employees.map((employee) =>
        employee.employeeId === updatedEmployee.employeeId
          ? res.data.updatedEmployee
          : employee
      );
      setEmployees(updatedEmployees);
      setFilteredEmployees(updatedEmployees);
      toast.success("Employee details updated successfully");
    } catch (error) {
      console.error("Error updating employee", error);
      toast.error("Failed to update employee");
    }
  };

  return (
    <div className="flex flex-col h-[820px] overflow-y-auto w-full p-4 sm:p-6 bg-[#e8effe] rounded-lg shadow-md">
      <div className="relative mb-4 w-full flex items-center space-x-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full lg:h-10 h-8 p-2 text-base text-gray-700 rounded-xl pl-10 bg-white border border-[#5443c3] shadow-lg"
          />
          <AiOutlineSearch
            size={20}
            className="absolute top-2.5 left-3 text-gray-500"
          />
        </div>
        <button
          className="bg-[#fc3b3b] hover:bg-red-700 text-white font-bold lg:text-xl text-xs rounded-xl h-12 px-3 "
          onClick={handleDelete}
        >
          Delete All
        </button>
      </div>

      <ToastContainer />
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="h-[850px] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-300 shadow-lg">
            <thead className="bg-[#5443c3] sticky top-0 z-10">
              <tr>
                <th className="py-3 px-2 sm:px-4 text-left text-xs sm:text-sm font-medium text-white uppercase tracking-wider">
                  Employee ID
                </th>
                <th className="py-3 px-2 sm:px-4 text-left text-xs sm:text-sm font-medium text-white uppercase tracking-wider">
                  Name
                </th>
                <th className="py-3 px-2 sm:px-4 text-left text-xs sm:text-sm font-medium text-white uppercase tracking-wider">
                  State
                </th>
                <th className="py-3 px-2 sm:px-4 text-left text-xs sm:text-sm font-medium text-white uppercase tracking-wider">
                  Language
                </th>
                <th className="py-3 px-2 sm:px-4 text-left text-xs sm:text-sm font-medium text-white uppercase tracking-wider">
                  Groups
                </th>
                <th className="py-3 px-2 sm:px-4 text-left text-xs sm:text-sm font-medium text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <tr key={employee.employeeId}>
                  <td className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-900 whitespace-nowrap">
                    {employee.employeeId}
                  </td>
                  <td className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-gray-700 whitespace-nowrap">
                    {employee.name}
                  </td>
                  <td className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-gray-700 whitespace-nowrap">
                    {employee.state}
                  </td>
                  <td className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-gray-700 whitespace-nowrap">
                    {employee.language}
                  </td>
                  <td className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-gray-700 whitespace-nowrap">
                    {employee.group.map((g, index) => (
                      <div key={index}>
                        <span>
                          {g.name} - {g.grade}
                        </span>
                      </div>
                    ))}
                  </td>
                  <td className="py-2 sm:py-4 px-2 sm:px-4 text-xs flex  items-center gap-5 sm:text-sm text-gray-700 whitespace-nowrap">
                    <button
                      className="text-blue-500 hover:text-blue-700"
                      onClick={() => handleEdit(employee)}
                    >
                      <FaEdit className="text-xl" />
                    </button>
                    <button
                      className="ml-2 text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(employee.employeeId)}
                    >
                      <RiDeleteBin5Line className="text-xl" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && (
        <Modal
          show={showModal}
          onClose={() => setShowModal(false)}
          employee={selectedEmployee}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
};

export default EmployeeDetails;
