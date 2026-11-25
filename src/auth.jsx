
import { useState } from "react";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";

import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import { auth, db } from "./firebase";

function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    rollNumber: "",
    branch: "",
    semester: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // STUDENT LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      onLoginSuccess?.(result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // STUDENT SIGNUP
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      // Create Firebase account
      const result = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      const user = result.user;

      // Save student name in Firebase Auth
      await updateProfile(user, {
        displayName: form.name
      });

      // Save student details in Firestore
      await setDoc(doc(db, "students", user.uid), {
        uid: user.uid,
        name: form.name,
        email: form.email,
        rollNumber: form.rollNumber,
        branch: form.branch,
        semester: form.semester,
        createdAt: serverTimestamp()
      });

      // Login successful
      onLoginSuccess?.(user);

    } catch (err) {
      setError(
        err.code === "auth/email-already-in-use"
          ? "This email is already registered. Please login."
          : err.code === "auth/weak-password"
          ? "Please choose a stronger password."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h1>Campus Companion</h1>
        <p>Your digital companion for MITS Gwalior</p>

        {/* LOGIN / SIGNUP TABS */}
        <div className="auth-tabs">

          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError("");
            }}
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError("");
            }}
          >
            Signup
          </button>

        </div>

        {/* LOGIN FORM */}
        {isLogin ? (

          <form onSubmit={handleLogin}>

            <h2>Student Login</h2>

            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your college email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />

            {error && (
              <p className="auth-error">{error}</p>
            )}

            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>

          </form>

        ) : (

          /* SIGNUP FORM */

          <form onSubmit={handleSignup}>

            <h2>Student Registration</h2>

            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <label>College Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your college email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <label>College Roll Number</label>
            <input
              type="text"
              name="rollNumber"
              placeholder="Enter your roll number"
              value={form.rollNumber}
              onChange={handleChange}
              required
            />

            <label>Branch</label>
            <select
              name="branch"
              value={form.branch}
              onChange={handleChange}
              required
            >
              <option value="">Select Branch</option>
              <option value="CSE">Computer Science</option>
              <option value="IT">Information Technology</option>
              <option value="ECE">Electronics & Communication</option>
              <option value="EE">Electrical Engineering</option>
              <option value="ME">Mechanical Engineering</option>
              <option value="CE">Civil Engineering</option>
              <option value="Other">Other</option>
            </select>

            <label>Semester</label>
            <select
              name="semester"
              value={form.semester}
              onChange={handleChange}
              required
            >
              <option value="">Select Semester</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={String(s)}>
                  Semester {s}
                </option>
              ))}
            </select>

            <label>Create Password</label>
            <input
              type="password"
              name="password"
              placeholder="Create a password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />

            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />

            {error && (
              <p className="auth-error">{error}</p>
            )}

            <button type="submit" disabled={loading}>
              {loading ? "Creating Account..." : "Create Student Account"}
            </button>

          </form>

        )}

      </div>
    </div>
  );
}

export default Auth;
