'use client'
import React, { useState, useEffect } from 'react';
import { getName } from 'country-list';
import axios from 'axios'; // import axios
import Link from 'next/link';
import config from '../config/config';

export default function Page() {

    const [userData, setUserData] = useState({});
    const [countryName, setCountryName] = useState('');
    const [planInfo, setPlanInfo] = useState(null);

    const [assignments, setAssignments] = useState([]);
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);

    const [assignmentCount, setAssignmentCount] = useState(0);
useEffect(() => {
        const fetchAssignmentCount = async () => {
            try {
                const tokenData = localStorage.getItem('camrilla_token');
                const accessToken = JSON.parse(tokenData)?.accessToken;
                if (!accessToken) return;

                const now = new Date();
                const currentYearStart = new Date(2000, 0, 1).getTime();
                const currentYearEnd = new Date(2100, 11, 31, 23, 59, 59, 999).getTime();

                const response = await axios.get(`${config.BASE_URL}order/assignment`, {
                    params: {
                        startDate: currentYearStart,
                        endDate: currentYearEnd
                    },
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });

                console.log(response.data)

                setAssignmentCount((response.data.data || []).length);
            } catch (error) {
                console.error("Error fetching assignment count:", error);
            }
        };

        fetchAssignmentCount();
    }, []);

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Read from localStorage
                const userDataString = localStorage.getItem('userData');
                const tokenDataString = localStorage.getItem('camrilla_token');

                if (!userDataString || !tokenDataString) {
                    console.error('Missing userData or camrilla_token');
                    return;
                }

                const userData = JSON.parse(userDataString);
                const tokenData = JSON.parse(tokenDataString);

                setUserData(userData);

                const name = getName(userData.country);
                setCountryName(name);

                const accessToken = tokenData.accessToken;

                // Get the current date
                const currentDate = new Date();
                // Calculate the start date of the current year
                const startDate = new Date(currentDate.getFullYear(), 0, 1); // January 1st of the current year
                const startDateMs = startDate.getTime(); // Start date in milliseconds
                // Calculate the end date of the current year
                const endDate = new Date(currentDate.getFullYear(), 11, 31, 23, 59, 59, 999); // December 31st of the current year
                const endDateMs = endDate.getTime(); // End date in milliseconds
                console.log("Start Date (Unix Time in ms):", startDateMs);
                console.log("End Date (Unix Time in ms):", endDateMs);

                // API endpoints${startDateMs}${endDate}
                const assignmentURL = `${config.BASE_URL}order/assignment?startDate=${startDateMs}&endDate=${endDateMs}`;
                const leadsURL = `${config.BASE_URL}lead-manager/lead`;

                // Fetch both APIs together
                const [assignmentsRes, leadsRes] = await Promise.all([
                    axios.get(assignmentURL),
                    axios.get(leadsURL),
                ]);

                console.log(assignmentsRes.data)
                setAssignments(assignmentsRes.data.data || []);
                setLeads(leadsRes.data.data || []);
            } catch (error) {
                console.error('Error fetching assignments or leads:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        fetchUserPlan();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }


    const formatDateParts = (timestamp) => {
        if (!timestamp) return { month: '', day: '', year: '' };
        const dateObj = new Date(timestamp);
        const month = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase(); // "APR"
        const day = dateObj.getDate(); // "20"
        const year = dateObj.getFullYear(); // "2025"
        return { month, day, year };
    };

    

    return (
        <div>

            <div className="container-xxl flex-grow-1 container-p-y">

                <div className="row">
                    <div className="col-12">
                        <div className="card mb-6">
                            <div className="user-profile-header-banner">
                                <img src="/assets/img/pages/profile-banner.png" alt="Banner image" className="rounded-top" />
                            </div>
                            <div className="user-profile-header d-flex flex-column flex-sm-row text-sm-start text-center mb-5">

                                <div className="flex-grow-1 mt-4 mt-sm-12">

                                    <div
                                        className="d-flex align-items-md-end align-items-sm-start align-items-center justify-content-md-between justify-content-start mx-5 flex-md-row flex-column gap-6">
                                        <div className="user-profile-info">
                                            <div style={{ display: "flex" }}>

                                                <div
                                                    style={{
                                                        width: '68px',
                                                        height: '68px',
                                                        backgroundColor: '#7367F0',
                                                        color: 'white',
                                                        fontWeight: 'bold',
                                                        fontSize: '30px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        borderRadius: '8px',
                                                        marginRight: '12px'
                                                    }}
                                                >
                                                    {(() => {
                                                        const name = userData.name || 'John Doe';
                                                        const parts = name.trim().split(/\s+/);
                                                        return parts.map(p => p[0]).slice(0, 3).join('').toUpperCase();
                                                    })()}
                                                </div>

                                                <div>

                                                    <h4 className="mb-2">{userData.name || 'John Doe'}</h4>
                                                    <ul
                                                        className="list-inline mb-0 d-flex align-items-center flex-wrap justify-content-sm-start justify-content-center gap-4">

                                                        <li className="list-inline-item">
                                                            <i className="ri-map-pin-line me-2 ri-24px"></i><span className="fw-medium">{countryName || 'Country'}</span>
                                                        </li>

                                                    </ul>

                                                </div>
                                            </div>

                                        </div>

                                        {planInfo?.planName != 'Professional' &&
                                            <Link href="/Subscriptions" className="btn btn-primary">
                                                <i className="ri-user-follow-line ri-16px me-2"></i>Subscribe Now
                                            </Link>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-xl-4 col-lg-5 col-md-5">

                        <div className="card mb-6">
                            <div className="card-body" style={{ height: "283px" }}>
                                <small className="card-text text-uppercase text-muted small">About</small>
                                <ul className="list-unstyled my-3 py-1">
                                    <li className="d-flex align-items-center mb-4">
                                        <i className="ri-user-3-line ri-24px"></i><span className="fw-medium mx-2">Full Name:</span>
                                        <span>{userData.name || 'John Doe'}</span>
                                    </li>
                                    <li className="d-flex align-items-center mb-4">
                                        <i className="ri-flag-2-line ri-24px"></i><span className="fw-medium mx-2">Country:</span>
                                        <span>{countryName || 'Country'}</span>
                                    </li>
                                    <li className="d-flex align-items-center mb-4">
                                        <i className="ri-cash-line ri-24px"></i><span className="fw-medium mx-2">Currency:</span>
                                        <span>{userData.currency || 'INR'}</span>
                                    </li>
                                    <li className="d-flex align-items-center mb-4">
                                        <i className="ri-global-line ri-24px"></i><span className="fw-medium mx-2">Time Zone:</span>
                                        <span>{userData.userTimeZone || 'Asia'}</span>
                                    </li>
                                    <li className="d-flex align-items-center mb-2">
                                        <i className="ri-translate-2 ri-24px"></i><span className="fw-medium mx-2">Languages:</span>
                                        <span>English</span>
                                    </li>
                                </ul>

                            </div>
                        </div>

                    </div>
                    <div className="col-xl-8 col-lg-7 col-md-7">

                        <div className="row">

                            <div className="col-lg-12 col-xl-6">
                                <div className="card mb-6">
                                    <div className="card-body" style={{ height: "283px" }}>
                                        <small className="card-text text-uppercase text-muted small">Contacts</small>
                                        <ul className="list-unstyled my-3 py-1">
                                            <li className="d-flex align-items-center mb-4">
                                                <i className="ri-phone-line ri-24px"></i><span className="fw-medium mx-2">Contact:</span>
                                                <span>{userData.mobile || '(123) 456-7890'}</span>
                                            </li>
                                            <li className="d-flex align-items-center mb-2">
                                                <i className="ri-mail-open-line ri-24px"></i><span className="fw-medium mx-2">Email:</span>
                                                <span>{userData.email || 'john.doe@example.com'}</span>
                                            </li>
                                        </ul>
                                        <small className="card-text text-uppercase text-muted small">Overview</small>
                                        <ul className="list-unstyled mb-0 mt-3 pt-1">
                                            <li className="d-flex align-items-center mb-4">
                                                <i className="ri-user-3-line ri-24px"></i><span className="fw-medium mx-2">Assignments:</span>
                                                <span>{assignmentCount}</span>
                                            </li>
                                            <li className="d-flex align-items-center">
                                                <i className="ri-star-smile-line ri-24px"></i><span className="fw-medium mx-2">Leads:</span>
                                                <span>{leads.length}</span>

                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-12 col-xl-6">
                                <div className="card mb-6">
                                    <div className="card-body" style={{ height: "283px" }}>
                                        <small className="card-text text-uppercase text-muted small">Plan Details</small>
                                        <ul className="list-unstyled my-3 py-1">
                                            <li className="d-flex align-items-center mb-4">
                                                <i className="ri-file-list-2-line ri-24px"></i><span className="fw-medium mx-2">Plan :</span>
                                                <span>{planInfo?.planName}</span>
                                            </li>
                                            <li className="d-flex align-items-center mb-4">
                                                <i className="ri-flag-line ri-24px"></i><span className="fw-medium mx-2">Status:</span>
                                                <span>{planInfo?.planStatus}</span>
                                            </li>
                                            <li className="d-flex align-items-center mb-4">
                                                <i className="ri-calendar-line ri-24px"></i><span className="fw-medium mx-2">Starts :</span>
                                                <span>{new Date(planInfo?.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                            </li>
                                            <li className="d-flex align-items-center">
                                                <i className="ri-calendar-line ri-24px"></i><span className="fw-medium mx-2">Ends:</span>
                                                <span>{new Date(planInfo?.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                            </li>
                                        </ul>

                                    </div>
                                </div>
                            </div>



                        </div>

                    </div>
                </div>

            </div>

        </div>
    )
}
