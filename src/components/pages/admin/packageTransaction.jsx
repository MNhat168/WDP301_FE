// src/views/admin/PackageTransactions.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../layout/adminsidebar';
import { format } from 'date-fns';

const PackageTransactions = () => {
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paymentStatus, setPaymentStatus] = useState([]);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        packageType: '',
        status: 'all', 
        search: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('accessToken');

                // Fetch analytics data
                const analyticsRes = await axios.get(
                    'https://wdp301-lzse.onrender.com/api/subscriptions/analytics',
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                // Fetch transactions with filters
                const params = new URLSearchParams();
                if (filters.startDate) params.append('startDate', filters.startDate);
                if (filters.endDate) params.append('endDate', filters.endDate);
                if (filters.packageType) params.append('packageType', filters.packageType);
                if (filters.status) params.append('status', filters.status);
                if (filters.search) params.append('search', filters.search);

                const transactionsRes = await axios.get(
                    `https://wdp301-lzse.onrender.com/api/subscriptions/admin/transactions?${params.toString()}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                setAnalytics(analyticsRes.data.result);
                setTransactions(transactionsRes.data.result);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch data. Please try again later.');
                setLoading(false);
                console.error(err);
            }
        };

        fetchData();
    }, [filters]);

    useEffect(() => {
        const fetchPaymentStatus = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const res = await axios.get(
                    'https://wdp301-lzse.onrender.com/api/subscriptions/admin/payment-status',
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setPaymentStatus(res.data.result);
            } catch (err) {
                console.error('Failed to fetch payment status:', err);
            }
        };

        fetchPaymentStatus();
    }, []);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleResetFilters = () => {
        setFilters({
            startDate: '',
            endDate: '',
            packageType: '',
            status: '',
            search: ''
        });
    };

    if (loading) {
        return (
            <div className="flex min-h-screen">
                <AdminSidebar />
                <div className="flex-1 p-4">
                    <div className="flex justify-center items-center h-screen">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen">
                <AdminSidebar />
                <div className="flex-1 p-4">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Error! </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <><AdminSidebar /><div className="flex min-h-screen bg-gray-50">


            <div className="ml-64 p-4 md:p-8">
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Package Management</h1>
                    <p className="text-gray-600">Subscription analytics and billing history</p>
                </div>

                {/* Analytics Section */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Subscription Analytics</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white p-4 rounded-lg shadow">
                            <h3 className="text-lg font-medium text-gray-700">Total Revenue</h3>
                            <p className="text-3xl font-bold text-blue-600">
                                ${analytics?.totalRevenue?.toLocaleString() || '0'}
                            </p>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow">
                            <h3 className="text-lg font-medium text-gray-700">Active Subscriptions</h3>
                            <p className="text-3xl font-bold text-green-600">
                                {analytics?.activeSubscriptions?.toLocaleString() || '0'}
                            </p>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow">
                            <h3 className="text-lg font-medium text-gray-700">Conversion Rate</h3>
                            <p className="text-3xl font-bold text-purple-600">
                                {analytics?.conversionRate || '0'}%
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-4 rounded-lg shadow">
                            <h3 className="text-lg font-medium text-gray-700 mb-4">Revenue by Package Type</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={analytics?.planAnalytics || []}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="_id" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                                    <Legend />
                                    <Bar dataKey="totalRevenue" name="Revenue" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow">
                            <h3 className="text-lg font-medium text-gray-700 mb-4">Subscription Distribution</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={analytics?.planAnalytics || []}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="count"
                                        nameKey="_id"
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {analytics?.planAnalytics?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value, name, props) => [`${value} subscriptions`, props.payload._id]} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Transactions Section */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Billing History</h2>
                    </div>

                    {/* Filters */}
                    <div className="bg-white p-4 rounded-lg shadow mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={filters.startDate}
                                    onChange={handleFilterChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">End Date</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={filters.endDate}
                                    onChange={handleFilterChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Package Type</label>
                                <select
                                    name="packageType"
                                    value={filters.packageType}
                                    onChange={handleFilterChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                >
                                    <option value="">All</option>
                                    <option value="free">Free</option>
                                    <option value="basic">Basic</option>
                                    <option value="premium">Premium</option>
                                    <option value="enterprise">Enterprise</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select
                                    name="status"
                                    value={filters.status}
                                    onChange={handleFilterChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                >
                                    <option value="all">All</option> {/* Add this line */}
                                    <option value="active">Active</option>
                                    <option value="expired">Expired</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Search</label>
                                <div className="flex">
                                    <input
                                        type="text"
                                        name="search"
                                        placeholder="Search users or plans..."
                                        value={filters.search}
                                        onChange={handleFilterChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                                    <button
                                        onClick={handleResetFilters}
                                        className="ml-2 mt-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow mb-6">
                        <h3 className="text-lg font-medium text-gray-700 mb-4">Payment Status</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {paymentStatus.map((status, index) => (
                                <div key={index} className="border p-3 rounded-lg">
                                    <div className="text-sm text-gray-500 capitalize">{status.status || 'unset'}</div>
                                    <div className="text-xl font-bold">${status.totalAmount.toLocaleString()}</div>
                                    <div className="text-sm">Count: {status.count}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Transactions Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Plan
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Payment Date
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Expiry
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {transactions.length > 0 ? (
                                        transactions.map((transaction) => (
                                            <tr key={transaction.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {transaction.userName}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {transaction.userEmail}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{transaction.planName}</div>
                                                    <div className="text-sm text-gray-500 capitalize">
                                                        {transaction.planType}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-semibold">
                                                        ${transaction.amount.toFixed(2)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {transaction.startDate ? format(new Date(transaction.startDate), 'MMM dd, yyyy HH:mm') : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${transaction.status === 'active' ? 'bg-green-100 text-green-800' :
                                                            transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                transaction.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                                    'bg-gray-100 text-gray-800'}`}
                                                    >
                                                        {transaction.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {transaction.expiryDate ? format(new Date(transaction.expiryDate), 'MMM dd, yyyy') : 'N/A'}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                                                No transactions found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination would go here */}
                    </div>
                </div>
            </div>
        </div></>
    );
};

export default PackageTransactions;