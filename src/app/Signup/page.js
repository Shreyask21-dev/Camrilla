'use client'
import React, { useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Page() {

    const [successMsg, setSuccessMsg] = useState('')
    const [errorMsg, setErrorMsg] = useState('')

    const router = useRouter()

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        country: '',
        mobile: '',
        password: ''
    })

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSignup = async (e) => {
        e.preventDefault()
        setSuccessMsg('')
        setErrorMsg('')

        const payload = {
            ...formData,
            address: '',
            isEmailVerified: "true",
            googleId: '',
            facebookId: '',
            profilePic: '',
            handle: '#meToo',
            deviceToken: '',
            currency: 'INR',
            userRole: 'USER'
        }

        try {
            console.log('Payload:', payload)
            const res = await axios.post('http://api.camrilla.com/user/register', payload)
            if (res.data.code === 0) {
                setSuccessMsg('🎉 Registration successful! Redirecting to login...')
                setTimeout(() => router.push('/Login'), 2000)
            } else {
                console.error('Signup error:', err.response?.data || err.message || err)
                setErrorMsg(res.data.message || 'Registration failed. Please try again.')
            }
        } catch (error) {
            // || error.message || error \\ error.response?.data
            console.error('Signup error:', JSON.stringify(error.response?.data) )
            setErrorMsg(error.response?.data?.message || 'Something went wrong. Please try again later.')
          }

    }



    return (
        <div>

            <div className="authentication-wrapper authentication-cover">
                <a href="index.html" className="auth-cover-brand d-flex align-items-center gap-2">
                    <span className="app-brand-logo demo">
                        <span style={{ color: "var(--bs-primary)" }}>
                            <svg width="268" height="150" viewBox="0 0 38 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M30.0944 2.22569C29.0511 0.444187 26.7508 -0.172113 24.9566 0.849138C23.1623 1.87039 22.5536 4.14247 23.5969 5.92397L30.5368 17.7743C31.5801 19.5558 33.8804 20.1721 35.6746 19.1509C37.4689 18.1296 38.0776 15.8575 37.0343 14.076L30.0944 2.22569Z"
                                    fill="currentColor" />
                                <path
                                    d="M30.171 2.22569C29.1277 0.444187 26.8274 -0.172113 25.0332 0.849138C23.2389 1.87039 22.6302 4.14247 23.6735 5.92397L30.6134 17.7743C31.6567 19.5558 33.957 20.1721 35.7512 19.1509C37.5455 18.1296 38.1542 15.8575 37.1109 14.076L30.171 2.22569Z"
                                    fill="url(#paint0_linear_2989_100980)"
                                    fill-opacity="0.4" />
                                <path
                                    d="M22.9676 2.22569C24.0109 0.444187 26.3112 -0.172113 28.1054 0.849138C29.8996 1.87039 30.5084 4.14247 29.4651 5.92397L22.5251 17.7743C21.4818 19.5558 19.1816 20.1721 17.3873 19.1509C15.5931 18.1296 14.9843 15.8575 16.0276 14.076L22.9676 2.22569Z"
                                    fill="currentColor" />
                                <path
                                    d="M14.9558 2.22569C13.9125 0.444187 11.6122 -0.172113 9.818 0.849138C8.02377 1.87039 7.41502 4.14247 8.45833 5.92397L15.3983 17.7743C16.4416 19.5558 18.7418 20.1721 20.5361 19.1509C22.3303 18.1296 22.9391 15.8575 21.8958 14.076L14.9558 2.22569Z"
                                    fill="currentColor" />
                                <path
                                    d="M14.9558 2.22569C13.9125 0.444187 11.6122 -0.172113 9.818 0.849138C8.02377 1.87039 7.41502 4.14247 8.45833 5.92397L15.3983 17.7743C16.4416 19.5558 18.7418 20.1721 20.5361 19.1509C22.3303 18.1296 22.9391 15.8575 21.8958 14.076L14.9558 2.22569Z"
                                    fill="url(#paint1_linear_2989_100980)"
                                    fill-opacity="0.4" />
                                <path
                                    d="M7.82901 2.22569C8.87231 0.444187 11.1726 -0.172113 12.9668 0.849138C14.7611 1.87039 15.3698 4.14247 14.3265 5.92397L7.38656 17.7743C6.34325 19.5558 4.04298 20.1721 2.24875 19.1509C0.454514 18.1296 -0.154233 15.8575 0.88907 14.076L7.82901 2.22569Z"
                                    fill="currentColor" />
                                <defs>
                                    <linearGradient
                                        id="paint0_linear_2989_100980"
                                        x1="5.36642"
                                        y1="0.849138"
                                        x2="10.532"
                                        y2="24.104"
                                        gradientUnits="userSpaceOnUse">
                                        <stop offset="0" stop-opacity="1" />
                                        <stop offset="1" stop-opacity="0" />
                                    </linearGradient>
                                    <linearGradient
                                        id="paint1_linear_2989_100980"
                                        x1="5.19475"
                                        y1="0.849139"
                                        x2="10.3357"
                                        y2="24.1155"
                                        gradientUnits="userSpaceOnUse">
                                        <stop offset="0" stop-opacity="1" />
                                        <stop offset="1" stop-opacity="0" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </span>
                    </span>
                    <span className="app-brand-text demo text-heading fw-semibold">Materialize</span>
                </a>

                <div className="authentication-inner row m-0">

                    <div className="d-none d-lg-flex col-lg-7 col-xl-8 align-items-center justify-content-center p-12 pb-2">
                        <img
                            src="/assets/img/illustrations/auth-register-illustration-light.png"
                            className="auth-cover-illustration w-100"
                            alt="auth-illustration"
                           />
                        <img
                            src="/assets/img/illustrations/auth-cover-register-mask-light.png"
                            className="authentication-image"
                            alt="mask"
                           />
                    </div>


                    <div
                        className="d-flex col-12 col-lg-5 col-xl-4 align-items-center authentication-bg position-relative py-sm-12 px-12 py-6">
                        <div className="w-px-400 mx-auto pt-5 pt-lg-0">
                            <h4 className="mb-1">Adventure starts here 🚀</h4>
                            <p className="mb-5">Make your app management easy and fun!</p>

                            <form className="mb-5" onSubmit={handleSignup}>
                                <div className="form-floating form-floating-outline mb-5">
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="firstName"
                                        name="firstName"
                                        placeholder="First Name"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                    />
                                    <label htmlFor="firstName">First Name</label>
                                </div>
                                <div className="form-floating form-floating-outline mb-5">
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="lastName"
                                        name="lastName"
                                        placeholder="Last Name"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                    />
                                    <label htmlFor="lastName">Last Name</label>
                                </div>
                                <div className="form-floating form-floating-outline mb-5">
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        name="email"
                                        placeholder="Email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                    <label htmlFor="email">Email</label>
                                </div>
                                <div className="form-floating form-floating-outline mb-5">
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="country"
                                        name="country"
                                        placeholder="Country Code (e.g. IN)"
                                        value={formData.country}
                                        onChange={handleChange}
                                        required
                                    />
                                    <label htmlFor="country">Country</label>
                                </div>
                                <div className="form-floating form-floating-outline mb-5">
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="mobile"
                                        name="mobile"
                                        placeholder="Mobile Number"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        required
                                    />
                                    <label htmlFor="mobile">Mobile</label>
                                </div>
                                <div className="form-floating form-floating-outline mb-5">
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="password"
                                        name="password"
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <label htmlFor="password">Password</label>
                                </div>

                                <button className="btn btn-primary d-grid w-100">Sign up</button>
                            </form>

                            {successMsg && (
                                <div className="alert alert-success" role="alert">
                                    {successMsg}
                                </div>
                            )}

                            {errorMsg && (
                                <div className="alert alert-danger" role="alert">
                                    {errorMsg}
                                </div>
                            )}


                            <p className="text-center">
                                <span>Already have an account?</span>
                                <Link href="/Login">
                                    <span>Sign in instead</span>
                                </Link>
                            </p>

                            <div className="divider my-5">
                                <div className="divider-text">or</div>
                            </div>

                            <div className="d-flex justify-content-center gap-2">
                                <a href="javascript:;" className="btn btn-icon rounded-circle btn-text-facebook">
                                    <i className="tf-icons ri-facebook-fill"></i>
                                </a>

                                <a href="javascript:;" className="btn btn-icon rounded-circle btn-text-twitter">
                                    <i className="tf-icons ri-twitter-fill"></i>
                                </a>

                                <a href="javascript:;" className="btn btn-icon rounded-circle btn-text-github">
                                    <i className="tf-icons ri-github-fill"></i>
                                </a>

                                <a href="javascript:;" className="btn btn-icon rounded-circle btn-text-google-plus">
                                    <i className="tf-icons ri-google-fill"></i>
                                </a>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    )
}
