import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../layout/header';
import useBanCheck from '../admin/checkban';

const PackagePayment = () => {
    const { packageId } = useParams();
    const navigate = useNavigate();
    const [paymentDetails, setPaymentDetails] = useState({
        amount: 0,
        paymentMethod: 'paypal',
        currency: 'USD'
    });
    const BanPopup = useBanCheck();
    
    useEffect(() => {
        fetchPackagePrice();
    }, [packageId]);

    const fetchPackagePrice = async () => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            const response = await fetch(`https://wdp301-lzse.onrender.com/api/subscriptions/plans`, {
                headers: {
                    'Authorization': `Bearer ${user?.token || user?.accessToken}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                const selectedPackage = data.result.find(pkg => pkg._id === packageId);
                if (selectedPackage) {
                    setPaymentDetails(prev => ({
                        ...prev,
                        amount: selectedPackage.pricing?.monthly || selectedPackage.price || 0
                    }));
                }
            }
        } catch (error) {
            console.error('Error fetching package price:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPaymentDetails(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            const response = await fetch('https://wdp301-lzse.onrender.com/api/subscriptions/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token || user?.accessToken}`
                },
                body: JSON.stringify({
                    subscriptionId: packageId,
                    paymentMethod: paymentDetails.paymentMethod,
                    billingPeriod: 'monthly'
                })
            });

            const data = await response.json();
            
            if (response.ok && data.status) {
                if (data.result.paymentUrl) {
                    // Redirect to PayPal payment page
                    window.location.href = data.result.paymentUrl;
                } else {
                    // Free subscription activated immediately
                    alert('Subscription activated successfully!');
                    navigate('/packages');
                }
            } else {
                alert(data.message || 'Subscription failed');
            }
        } catch (error) {
            console.error('Error processing payment:', error);
            alert('Payment processing failed. Please try again.');
        }
    };

    return (
        <>
            <Header />
            <div className="container mx-auto px-4 py-8 mt-20">
                <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
                    <h2 className="text-2xl font-bold mb-6">Pay With VNPAY</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Amount to Pay (VND)
                            </label>
                            <input
                                type="number"
                                value={paymentDetails.amount}
                                readOnly
                                className="w-full p-3 border rounded-md bg-gray-50"
                            />
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Select Payment Method</h3>
                            
                            <div className="space-y-2">
                                <label className="flex items-center space-x-3">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="paypal"
                                        checked={paymentDetails.paymentMethod === 'paypal'}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-blue-600"
                                    />
                                    <span>PayPal</span>
                                </label>

                                <label className="flex items-center space-x-3">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="paypal_credit"
                                        checked={paymentDetails.paymentMethod === 'paypal_credit'}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-blue-600"
                                    />
                                    <span>PayPal Credit</span>
                                </label>

                                <label className="flex items-center space-x-3">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="card"
                                        checked={paymentDetails.paymentMethod === 'card'}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-blue-600"
                                    />
                                    <span>Credit/Debit Card via PayPal</span>
                                </label>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Select Currency</h3>
                            <div className="space-y-2">
                                <label className="flex items-center space-x-3">
                                    <input
                                        type="radio"
                                        name="currency"
                                        value="USD"
                                        checked={paymentDetails.currency === 'USD'}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-blue-600"
                                    />
                                    <span>USD</span>
                                </label>

                                <label className="flex items-center space-x-3">
                                    <input
                                        type="radio"
                                        name="currency"
                                        value="VND"
                                        checked={paymentDetails.currency === 'VND'}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-blue-600"
                                    />
                                    <span>VND</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Proceed to Payment
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/packages')}
                                className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-300 transition-colors"
                            >
                                Back
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default PackagePayment;