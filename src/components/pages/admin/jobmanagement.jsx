import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminSidebar from '../../layout/adminsidebar';
import { format } from 'date-fns';

const JobList = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const token = localStorage.getItem('accessToken');
    const checkAuth = async () => {
        try {
            const response = await axios.get('https://wdp301-lzse.onrender.com/api/user/current', {
                headers: {
                    Authorization: `Bearer ${token}`  // Add this
                },
                withCredentials: true
            });
        } catch (error) {
            console.error('Error fetching data:', error);;
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await axios.get('https://wdp301-lzse.onrender.com/api/jobs/admin/pending', {
                headers: {
                    Authorization: `Bearer ${token}`  // Add this
                },
                withCredentials: true
            });
            setJobs(response.data.result);
        } catch (err) {
            setError('Failed to fetch jobs. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (jobId, status) => {
        try {
            const response = await axios.patch(
                `https://wdp301-lzse.onrender.com/api/jobs/admin/${jobId}/status`,
                { status },
                {
                    headers: {
                        Authorization: `Bearer ${token}`  // Add this
                    },
                    withCredentials: true
                }
            );

            setJobs(jobs.map(job =>
                job._id === jobId ? { ...job, status } : job
            ));

            alert(`Job ${status} successfully!`);
        } catch (err) {
            alert(`Failed to ${status} job: ${err.response?.data?.message || err.message}`);
        }
    };

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.companyId.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <>
            <AdminSidebar />
            <div className="flex-1 ml-64 min-h-screen bg-gray-50">
                {/* Header */}
                <div className="py-6 px-8 bg-white shadow-sm border-b">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Job Moderation</h1>
                            <p className="text-sm text-gray-600 mt-1">Review and approve pending job postings</p>
                        </div>
                        <div className="relative w-64">
                            <input
                                type="text"
                                placeholder="Search jobs or companies..."
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <svg
                                className="w-5 h-5 absolute left-3 top-2.5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Jobs Table */}
                <div className="p-8">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : error ? (
                        <div className="mb-4 bg-red-50 text-red-600 p-4 rounded-md">
                            {error}
                        </div>
                    ) : filteredJobs.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-lg shadow">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="mt-2 text-lg font-medium text-gray-900">No pending jobs</h3>
                            <p className="mt-1 text-sm text-gray-500">All jobs have been reviewed and moderated.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Job Title
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Company
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Posted Date
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredJobs.map((job) => (
                                        <tr key={job._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{job.title}</div>
                                                <div className="text-sm text-gray-500">ID: {job._id}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{job.companyId.companyName}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {format(new Date(job.createdAt), 'MMM dd, yyyy')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(job.status)}`}>
                                                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {job.status === 'pending' ? (
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleStatusChange(job._id, 'active')}
                                                            className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusChange(job._id, 'rejected')}
                                                            className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                                        >
                                                            Reject
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                // Implement preview functionality
                                                                window.open(`/job-preview/${job._id}`, '_blank');
                                                            }}
                                                            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        >
                                                            Preview
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleStatusChange(job._id, 'pending')}
                                                        className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                                                    >
                                                        Reset
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default JobList;