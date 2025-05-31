'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Script from 'next/script'; // For Razorpay script
import config from '../config/config';


export default function Page() {

    const [activePlan, setActivePlan] = useState(null);

    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    const [couponCodes, setCouponCodes] = useState({});
    const [appliedCoupons, setAppliedCoupons] = useState({});
    const [errorMessages, setErrorMessages] = useState({});

    const [AppliedCouponData, setAppliedCouponData] = useState(null);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const tokenDataString = localStorage.getItem('camrilla_token');
                if (!tokenDataString) {
                    console.error('Missing camrilla_token');
                    return;
                }

                const tokenData = JSON.parse(tokenDataString);
                const accessToken = tokenData.accessToken;

                const response = await axios.get(`${config.BASE_URL}user-plan`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });

                console.log('Plans API Response:', response.data);

                if (response.data.code === 0) {
                    // Set both available plans and active plan
                    setPlans(response.data.data.availablePlans || []);
                    setActivePlan(response.data.data.userPlanDetails || {});
                } else {
                    console.error('API Error:', response.data.message);
                }
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
                `${config.BASE_URL}initiate-payment-request`,
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

                const tokenDataString = localStorage.getItem('camrilla_token');
                if (!tokenDataString) {
                    alert('Please login first');
                    return;
                }

                const tokenData = JSON.parse(tokenDataString);
                const accessToken = tokenData.accessToken;

                console.log('Payment Success Response:', response);

                try {
                    await axios.post(`${config.BASE_URL}update-payment-response`, {
                        orderId: paymentData.camrillaOrderId
                    });
                    const updateBasicRes = await axios.post(`${config.BASE_URL}update-basic-plan`, {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    });

                    // alert('Payment successful and updated!');
                    if (updateBasicRes.data && updateBasicRes.data.code === 0) {
                        alert('Payment successful and subscription updated!');
                        // Optional: refresh the page or fetch plans again
                        // window.location.reload();
                    } else {
                        console.error('update-basic-plan failed:', updateBasicRes.data.message);
                        alert('Payment was successful but failed to update subscription.');
                    }

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

            const response = await axios.get(`${config.BASE_URL}admin/discount-coupon/validate/${code}`, {
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
                src="https://checkout.razorpay.com/v1/checkout.js"
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
                            <p className="text-center my-4">
                                Your Journey Begins Here—Subscribe Now & Maximize Your Potential! Exclusive Access <br />Awaits—One Click to Unlock Unlimited Possibilities!
                            </p>

                            <div className="pricing-plans row mx-4 gy-3 px-lg-12 mt-5">
                                {plans.length > 0 ? (
                                    plans.map((plan, index) => {

                                        const features = JSON.parse(plan.feature);

                                        return (
                                            <div key={plan.id} className="col-md-6 mb-4 d-flex justify-content-center" style={{
                                                flexGrow: plan.planName.toLowerCase() === 'professional' ? 1.1 : 1,
                                            }}>
                                                <div className={`card border position-relative ${plan.planName.toLowerCase() === 'professional' ? 'highlight-plan' : ''}`}
                                                    style={{
                                                        width: plan.planName.toLowerCase() === 'professional' ? '100%' : '95%',
                                                        maxWidth: plan.planName.toLowerCase() === 'professional' ? '480px' : '420px',
                                                    }}>

                                                    {plan.planName.toLowerCase() === 'professional' && (
                                                        <div className="recommended-badge">Recommended</div>
                                                    )}
                                                    <div className="card-body pt-4 pb-4 px-3">
                                                        <div className="mt-3 mb-5 text-center">
                                                            <img
                                                                src={`/assets/img/illustrations/${plan?.planName === 'Basic' ? 'pricing-basic.png' : 'pricing-standard.png'}`}
                                                                alt="Plan"
                                                                height="100"
                                                            />
                                                        </div>
                                                        <h4 className="card-title text-center text-capitalize mb-2">{plan.planName}</h4>
                                                        <p className="text-center mb-5">{plan.planDescription || 'Perfect for you'}</p>
                                                        <div className="text-center">
                                                            <div className="d-flex justify-content-center">
                                                                <sup className="h6 pricing-currency mt-2 mb-0 me-1 text-body">{plan.currency}</sup>
                                                                <h1 className="mb-0 text-primary">
                                                                    {appliedCoupons[plan.id]
                                                                        ? (plan.finalAmount * (1 - appliedCoupons[plan.id].discountValue / 100)).toFixed(2)
                                                                        : plan.finalAmount}
                                                                </h1>
                                                                <sub className="h6 pricing-duration mt-auto mb-1 text-body">/year</sub>
                                                            </div>
                                                        </div>

                                                        <ul className="list-group my-3 pt-2" style={{ paddingLeft: "28%" }}>
                                                            {features.map((feature, idx) => (
                                                                <li key={idx} className="mb-2 small">{feature}</li>
                                                            ))}
                                                        </ul>

                                                        {!(
                                                            (plan.planName === 'Basic' &&
                                                                plan.monthlyAmount === 0.0 &&
                                                                plan.monthlyDisscountedAmount === 0.0 &&
                                                                plan.finalAmount === 0.0) ||
                                                            // (activePlan?.planId === plan.id)
                                                            (activePlan?.planId === plan.id && plan.planName.toLowerCase() !== 'professional')
                                                        ) && (
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
                                                            )}


                                                        {!(plan.planName === 'Basic' &&
                                                            plan.monthlyAmount === 0.0 &&
                                                            plan.monthlyDisscountedAmount === 0.0 &&
                                                            plan.finalAmount === 0.0) && (
                                                                <button
                                                                    onClick={() => initiatePayment(plan.id)}
                                                                    className={`btn ${activePlan?.planId === plan.id ? 'btn-primary' : 'btn-outline-primary'} d-grid w-100`}
                                                                // disabled={activePlan?.planId === plan.id}
                                                                >
                                                                    {activePlan?.planId === plan.id ? (plan.planName.toLowerCase() === 'professional' ? 'Renew' : 'Your Current Plan') : 'Upgrade'}
                                                                </button>
                                                            )}
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
