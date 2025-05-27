'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config/config';
import Link from 'next/link';

export default function Page() {

    const [feedback, setFeedback] = useState('');
    const [accessToken, setAccessToken] = useState('');

    useEffect(() => {
        const tokenDataString = localStorage.getItem('camrilla_token');
        if (tokenDataString) {
            const tokenData = JSON.parse(tokenDataString);
            setAccessToken(tokenData.accessToken);
        }
    }, []);


    const handleSubmitFeedback = async (e) => {
        e.preventDefault();

        if (!feedback.trim()) {
            alert('Please enter your feedback!');
            return;
        }

        try {
            const response = await axios.post(
                `${config.BASE_URL}user-feedback`,
                { feedback }
            );

            // ,
            //     {
            //         headers: {
            //             Authorization: `Bearer ${accessToken}`,
            //         },
            //     }

            console.log('Feedback submitted:', response.data);
            alert('Thank you for your feedback!');
            setFeedback('');
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert(error.response?.data?.message || 'Failed to send feedback.');
        }
    };

    return (
        <div>

            <div class="container-xxl flex-grow-1 container-p-y">
                <div
                    class="faq-header d-flex flex-column justify-content-center align-items-center h-px-300 position-relative overflow-hidden rounded-4">
                    <img
                        src="/assets/img/pages/header-light.png"
                        class="scaleX-n1-rtl faq-banner-img h-px-300 z-n1"
                        alt="background image"
                        data-app-light-img="pages/header-light.png"
                        data-app-dark-img="pages/header-dark.png" />
                    <h4 class="text-center text-primary mb-2">Hello, how can we help?</h4>
                    <p class="text-body text-center mb-0 px-4">or choose a category to quickly find the help you need</p>
                    <div class="input-wrapper mb-6 mt-7 input-group input-group-merge px-sm-5">
                        <span class="input-group-text" id="basic-addon1"><i class="ri-search-line"></i></span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Write your feedback here..."
                            aria-label="Feedback"
                            aria-describedby="basic-addon1"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                        />
                    </div>
                    <div className="text-center mt-3">
                        <button className="btn btn-primary" onClick={handleSubmitFeedback}>
                            Submit Feedback
                        </button>
                    </div>
                </div>

                <div class="row mt-6">

                    <div class="col-lg-3 col-md-4 col-12 mb-md-0 mb-4">
                        <div class="d-flex justify-content-between flex-column nav-align-left mb-2 mb-md-0">
                            <ul class="nav nav-pills flex-column flex-nowrap">
                                <li class="nav-item">
                                    <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#payment">
                                        <i class="ri-bank-card-line me-2"></i>
                                        <span class="align-middle">Payment</span>
                                    </button>
                                </li>

                                <li class="nav-item">
                                    <button class="nav-link" data-bs-toggle="tab" data-bs-target="#cancellation">
                                        <i class="ri-refresh-line me-2"></i>
                                        <span class="align-middle">Privacy Policy </span>
                                    </button>
                                </li>

                                <li class="nav-item">
                                    <button class="nav-link" data-bs-toggle="tab" data-bs-target="#product">
                                        <i class="ri-settings-4-line me-2"></i>
                                        <span class="align-middle">Plans & Services</span>
                                    </button>
                                </li>
                            </ul>
                            <div class="d-none d-md-block">
                                <div class="mt-4 text-center">
                                    <img
                                        src="/assets/img/illustrations/faq-illustration.png"
                                        class="img-fluid"
                                        width="135"
                                        alt="FAQ Image" />
                                </div>
                            </div>
                        </div>
                    </div>



                    <div class="col-lg-9 col-md-8 col-12">
                        <div class="tab-content p-0">
                            <div class="tab-pane fade show active" id="payment" role="tabpanel">
                                <div class="d-flex mb-4 gap-4">
                                    <div class="avatar avatar-md">
                                        <div class="avatar-initial bg-label-primary rounded-4">
                                            <i class="ri-bank-card-line ri-30px"></i>
                                        </div>
                                    </div>
                                    <div>
                                        <h5 class="mb-0">
                                            <span class="align-middle">Payment</span>
                                        </h5>
                                        <span>Get help with payment</span>
                                    </div>
                                </div>
                                <div id="accordionPayment" class="accordion">
                                    <div class="accordion-item active">
                                        <h2 class="accordion-header">
                                            <button
                                                class="accordion-button"
                                                type="button"
                                                data-bs-toggle="collapse"
                                                aria-expanded="true"
                                                data-bs-target="#accordionPayment-1"
                                                aria-controls="accordionPayment-1">
                                                When is payment collected for my Camrilla plan?
                                            </button>
                                        </h2>

                                        <div id="accordionPayment-1" class="accordion-collapse collapse show">
                                            <div class="accordion-body">
                                                Payment is collected at the time of subscription to a Camrilla plan. Your plan becomes active immediately once the payment is successfully processed.
                                            </div>
                                        </div>
                                    </div>

                                    <div class="accordion-item">
                                        <h2 class="accordion-header">
                                            <button
                                                class="accordion-button collapsed"
                                                type="button"
                                                data-bs-toggle="collapse"
                                                data-bs-target="#accordionPayment-2"
                                                aria-controls="accordionPayment-2">
                                                What payment methods do you accept?
                                            </button>
                                        </h2>
                                        <div id="accordionPayment-2" class="accordion-collapse collapse">
                                            <div class="accordion-body">
                                                We accept all major credit/debit cards, UPI, and net banking through secure payment gateways. Your payment details are encrypted and handled with care.
                                            </div>
                                        </div>
                                    </div>

                                    <div class="accordion-item">
                                        <h2 class="accordion-header">
                                            <button
                                                class="accordion-button collapsed"
                                                type="button"
                                                data-bs-toggle="collapse"
                                                data-bs-target="#accordionPayment-3"
                                                aria-controls="accordionPayment-3">
                                                I'm facing issues while making a payment. What should I do?
                                            </button>
                                        </h2>
                                        <div id="accordionPayment-3" class="accordion-collapse collapse">
                                            <div class="accordion-body">
                                                If you're facing any technical issues during payment, please reach out via our <a href="javascript:void(0);">support portal</a>, or email us at <a href="mailto:support@camrilla.com">support@camrilla.com</a>.
                                            </div>
                                        </div>
                                    </div>

                                    <div class="accordion-item">
                                        <h2 class="accordion-header">
                                            <button
                                                class="accordion-button collapsed"
                                                type="button"
                                                data-bs-toggle="collapse"
                                                data-bs-target="#accordionPayment-4"
                                                aria-controls="accordionPayment-4">
                                                What happens if I don't renew my subscription?
                                            </button>
                                        </h2>
                                        <div id="accordionPayment-4" class="accordion-collapse collapse">
                                            <div class="accordion-body">
                                                If your subscription isn't renewed before the expiry date, access to premium features will be paused. Your data remains safe and can be reactivated anytime by resubscribing.
                                            </div>
                                        </div>
                                    </div>

                                    <div class="accordion-item">
                                        <h2 class="accordion-header">
                                            <button
                                                class="accordion-button collapsed"
                                                type="button"
                                                data-bs-toggle="collapse"
                                                data-bs-target="#accordionPayment-5"
                                                aria-controls="accordionPayment-5">
                                                Does my subscription renew automatically?
                                            </button>
                                        </h2>
                                        <div id="accordionPayment-5" class="accordion-collapse collapse">
                                            <div class="accordion-body">
                                                Yes, your subscription will auto-renew at the end of each billing cycle unless you cancel it manually from your account settings before the renewal date.
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <div class="tab-pane fade" id="cancellation" role="tabpanel">
                                <div class="d-flex mb-4 gap-4 align-items-center">
                                    <div class="avatar avatar-md">
                                        <span class="avatar-initial bg-label-primary rounded-4">
                                            <i class="ri-refresh-line ri-30px"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <h5 class="mb-0"><span class="align-middle">Privacy Policy </span></h5>
                                        {/* <span>Lorem ipsum, dolor sit amet.</span> */}
                                    </div>
                                </div>
                                <div id="accordionCancellation" class="accordion">
                                    <div class="accordion-item active">
                                        <h2 class="accordion-header">
                                            <button
                                                class="accordion-button"
                                                type="button"
                                                data-bs-toggle="collapse"
                                                aria-expanded="true"
                                                data-bs-target="#accordionPrivacy-1"
                                                aria-controls="accordionPrivacy-1">
                                                What personal data do you collect?
                                            </button>
                                        </h2>
                                        <div id="accordionPrivacy-1" class="accordion-collapse collapse show">
                                            <div class="accordion-body">
                                                We collect information you provide during account creation, checkout, or customer support interactions,
                                                including your name, email address, phone number and billing.
                                            </div>
                                        </div>
                                    </div>

                                    <div class="accordion-item">
                                        <h2 class="accordion-header">
                                            <button
                                                class="accordion-button collapsed"
                                                type="button"
                                                data-bs-toggle="collapse"
                                                data-bs-target="#accordionPrivacy-2"
                                                aria-controls="accordionPrivacy-2">
                                                How is my personal information used?
                                            </button>
                                        </h2>
                                        <div id="accordionPrivacy-2" class="accordion-collapse collapse">
                                            <div class="accordion-body">
                                                Your information is used to process orders, communicate with you about your purchase, and improve our
                                                services. We may also use it for legal, security, and compliance purposes.
                                            </div>
                                        </div>
                                    </div>

                                    <div class="accordion-item">
                                        <h2 class="accordion-header">
                                            <button
                                                class="accordion-button collapsed"
                                                type="button"
                                                data-bs-toggle="collapse"
                                                data-bs-target="#accordionPrivacy-3"
                                                aria-controls="accordionPrivacy-3">
                                                Do you share my information with third parties?
                                            </button>
                                        </h2>
                                        <div id="accordionPrivacy-3" class="accordion-collapse collapse">
                                            <div class="accordion-body">
                                                We do not sell your personal information. We may share it with trusted service providers (like payment processors and delivery partners) who help us operate our business.
                                            </div>
                                        </div>
                                    </div>

                                    <div class="accordion-item">
                                        <h2 class="accordion-header">
                                            <button
                                                class="accordion-button collapsed"
                                                type="button"
                                                data-bs-toggle="collapse"
                                                data-bs-target="#accordionPrivacy-4"
                                                aria-controls="accordionPrivacy-4">
                                                How do you protect my data?
                                            </button>
                                        </h2>
                                        <div id="accordionPrivacy-4" class="accordion-collapse collapse">
                                            <div class="accordion-body">
                                                We use industry-standard encryption technologies, secure servers, and access controls to protect your data from unauthorized access, disclosure, or misuse.
                                            </div>
                                        </div>
                                    </div>

                                    <div class="accordion-item">
                                        <h2 class="accordion-header">
                                            <button
                                                class="accordion-button collapsed"
                                                type="button"
                                                data-bs-toggle="collapse"
                                                data-bs-target="#accordionPrivacy-5"
                                                aria-controls="accordionPrivacy-5">
                                                Can I delete my personal data?
                                            </button>
                                        </h2>
                                        <div id="accordionPrivacy-5" class="accordion-collapse collapse">
                                            <div class="accordion-body">
                                                Yes, you can request deletion of your personal data by contacting our <a href="javascript:void(0);">privacy team</a>. Some data may be retained if required by law or for legitimate business purposes.
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <div class="tab-pane fade" id="product" role="tabpanel">
                                <div class="d-flex mb-4 gap-4 align-items-center">
                                    <div class="avatar avatar-md">
                                        <span class="avatar-initial bg-label-primary rounded-4">
                                            <i class="ri-settings-4-line ri-30px"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <h5 class="mb-0">
                                            <span class="align-middle">Plans & Services</span>
                                        </h5>
                                        {/* <span>Lorem ipsum, dolor sit amet.</span> */}
                                    </div>
                                </div>
                                <div id="accordionProduct" class="accordion">
                                    <div class="accordion-item active">
                                        <h2 class="accordion-header">
                                            <button
                                                class="accordion-button"
                                                type="button"
                                                data-bs-toggle="collapse"
                                                aria-expanded="true"
                                                data-bs-target="#accordionPlan-1"
                                                aria-controls="accordionPlan-1">
                                                What subscription plans do you offer?
                                            </button>
                                        </h2>
                                        <div id="accordionPlan-1" class="accordion-collapse collapse show">
                                            <div class="accordion-body">
                                                We offer flexible monthly subscription plans designed to suit different user needs. You can choose a plan that fits your requirements and upgrade as needed. Visit our <Link href="/Subscriptions">Plans page</Link> to learn more.
                                            </div>
                                        </div>
                                    </div>

                                    <div class="accordion-item">
                                        <h2 class="accordion-header">
                                            <button
                                                class="accordion-button collapsed"
                                                type="button"
                                                data-bs-toggle="collapse"
                                                data-bs-target="#accordionPlan-2"
                                                aria-controls="accordionPlan-2">
                                                Can I upgrade or downgrade my plan?
                                            </button>
                                        </h2>
                                        <div id="accordionPlan-2" class="accordion-collapse collapse">
                                            <div class="accordion-body">
                                                You can upgrade your plan at any time to access more features. However, downgrading to a lower plan is not supported once you've upgraded.
                                            </div>
                                        </div>
                                    </div>

                                    <div class="accordion-item">
                                        <h2 class="accordion-header">
                                            <button
                                                class="accordion-button collapsed"
                                                type="button"
                                                data-bs-toggle="collapse"
                                                data-bs-target="#accordionPlan-5"
                                                aria-controls="accordionPlan-5">
                                                Can I cancel my subscription?
                                            </button>
                                        </h2>
                                        <div id="accordionPlan-5" class="accordion-collapse collapse">
                                            <div class="accordion-body">
                                                Subscription cancellation is not available at this time. Once you subscribe, your plan remains active with automatic monthly renewals. For more information, please contact our <a href="javascript:void(0);">support team</a>.
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row my-6">
                    <div class="col-6 text-center my-6">
                        <div class="badge bg-label-primary rounded-pill">Question?</div>
                        <h4 class="my-2">You still have a question?</h4>
                        <p class="mb-0">
                            If you cannot find question in our FAQ, you can contact us. We will answer you shortly!
                        </p>
                    </div>
                    <div class="col-sm-6">
                        <div class="p-6 rounded-4 bg-faq-section d-flex align-items-center flex-column">
                            <div class="avatar avatar-md">
                                <span class="avatar-initial bg-label-primary rounded-3">
                                    <i class="ri-mail-line ri-30px"></i>
                                </span>
                            </div>
                            <h5 class="mt-4 mb-1"><a class="text-heading" href="mailto:camrilla.app@gmail.com">camrilla.app@gmail.com</a></h5>
                            <p class="mb-0">Best way to get a quick answer</p>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    )
}
