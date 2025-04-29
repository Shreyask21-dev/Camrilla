'use client'
import Link from 'next/link';
import React, { useState, useEffect } from 'react';

export default function Page() {

    const [userData, setUserData] = useState({});

    useEffect(() => {
        const data = localStorage.getItem('userData');
        if (data) {
            const parsedData = JSON.parse(data);
            setUserData(parsedData);
        }
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

                            </ul>
                        </div>
                        <div class="card mb-6">

                            <div class="card-body">
                                <div class="d-flex align-items-start align-items-sm-center gap-6">
                                    <img
                                        src="/assets/img/avatars/1.png"
                                        alt="user-avatar"
                                        class="d-block w-px-100 h-px-100 rounded-4"
                                        id="uploadedAvatar" />
                                    <div class="button-wrapper">
                                        <label for="upload" class="btn btn-primary me-3 mb-4" tabindex="0">
                                            <span class="d-none d-sm-block">Upload new photo</span>
                                            <i class="ri-upload-2-line d-block d-sm-none"></i>
                                            <input
                                                type="file"
                                                id="upload"
                                                class="account-file-input"
                                                hidden
                                                accept="image/png, image/jpeg" />
                                        </label>
                                        <button type="button" class="btn btn-outline-danger account-image-reset mb-4">
                                            <i class="ri-refresh-line d-block d-sm-none"></i>
                                            <span class="d-none d-sm-block">Reset</span>
                                        </button>

                                        <div>Allowed JPG, GIF or PNG. Max size of 800K</div>
                                    </div>
                                </div>
                            </div>
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
                                        <div class="col-md-6">
                                            <div class="form-floating form-floating-outline">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="address"
                                                    name="address"
                                                    value={userData.address || ''}
                                                    readOnly
                                                />
                                                <label for="address">Address</label>
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
                                                <select id="timeZones" class="select2 form-select">
                                                    <option value="-12" selected>(GMT-12:00) International Date Line West</option>
                                                    <option value="-11">(GMT-11:00) Midway Island, Samoa</option>
                                                    <option value="-10">(GMT-10:00) Hawaii</option>
                                                    <option value="-9">(GMT-09:00) Alaska</option>
                                                    <option value="-8">(GMT-08:00) Pacific Time (US & Canada)</option>
                                                    <option value="-8">(GMT-08:00) Tijuana, Baja California</option>
                                                    <option value="-7">(GMT-07:00) Arizona</option>
                                                    <option value="-7">(GMT-07:00) Chihuahua, La Paz, Mazatlan</option>
                                                    <option value="-7">(GMT-07:00) Mountain Time (US & Canada)</option>
                                                    <option value="-6">(GMT-06:00) Central America</option>
                                                    <option value="-6">(GMT-06:00) Central Time (US & Canada)</option>
                                                    <option value="-6">(GMT-06:00) Guadalajara, Mexico City, Monterrey</option>
                                                    <option value="-6">(GMT-06:00) Saskatchewan</option>
                                                    <option value="-5">(GMT-05:00) Bogota, Lima, Quito, Rio Branco</option>
                                                    <option value="-5">(GMT-05:00) Eastern Time (US & Canada)</option>
                                                    <option value="-5">(GMT-05:00) Indiana (East)</option>
                                                    <option value="-4">(GMT-04:00) Atlantic Time (Canada)</option>
                                                    <option value="-4">(GMT-04:00) Caracas, La Paz</option>
                                                </select>
                                                <label for="timeZones">Timezone</label>
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
                                    </div>
                                    <div class="mt-6">
                                        <button type="submit" class="btn btn-primary me-3">Save changes</button>
                                        <button type="reset" class="btn btn-outline-secondary">Reset</button>
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
