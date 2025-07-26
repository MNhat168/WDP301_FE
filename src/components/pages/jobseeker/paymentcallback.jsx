import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../layout/header';
import useBanCheck from '../admin/checkban';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';

const PaymentCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('processing');
    const [message, setMessage] = useState('Processing your payment...');
    const BanPopup = useBanCheck();
    
    useEffect(() => {
        const token = searchParams.get('token'); // PayPal token/order ID
        const payerId = searchParams.get('PayerID');
        const cancelled = searchParams.get('cancelled');
        
        console.log('PayPal callback received:', { token, payerId, cancelled });
    
        if (cancelled === 'true') {
            setStatus('cancelled');
            setMessage('Payment was cancelled. You can try again anytime.');
            toastr.warning('Payment cancelled');
            setTimeout(() => navigate('/packages'), 3000);
            return;
        }

        if (!token || !payerId) {
            setStatus('error');
            setMessage('Invalid payment session. Please try again.');
            toastr.error('Invalid payment session');
            setTimeout(() => navigate('/packages'), 3000);
            return;
        }

        handlePaymentCapture(token, payerId);
    }, [searchParams, navigate]);

    const handlePaymentCapture = async (orderId, payerId) => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            const response = await fetch('https://wdp301-lzse.onrender.com/api/payments/capture', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user?.accessToken || user?.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ orderId, payerId })
            });

            const result = await response.json();
            console.log('Payment capture response:', result);

            if (response.ok && result.status) {
                setStatus('success');
                setMessage('🎉 Payment confirmed! Your subscription is now active. Redirecting to plans...');
                
                // Show success toast
                toastr.success('🎉 Subscription activated successfully!', '', {
                    timeOut: 5000,
                    progressBar: true
                });
                
                console.log('Payment captured successfully:', result);
                
                // Redirect to package list after success
                setTimeout(() => {
                    navigate('/packages');
                }, 3000);
            } else {
                throw new Error(result.message || 'Payment capture failed');
            }
        } catch (error) {
            console.error('Payment capture error:', error);
            setStatus('error');
            setMessage('Failed to confirm payment. Please contact support if money was deducted.');
            
            // Show error toast
            toastr.error('Payment confirmation failed. Please contact support.', '', {
                timeOut: 8000,
                progressBar: true
            });
            
            setTimeout(() => navigate('/packages'), 5000);
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'processing':
                return (
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                );
            case 'success':
                return (
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                );
            case 'error':
                return (
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </div>
                );
            case 'cancelled':
                return (
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.762 0L3.05 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                        </svg>
                    </div>
                );
            default:
                return null;
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'success':
                return 'text-green-600';
            case 'error':
                return 'text-red-600';
            case 'cancelled':
                return 'text-yellow-600';
            default:
                return 'text-blue-600';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
            {BanPopup}
            <Header />

            {/* Hero Section */}
            <div className="w-full bg-white border-b border-gray-200 py-12 mb-0">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
                        Payment Confirmation
                    </h1>
                    <p className="text-lg text-gray-600">
                        Please wait while we process your payment and activate your subscription.
                    </p>
                </div>
            </div>

            {/* Main Card */}
            <div className="flex-1 flex items-center justify-center py-8 px-4">
                <div className="max-w-md w-full mx-auto bg-white rounded-3xl shadow-2xl p-8 text-center border border-gray-100">
                    {/* Status Icon */}
                    <div className="mb-6">
                        {getStatusIcon()}
                    </div>

                    {/* Headline */}
                    <h1 className={`text-2xl sm:text-3xl font-bold mb-3 ${getStatusColor()}`}>
                        {status === 'processing' && 'Processing Payment'}
                        {status === 'success' && '🎉 Payment Successful!'}
                        {status === 'error' && 'Payment Failed'}
                        {status === 'cancelled' && 'Payment Cancelled'}
                    </h1>

                    {/* Message */}
                    <p className="text-gray-600 mb-6 text-base sm:text-lg min-h-[40px]">{message}</p>

                    {/* Extra info */}
                    {status === 'processing' && (
                        <div className="text-sm text-gray-500 mb-2">
                            Please wait while we confirm your payment with PayPal...
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700 mb-2">
                            <p>✅ Subscription activated successfully</p>
                            <p>✅ Premium features unlocked</p>
                            <p className="mt-2">Redirecting to your plans page...</p>
                        </div>
                    )}

                    {(status === 'error' || status === 'cancelled') && (
                        <div className="mt-6">
                            <button
                                onClick={() => navigate('/packages')}
                                className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold text-base shadow-sm"
                            >
                                Back to Plans
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentCallback;