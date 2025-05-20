'use client';
import Link from 'next/link';
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function Page() {

    const [email, setEmail] = useState('');

    const router = useRouter();

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     try {
    //         const response = await axios.post('https://newapi.camrilla.com/user/forget-password', {
    //             email: email,
    //         });
    //         console.log('Success:', response.data);
    //         alert('Reset link sent to your email.');
    //     } catch (error) {
    //         console.error('Error:', error);
    //         alert('Failed to send reset link.');
    //     }
    // };


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('https://newapi.camrilla.com/n/api/auth/reset-password', {
                email: email,
            });
            console.log('Success:', response.data);
            alert('A temporary password has been sent to your email.');
            router.push('/Login'); // <-- Redirect to Login page
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to reset password. Please try again.');
        }
    };

    return (
        <div>
            <div className="authentication-wrapper authentication-cover">
                <Link href="index.html" className="auth-cover-brand d-flex align-items-center gap-2">
                    <img src="/images/logo.png" width="80" />
                    <span className="app-brand-text demo text-heading fw-semibold">Camrilla</span>
                </Link>
                <div className="authentication-inner row m-0">
                    <div className="d-none d-lg-flex col-lg-7 col-xl-8 align-items-center justify-content-center p-12 pb-2">
                        <img
                            src="/assets/img/illustrations/auth-forgot-password-illustration-light.png"
                            className="auth-cover-illustration w-100"
                            alt="auth-illustration"
                            data-app-light-img="illustrations/auth-forgot-password-illustration-light.png"
                            data-app-dark-img="illustrations/auth-forgot-password-illustration-dark.png" />
                        <img
                            src="/assets/img/illustrations/auth-cover-forgot-password-mask-light.png"
                            className="authentication-image"
                            alt="mask"
                            data-app-light-img="illustrations/auth-cover-forgot-password-mask-light.png"
                            data-app-dark-img="illustrations/auth-cover-forgot-password-mask-dark.png" />
                    </div>


                    <div className="d-flex col-12 col-lg-5 col-xl-4 align-items-center authentication-bg p-sm-12 p-6">
                        <div className="w-px-400 mx-auto">
                            <h4 className="mb-1">Forgot Password? 🔒</h4>
                            <p className="mb-5">Enter your email and we will send you instructions to reset your password</p>
                            <form id="formAuthentication" className="mb-5" onSubmit={handleSubmit}>
                                <div className="form-floating form-floating-outline mb-5">
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        name="email"
                                        placeholder="Enter your email"
                                        autoFocus
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <label htmlFor="email">Email</label>
                                </div>
                                <button type="submit" className="btn btn-primary d-grid w-100">
                                    Send Reset Link
                                </button>
                            </form>
                            <div className="text-center">
                                <Link href="/Login" className="d-flex align-items-center justify-content-center">
                                    <i className="ri-arrow-left-s-line scaleX-n1-rtl ri-20px me-1_5"></i>
                                    Back to login
                                </Link>

                            </div>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    )
}
