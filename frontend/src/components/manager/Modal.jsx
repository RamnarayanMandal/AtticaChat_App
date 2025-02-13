import React, { useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { BASE_URL } from "../../constants";

export const Modal = ({ show, onClose, manager, onUpdate}) => {
  const [formData, setFormData] = useState({ ...manager });
  const [groupOptions, setGroupOptions] = useState([]);

  console.log("groupOptions",groupOptions)

  useEffect(() => {
    setFormData({ ...manager });
  }, [manager]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/groups`);
        const data = await response.json();

        const filteredGroups = data.filter((group) => group.department === "Manager");
        if (filteredGroups) setGroupOptions(filteredGroups);
      } catch (error) {
        console.error("Error fetching group data:", error);
      }
    };

    fetchData();
  }, []);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleGroupChange = (index, e) => {
    const { name, value } = e.target;
    const updatedGroup = [...formData.group];
    updatedGroup[index][name] = value;

    if (name === "name") updatedGroup[index].grade = ""; // Reset grade if group name changes

    setFormData({ ...formData, group: updatedGroup });
  };

  const handleAddGroup = () => {
    setFormData({
      ...formData,
      group: [...(formData.group || []), { name: "", grade: "" }],
    });
  };

  const removeGroup = (index) => {
    const updatedGroup = formData.group.filter((_, i) => i !== index);
    setFormData({ ...formData, group: updatedGroup });
  };

  const handleUpdate = () => {
    onUpdate(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-full overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-[#5443c3]">Edit Manager Details</h2>
        <form className="lg:grid grid-cols-2 gap-4">
          {[
            { label: "Manager ID", name: "manager_Id", type: "text" },
            { label: "Manager Name", name: "manager_name", type: "text" },
            { label: "Manager Email", name: "manager_email", type: "email" },
            { label: "Manager Password", name: "manager_password", type: "password" },
            { label: "Manager Phone", name: "manager_phone", type: "text" },
            { label: "Manager Address", name: "manager_address", type: "text" },
            { label: "Branch City", name: "branch_city", type: "text" },
            { label: "Branch State", name: "branch_state", type: "text" },
            { label: "Branch Pincode", name: "branch_pincode", type: "text" },
            { label: "Branch Name", name: "branch_name", type: "text" },
            { label: "Branch Address", name: "branch_address", type: "text" },
          ].map((field, index) => (
            <div className="mb-4" key={index}>
              <label
                className="block text-[#5443c3] text-sm font-bold mb-2"
                htmlFor={field.name}
              >
                {field.label}
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                id={field.name}
                name={field.name}
                type={field.type}
                value={formData[field.name] || ""}
                onChange={handleChange}
              />
            </div>
          ))}

          {/* Dynamic Group Section */}
          <div className="col-span-2">
            {formData.group?.map((group, index) => (
              <div key={index} className="mb-4">
                <div className="mb-2">
                  <label className="block text-[#5443c3] text-sm font-bold mb-2">Group Name</label>
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
                <div className="mb-2">
                  <label className="block text-[#5443c3] text-sm font-bold mb-2">Grade</label>
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
                <button
                  type="button"
                  onClick={() => removeGroup(index)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Remove Group
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddGroup}
              className="bg-[#5443c3] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
            >
              Add Group
            </button>
          </div>

          <div className="flex justify-end col-span-2">
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
