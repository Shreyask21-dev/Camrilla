'use client';
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link';
import AvatarInitials from './AvatarInitials';
import useSearchStore from '../store/searchStore'; // adjust the path 

export default function Navbar() {

    const token = JSON.parse(localStorage.getItem('camrilla_token'));

    const { setSearchTerm } = useSearchStore();

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const [userData, setUserData] = useState({})

    const router = useRouter()

    const handleLogout = () => {
        localStorage.clear() // clears all keys; use removeItem if you want to keep some
        router.push('/Login') // redirect to login page
    }

    // useEffect(() => {
    //     const data = localStorage.getItem('userData')
    //     console.log(JSON.parse(data))
    //     setUserData(JSON.parse(data))
    // }, [])

    useEffect(() => {
        const data = localStorage.getItem('userData');
        const parsedData = JSON.parse(data);
        console.log('Parsed User Data:', parsedData);
        if (parsedData) {
            setUserData(parsedData);
        } else {
            setUserData({ name: '', email: '' });
        }
    }, []);

     if (!token?.accessToken) return null;

    return (
        <div>

            <nav
                className="layout-navbar container-xxl navbar navbar-expand-xl navbar-detached align-items-center bg-navbar-theme"
                id="layout-navbar">
                <div className="layout-menu-toggle navbar-nav align-items-xl-center me-4 me-xl-0 d-xl-none">
                    <a className="nav-item nav-link px-0 me-xl-6" href="javascript:void(0)">
                        <i className="ri-menu-fill ri-22px"></i>
                    </a>
                </div>

                <div className="navbar-nav-right d-flex align-items-center" id="navbar-collapse">

                    <div className="navbar-nav align-items-center">
                        <div className="nav-item navbar-search-wrapper mb-0">


                            <div className="position-relative border border-top-0 border-start-0 border-end-0 " style={{ width: "67.5vw" }}>
                                <i
                                    className="ri-search-line position-absolute text-muted "
                                    style={{ top: '50%', left: '0px', transform: 'translateY(-50%)' }}
                                ></i>
                                <input
                                    type="text"
                                    className="form-control ps-5 border-0"
                                    placeholder="Search..."
                                    aria-label="Search..."
                                    onChange={handleSearchChange}
                                />
                            </div>

                        </div>
                    </div>


                    <ul className="navbar-nav flex-row align-items-center ms-auto">

                        <li className="nav-item navbar-dropdown dropdown-user dropdown">
                            <a className="nav-link dropdown-toggle hide-arrow" href="javascript:void(0);" data-bs-toggle="dropdown">
                                <AvatarInitials name={userData?.name || 'Guest'} />
                            </a>
                            <ul className="dropdown-menu dropdown-menu-end">
                                <li>
                                    <a className="dropdown-item" href="/Profile">
                                        <div className="d-flex">
                                            <div className="flex-shrink-0 me-2">
                                                <AvatarInitials name={userData?.name || 'Guest'} />
                                            </div>
                                            <div className="flex-grow-1">
                                                <span className="fw-medium d-block small">{userData.name}</span>
                                                <small className="text-muted">{userData.email}</small>
                                            </div>
                                        </div>
                                    </a>
                                </li>
                                <li>
                                    <div className="dropdown-divider"></div>
                                </li>
                                <li>
                                    <Link className="dropdown-item" href="/Profile">
                                        <i className="ri-user-3-line ri-22px me-3"></i><span className="align-middle">My Profile</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link className="dropdown-item" href="/Settings">
                                        <i className="ri-settings-4-line ri-22px me-3"></i><span className="align-middle">Settings</span>
                                    </Link>
                                </li>

                                <li>
                                    <div className="dropdown-divider"></div>
                                </li>

                                <li>
                                    <Link className="dropdown-item" href="/Subscriptions">
                                        <i className="ri-money-dollar-circle-line ri-22px me-3"></i
                                        ><span className="align-middle">Pricing</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link className="dropdown-item" href="Feedback">
                                        <i className="ri-question-line ri-22px me-3"></i><span className="align-middle">FAQ</span>
                                    </Link>
                                </li>

                                <li>
                                    <div className="dropdown-divider"></div>
                                </li>

                                <li>
                                    <Link className="dropdown-item" href="https://www.facebook.com/camrillatheapp/" target='_blank'>
                                        <i className="menu-icon tf-icons ri-facebook-circle-fill"></i><span className="align-middle">Facebook</span>
                                    </Link>
                                </li>

                                <li>
                                    <Link className="dropdown-item" href="https://www.instagram.com/camrilla_photographers_app/" target='_blank'>
                                        <i className="ri-instagram-line ri-22px me-3"></i><span className="align-middle">Instagram</span>
                                    </Link>
                                </li>

                                <li>
                                    <Link className="dropdown-item" href="https://camrilla.com/" target='_blank'>
                                        <i className="ri-earth-line ri-22px me-3"></i><span className="align-middle">Website</span>
                                    </Link>
                                </li>

                                <li>
                                    <div className="d-grid px-4 pt-2 pb-1">
                                        <button onClick={handleLogout} className="btn btn-sm btn-danger d-flex">
                                            <small className="align-middle">Logout</small>
                                            <i className="ri-logout-box-r-line ms-2 ri-16px"></i>
                                        </button>
                                    </div>
                                </li>
                            </ul>
                        </li>

                    </ul>
                </div>


                <div className="navbar-search-wrapper search-input-wrapper d-none">
                    <input
                        type="text"
                        className="form-control search-input container-xxl border-0"
                        placeholder="Search..."
                        aria-label="Search..." />
                    <i className="ri-close-fill search-toggler cursor-pointer"></i>
                </div>
            </nav>

        </div>
    )
}
