import React, { useState, useRef } from 'react';
import './LoginSignup.css';

import user_icon from '../assets/user.png';
import email_icon from '../assets/message.png';
import mobile_icon from '../assets/telephone.png';
import password_icon from '../assets/password.png';

const LoginSignup = () => {
  const [action, setAction] = useState("Login");

  const nameRef = useRef(null);
  const mobileRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [slideDirection, setSlideDirection] = useState("slide-none");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
  };

  const handleActionChange = (nextAction) => {
    setSlideDirection(nextAction === "Sign Up" ? "slide-in-left" : "slide-in-right");
    setAction(nextAction);
    setError("");
    if (nextAction === "Login") {
      setFormData({ name: "", mobile: "", email: "", password: "" });
    }
  };

  const fieldLabels = {
    name: "Name",
    mobile: "Mobile Number",
    email: "Email",
    password: "Password",
  };

  const focusField = (field) => {
    const refs = {
      name: nameRef,
      mobile: mobileRef,
      email: emailRef,
      password: passwordRef,
    };

    refs[field]?.current?.focus();
  };

  const validateForm = () => {
    if (action === "Sign Up") {
      if (!formData.name.trim()) {
        return { field: "name", message: "Name is required" };
      }

      if (!formData.mobile.trim()) {
        return { field: "mobile", message: "Mobile number is required" };
      }

      if (!/^[0-9]{10}$/.test(formData.mobile)) {
        return { field: "mobile", message: "Enter valid 10-digit mobile number" };
      }
    }

    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return { field: "email", message: "Enter valid email" };
    }

    if (formData.password.length < 6) {
      return { field: "password", message: "Password must be at least 6 characters" };
    }

    return null;
  };

  const handleForgotPassword = () => {
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError("Enter a valid email to reset password");
      focusField("email");
      return;
    }

    alert(`Password reset link sent to ${formData.email}`);
    setError("");
  };

  const handleSubmit = async () => {
    const validation = validateForm();
    if (validation) {
      setError(validation.message);
      focusField(validation.field);
      return;
    }

    try {
      const url =
        action === "Sign Up"
          ? "http://localhost:5000/signup"
          : "http://localhost:5000/login";

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.text();

      if (action === "Login" && data === "Login successful") {
        setShowSuccess(true);
        setFormData({ name: "", mobile: "", email: "", password: "" });
      } else {
        alert(data);
      }
      setError("");

      if (action === "Sign Up" && data === "Signup successful") {
        handleActionChange("Login");
      }

    } catch (err) {
      console.error(err);
      setError("Server error");
    }
  };

  const nextField = (currentField) => {
    const signupOrder = ["name", "mobile", "email", "password"];
    const loginOrder = ["email", "password"];
    const order = action === "Sign Up" ? signupOrder : loginOrder;
    const currentIndex = order.indexOf(currentField);
    return currentIndex >= 0 && currentIndex < order.length - 1
      ? order[currentIndex + 1]
      : null;
  };

  const handleKeyDown = (e, field) => {
    if (e.key !== "Enter") return;
    e.preventDefault();

    if (!formData[field].trim()) {
      setError(`${fieldLabels[field]} is required`);
      focusField(field);
      return;
    }

    const next = nextField(field);
    if (next) {
      focusField(next);
    } else {
      handleSubmit();
    }
  };

  return (
    <form className={`container ${slideDirection}`} key={action} onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      
      <div className="header">
        <div className="text">{action === "Sign Up" ? "Create your account" : "Welcome back"}</div>
      </div>

      <p className="info-text">
        {action === "Sign Up"
          ? "Join now and secure your account with an email and strong password."
          : "Sign in to continue to your account quickly and safely."}
      </p>

      <div className="inputs">

        {action === "Sign Up" && (
          <>
            <div className="input">
              <img src={user_icon} alt="" />
              <input
                ref={nameRef}
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, "name")}
              />
            </div>

            <div className="input">
              <img src={mobile_icon} alt="" />
              <input
                ref={mobileRef}
                type="tel"
                name="mobile"
                placeholder="Mobile Number"
                value={formData.mobile}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, "mobile")}
              />
            </div>
          </>
        )}

        <div className="input">
          <img src={email_icon} alt="" />
          <input
            ref={emailRef}
            type="email"
            name="email"
            placeholder="Email Id"
            value={formData.email}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, "email")}
          />
        </div>

        <div className="input">
          <img src={password_icon} alt="" />
          <input
            ref={passwordRef}
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, "password")}
          />
        </div>

      </div>

      {/* Error message */}
      {error && (
        <p style={{ color: "red", textAlign: "center" }}>{error}</p>
      )}

      {action === "Login" && (
        <div className="forgot-password">
          Lost Password? <span style={{ cursor: "pointer", color: "#1976d2" }} onClick={handleForgotPassword}>Click Here!</span>
        </div>
      )}

      <button className="main-btn" type="submit">
        {action === "Sign Up" ? "Create User" : action}
      </button>

      {action === "Sign Up" ? (
        <div className="action-note" style={{ textAlign: "center", marginTop: "16px" }}>
          Already User Create :{' '}
          <span
            style={{ color: "#1976d2", cursor: "pointer", fontWeight: 600 }}
            onClick={() => handleActionChange("Login")}
          >
            Login Here
          </span>
        </div>
      ) : (
        <div className="action-note" style={{ textAlign: "center", marginTop: "16px" }}>
          Create a New User :{' '}
          <span
            style={{ color: "#1976d2", cursor: "pointer", fontWeight: 600 }}
            onClick={() => handleActionChange("Sign Up")}
          >Sign Up
          </span>
        </div>
      )}

      {showSuccess && (
        <div className="success-modal">
          <div className="success-content">
            <h2>🎉 Welcome back!</h2>
            <p>You have successfully logged in.</p>
            <div className="walking-man">👨‍🚶‍➡️</div>
            <button className="continue-btn" onClick={() => setShowSuccess(false)}>Continue</button>
          </div>
        </div>
      )}

    </form>
  );
};

export default LoginSignup;