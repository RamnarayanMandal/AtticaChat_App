import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GoogleMapsuper from './GoogleMapsuper';
import { BASE_URL } from '../../constants';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './TETable.css';

const TETable = ({ name }) => {
  const [TE, setTE] = useState([]);
  const [filteredTE, setFilteredTE] = useState([]);
  const [selectedTE, setSelectedTE] = useState(null);
  const [location, setLocation] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [locationNotFound, setLocationNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 8;

  const roleEndpointMap = {
    Accountant: 'allUser/getAllAccountantTeam',
    Software: 'allUser/getAllSoftwareTeam',
    HR: 'allUser/getAllHRTeam',
    CallCenter: 'allUser/getAllCallCenterTeam',
    VirtualTeam: 'allUser/getAllVirtualTeam',
    MonitoringTeam: 'allUser/getAllMonitoringTeam',
    'Bouncers/Driver': 'allUser/getAllBouncersTeam',
    'Security/CCTV': 'allUser/getAllSecurityTeam',
    DigitalMarketing: 'allUser/getAllDigitalMarketingTeam',
    Logistic: 'allUser/getAllLogistic',
    TE: 'allUser/getAllTE',
  };

  const endpoint = roleEndpointMap[name] || null;

  useEffect(() => {
    const fetchUsers = async () => {
      if (!endpoint) return;
      setLoading(true);
      try {
        const response = await axios.get(`${BASE_URL}/api/${endpoint}`);
        setTE(response.data);
        setFilteredTE(response.data); // Set initial filtered data
      } catch (error) {
        console.error(`Error fetching data for ${name}:`, error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [endpoint]);

  const fetchLocations = async (id, date) => {
    try {
      const response = await fetch(`${BASE_URL}/api/location/get-location/${id}/${date}`);
      if (response.ok) {
        const data = await response.json();
        const locations = data.dateLocation.locations;
        if (locations.length > 0) {
          setLocation(locations);
          setShowMap(true);
          setLocationNotFound(false);
        } else {
          setLocation([]);
          setShowMap(false);
          setLocationNotFound(true);
        }
      } else {
        throw new Error('Failed to fetch location');
      }
    } catch (error) {
      console.error('Error fetching location:', error);
      setLocation([]);
      setShowMap(false);
      setLocationNotFound(true);
    }
  };

  const handleDateChange = (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    setSelectedDate(formattedDate);
  };

  const openModal = async (id) => {
    setSelectedTE(id);
    await fetchLocations(id, selectedDate);
  };

  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter items by matching name, email, or ID
    const filtered = TE.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item._id.toLowerCase().includes(query)
    );

    setFilteredTE(filtered);
    setCurrentPage(1); // Reset to the first page after search
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredTE.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentRecords = filteredTE.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex flex-wrap w-full">
      <div className="p-4 rounded-lg shadow-lg overflow-auto border border-purple-900 w-full">
        <div className="lg:text-xl md:text-xl text-sm font-bold mb-4 text-[#5443c3]">
          {name} Details
        </div>

        <input
          type="text"
          placeholder="Search name, email "
          value={searchQuery}
          onChange={handleSearchChange}
          className="border rounded px-2 w-full py-2 mb-4"
        />

        {loading ? (
          <div className="text-center text-blue-600 font-semibold">Loading...</div>
        ) : (
          <table className="min-w-full bg-white border lg:text-xl md:text-xl text-sm">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b bg-[#5443c3] text-white text-center">Name</th>
                <th className="py-2 px-4 border-b bg-[#5443c3] text-white text-center">Email</th>
                <th className="py-2 px-4 border-b bg-[#5443c3] text-white text-center">Location</th>
                <th className="py-2 px-4 border-b bg-[#5443c3] text-white text-center">Select Date</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.map((item) => (
                <tr key={item._id} className="hover:bg-gray-100">
                  <td className="py-2 px-4 border-b text-[#5443c3] text-center">{item.name}</td>
                  <td className="py-2 px-4 border-b text-[#5443c3] text-center">{item.email}</td>
                  <td
                    className="py-2 px-4 border-b text-blue-600 underline cursor-pointer text-center"
                    onClick={() => openModal(item._id)}
                  >
                    Click here
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    <DatePicker
                      selected={new Date(selectedDate)}
                      onChange={handleDateChange}
                      dateFormat="yyyy-MM-dd"
                      className="border rounded px-2 py-1"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination controls */}
        <div className="flex justify-center mt-4">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              className={`mx-1 px-3 py-1 border rounded ${
                currentPage === index + 1
                  ? 'bg-[#5443c3] text-white'
                  : 'bg-white text-[#5443c3]'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {showMap && (
        <div className="w-full p-4 absolute z-0 top-0 left-0">
          {locationNotFound ? (
            <div className="text-red-600 font-semibold">
              No locations found for the selected date.
            </div>
          ) : (
            <GoogleMapsuper locations={location} onClose={() => setShowMap(false)} className="w-full" />
          )}
        </div>
      )}
    </div>
  );
};

export default TETable;
