'use client'
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { lookup } from 'country-data';
import config from '../config/config';

export default function Page() {

    const [paymentHistory, setPaymentHistory] = useState([]);

    useEffect(() => {
        const fetchPaymentHistory = async () => {
            const tokenData = localStorage.getItem('camrilla_token');
            if (!tokenData) return;

            try {
                const { accessToken } = JSON.parse(tokenData);
                const res = await fetch(`${config.BASE_URL}payment-history`, {
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
                const res = await fetch(`${config.BASE_URL}user-plan`, {
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

    const getCountryDetails = (countryCode) => {
        try {
            const countries = lookup?.countries?.({ alpha2: countryCode }) || [];
            const country = countries.length > 0 ? countries[0] : null;
            return country ? { name: country.name, phoneCode: country.callingCodes?.[0] || '' } : { name: '', phoneCode: '' };
        } catch (e) {
            console.error('Error in getCountryDetails:', e);
            return { name: '', phoneCode: '' };
        }
    };


    const { name: countryName, phoneCode } = getCountryDetails(userData.country || '');

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
                                            <div class="input-group input-group-merge">
                                                <div class="form-floating form-floating-outline">
                                                    <input
                                                        type="text"
                                                        id="phoneNumber"
                                                        name="phoneNumber"
                                                        className="form-control"
                                                        // value={userData.mobile || ''}
                                                        value={`${phoneCode} ${userData.mobile || ''}`}
                                                        readOnly
                                                    />
                                                    <label for="phoneNumber">Phone Number</label>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="col-md-6">
                                            <div class="input-group input-group-merge">
                                                <div class="form-floating form-floating-outline">
                                                    <input
                                                        type="text"
                                                        id="country"
                                                        name="country"
                                                        className="form-control"
                                                        // value={userData.country || ''}
                                                        value={countryName}
                                                        readOnly
                                                    />
                                                    <label for="country">Country</label>
                                                </div>
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
                                            <div class="input-group input-group-merge">
                                                <div class="form-floating form-floating-outline">
                                                    <input
                                                        type="text"
                                                        id="currency"
                                                        name="currency"
                                                        className="form-control"
                                                        value={userData.currency || ''}
                                                        readOnly
                                                    />
                                                    <label for="currency">Currency</label>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="col-md-6">
                                            <div class="input-group input-group-merge">
                                                <div class="form-floating form-floating-outline">
                                                    <input
                                                        type="text"
                                                        id="timeZone"
                                                        name="timeZone"
                                                        className="form-control"
                                                        value={userData.userTimeZone || ''}
                                                        readOnly
                                                    />
                                                    <label for="timeZone">Time Zone</label>
                                                </div>
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
                                            {planInfo.planName === 'Professional' &&
                                                <>
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
                                                </>}

                                        </>
                                        )}
                                    </div>
                                </form>
                            </div>

                        </div>
                    </div>
                </div>

            </div>

        </div>
    )
}
