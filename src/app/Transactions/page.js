'use client';
import Link from 'next/link';
import React, { useState, useEffect } from 'react'

export default function Page() {

    const [paymentHistory, setPaymentHistory] = useState([]);

    useEffect(() => {
        const fetchPaymentHistory = async () => {
            const tokenData = localStorage.getItem('camrilla_token');
            if (!tokenData) return;

            try {
                const { accessToken } = JSON.parse(tokenData);
                const res = await fetch('https://api.camrilla.com/payment-history', {
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

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };


    return (
        <div>
            <div className="container-xxl flex-grow-1 container-p-y">
                <div className="row">
                    <div className="col-md-12">
                        <div className="nav-align-top">
                            <ul className="nav nav-pills flex-column flex-md-row mb-6 gap-2 gap-lg-0">
                                <li className="nav-item">
                                    <Link className="nav-link " href="/Settings"
                                    ><i className="ri-group-line me-2"></i>Account</Link>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link" href="/Security"
                                    ><i className="ri-lock-line me-2"></i>Security</a
                                    >
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link active" href="/Transactions"
                                    ><i className="ri-lock-line me-2"></i>Transactions</a
                                    >
                                </li>

                            </ul>
                        </div>
                        <div className="card mb-6">


                            <div className="card p-3" style={{ height: "100vh", overflowY: "scroll" }} >
                                {paymentHistory.length > 0 && (
                                    <div className="col-md-12 mt-4">
                                        <h5 className="mb-3">Payment History</h5>
                                        <div className="table-responsive">
                                            <table className="table table-bordered">
                                                <thead>
                                                    <tr>
                                                        <th>Date</th>
                                                        <th>Plan</th>
                                                        <th>Amount</th>
                                                        <th>Status</th>
                                                        <th>Currency</th>
                                                        <th>Order ID</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {[...paymentHistory]
                                                        .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
                                                        .map((txn, index) => (
                                                            <tr key={index}>
                                                                <td>{formatDate(txn.paymentDate)}</td>
                                                                <td>{txn.planName}</td>
                                                                <td>{txn.amount}</td>
                                                                <td>{txn.paymentStatus}</td>
                                                                <td>{txn.currency}</td>
                                                                <td>{txn.orderId}</td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                            </div>

                        </div>
                    </div>
                </div>



            </div>






        </div>
    )
}
