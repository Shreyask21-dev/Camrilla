'use client';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Page() {

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [accessToken, setAccessToken] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    const tokenData = localStorage.getItem('camrilla_token');
    if (userData && tokenData) {
      const parsedUser = JSON.parse(userData);
      const parsedToken = JSON.parse(tokenData);
      setEmail(parsedUser.email);
      setAccessToken(parsedToken.accessToken);
    }
  }, []);


  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match!");
      return;
    }

    try {
      const response = await axios.post(
        'https://api.camrilla.com/user/reset-password',
        {
          email: email,
          oldPassword: currentPassword,
          newPassword: newPassword,
        }
      );

      console.log('Password Changed Successfully:', response.data);
      alert('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      alert(error.response?.data?.message || 'Failed to update password.');
    }
  };

  return (
    <div>

      <div class="container-xxl flex-grow-1 container-p-y">
        <div class="row">
          <div class="col-md-12">
            <div class="nav-align-top">
              <ul class="nav nav-pills flex-column flex-md-row mb-6 gap-2 gap-lg-0">
                <li class="nav-item">
                  <Link class="nav-link" href="/Settings"
                  ><i class="ri-group-line me-2"></i> Account</Link>
                </li>
                <li class="nav-item">
                  <Link class="nav-link active" href="/Security"
                  ><i class="ri-lock-line me-2"></i> Security</Link>
                </li>
                <li className="nav-item">
                  <a className="nav-link " href="/Transactions"
                  ><i className="ri-lock-line me-2"></i>Transactions</a
                  >
                </li>
              </ul>
            </div>

            <div class="card mb-6">
              <h5 class="card-header">Change Password</h5>
              <div class="card-body pt-1">
                <form id="formAccountSettings" onSubmit={handlePasswordChange}>
                  <div className="row">
                    <div className="mb-5 col-md-6 form-password-toggle">
                      <div className="input-group input-group-merge">
                        <div className="form-floating form-floating-outline">
                          <input
                            className="form-control"
                            type="password"
                            name="currentPassword"
                            id="currentPassword"
                            placeholder="Current Password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                          />
                          <label htmlFor="currentPassword">Current Password</label>
                        </div>
                        <span className="input-group-text cursor-pointer">
                          <i className="ri-eye-off-line"></i>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="row g-5 mb-6">
                    <div className="col-md-6 form-password-toggle">
                      <div className="input-group input-group-merge">
                        <div className="form-floating form-floating-outline">
                          <input
                            className="form-control"
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                          <label htmlFor="newPassword">New Password</label>
                        </div>
                        <span className="input-group-text cursor-pointer">
                          <i className="ri-eye-off-line"></i>
                        </span>
                      </div>
                    </div>

                    <div className="col-md-6 form-password-toggle">
                      <div className="input-group input-group-merge">
                        <div className="form-floating form-floating-outline">
                          <input
                            className="form-control"
                            type="password"
                            name="confirmPassword"
                            id="confirmPassword"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                          <label htmlFor="confirmPassword">Confirm New Password</label>
                        </div>
                        <span className="input-group-text cursor-pointer">
                          <i className="ri-eye-off-line"></i>
                        </span>
                      </div>
                    </div>
                  </div>

                  <h6 className="text-body">Password Requirements:</h6>
                  <ul className="ps-4 mb-0">
                    <li className="mb-4">Minimum 8 characters long - the more, the better</li>
                    <li className="mb-4">At least one lowercase character</li>
                    <li>At least one number, symbol, or whitespace character</li>
                  </ul>

                  <div className="mt-6">
                    <button type="submit" className="btn btn-primary me-3">Save changes</button>
                    <button type="reset" className="btn btn-outline-secondary" onClick={() => {
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}>
                      Reset
                    </button>
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
