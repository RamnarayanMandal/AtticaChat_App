import React, { useEffect, useState } from "react";

const  Modal = ({ show, onClose, employee, onUpdate }) => {
  const [formData, setFormData] = useState({ ...employee });

  useEffect(() => {
    setFormData({ ...employee });
  }, [employee]);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleGroupChange = (e, index) => {
    const { name, value } = e.target;
    const updatedGroups = [...formData.group];
    updatedGroups[index] = { ...updatedGroups[index], [name]: value };
    setFormData({ ...formData, group: updatedGroups });
  };

  const handleAddGroup = () => {
    setFormData({
      ...formData,
      group: [...formData.group, { name: "", grade: "" }]
    });
  };

  const handleUpdate = () => {
    onUpdate(formData);
    onClose();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg lg:w-full lg:h-auto w-[80%] h-[650px] max-w-md overflow-hidden">
        <h2 className="lg:text-2xl text-xl font-bold mb-4 text-[#5443c3]">Edit Employee Details</h2>
        <div className="overflow-y-auto h-[500px]">
          <form>
            {['name', 'email', 'phone', 'address', 'branch_name', 'branch_state', 'branch_city', 'branch_pincode'].map((field) => (
              <div className="lg:mb-4 mb-2" key={field}>
                <label className="block text-[#5443c3] text-sm font-bold mb-2">
                  {field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 lg:h-auto h-[8vw]"
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                />
              </div>
            ))}
            <div className="lg:mb-4 mb-2">
              <label className="block text-[#5443c3] text-sm font-bold mb-2">Groups</label>
              {formData.group.map((group, index) => (
                <div key={index} className="mb-2">
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                    name="name"
                    placeholder="Group Name"
                    value={group.name}
                    onChange={(e) => handleGroupChange(e, index)}
                  />
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mt-2"
                    name="grade"
                    placeholder="Group Grade"
                    value={group.grade}
                    onChange={(e) => handleGroupChange(e, index)}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddGroup}
                className="bg-[#5443c3] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Add Group
              </button>
            </div>
            <div className="flex justify-end">
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
    </div>
  );
};

export default Modal;
