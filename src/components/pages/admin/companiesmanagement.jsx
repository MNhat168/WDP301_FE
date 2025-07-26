import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from '../../layout/adminsidebar';
import { FaBuilding, FaSearch, FaEye, FaEdit, FaTrash } from 'react-icons/fa';

const AdminCompaniesPage = () => {
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [companyJobs, setCompanyJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const response = await axios.get(`https://wdp301-lzse.onrender.com/api/companies?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.status) {
                    setCompanies(response.data.result);
                    setTotalPages(Math.ceil(response.data.total / itemsPerPage));

                    // Select first company by default
                    if (response.data.result.length > 0 && !selectedCompany) {
                        handleSelectCompany(response.data.result[0]);
                    }
                }
            } catch (err) {
                setError('Failed to load companies');
                console.error('Error fetching companies:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCompanies();
    }, [currentPage, searchTerm]);

    const handleSelectCompany = async (company) => {
        setSelectedCompany(company);
        setLoading(true);

        try {
            const token = localStorage.getItem('accessToken');

            // Fetch company details
            const companyResponse = await axios.get(`https://wdp301-lzse.onrender.com/api/companies/${company._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Fetch company jobs
            const jobsResponse = await axios.get(`https://wdp301-lzse.onrender.com/api/companies/${company._id}/jobs`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (companyResponse.data.status && jobsResponse.data.status) {
                setSelectedCompany(companyResponse.data.result);
                setCompanyJobs(jobsResponse.data.result);
            }
        } catch (err) {
            setError('Failed to load company details');
            console.error('Error fetching company details:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        if (!selectedCompany) return;

        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.put(
                `https://wdp301-lzse.onrender.com/api/companies/${selectedCompany._id}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.status) {
                // Update selected company
                setSelectedCompany({ ...selectedCompany, status: newStatus });

                // Update in companies list
                setCompanies(companies.map(comp =>
                    comp._id === selectedCompany._id ? { ...comp, status: newStatus } : comp
                ));
            }
        } catch (err) {
            setError('Failed to update company status');
            console.error('Error updating company status:', err);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <AdminSidebar />

            <div className="flex-1 p-6 ml-64">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Companies Management</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Company List Section */}
                    <div className="lg:col-span-1 bg-white rounded-lg shadow p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Company List</h2>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search companies..."
                                    className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : companies.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No companies found
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {companies.map(company => (
                                    <div
                                        key={company._id}
                                        className={`p-3 rounded-lg cursor-pointer transition-all ${selectedCompany?._id === company._id
                                            ? 'bg-blue-100 border-l-4 border-blue-500'
                                            : 'hover:bg-gray-50'
                                            }`}
                                        onClick={() => handleSelectCompany(company)}
                                    >
                                        <div className="flex items-center">
                                            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center">
                                                <FaBuilding className="text-gray-500 text-xl" />
                                            </div>
                                            <div className="ml-3 flex-1">
                                                <h3 className="font-medium">{company.companyName}</h3>
                                                <div className="flex items-center justify-between mt-1">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${company.status === 'active'
                                                        ? 'bg-green-100 text-green-800'
                                                        : company.status === 'pending'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(company.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Pagination */}
                                <div className="flex justify-between items-center mt-4">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className={`px-4 py-2 rounded ${currentPage === 1
                                            ? 'bg-gray-200 cursor-not-allowed'
                                            : 'bg-gray-200 hover:bg-gray-300'
                                            }`}
                                    >
                                        Previous
                                    </button>

                                    <span className="text-sm">
                                        Page {currentPage} of {totalPages}
                                    </span>

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className={`px-4 py-2 rounded ${currentPage === totalPages
                                            ? 'bg-gray-200 cursor-not-allowed'
                                            : 'bg-gray-200 hover:bg-gray-300'
                                            }`}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Company Details Section */}
                    <div className="lg:col-span-2 bg-white rounded-lg shadow p-4">
                        {selectedCompany ? (
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <div className="flex items-center">
                                            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-20 h-20 flex items-center justify-center">
                                                <FaBuilding className="text-gray-500 text-3xl" />
                                            </div>
                                            <div className="ml-4">
                                                <h2 className="text-xl font-bold">{selectedCompany.companyName}</h2>
                                                <div className="flex items-center mt-1">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${selectedCompany.status === 'active'
                                                        ? 'bg-green-100 text-green-800'
                                                        : selectedCompany.status === 'pending'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {selectedCompany.status.charAt(0).toUpperCase() + selectedCompany.status.slice(1)}
                                                    </span>
                                                    <span className="ml-2 text-sm text-gray-500">
                                                        Created: {new Date(selectedCompany.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex space-x-2">
                                        <select
                                            value={selectedCompany.status}
                                            onChange={(e) => handleStatusChange(e.target.value)}
                                            className="border rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="active">Active</option>
                                            <option value="pending">Pending</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                        <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200">
                                            <FaEdit />
                                        </button>
                                        <button className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200">
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div className="border rounded-lg p-4">
                                        <h3 className="font-medium mb-2 text-gray-700">Company Information</h3>
                                        <div className="space-y-2">
                                            <div>
                                                <label className="text-xs text-gray-500">Website</label>
                                                <p className="text-sm">
                                                    {selectedCompany.url ? (
                                                        <img
                                                            className="h-16 w-16 md:h-20 md:w-20 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-xl"
                                                            src={selectedCompany.url || "/assets/images/default-image.jpg"}
                                                            alt="Company Logo"
                                                        />
                                                    ) : 'Not provided'}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500">Address</label>
                                                <p className="text-sm">{selectedCompany.address || 'Not provided'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border rounded-lg p-4">
                                        <h3 className="font-medium mb-2 text-gray-700">About Us</h3>
                                        <p className="text-sm text-gray-700">
                                            {selectedCompany.aboutUs || 'No description provided'}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold">Posted Jobs</h3>
                                        <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full">
                                            {companyJobs.length} jobs
                                        </span>
                                    </div>

                                    {companyJobs.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            This company hasn't posted any jobs yet
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {companyJobs.map(job => (
                                                <div key={job._id} className="border rounded-lg p-4 hover:bg-gray-50">
                                                    <div className="flex justify-between">
                                                        <div>
                                                            <h4 className="font-medium">{job.title}</h4>
                                                            <div className="flex flex-wrap gap-2 mt-2">
                                                                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                                                                    {job.employmentType}
                                                                </span>
                                                                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                                                                    {job.experienceLevel}
                                                                </span>
                                                                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                                                                    Salary: {job.minSalary || 'Not specified'} - {job.maxSalary || 'Not specified'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <button className="text-blue-600 hover:text-blue-800">
                                                            <FaEye />
                                                        </button>
                                                    </div>
                                                    <div className="mt-3 text-sm text-gray-500">
                                                        Posted: {new Date(job.createdAt).toLocaleDateString()}
                                                        <span className={`ml-3 px-2 py-1 text-xs rounded-full ${job.status === 'active'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                            }`}>
                                                            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full py-12">
                                <FaBuilding className="text-gray-400 text-5xl mb-4" />
                                <h3 className="text-xl font-medium text-gray-500 mb-2">No Company Selected</h3>
                                <p className="text-gray-500 text-center">
                                    Select a company from the list to view details and jobs
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCompaniesPage;