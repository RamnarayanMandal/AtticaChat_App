import { useEffect, useState } from "react";
import { BASE_URL } from "../../constants";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Message from "../admin/Message";
import GPSTracker from "../manager/Gps";

const BillingGroupChat = ({ department }) => {
  const [groups, setGroups] = useState([]);
  const [selectedGroupName, setSelectedGroupName] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const userId = localStorage.getItem("CurrentUserId");
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/billingTeam/groups/${userId}`
        );
        setGroups(response.data); // Set the fetched groups
        console.log("Groups:", response.data); // For debugging
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    fetchGroups();
  }, [userId]);

  const handleGroupClick = (name, grade) => {
    setSelectedGroupName(name);
    setSelectedGrade(grade);

    if (window.innerWidth < 1024) {
      navigate(
        `/message/${encodeURIComponent(name)}/${encodeURIComponent(
          grade
        )}/${encodeURIComponent(department)}`
      );
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full">
      <GPSTracker managerId={userId} path={"te-location"} />
      <ToastContainer />
      <div className="flex flex-col w-full lg:w-[24vw] bg-[#ffffff] text-[#5443c3] lg:border shadow lg:shadow-blue-500/65">
        <div className="p-4 flex justify-between items-center">
          <h1 className="lg:text-3xl md:text-2xl text-xl font-bold">Groups</h1>
        </div>
        <div className="overflow-y-auto mt-8">
          {groups.map((group) => (
            <div
              key={group._id} // Use _id for a unique key
              className="p-4 cursor-pointer text-[#5443c3] hover:bg-[#eef2fa] flex justify-between items-center"
              onClick={() => handleGroupClick(group.name, group.grade)}
            >
              <div>
                <h1 className="lg:text-xl md:text-xl text-sm font-bold text-[#5443c3]">
                  {group.name}
                </h1>
                <p className="text-[#8b7ed5]">Grade: {group.grade}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Render Message component conditionally */}
      {selectedGroupName && selectedGrade && (
        <div className="lg:flex-1 hidden lg:block">
          <Message
            selectedGroupName={selectedGroupName}
            selectedGrade={selectedGrade}
            department={department}
          />
        </div>
      )}
    </div>
  );
};

export default BillingGroupChat;
