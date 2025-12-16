"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import countries from "world-countries";
import config from "../config/config";

export default function Page() {
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const [countryList, setCountryList] = useState([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    country: "",
    phoneCode: "",
    phoneNumber: "",
    password: "",
  });

  // validation errors per field
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    country: "",
    phoneNumber: "",
    password: "",
  });

  useEffect(() => {
    const list = countries.map((country) => {
      const currencyObject = country.currencies
        ? Object.values(country.currencies)[0]
        : null;
      return {
        name: country.name.common,
        code: country.cca2,
        callingCode:
          country.idd && country.idd.root
            ? `${country.idd.root}${
                country.idd.suffixes ? country.idd.suffixes[0] || "" : ""
              }`
            : "",
        currency: currencyObject?.name || "",
        currencyCode: country.currencies
          ? Object.keys(country.currencies)[0]
          : "",
      };
    });
    // sort alphabetically for nicer UX
    list.sort((a, b) => a.name.localeCompare(b.name));
    setCountryList(list);
  }, []);

  const validateName = (name) => {
    if (!name || typeof name !== "string") return "This field is required.";
    const trimmed = name.trim();
    if (trimmed.length < 2) return "Must be at least 2 characters.";
    // disallow names that are only spaces or punctuation
    if (/^[\s]*$/.test(name)) return "Cannot be empty or spaces only.";
    // only allow alphabetic characters and spaces
    if (!/^[A-Za-z\s]+$/.test(trimmed))
      return "Only alphabetic characters and spaces are allowed.";
    return "";
  };

  const validateEmail = (email) => {
    if (!email) return "Email is required.";
    const trimmed = email.trim();
    // simple but robust RFC-like regex (reasonable client-side check)
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(trimmed)) return "Enter a valid email address.";
    return "";
  };

  const validatePhoneNumber = (num) => {
    if (!num) return "Phone number is required.";
    const trimmed = num.trim();
    // allow digits, spaces, hyphens; remove spaces/hyphens when checking length
    const digits = trimmed.replace(/[\s-()+]/g, "");
    if (!/^\d+$/.test(digits)) return "Phone number must contain only digits.";
    if (digits.length < 6) return "Phone number is too short.";
    if (digits.length > 15) return "Phone number is too long.";
    return "";
  };

  const validatePassword = (pw) => {
    if (!pw) return "Password is required.";
    if (pw.length < 8) return "Password must be at least 8 characters.";
    // require at least one letter and one digit
    if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw))
      return "Password must contain letters and numbers.";
    return "";
  };

  // Helper function to check if error message indicates duplicate email
  const isDuplicateEmailError = (message) => {
    if (!message) return false;
    const lowerMessage = message.toLowerCase();
    return (
      (lowerMessage.includes("email") && lowerMessage.includes("already")) ||
      (lowerMessage.includes("email") && lowerMessage.includes("exist")) ||
      lowerMessage.includes("user already exists") ||
      lowerMessage.includes("duplicate email")
    );
  };

  // handle country selection -> set phone code separately
  const handleCountrySelect = (e) => {
    const selectedCode = e.target.value;
    const selectedCountry = countryList.find((c) => c.code === selectedCode);

    setFormData((prev) => ({
      ...prev,
      country: selectedCode,
      phoneCode: selectedCountry?.callingCode
        ? selectedCountry.callingCode
        : "",
    }));

    // clear phone errors when changing country
    setErrors((prev) => ({ ...prev, country: "", phoneNumber: "" }));
  };

  // normalize input: trim leading/trailing spaces for text fields (except password)
  const handleChange = (e) => {
    const { name, value } = e.target;

    // For names and email, avoid leading/trailing spaces in state
    const normalized =
      name === "firstName" || name === "lastName" || name === "email"
        ? value.replace(/^\s+/g, "") // remove leading spaces, keep internal spaces
        : value;

    setFormData((prev) => ({ ...prev, [name]: normalized }));

    // validate as user types (live feedback)
    switch (name) {
      case "firstName":
        setErrors((prev) => ({ ...prev, firstName: validateName(normalized) }));
        break;
      case "lastName":
        setErrors((prev) => ({ ...prev, lastName: validateName(normalized) }));
        break;
      case "email":
        setErrors((prev) => ({ ...prev, email: validateEmail(normalized) }));
        break;
      case "phoneNumber":
        setErrors((prev) => ({
          ...prev,
          phoneNumber: validatePhoneNumber(normalized),
        }));
        break;
      case "password":
        setErrors((prev) => ({
          ...prev,
          password: validatePassword(normalized),
        }));
        break;
      default:
        break;
    }
  };

  // full form validation before submit - returns boolean
  const validateForm = () => {
    const fErr = {
      firstName: validateName(formData.firstName),
      lastName: validateName(formData.lastName),
      email: validateEmail(formData.email),
      country: formData.country ? "" : "Please select a country.",
      phoneNumber: validatePhoneNumber(formData.phoneNumber),
      password: validatePassword(formData.password),
    };
    setErrors(fErr);

    // if any error message present -> invalid
    return !Object.values(fErr).some((v) => v && v.length > 0);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    // final trim for sending
    const trimmedData = {
      ...formData,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      phoneCode: formData.phoneCode.trim(),
    };

    // validate
    if (!validateForm()) {
      // setErrorMsg("Please fix validation errors and try again.");
      return;
    }

    // prepare payload (adjust as your backend expects)
    const payload = {
      firstName: trimmedData.firstName,
      lastName: trimmedData.lastName,
      email: trimmedData.email,
      country: formData.country,
      mobile: `${trimmedData.phoneCode}${trimmedData.phoneNumber}`, // keep previous contract
      password: formData.password,
      address: "",
      isEmailVerified: "true",
      googleId: "",
      facebookId: "",
      profilePic: "",
      handle: "#meToo",
      deviceToken: "",
      currency: "INR",
      userRole: "USER",
    };

    try {
      console.log("Payload:", payload);
      const res = await axios.post(`${config.BASE_URL}user/register`, payload);
      const apiMessage = res.data?.message || "";
      const apiCode = res.data?.code;

      if (apiCode === 0) {
        setSuccessMsg("🎉 Registration successful! Redirecting to login...");
        setTimeout(() => router.push("/Login"), 1600);
      } else {
        // 🔴 Backend does not distinguish errors → treat as duplicate email
        setErrorMsg("Email already exists. Please use a different email.");

        setErrors((prev) => ({
          ...prev,
          email: "Email already exists. Please use a different email.",
        }));
      }
    } catch (error) {
      console.log("Signup error full:", error);

      const status = error?.response?.status;
      const backendData = error?.response?.data;

      // 🔴 FORCE DUPLICATE EMAIL MESSAGE
      if (status === 409 || status === 400) {
        setErrorMsg("Email already exists. Please use a different email.");

        // Optional: highlight email field
        setErrors((prev) => ({
          ...prev,
          email: "Email already exists. Please use a different email.",
        }));

        return;
      }

      // fallback
      setErrorMsg("Registration failed. Please try again.");
    }
  };

  // small helper to display error block
  const FieldError = ({ message }) =>
    message ? (
      <div className="invalid-feedback d-block" style={{ marginTop: "4px" }}>
        {message}
      </div>
    ) : null;

  return (
    <div>
      <div className="authentication-wrapper authentication-cover">
        <Link
          href="/"
          className="auth-cover-brand d-flex align-items-center gap-2"
        >
          <img src="/images/logo.png" width="80" alt="logo" />
          <span className="app-brand-text demo text-heading fw-semibold">
            Camrilla
          </span>
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

          <div className="d-flex col-12 col-lg-5 col-xl-4 align-items-center authentication-bg position-relative py-sm-12 px-12 py-6">
            <div className="w-px-400 mx-auto pt-5 pt-lg-0">
              <h4 className="mb-1">Adventure starts here 🚀</h4>
              <p className="mb-4">Make your app management easy and fun!</p>

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

              <form className="mb-4" onSubmit={handleSignup} noValidate>
                {/* First Name */}
                <div className="form-floating form-floating-outline mb-4">
                  <input
                    type="text"
                    className={`form-control ${
                      errors.firstName ? "is-invalid" : ""
                    }`}
                    id="firstName"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    minLength={2}
                    aria-describedby="firstNameHelp"
                  />
                  <label htmlFor="firstName">First Name</label>
                  <FieldError message={errors.firstName} />
                </div>

                {/* Last Name */}
                <div className="form-floating form-floating-outline mb-4">
                  <input
                    type="text"
                    className={`form-control ${
                      errors.lastName ? "is-invalid" : ""
                    }`}
                    id="lastName"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    minLength={2}
                  />
                  <label htmlFor="lastName">Last Name</label>
                  <FieldError message={errors.lastName} />
                </div>

                {/* Email */}
                <div className="form-floating form-floating-outline mb-4">
                  <input
                    type="email"
                    className={`form-control ${
                      errors.email ? "is-invalid" : ""
                    }`}
                    id="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="email">Email</label>
                  <FieldError message={errors.email} />
                </div>

                {/* Country */}
                <div className="form-floating form-floating-outline mb-4">
                  <select
                    className={`form-select ${
                      errors.country ? "is-invalid" : ""
                    }`}
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
                  <FieldError message={errors.country} />
                </div>

                {/* Phone code + number side-by-side */}
                <div className="row g-2 mb-4">
                  <div className="col-4">
                    <div className="form-floating form-floating-outline">
                      <input
                        type="text"
                        className="form-control"
                        id="phoneCode"
                        name="phoneCode"
                        placeholder="+91"
                        value={formData.phoneCode}
                        readOnly
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            phoneCode: e.target.value,
                          }))
                        }
                        aria-label="Phone code"
                      />
                      <label htmlFor="phoneCode">Code</label>
                    </div>
                  </div>

                  <div className="col-8">
                    <div className="form-floating form-floating-outline">
                      <input
                        type="text"
                        className={`form-control ${
                          errors.phoneNumber ? "is-invalid" : ""
                        }`}
                        id="phoneNumber"
                        name="phoneNumber"
                        placeholder="Mobile Number"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        required
                        aria-describedby="phoneHelp"
                      />
                      <label htmlFor="phoneNumber">Mobile</label>
                      <FieldError message={errors.phoneNumber} />
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div className="form-floating form-floating-outline mb-4">
                  <input
                    type="password"
                    className={`form-control ${
                      errors.password ? "is-invalid" : ""
                    }`}
                    id="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="password">Password</label>
                  <div className="form-text" style={{ marginTop: "4px" }}>
                    Use at least 8 characters with letters and numbers.
                  </div>
                  <FieldError message={errors.password} />
                </div>

                <button
                  className="btn btn-primary d-grid w-100"
                  type="submit"
                  aria-disabled={Object.values(errors).some((v) => v)}
                >
                  Sign up
                </button>
              </form>

              <p className="text-center mt-3">
                <span>Already have an account? </span>
                <Link href="/Login">
                  <span className="text-primary">Sign in instead</span>
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
