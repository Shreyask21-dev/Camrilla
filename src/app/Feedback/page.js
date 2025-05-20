'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
                'https://newapi.camrilla.com/user-feedback',
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
                                        <span class="align-middle">Cancellation & Return</span>
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
                                                When is payment taken for my order?
                                            </button>
                                        </h2>

                                        <div id="accordionPayment-1" class="accordion-collapse collapse show">
                                            <div class="accordion-body">
                                                Payment is taken during the checkout process when you pay for your order. The order number
                                                that appears on the confirmation screen indicates payment has been successfully processed.
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
                                                How do I pay for my order?
                                            </button>
                                        </h2>
                                        <div id="accordionPayment-2" class="accordion-collapse collapse">
                                            <div class="accordion-body">
                                                We accept Visa®, MasterCard®, American Express®, and PayPal®. Our servers encrypt all
                                                information submitted to them, so you can be confident that your credit card information
                                                will be kept safe and secure.
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
                                                What should I do if I am having trouble placing an order?
                                            </button>
                                        </h2>
                                        <div id="accordionPayment-3" class="accordion-collapse collapse">
                                            <div class="accordion-body">
                                                For any technical difficulties you are experiencing with our website, please contact us at
                                                our
                                                <a href="javascript:void(0);">support portal</a>, or you can call us toll-free at
                                                <span class="fw-medium">1-000-000-000</span>, or email us at
                                                <a href="javascript:void(0);">order@companymail.com</a>
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
                                                Which license do I need for an end product that is only accessible to paying users?
                                            </button>
                                        </h2>
                                        <div id="accordionPayment-4" class="accordion-collapse collapse">
                                            <div class="accordion-body">
                                                If you have paying users or you are developing any SaaS products then you need an Extended
                                                License. For each products, you need a license. You can get free lifetime updates as well.
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
                                                Does my subscription automatically renew?
                                            </button>
                                        </h2>
                                        <div id="accordionPayment-5" class="accordion-collapse collapse">
                                            <div class="accordion-body">
                                                No, This is not subscription based item.Pastry pudding cookie toffee bonbon jujubes
                                                jujubes powder topping. Jelly beans gummi bears sweet roll bonbon muffin liquorice. Wafer
                                                lollipop sesame snaps.
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
                                        <h5 class="mb-0"><span class="align-middle">Cancellation & Return</span></h5>
                                        <span>Lorem ipsum, dolor sit amet.</span>
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
                                                data-bs-target="#accordionCancellation-1"
                                                aria-controls="accordionCancellation-1">
                                                Can I cancel my order?
                                            </button>
                                        </h2>

                                        <div id="accordionCancellation-1" class="accordion-collapse collapse show">
                                            <div class="accordion-body">
                                                <p>
                                                    Scheduled delivery orders can be cancelled 72 hours prior to your selected delivery date
                                                    for full refund.
                                                </p>
                                                <p class="mb-0">
                                                    Parcel delivery orders cannot be cancelled, however a free return label can be provided
                                                    upon request.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="accordion-item">
                                        <h2 class="accordion-header">
                                            <button
                                                class="accordion-button collapsed"
                                                type="button"
                                                data-bs-toggle="collapse"
                                                data-bs-target="#accordionCancellation-2"
                                                aria-controls="accordionCancellation-2">
                                                Can I return my product?
                                            </button>
                                        </h2>
                                        <div id="accordionCancellation-2" class="accordion-collapse collapse">
                                            <div class="accordion-body">
                                                You can return your product within 15 days of delivery, by contacting our
                                                <a href="javascript:void(0);">support team</a>, All merchandise returned must be in the
                                                original packaging with all original items.
                                            </div>
                                        </div>
                                    </div>

                                    <div class="accordion-item">
                                        <h2 class="accordion-header">
                                            <button
                                                class="accordion-button collapsed"
                                                type="button"
                                                data-bs-toggle="collapse"
                                                aria-controls="accordionCancellation-3"
                                                data-bs-target="#accordionCancellation-3">
                                                Where can I view status of return?
                                            </button>
                                        </h2>
                                        <div id="accordionCancellation-3" class="accordion-collapse collapse">
                                            <div class="accordion-body">
                                                <p>Locate the item from Your <a href="javascript:void(0);">Orders</a></p>
                                                <p class="mb-0">Select <span class="fw-medium">Return/Refund</span> status</p>
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
                                        <span>Lorem ipsum, dolor sit amet.</span>
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
                                                data-bs-target="#accordionProduct-1"
                                                aria-controls="accordionProduct-1">
                                                Will I be notified once my order has shipped?
                                            </button>
                                        </h2>

                                        <div id="accordionProduct-1" class="accordion-collapse collapse show">
                                            <div class="accordion-body">
                                                Yes, We will send you an email once your order has been shipped. This email will contain
                                                tracking and order information.
                                            </div>
                                        </div>
                                    </div>

                                    <div class="accordion-item">
                                        <h2 class="accordion-header">
                                            <button
                                                class="accordion-button collapsed"
                                                type="button"
                                                data-bs-toggle="collapse"
                                                data-bs-target="#accordionProduct-2"
                                                aria-controls="accordionProduct-2">
                                                Where can I find warranty information?
                                            </button>
                                        </h2>
                                        <div id="accordionProduct-2" class="accordion-collapse collapse">
                                            <div class="accordion-body">
                                                We are committed to quality products. For information on warranty period and warranty
                                                services, visit our Warranty section <a href="javascript:void(0);">here</a>.
                                            </div>
                                        </div>
                                    </div>

                                    <div class="accordion-item">
                                        <h2 class="accordion-header">
                                            <button
                                                class="accordion-button collapsed"
                                                type="button"
                                                data-bs-toggle="collapse"
                                                data-bs-target="#accordionProduct-3"
                                                aria-controls="accordionProduct-3">
                                                How can I purchase additional warranty coverage?
                                            </button>
                                        </h2>
                                        <div id="accordionProduct-3" class="accordion-collapse collapse">
                                            <div class="accordion-body">
                                                For the peace of your mind, we offer extended warranty plans that add additional year(s)
                                                of protection to the standard manufacturer’s warranty provided by us. To purchase or find
                                                out more about the extended warranty program, visit Extended Warranty section
                                                <a href="javascript:void(0);">here</a>.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row my-6">
                    <div class="col-12 text-center my-6">
                        <div class="badge bg-label-primary rounded-pill">Question?</div>
                        <h4 class="my-2">You still have a question?</h4>
                        <p class="mb-0">
                            If you cannot find question in our FAQ, you can contact us. We will answer you shortly!
                        </p>
                    </div>
                </div>
                <div class="row justify-content-center gap-sm-0 gap-6">
                    <div class="col-sm-6">
                        <div class="p-6 rounded-4 bg-faq-section d-flex align-items-center flex-column">
                            <div class="avatar avatar-md">
                                <span class="avatar-initial bg-label-primary rounded-3">
                                    <i class="ri-phone-line ri-30px"></i>
                                </span>
                            </div>
                            <h5 class="mt-4 mb-1"><a class="text-heading" href="tel:+(810)25482568">+ (810) 2548 2568</a></h5>
                            <p class="mb-0">We are always happy to help</p>
                        </div>
                    </div>
                    <div class="col-sm-6">
                        <div class="p-6 rounded-4 bg-faq-section d-flex align-items-center flex-column">
                            <div class="avatar avatar-md">
                                <span class="avatar-initial bg-label-primary rounded-3">
                                    <i class="ri-mail-line ri-30px"></i>
                                </span>
                            </div>
                            <h5 class="mt-4 mb-1"><a class="text-heading" href="mailto:help@help.com">help@help.com</a></h5>
                            <p class="mb-0">Best way to get a quick answer</p>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    )
}
