import React, { useState } from "react";
import { db, collection, getDocs, doc, getDoc } from "./firebase";
import "./Login.css";



const Login = ({ onAdminLogin, onUserLogin }) => {
  const [credentials, setCredentials] = useState({ id: "", password: "" });
  const [loginType, setLoginType] = useState("admin"); // "admin" or "user"
  const [adminId, setAdminId] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [userDob, setUserDob] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loginMethod, setLoginMethod] = useState("uid"); // 'uid' or 'dob'
const [userIdentifier, setUserIdentifier] = useState(""); // Either UID or DOB


  const hardcodedAdmin = { id: "admin123", password: "adminpass" };

  const handleAdminLogin = () => {
    if (adminId === hardcodedAdmin.id && adminPassword === hardcodedAdmin.password) {
      onAdminLogin();
    } else {
      setMessage("Invalid Admin Credentials");
    }
  };

  // 🔹 User Login (Validate from Firestore)
  const handleUserLogin = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const users = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  
      const foundUser = users.find((user) => {
        if (loginMethod === "uid") {
          return user.uid === userIdentifier && user.password === userPassword;
        } else {
          return user.dob === userIdentifier && user.password === userPassword;
        }
      });
  
      if (foundUser) {
        const userRef = doc(db, "users", foundUser.id);
        const userDoc = await getDoc(userRef);
        const votedParty = userDoc.exists() ? userDoc.data().votedParty : null;
  
        onUserLogin({ ...foundUser, votedParty });
      } else {
        setMessage("Invalid User Credentials");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setMessage("Error logging in");
    }
  };
  
  


  return (
  <div className="login-container">
    <img src="/Screenshot 2025-04-04 230311-Photoroom.png" alt="App Logo" className="login-logo" />
    <h2>Login</h2>

    <select
      className="login-select"
      onChange={(e) => setLoginType(e.target.value)}
      value={loginType}
    >
      <option value="admin">Admin</option>
      <option value="user">User</option>
    </select>

    {loginType === "admin" ? (
      <div className="login-form">
        <input
          type="text"
          placeholder="Admin ID"
          value={adminId}
          onChange={(e) => setAdminId(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={adminPassword}
          onChange={(e) => setAdminPassword(e.target.value)}
        />
        <button onClick={handleAdminLogin}>Login as Admin</button>
      </div>
    ) : (
      <div className="login-form">
      {/* Dropdown to select login method */}
      <select
        className="login-select"
        value={loginMethod}
        onChange={(e) => setLoginMethod(e.target.value)}
      >
        <option value="uid">Login using UID</option>
        <option value="dob">Login using Date of Birth</option>
      </select>
    
      {/* Conditional input based on selection */}
      <input
        type={loginMethod === "dob" ? "date" : "text"}
        placeholder={loginMethod === "dob" ? "Enter Date of Birth" : "Enter UID"}
        value={userIdentifier}
        onChange={(e) => setUserIdentifier(e.target.value)}
      />
    
      <input
        type="password"
        placeholder="Password"
        value={userPassword}
        onChange={(e) => setUserPassword(e.target.value)}
      />
      <button onClick={handleUserLogin}>Login as User</button>
    </div>
    )}

    {message && <p>{message}</p>}
  </div>
);
};

export default Login;
