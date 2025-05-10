'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Script from 'next/script'; // For Razorpay script

export default function Page() {

    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    const [couponCodes, setCouponCodes] = useState({});
    const [appliedCoupons, setAppliedCoupons] = useState({});
    const [errorMessages, setErrorMessages] = useState({});

    const [AppliedCouponData, setAppliedCouponData] = useState(null); 

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const userDataString = localStorage.getItem('userData');
                const tokenDataString = localStorage.getItem('camrilla_token');

                if (!userDataString || !tokenDataString) {
                    console.error('Missing userData or camrilla_token');
                    return;
                }

                const userData = JSON.parse(userDataString);
                const tokenData = JSON.parse(tokenDataString);

                const accessToken = tokenData.accessToken;
                const countryCode = userData.country;

                const response = await axios.get(`http://api.camrilla.com/admin/plan-master/${countryCode}`);

                console.log('Plans API Response:', response.data);

                setPlans(response.data.data || []);
            } catch (error) {
                console.error('Error fetching plans:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, []);

    if (loading) {
        return <div>Loading plans...</div>;
    }


    const initiatePayment = async (planId) => {
        try {
            const tokenDataString = localStorage.getItem('camrilla_token');
            if (!tokenDataString) {
                alert('Please login first');
                return;
            }

            const tokenData = JSON.parse(tokenDataString);
            const accessToken = tokenData.accessToken;

            let payload = {};

            // ✅ If coupon applied, use coupon's ID and code
            if (AppliedCouponData && AppliedCouponData.id && AppliedCouponData.discountCouponCode) {
                payload = {
                    id: AppliedCouponData.id,
                    discountCouponCode: AppliedCouponData.discountCouponCode
                };
            } else {
                payload = {
                    id: planId
                };
            }

            const response = await axios.post(
                'http://api.camrilla.com/initiate-payment-request',
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );

            const paymentData = response.data.data;
            console.log('Initiate Payment Response:', paymentData);

            openRazorpay(paymentData);
        } catch (error) {
            console.error('Error initiating payment:', error);
            alert('Failed to initiate payment');
        }
    };




    const openRazorpay = (paymentData) => {
        if (typeof window === "undefined" || typeof window.Razorpay === "undefined") {
            alert("Razorpay SDK not yet loaded.");
            return;
        }

        const options = {
            key: paymentData.razorPayKey,
            amount: paymentData.amount * 100,
            currency: paymentData.currency,
            name: "Camrilla",
            description: paymentData.planDescription,
            order_id: paymentData.orderId,
            handler: async function (response) {
                console.log('Payment Success Response:', response);

                try {
                    await axios.post('http://api.camrilla.com/update-payment-response', {
                        orderId: paymentData.camrillaOrderId
                    });
                    alert('Payment successful and updated!');
                } catch (error) {
                    console.error('Error updating payment response:', error);
                    alert('Payment was successful but updating server failed.');
                }
            },
            prefill: {
                email: paymentData.email,
                contact: paymentData.mobile
            },
            theme: {
                color: "#3399cc"
            }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    const handleApplyCoupon = async (planId) => {
        const code = couponCodes[planId];
        try {
            setErrorMessages((prev) => ({ ...prev, [planId]: '' }));
            const tokenDataString = localStorage.getItem('camrilla_token');
            if (!tokenDataString) {
                alert('Please login first');
                return;
            }

            const tokenData = JSON.parse(tokenDataString);
            const accessToken = tokenData.accessToken;

            const response = await axios.get(`http://api.camrilla.com/admin/discount-coupon/validate/${code}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            if (response.data && response.data.code === 0) {
                setAppliedCouponData(response.data.data);
                setAppliedCoupons((prev) => ({ ...prev, [planId]: response.data.data }));
            } else {
                setErrorMessages((prev) => ({ ...prev, [planId]: 'Invalid or expired coupon.' }));
                setAppliedCoupons((prev) => ({ ...prev, [planId]: null }));
            }
        } catch (error) {
            console.error('Error validating coupon:', error);
            setErrorMessages((prev) => ({ ...prev, [planId]: 'Failed to validate coupon.' }));
            setAppliedCoupons((prev) => ({ ...prev, [planId]: null }));
        }
    };

    return (
        <div>
            <Script
                src="http://checkout.razorpay.com/v1/checkout.js"
                strategy="afterInteractive"
                onLoad={() => {
                    console.log("Razorpay script loaded!");
                }}
            />

            <div className="container-xxl flex-grow-1 container-p-y">
                <div className="card">
                    <div className="pb-sm-12 pb-2 rounded-top">
                        <div className="container py-12">
                            <h4 className="text-center mb-2 mt-0 mt-md-4">Pricing Plans</h4>
                            <p className="text-center mb-2">
                                All plans include 40+ advanced tools and features to boost your product. Choose the best plan to
                                fit your needs.
                            </p>

                            <div className="pricing-plans row mx-4 gy-3 px-lg-12">
                                {plans.length > 0 ? (
                                    plans.map((plan, index) => {
                                        // Parse feature array from JSON string
                                        const features = JSON.parse(plan.feature);

                                        return (
                                            <div key={plan.id} className="col-lg mb-lg-0 mb-3">
                                                <div className={`card border ${index === 1 ? 'border-primary' : ''} shadow-none`}>
                                                    <div className="card-body pt-12">
                                                        <div className="mt-3 mb-5 text-center">
                                                            <img
                                                                src={`/assets/img/illustrations/pricing-basic.png`}
                                                                alt="Plan"
                                                                height="100"
                                                            />
                                                        </div>
                                                        <h4 className="card-title text-center text-capitalize mb-2">{plan.planName}</h4>
                                                        <p className="text-center mb-5">{plan.planDescription || 'Perfect for you'}</p>
                                                        <div className="text-center">
                                                            <div className="d-flex justify-content-center">
                                                                <sup className="h6 pricing-currency mt-2 mb-0 me-1 text-body">{plan.currency}</sup>
                                                                {/* <h1 className="mb-0 text-primary">{plan.finalAmount}</h1> */}
                                                                <h1 className="mb-0 text-primary">
                                                                    {/* {appliedCoupon
                                                                        ? (plan.finalAmount * (1 - appliedCoupon.discountValue / 100)).toFixed(2)
                                                                        : plan.finalAmount} */}

                                                                    {appliedCoupons[plan.id]
                                                                        ? (plan.finalAmount * (1 - appliedCoupons[plan.id].discountValue / 100)).toFixed(2)
                                                                        : plan.finalAmount}
                                                                </h1>
                                                                <sub className="h6 pricing-duration mt-auto mb-1 text-body">/month</sub>
                                                            </div>
                                                        </div>

                                                        <ul className="list-group ps-6 my-5 pt-4">
                                                            {features.map((feature, idx) => (
                                                                <li key={idx} className="mb-4">{feature}</li>
                                                            ))}
                                                        </ul>

                                                        <div className="coupon-section mb-4 text-center">
                                                            <input
                                                                type="text"
                                                                placeholder="Enter coupon code"
                                                                value={couponCodes[plan.id] || ''}
                                                                onChange={(e) =>
                                                                    setCouponCodes((prev) => ({ ...prev, [plan.id]: e.target.value }))
                                                                }
                                                                className="form-control d-inline-block w-auto me-2"
                                                            />
                                                            <button
                                                                onClick={() => handleApplyCoupon(plan.id)}
                                                                className="btn btn-sm btn-success"
                                                            >
                                                                Apply Coupon
                                                            </button>
                                                            {appliedCoupons[plan.id] && (
                                                                <div className="mt-2 text-success">
                                                                    Coupon applied: {appliedCoupons[plan.id].discountCouponCode} (
                                                                    {appliedCoupons[plan.id].discountValue}% off)
                                                                </div>
                                                            )}
                                                            {errorMessages[plan.id] && (
                                                                <div className="mt-2 text-danger">{errorMessages[plan.id]}</div>
                                                            )}
                                                        </div>

                                                        <button
                                                            onClick={() => initiatePayment(plan.id)}
                                                            className={`btn ${index === 1 ? 'btn-primary' : 'btn-outline-primary'} d-grid w-100`}
                                                        >
                                                            {index === 0 ? 'Your Current Plan' : 'Upgrade'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center">No plans available</div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}
