'use client'
import Link from 'next/link';
import React, { useState, useEffect } from 'react';

export default function Page() {

    const [paymentHistory, setPaymentHistory] = useState([]);

    useEffect(() => {
        const fetchPaymentHistory = async () => {
            const tokenData = localStorage.getItem('camrilla_token');
            if (!tokenData) return;

            try {
                const { accessToken } = JSON.parse(tokenData);
                const res = await fetch('https://api.camrilla.com/payment-history', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });

                const json = await res.json();
                if (json.code === 0) {
                    setPaymentHistory(json.data || []);
                }
            } catch (err) {
                console.error("Error fetching payment history:", err);
            }
        };

        fetchPaymentHistory();
    }, []);


    const [userData, setUserData] = useState({});

    const [planInfo, setPlanInfo] = useState(null);

    useEffect(() => {
        const data = localStorage.getItem('userData');
        if (data) {
            const parsedData = JSON.parse(data);
            setUserData(parsedData);
        }
    }, []);

    useEffect(() => {
        const fetchUserPlan = async () => {
            const tokenData = localStorage.getItem('camrilla_token');
            if (!tokenData) return;

            try {
                const { accessToken } = JSON.parse(tokenData);
                const res = await fetch('https://api.camrilla.com/user-plan', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });

                const json = await res.json();
                if (json.code === 0) {
                    setPlanInfo(json.data.userPlanDetails);
                }
            } catch (err) {
                console.error("Error fetching user plan:", err);
            }
        };

        fetchUserPlan();
    }, []);

    return (
        <div>

            <div class="container-xxl flex-grow-1 container-p-y">
                <div class="row">
                    <div class="col-md-12">
                        <div class="nav-align-top">
                            <ul class="nav nav-pills flex-column flex-md-row mb-6 gap-2 gap-lg-0">
                                <li class="nav-item">
                                    <Link class="nav-link active" href="/Settings"
                                    ><i class="ri-group-line me-2"></i>Account</Link>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/Security"
                                    ><i class="ri-lock-line me-2"></i>Security</a
                                    >
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link" href="/Transactions"
                                    ><i className="ri-lock-line me-2"></i>Transactions</a
                                    >
                                </li>

                            </ul>
                        </div>
                        <div class="card mb-6">

                            <div class="card-body pt-0">
                                <form id="formAccountSettings" method="GET" onsubmit="return false">
                                    <div class="row mt-1 g-5">
                                        <div class="col-md-6">
                                            <div class="form-floating form-floating-outline">
                                                <input
                                                    className="form-control"
                                                    type="text"
                                                    id="firstName"
                                                    name="firstName"
                                                    value={userData.name?.split(' ')[0] || ''}
                                                    readOnly
                                                />
                                                <label for="firstName">First Name</label>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-floating form-floating-outline">
                                                <input
                                                    className="form-control"
                                                    type="text"
                                                    id="lastName"
                                                    name="lastName"
                                                    value={userData.name?.split(' ')[1] || ''}
                                                    readOnly
                                                />
                                                <label for="lastName">Last Name</label>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-floating form-floating-outline">
                                                <input
                                                    className="form-control"
                                                    type="text"
                                                    id="email"
                                                    name="email"
                                                    value={userData.email || ''}
                                                    readOnly
                                                />
                                                <label for="email">E-mail</label>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-floating form-floating-outline">
                                                <input
                                                    type="text"
                                                    class="form-control"
                                                    id="organization"
                                                    name="organization"
                                                    value="Pixinvent" />
                                                <label for="organization">Organization</label>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="input-group input-group-merge">
                                                <div class="form-floating form-floating-outline">
                                                    <input
                                                        type="text"
                                                        id="phoneNumber"
                                                        name="phoneNumber"
                                                        className="form-control"
                                                        value={userData.mobile || ''}
                                                        readOnly
                                                    />
                                                    <label for="phoneNumber">Phone Number</label>
                                                </div>
                                                <span class="input-group-text">US (+1)</span>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="form-floating form-floating-outline">
                                                <select id="country" className="select2 form-select" defaultValue={userData.country || ''} disabled>
                                                    <option value="IN">India</option>
                                                    <option value="US">United States</option>
                                                    <option value="CA">Canada</option>
                                                    {/* ... Add others */}
                                                </select>
                                                <label htmlFor="country">Country</label>
                                            </div>
                                        </div>
                                        {/* Language */}
                                        <div className="col-md-6">
                                            <div className="form-floating form-floating-outline">
                                                <input
                                                    id="TagifyLanguageSuggestion"
                                                    name="TagifyLanguageSuggestion"
                                                    className="form-control h-auto"
                                                    placeholder="select language"
                                                    value="English" // static for now
                                                    readOnly
                                                />
                                                <label htmlFor="TagifyLanguageSuggestion">Language</label>
                                            </div>
                                        </div>

                                        <div class="col-md-6">
                                            <div class="form-floating form-floating-outline">
                                                <select id="currency" class="select2 form-select">
                                                    <option value="inr" selected>INR</option>
                                                    <option value="euro">Euro</option>
                                                    <option value="pound">Pound</option>
                                                    <option value="bitcoin">Bitcoin</option>
                                                </select>
                                                <label for="currency">Currency</label>
                                            </div>
                                        </div>
                                        <h5 className="mb-4">Your Current Plan Details</h5>
                                        {planInfo && (<>
                                            <div class="col-md-6">
                                                <div class="form-floating form-floating-outline">
                                                    <input
                                                        className="form-control"
                                                        type="text"
                                                        id="Plan"
                                                        name="Plan"
                                                        value={planInfo.planName}
                                                        readOnly
                                                    />
                                                    <label for="Plan">Plan</label>
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <div class="form-floating form-floating-outline">
                                                    <input
                                                        className="form-control"
                                                        type="text"
                                                        id="Status"
                                                        name="Status"
                                                        value={planInfo.planStatus}
                                                        readOnly
                                                    />
                                                    <label for="Status">Status</label>
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <div class="form-floating form-floating-outline">
                                                    <input
                                                        className="form-control"
                                                        type="text"
                                                        id="startDate"
                                                        name="startDate"
                                                        value={new Date(planInfo.startDate).toLocaleDateString()}
                                                        readOnly
                                                    />
                                                    <label for="startDate">Start Date</label>
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <div class="form-floating form-floating-outline">
                                                    <input
                                                        className="form-control"
                                                        type="text"
                                                        id="endDate"
                                                        name="endDate"
                                                        value={new Date(planInfo.endDate).toLocaleDateString()}
                                                        readOnly
                                                    />
                                                    <label for="startDate">End Date</label>
                                                </div>
                                            </div>
                                        </>
                                        )}
                                    </div>
                                </form>
                            </div>

                        </div>
                    </div>
                </div>

                {/* <div className="card p-3" style={{height:"100vh", overflowY:"scroll"}} >

                    {paymentHistory.length > 0 && (
                        <div className="col-md-12 mt-4">
                            <h5 className="mb-3">Payment History</h5>
                            <div className="table-responsive">
                                <table className="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Plan</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                            <th>Currency</th>
                                            <th>Order ID</th>
                                            <th>Coupon Code</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paymentHistory.map((txn, index) => (
                                            <tr key={index}>
                                                <td>{new Date(txn.paymentDate).toLocaleDateString()}</td>
                                                <td>{txn.planName}</td>
                                                <td>{txn.amount}</td>
                                                <td>{txn.paymentStatus}</td>
                                                <td>{txn.currency}</td>
                                                <td>{txn.orderId}</td>
                                                <td>{txn.discountCouponCode || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </div> */}


            </div>

        </div>
    )
}
