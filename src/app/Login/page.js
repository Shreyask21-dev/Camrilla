'use client'
import React, { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import config from '../config/config'

export default function Page() {

  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // --- validation state (added) ---
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  })

  // validation helpers (added)
  const validateEmail = (value) => {
    if (!value || value.trim() === '') return 'Email is required.'
    const trimmed = value.trim()
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!re.test(trimmed)) return 'Enter a valid email address.'
    return ''
  }

  const validatePassword = (value) => {
    if (!value || value === '') return 'Password is required.'
    if (value.length < 8) return 'Password must be at least 8 characters.'
    return ''
  }

  // onBlur handlers to provide inline feedback (added)
  const handleEmailBlur = () => {
    setErrors((prev) => ({ ...prev, email: validateEmail(email) }))
  }

  const handlePasswordBlur = () => {
    setErrors((prev) => ({ ...prev, password: validatePassword(password) }))
  }

  const handleLogin = async (e) => {
    e.preventDefault()

    // run validations before attempting submit (added)
    const emailErr = validateEmail(email)
    const passwordErr = validatePassword(password)
    setErrors({ email: emailErr, password: passwordErr })

    if (emailErr || passwordErr) {
      // stop submission if invalid
      return
    }

    try {
      const response = await axios.post(`${config.BASE_URL}user/login`, {
        email,
        password
      })

      if (response.data.code === 0) {
        const { token, ...userData } = response.data.data

        // Store in localStorage
        localStorage.setItem('camrilla_token', JSON.stringify({
          accessToken: token.accessToken,
          refreshToken: token.refreshToken
        }))
        localStorage.setItem('userData', JSON.stringify(userData))

        // Show success message
        setSuccessMsg('Login Successful! Redirecting...')

        // Redirect after a short delay (e.g. 2 seconds)
        setTimeout(() => {
          router.push('/')
        }, 1000)

      } else {
        alert('Login failed: ' + response.data.message)
      }
    } catch (error) {
      console.error('Login error:', error)
      alert('An error occurred while logging in.')
    }
  }

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
              src="/assets/img/illustrations/auth-login-illustration-light.png"
              className="auth-cover-illustration w-100"
              alt="auth-illustration"
            />
            <img
              src="/assets/img/illustrations/auth-cover-login-mask-light.png"
              className="authentication-image"
              alt="mask"
            />
          </div>

          <div
            className="d-flex col-12 col-lg-5 col-xl-4 align-items-center authentication-bg position-relative py-sm-12 px-12 py-6">
            <div className="w-px-400 mx-auto pt-5 pt-lg-0">
              <h4 className="mb-1">Welcome to Camrilla! 👋</h4>
              <p className="mb-5">Please sign-in to your account and start the adventure</p>

              {/* ✅ Success message */}
              {successMsg && <div className="text-success mb-3">{successMsg}</div>}

              <form onSubmit={handleLogin} className="mb-5" >
                <div className="form-floating form-floating-outline mb-5">
                  <input
                    type="text"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    id="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={handleEmailBlur}   /* added */
                    required
                  />
                  <label htmlFor="email">Email</label>
                  {errors.email && (
                    <div className="invalid-feedback d-block" style={{ marginTop: 6 }}>
                      {errors.email}
                    </div>
                  )}
                </div>
                <div className="mb-5">
                  <div className="form-password-toggle">
                    <div className="input-group input-group-merge">
                      <div className="form-floating form-floating-outline">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                          placeholder="********"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onBlur={handlePasswordBlur} /* added */
                          required
                        />
                        <label htmlFor="password">Password</label>
                      </div>
                      <span
                        className="input-group-text cursor-pointer"
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        <i className={showPassword ? "ri-eye-line" : "ri-eye-off-line"}></i>
                      </span>
                    </div>
                    {errors.password && (
                      <div className="invalid-feedback d-block" style={{ marginTop: 6 }}>
                        {errors.password}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mb-5 d-flex justify-content-between mt-5">
                  <div className="form-check mt-2">
                    <input className="form-check-input" type="checkbox" id="remember-me" />
                    <label className="form-check-label" htmlFor="remember-me"> Remember Me </label>
                  </div>
                  <Link href="/Forgot" className="float-end mb-1 mt-2">
                    <span>Forgot Password?</span>
                  </Link>
                </div>
                <button type="submit" className="btn btn-primary d-grid w-100">Sign in</button>
              </form>

              <p className="text-center">
                <span>New to Camrilla? </span>
                <Link href="/Signup">
                  <span>Create an account</span>
                </Link>
              </p>

            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
