import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiRefreshCw, FiArrowLeft } from 'react-icons/fi';
import Header from '../../layout/header';
import toastr from 'toastr';

const PaymentResult = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('checking'); // checking, success, failed, cancelled
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    const paymentLinkId = searchParams.get('paymentLinkId');
    const orderCode = searchParams.get('orderCode');
    const cancel = searchParams.get('cancel');

    useEffect(() => {
        if (cancel === 'true') {
            setStatus('cancelled');
            setLoading(false);
            return;
        }

        if (paymentLinkId) {
            checkPaymentStatus(paymentLinkId);
        } else {
            setStatus('failed');
            setLoading(false);
        }
    }, [paymentLinkId, cancel]);

    const checkPaymentStatus = async (linkId) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = user?.token;

            if (!token) {
                navigate('/login');
                return;
            }

            const response = await fetch(`https://wdp301-lzse.onrender.com/api/payments/status/${linkId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (response.ok && data.status) {
                setPaymentInfo(data.result);
                
                if (data.result.status === 'PAID') {
                    setStatus('success');
                    toastr.success('Payment successful! Your subscription has been activated.');
                } else if (data.result.status === 'CANCELLED') {
                    setStatus('cancelled');
                } else {
                    setStatus('failed');
                }
            } else {
                setStatus('failed');
            }
        } catch (error) {
            console.error('Error checking payment status:', error);
            setStatus('failed');
        } finally {
            setLoading(false);
        }
    };

    const StatusIcon = () => {
        switch (status) {
            case 'success':
                return <FiCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />;
            case 'failed':
                return <FiXCircle className="text-red-500 text-6xl mx-auto mb-4" />;
            case 'cancelled':
                return <FiXCircle className="text-orange-500 text-6xl mx-auto mb-4" />;
            default:
                return <FiRefreshCw className="text-blue-500 text-6xl mx-auto mb-4 animate-spin" />;
        }
    };

    const getStatusMessage = () => {
        switch (status) {
            case 'success':
                return {
                    title: 'Payment Successful!',
                    message: 'Your subscription has been activated successfully. You now have access to premium features.',
                    buttonText: 'Go to Dashboard',
                    buttonAction: () => navigate('/jobseeker/subscription')
                };
            case 'failed':
                return {
                    title: 'Payment Failed',
                    message: 'Your payment could not be processed. Please try again or contact support.',
                    buttonText: 'Try Again',
                    buttonAction: () => navigate('/packages')
                };
            case 'cancelled':
                return {
                    title: 'Payment Cancelled',
                    message: 'You cancelled the payment process. No charges were made to your account.',
                    buttonText: 'Back to Plans',
                    buttonAction: () => navigate('/packages')
                };
            default:
                return {
                    title: 'Checking Payment Status',
                    message: 'Please wait while we verify your payment...',
                    buttonText: null,
                    buttonAction: null
                };
        }
    };

    const statusInfo = getStatusMessage();

    if (loading && status === 'checking') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                <Header />
                <div className="container mx-auto px-4 py-8 mt-20 flex items-center justify-center min-h-[60vh]">
                    <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-md w-full">
                        <FiRefreshCw className="text-blue-500 text-6xl mx-auto mb-4 animate-spin" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Checking Payment Status</h2>
                        <p className="text-gray-600 mb-6">Please wait while we verify your payment...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Header />
            <div className="container mx-auto px-4 py-8 mt-20 flex items-center justify-center min-h-[60vh]">
                <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-md w-full">
                    <StatusIcon />
                    
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        {statusInfo.title}
                    </h2>
                    
                    <p className="text-gray-600 mb-6">
                        {statusInfo.message}
                    </p>

                    {paymentInfo && (
                        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                            <h4 className="font-semibold text-gray-800 mb-2">Payment Details</h4>
                            <div className="space-y-1 text-sm text-gray-600">
                                <div className="flex justify-between">
                                    <span>Order Code:</span>
                                    <span className="font-medium">{paymentInfo.orderCode}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Amount:</span>
                                    <span className="font-medium">{paymentInfo.amount?.toLocaleString()} VND</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Status:</span>
                                    <span className={`font-medium ${
                                        paymentInfo.status === 'PAID' ? 'text-green-600' : 
                                        paymentInfo.status === 'CANCELLED' ? 'text-orange-600' : 'text-red-600'
                                    }`}>
                                        {paymentInfo.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/packages')}
                            className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors font-semibold flex items-center justify-center"
                        >
                            <FiArrowLeft className="mr-2" />
                            Back to Plans
                        </button>
                        
                        {statusInfo.buttonAction && (
                            <button
                                onClick={statusInfo.buttonAction}
                                className={`flex-1 py-3 px-4 rounded-xl transition-colors font-semibold ${
                                    status === 'success' 
                                        ? 'bg-green-500 text-white hover:bg-green-600'
                                        : 'bg-blue-500 text-white hover:bg-blue-600'
                                }`}
                            >
                                {statusInfo.buttonText}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentResult; 