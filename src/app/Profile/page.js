'use client'
import React, { useState, useEffect } from 'react';
import { getName } from 'country-list';
import axios from 'axios'; // import axios
import Link from 'next/link';

export default function Page() {

    const [userData, setUserData] = useState({});
    const [countryName, setCountryName] = useState('');

    const [assignments, setAssignments] = useState([]);
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);

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

                // Calculate start and end date in milliseconds
                const endDate = Date.now();
                const startDate = new Date();
                startDate.setFullYear(startDate.getFullYear() - 1);
                const startDateMs = startDate.getTime();

                // API endpoints
                const assignmentURL = `https://api.camrilla.com/order/assignment?startDate=${startDateMs}&endDate=${endDate}`;
                const leadsURL = `https://api.camrilla.com/lead-manager/lead`;

                // Fetch both APIs together
                const [assignmentsRes, leadsRes] = await Promise.all([
                    axios.get(assignmentURL),
                    // , {
                    //     headers: { Authorization: `Bearer ${accessToken}` }
                    // }
                    axios.get(leadsURL),
                    // , {
                    //     headers: { Authorization: `Bearer ${accessToken}` }
                    // }
                ]);

                setAssignments(assignmentsRes.data.data || []);
                setLeads(leadsRes.data.data || []);
            } catch (error) {
                console.error('Error fetching assignments or leads:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
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

            <div class="container-xxl flex-grow-1 container-p-y">

                <div class="row">
                    <div class="col-12">
                        <div class="card mb-6">
                            <div class="user-profile-header-banner">
                                <img src="/assets/img/pages/profile-banner.png" alt="Banner image" class="rounded-top" />
                            </div>
                            <div class="user-profile-header d-flex flex-column flex-sm-row text-sm-start text-center mb-5">
                                <div class="flex-shrink-0 mt-n2 mx-sm-0 mx-auto">
                                    <img
                                        src="/assets/img/avatars/1.png"
                                        alt="user image"
                                        class="d-block h-auto ms-0 ms-sm-5 rounded-4 user-profile-img" />
                                </div>
                                <div class="flex-grow-1 mt-4 mt-sm-12">
                                    <div
                                        class="d-flex align-items-md-end align-items-sm-start align-items-center justify-content-md-between justify-content-start mx-5 flex-md-row flex-column gap-6">
                                        <div class="user-profile-info">
                                            <h4 class="mb-2">{userData.name || 'John Doe'}</h4>
                                            <ul
                                                class="list-inline mb-0 d-flex align-items-center flex-wrap justify-content-sm-start justify-content-center gap-4">

                                                <li class="list-inline-item">
                                                    <i class="ri-map-pin-line me-2 ri-24px"></i><span class="fw-medium">{countryName || 'Country'}</span>
                                                </li>

                                            </ul>
                                        </div>
                                        <a href="javascript:void(0)" class="btn btn-primary">
                                            <i class="ri-user-follow-line ri-16px me-2"></i>Connected
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-xl-4 col-lg-5 col-md-5">

                        <div class="card mb-6">
                            <div class="card-body">
                                <small class="card-text text-uppercase text-muted small">About</small>
                                <ul class="list-unstyled my-3 py-1">
                                    <li class="d-flex align-items-center mb-4">
                                        <i class="ri-user-3-line ri-24px"></i><span class="fw-medium mx-2">Full Name:</span>
                                        <span>{userData.name || 'John Doe'}</span>
                                    </li>
                                    <li class="d-flex align-items-center mb-4">
                                        <i class="ri-flag-2-line ri-24px"></i><span class="fw-medium mx-2">Country:</span>
                                        <span>{countryName || 'Country'}</span>
                                    </li>
                                    <li class="d-flex align-items-center mb-2">
                                        <i class="ri-translate-2 ri-24px"></i><span class="fw-medium mx-2">Languages:</span>
                                        <span>English</span>
                                    </li>
                                </ul>
                                <small class="card-text text-uppercase text-muted small">Contacts</small>
                                <ul class="list-unstyled my-3 py-1">
                                    <li class="d-flex align-items-center mb-4">
                                        <i class="ri-phone-line ri-24px"></i><span class="fw-medium mx-2">Contact:</span>
                                        <span>{userData.mobile || '(123) 456-7890'}</span>
                                    </li>
                                    <li class="d-flex align-items-center mb-2">
                                        <i class="ri-mail-open-line ri-24px"></i><span class="fw-medium mx-2">Email:</span>
                                        <span>{userData.email || 'john.doe@example.com'}</span>
                                    </li>
                                </ul>

                            </div>
                        </div>

                        <div class="card mb-6">
                            <div class="card-body">
                                <small class="card-text text-uppercase text-muted small">Overview</small>
                                <ul class="list-unstyled mb-0 mt-3 pt-1">
                                    <li class="d-flex align-items-center mb-4">
                                        <i class="ri-user-3-line ri-24px"></i><span class="fw-medium mx-2">Assignments:</span>
                                        <span>{userData.assignmentCount || 0}</span>
                                    </li>
                                    <li class="d-flex align-items-center">
                                        <i class="ri-star-smile-line ri-24px"></i><span class="fw-medium mx-2">Leads:</span>
                                        <span>{userData.leadCount || 0}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                    </div>
                    <div class="col-xl-8 col-lg-7 col-md-7">

                        <div class="row">

                            <div className="col-lg-12 col-xl-6">
                                <div className="card card-action mb-6">
                                    <div className="card-header align-items-center">
                                        <h5 className="card-action-title mb-0">Assignments</h5>
                                    </div>
                                    <div className="card-body">
                                        <ul className="list-unstyled mb-0">
                                            {assignments.length > 0 ? (
                                                assignments.map((assignment, index) => {

                                                    const { month, day, year } = formatDateParts(assignment.assignmentDateTime);

                                                    return (
                                                        <li key={index} className="mb-4">
                                                            <div className="d-flex align-items-center">
                                                                <div className="d-flex align-items-center">
                                                                    <div className="avatar me-2 text-center bg-primary text-white rounded-circle d-flex flex-column justify-content-center align-items-center" style={{ width: '60px', height: '60px', fontSize: '10px' }}>
                                                                        <div>{month}</div>
                                                                        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{day}</div>
                                                                        <div>{year}</div>
                                                                    </div>
                                                                    <div className="me-2">
                                                                        <h6 className="mb-1">{assignment.assignmentName || 'No Title'}</h6>
                                                                        <small>{assignment.customerName || 'No Client'}</small>
                                                                    </div>
                                                                </div>
                                                                <div className="ms-auto">
                                                                    <Link href='/Assignments' >
                                                                        <button className="btn btn-outline-primary btn-icon">
                                                                            <i className="ri-user-add-line ri-22px"></i>
                                                                        </button>
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        </li>
                                                    )
                                                })
                                            ) : (
                                                <li>No Assignments Found</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-12 col-xl-6">
                                <div className="card card-action mb-6">
                                    <div className="card-header align-items-center">
                                        <h5 className="card-action-title mb-0">Leads</h5>
                                    </div>
                                    <div className="card-body">
                                        <ul className="list-unstyled mb-0">
                                            {leads.length > 0 ? (
                                                leads.map((lead, index) => {

                                                    const { month, day, year } = formatDateParts(lead.leadDate);

                                                    return (
                                                        <li key={index} className="mb-4">
                                                            <div className="d-flex align-items-center">
                                                                <div className="d-flex align-items-center">
                                                                    <div className="avatar me-2 text-center bg-primary text-white rounded-circle d-flex flex-column justify-content-center align-items-center" style={{ width: '60px', height: '60px', fontSize: '10px' }}>
                                                                        <div>{month}</div>
                                                                        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{day}</div>
                                                                        <div>{year}</div>
                                                                    </div>
                                                                    <div className="me-2">
                                                                        <h6 className="mb-1">{lead.customerName || 'No Lead Name'}</h6>
                                                                        <small>{lead.status || 'No Status'}</small>
                                                                    </div>
                                                                </div>
                                                                <div className="ms-auto">
                                                                    <a href="javascript:;" className="badge bg-label-primary rounded-pill">
                                                                        {lead.assignmentType || 'Lead'}
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </li>
                                                    )
                                                })
                                            ) : (
                                                <li>No Leads Found</li>
                                            )}
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
