import React, { useState } from "react";
import Login from "./Login";
import UserDashboard from "./UserDashboard";
import AdminDashboard from "./AdminDashboard";
import "./App.css";
import { db, collection, addDoc } from "./firebase";

const App = () => {
  const [currentTab, setCurrentTab] = useState("home"); // Tracks selected tab
  const [user, setUser] = useState(null); // Stores user info when logged in
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
 

  // Function to handle admin login
  const handleAdminLogin = () => {
    setUser({ role: "admin", name: "Admin User" }); // Set admin user
    setCurrentTab("dashboard"); // Redirect to dashboard
  };

  // Function to handle user login
  const handleUserLogin = (userData) => {
    setUser(userData); // Set logged-in user
    setCurrentTab("dashboard"); // Redirect to dashboard
  };

  // Function to handle logout
  const handleLogout = () => {
    setUser(null);
    setCurrentTab("home");
  };
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitStatus, setSubmitStatus] = useState("");

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "contactMessages"), formData);
      setSubmitStatus("Message sent successfully!");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      setSubmitStatus("Error sending message. Please try again.");
    }
  };

  return (
    <div className="app-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <button 
          className={currentTab === "home" ? "active" : ""}
          onClick={() => setCurrentTab("home")}
        >
          Home
        </button>
        <button 
          className={currentTab === "login" ? "active" : ""}
          onClick={() => setCurrentTab("login")}
        >
          Login
        </button>
        <button 
          className={currentTab === "dashboard" ? "active" : ""}
          onClick={() => setCurrentTab("dashboard")}
        >
          Dashboard
        </button>
        <button className={currentTab === "about" ? "active" : ""} onClick={() => setCurrentTab("about")}>
          About Us
        </button>
        <button className={currentTab === "contact" ? "active" : ""} onClick={() => setCurrentTab("contact")}>
          Get in Touch
        </button>
      </nav>

      {/* Page Content */}
      <div className="content">
      {currentTab === "home" && (
          <div className="home">
            <img src="/Screenshot 2025-04-04 230311-Photoroom.png" alt="App Logo" className="login-logohome" />
            <h1>Welcome to the Future of Voting</h1>
            <p>A secure, transparent, and modern way to vote online.</p>
            
            <div className="features">
              <div className="card">
                <h2>Secure</h2>
                <p>End-to-end encryption ensures your vote remains confidential.</p>
              </div>
              <div className="card">
                <h2>Transparent</h2>
                <p>Real-time verification and auditability for trust and reliability.</p>
              </div>
              <div className="card">
                <h2>Easy to Use</h2>
                <p>Intuitive interface designed for all voters.</p>
              </div>
            </div>
            <div className="additional-content">
              <h2>Why Choose Our E-Voting System?</h2>
              <p>Our system provides the highest security standards while ensuring a seamless voting experience.</p>
              
              <div className="info-section">
                <div className="info-box">
                  <h3>Real-Time Results</h3>
                  <p>Instant and accurate election results without delays.</p>
                </div>
                <div className="info-box">
                  <h3>Anonymous Voting</h3>
                  <p>Your privacy is our priority; vote securely without revealing identity.</p>
                </div>
                <div className="info-box">
                  <h3>24/7 Availability</h3>
                  <p>Vote anytime, anywhere with our accessible platform.</p>
                </div>
              </div>
            </div>
          </div>
        
        )}

{currentTab === "about" && (
          <div className="about-section">
            <h1>About Our E-Voting System</h1>
            <p className="about-text">
              Our mission is to revolutionize elections by making them more **secure, transparent, and accessible** to everyone.
              We use cutting-edge technology to ensure fair and tamper-proof voting.
            </p>

            <h2>Our Core Values</h2>
            <ul className="values-list">
              <li><strong>Security:</strong> State-of-the-art encryption for vote integrity.</li>
              <li><strong>Transparency:</strong> Real-time tracking and verification.</li>
              <li><strong>Accessibility:</strong> Vote from anywhere, anytime.</li>
            </ul>

            {/* Team Section */}
            <h2>Meet Our Team</h2>
            <div className="team-section">
              <div className="team-card">
                <img src="https://i.postimg.cc/Y99CzQF1/Whats-App-Image-2025-04-04-at-23-52-00-59997816-Photoroom.png" alt="John Doe" />
                <h3>Annesha Dubey</h3>
                <p>Front-End Developer</p>
              </div>
              <div className="team-card">
                <img src="https://i.postimg.cc/R0vFqkVp/Whats-App-Image-2025-04-05-at-00-11-Photoroom.jpg" alt="Jane Smith" />
                <h3>Ayush Das</h3>
                <p>Back-End Developer</p>
              </div>
            </div>
          </div>
        )}

        {currentTab === "login" && (
          <Login onAdminLogin={handleAdminLogin} onUserLogin={handleUserLogin} />
        )} 

        {currentTab === "dashboard" && (
          user ? (
            user.role === "admin" ? (
              <AdminDashboard user={user} onLogout={handleLogout} />
            ) : (
              <UserDashboard user={user} onLogout={handleLogout} />
            )
          ) : (
            <div className="login-redirect">
              <p>Please log in first.</p>
              <button onClick={() => setCurrentTab("login")}>Go to Login</button>
            </div>
          )
        )}
         {currentTab === "contact" && (
           <div className="contact-section">
           <h2>Get in Touch</h2>
           <p>Have questions? Fill out the form and we'll respond promptly.</p>
     
           <form className="contact-form" onSubmit={handleSubmit}>
             <div className="input-wrapper">
               <input
                 type="text"
                 placeholder="Your Name"
                 value={formData.name}
                 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                 required
               />
             </div>
             <div className="input-wrapper">
               <input
                 type="email"
                 placeholder="Your Email"
                 value={formData.email}
                 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                 required
               />
             </div>
             <div className="input-wrapper">
               <textarea
                 placeholder="Your Message"
                 value={formData.message}
                 onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                 required
               />
             </div>
             <button type="submit">Send Message</button>
             {submitStatus && <p className="status-text">{submitStatus}</p>}
           </form>
         </div>
        )}
      </div>
    </div>
  );
};

export default App;
