'use client';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config/config';

export default function Page() {

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [accessToken, setAccessToken] = useState('');

  // SHOW/HIDE password toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

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

  // Remove spaces from input
  const sanitizeInput = (value) => value.replace(/\s+/g, "");

  // Password validation rules
  const validatePassword = (password) => {
    if (!password) return "Password is required.";
    if (password.includes(" ")) return "Spaces are not allowed.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (!/[a-z]/.test(password)) return "Must contain a lowercase letter.";
    if (!/[0-9!@#$%^&*.,?_\-]/.test(password)) 
      return "Must contain a number or symbol.";
    return "";
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    let validationErrors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    };

    if (!currentPassword.trim()) {
      validationErrors.currentPassword = "Current password is required.";
    }

    validationErrors.newPassword = validatePassword(newPassword);

    if (!confirmPassword) {
      validationErrors.confirmPassword = "Confirm password is required.";
    } else if (newPassword !== confirmPassword) {
      validationErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(validationErrors);

    if (
      validationErrors.currentPassword ||
      validationErrors.newPassword ||
      validationErrors.confirmPassword
    ) return;

    try {
      const response = await axios.post(
        `${config.BASE_URL}user/reset-password`,
        {
          email: email,
          oldPassword: currentPassword,
          newPassword: newPassword,
        }
      );

      alert('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setErrors({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

    } catch (error) {
      console.error('Error updating password:', error);
      alert(error.response?.data?.message || 'Failed to update password.');
    }
  };

  return (
    <div>

      <div className="container-xxl flex-grow-1 container-p-y">
        <div className="row">
          <div className="col-md-12">

            <div className="nav-align-top">
              <ul className="nav nav-pills flex-column flex-md-row mb-6 gap-2 gap-lg-0">
                <li className="nav-item">
                  <Link className="nav-link" href="/Settings">
                    <i className="ri-group-line me-2"></i> Account
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link active" href="/Security">
                    <i className="ri-lock-line me-2"></i> Security
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" href="/Transactions">
                    <i className="ri-bank-line me-2"></i>Transactions
                  </Link>
                </li>
              </ul>
            </div>

            <div className="card mb-6">
              <h5 className="card-header">Change Password</h5>
              <div className="card-body pt-1">

                <form id="formAccountSettings" onSubmit={handlePasswordChange}>

                  {/* CURRENT PASSWORD */}
                  <div className="row">
                    <div className="mb-5 col-md-6 form-password-toggle">
                      <div className="input-group input-group-merge">
                        
                        <div className="form-floating form-floating-outline">
                          <input
                            className={`form-control ${errors.currentPassword ? 'is-invalid' : ''}`}
                            type={showCurrent ? "text" : "password"}
                            id="currentPassword"
                            placeholder="Current Password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(sanitizeInput(e.target.value))}
                          />
                          <label htmlFor="currentPassword">Current Password</label>
                          <div className="invalid-feedback">{errors.currentPassword}</div>
                        </div>

                        <span
                          className="input-group-text cursor-pointer"
                          onClick={() => setShowCurrent(!showCurrent)}
                        >
                          <i className={showCurrent ? "ri-eye-line" : "ri-eye-off-line"}></i>
                        </span>

                      </div>
                    </div>
                  </div>

                  {/* NEW + CONFIRM PASSWORD */}
                  <div className="row g-5 mb-6">

                    {/* NEW PASSWORD */}
                    <div className="col-md-6 form-password-toggle">
                      <div className="input-group input-group-merge">

                        <div className="form-floating form-floating-outline">
                          <input
                            className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
                            type={showNew ? "text" : "password"}
                            id="newPassword"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(sanitizeInput(e.target.value))}
                          />
                          <label htmlFor="newPassword">New Password</label>
                          <div className="invalid-feedback">{errors.newPassword}</div>
                        </div>

                        <span
                          className="input-group-text cursor-pointer"
                          onClick={() => setShowNew(!showNew)}
                        >
                          <i className={showNew ? "ri-eye-line" : "ri-eye-off-line"}></i>
                        </span>

                      </div>
                    </div>

                    {/* CONFIRM PASSWORD */}
                    <div className="col-md-6 form-password-toggle">
                      <div className="input-group input-group-merge">

                        <div className="form-floating form-floating-outline">
                          <input
                            className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                            type={showConfirm ? "text" : "password"}
                            id="confirmPassword"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(sanitizeInput(e.target.value))}
                          />
                          <label htmlFor="confirmPassword">Confirm New Password</label>
                          <div className="invalid-feedback">{errors.confirmPassword}</div>
                        </div>

                        <span
                          className="input-group-text cursor-pointer"
                          onClick={() => setShowConfirm(!showConfirm)}
                        >
                          <i className={showConfirm ? "ri-eye-line" : "ri-eye-off-line"}></i>
                        </span>

                      </div>
                    </div>

                  </div>

                  <h6 className="text-body">Password Requirements:</h6>
                  <ul className="ps-4 mb-0">
                    <li className="mb-4">Minimum 8 characters</li>
                    <li className="mb-4">At least one lowercase character</li>
                    <li className="mb-4">At least one number or symbol</li>
                    <li>No spaces allowed</li>
                  </ul>

                  <div className="mt-6">
                    <button type="submit" className="btn btn-primary me-3">Save changes</button>

                    <button
                      type="reset"
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                        setErrors({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: ""
                        });
                      }}
                    >
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
  );
}
