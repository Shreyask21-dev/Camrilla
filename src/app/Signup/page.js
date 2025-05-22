'use client'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import countries from 'world-countries'

export default function Page() {

    const [successMsg, setSuccessMsg] = useState('')
    const [errorMsg, setErrorMsg] = useState('')

    const router = useRouter()

    const [countryList, setCountryList] = useState([])
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        country: '',
        mobile: '',
        password: ''
    })

    useEffect(() => {
        const list = countries.map((country) => {
            const currencyObject = country.currencies ? Object.values(country.currencies)[0] : null;
            return {
                name: country.name.common,
                code: country.cca2,
                callingCode: `+${country.idd.root?.replace('+', '') || ''}${country.idd.suffixes ? country.idd.suffixes[0] : ''}`,
                currency: currencyObject?.name || '',
                currencyCode: country.currencies ? Object.keys(country.currencies)[0] : ''
            }
        })
        setCountryList(list)
    }, [])


    const handleCountrySelect = (e) => {
        const selectedCode = e.target.value
        const selectedCountry = countryList.find(c => c.code === selectedCode)

        setFormData({
            ...formData,
            country: selectedCode,
            mobile: selectedCountry.callingCode,
            currency: selectedCountry.currency,
            currencyCode: selectedCountry.currencyCode,
            phoneCode: selectedCountry.callingCode
        })
    }

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
            const res = await axios.post('https://newapi.camrilla.com/user/register', payload)
            if (res.data.code === 0) {
                setSuccessMsg('🎉 Registration successful! Redirecting to login...')
                setTimeout(() => router.push('/Login'), 2000)
            } else {
                console.error('Signup error:', err.response?.data || err.message || err)
                setErrorMsg(res.data.message || 'Registration failed. Please try again.')
            }
        } catch (error) {
            
            console.error('Signup error:', JSON.stringify(error.response?.data))
            setErrorMsg(error.response?.data?.message || 'The email ID provided is already associated with an existing account. Please try using a different email address.')
        }

    }



    return (
        <div>

            <div className="authentication-wrapper authentication-cover">
                <Link href="/" className="auth-cover-brand d-flex align-items-center gap-2">
                    <img src="/images/logo.png" width="80" />
                    <span className="app-brand-text demo text-heading fw-semibold">Camrilla</span>
                </Link>

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
                                    <select
                                        className="form-select"
                                        id="country"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleCountrySelect}
                                        required
                                    >
                                        <option value="">Select Country</option>
                                        {countryList.map((country) => (
                                            <option key={country.code} value={country.code}>
                                                {country.name}
                                            </option>
                                        ))}
                                    </select>
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
                                <span>Already have an account? </span>
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
