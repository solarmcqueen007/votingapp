import React, { useState,  useEffect, useRef } from "react";
import { db, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, onSnapshot,setDoc } from "./firebase";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import './AdminDashboard.css';



ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const AdminDashboard = ({ onLogout }) => {
  const topRef = useRef(null); 
  const [timer, setTimer] = useState(null);
  const [votingEnabled, setVotingEnabled] = useState(false);
  const [user, setUser] = useState({ name: "", dob: "", password: "" });
  const [party, setParty] = useState({ name: "", symbol: "", leader: "" });
  const [parties, setParties] = useState([]);
  const [users, setUsers] = useState([]); 
  const [message, setMessage] = useState("");
  const [editingUserId, setEditingUserId] = useState(null); 
  const [voteCounts, setVoteCounts] = useState({});
  const [inputMinutes, setInputMinutes] = useState(5);
  const [isPublished, setIsPublished] = useState(false);


  useEffect(() => {
    const timerRef = doc(db, "settings", "votingTimer");
    const unsubscribe = onSnapshot(timerRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const endTime = data.endTime;
        const currentTime = Date.now();

        setIsPublished(data.isPublished || false);

        
        if (data.isEnabled && endTime > currentTime) {
          setVotingEnabled(true);
          setTimer(Math.floor((endTime - currentTime) / 1000));
        } else {
          setVotingEnabled(false);
          setTimer(null);
        }
      } else {
        setVotingEnabled(false);
        setTimer(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (timer !== null && timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const startVoting = async () => {
    if (timer === null) {
      const duration = inputMinutes * 60 * 1000; // Admin sets minutes
      const endTime = Date.now() + duration;
      await setDoc(doc(db, "settings", "votingTimer"), {
        endTime,
        isEnabled: true,
      });
    }
  };
  const stopVoting = async () => {
    await setDoc(doc(db, "settings", "votingTimer"), {
      endTime: 0,
      isEnabled: false,
    });
    // Clear the endTime in Firestore
    setVotingEnabled(false);
    setTimer(null);
  };



  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const userList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(userList);
    };
    fetchUsers();
  }, []);

   // 🔹 Fetch Voting Results
   useEffect(() => {
    const fetchVotes = async () => {
      const querySnapshot = await getDocs(collection(db, "votes"));
      const voteData = querySnapshot.docs.map(doc => doc.data().partyId);

      // Count votes for each party
      const counts = {};
      voteData.forEach(partyId => {
        counts[partyId] = (counts[partyId] || 0) + 1;
      });
      setVoteCounts(counts);
    };
    fetchVotes();
  }, []);


  useEffect(() => {
    const fetchParties = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "parties"));
        const fetchedParties = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          votes: doc.data().votes || 0, // Ensure votes is always a number
        }));
        setParties(fetchedParties);
      } catch (error) {
        console.error("Error fetching parties:", error);
      }
    };

    fetchParties();
  }, []);


    // Prepare Chart.js data
    const chartData = {
        labels: parties.map((party) => party.name),
        datasets: [
          {
            label: "Votes",
            data: parties.map((party) => party.votes || 0),
            backgroundColor: "#8884d8",
            borderColor: "#8884d8",
            borderWidth: 1,
          },
        ],
      };

  // 🔹 Add new party
  const handleAddParty = async () => {
    try {
      await addDoc(collection(db, "parties"), party);
      setMessage("Party added successfully!");
      setParty({ name: "", symbol: "", leader: "" }); // Clear form
    } catch (error) {
      console.error("Error adding party:", error);
      setMessage("Error adding party.");
    }
  };

  // 🔹 Delete party
  const handleDeleteParty = async (partyId) => {
    try {
      await deleteDoc(doc(db, "parties", partyId));
      setParties(parties.filter((p) => p.id !== partyId));
      setMessage("Party deleted successfully!");
    } catch (error) {
      console.error("Error deleting party:", error);
      setMessage("Error deleting party.");
    }
  };

  const handleEditUser = async (userId) => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, user);
      setMessage("User updated successfully!");
      setEditingUserId(null);
    } catch (error) {
      console.error("Error updating user:", error);
      setMessage("Error updating user.");
    }
  };

  // 🔹 Delete user
  const handleDeleteUser = async (userId) => {
    try {
      await deleteDoc(doc(db, "users", userId));
      setUsers(users.filter((u) => u.id !== userId));
      setMessage("User deleted successfully!");
    } catch (error) {
      console.error("Error deleting user:", error);
      setMessage("Error deleting user.");
    }
  };

  const handleAddUser = async () => {
    try {
      const docRef = await addDoc(collection(db, "users"), user);
      await updateDoc(doc(db, "users", docRef.id), { uid: docRef.id }); // Add user ID into the document
  
      setMessage("User added successfully!");
      setUser({ name: "", dob: "", password: "" }); // Clear form
    } catch (error) {
      console.error("Error adding user:", error);
      setMessage("Error adding user.");
    }
  };
  



  const handlePublishResults = async () => {
    try {
      const timerRef = doc(db, "settings", "votingTimer");
      await updateDoc(timerRef, {
        isPublished: true,
      });
      setIsPublished(true);
      setMessage("Results published successfully!");
    } catch (error) {
      console.error("Error publishing results:", error);
      setMessage("Failed to publish results.");
    }
  };
  
  return (
    <div className="admin-dashboard">
       <img src="/Screenshot 2025-04-04 230311-Photoroom.png" alt="App Logo" className="login-logo" />
      <h2>Admin Dashboard</h2>
      <p>Welcome, Admin!</p>
  
      <div className="voting-control">
  <input
    type="number"
    value={inputMinutes}
    onChange={(e) => setInputMinutes(e.target.value)}
    min="1"
    disabled={timer !== null}
    placeholder="Enter Minutes"
  />
  <button onClick={startVoting} disabled={timer !== null}>Start Voting</button>
  {votingEnabled && (
    <button onClick={stopVoting} style={{ backgroundColor: "red", color: "white", marginLeft: "10px" }}>
      Stop Voting
    </button>
  )}
</div>
      <h3>Voting Status: <span className={votingEnabled ? "status open" : "status closed"}>{votingEnabled ? "Ongoing" : "Not Started / Ended"}</span></h3>
      {timer !== null && <h3>Time Remaining: <span className="timer">{timer}s</span></h3>}
  
      <div className="section" ref={topRef}>
        <h3>{editingUserId ? "Edit User" : "Add New User"}</h3>
        <div className="form-group">
          <input type="text" placeholder="Full Name" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} />
          <input type="date" placeholder="Date of Birth" value={user.dob} onChange={(e) => setUser({ ...user, dob: e.target.value })} />
          <input type="password" placeholder="Password" value={user.password} onChange={(e) => setUser({ ...user, password: e.target.value })} />
          {editingUserId ? (
            <button onClick={() => handleEditUser(editingUserId)}>Update User</button>
          ) : (
            <button onClick={handleAddUser}>Add User</button>
          )}
          {/* Show "Publish Results" button only when voting is ended and results are not yet published */}
{!votingEnabled && !isPublished && (
  <button
    onClick={handlePublishResults}
    style={{ backgroundColor: "#28a745", color: "white", marginTop: "10px" }}
  >
    Publish Results
  </button>
)}

{/* Show confirmation if results already published */}
{!votingEnabled && isPublished && (
  <p style={{ color: "green", fontWeight: "bold" }}>Results have been published ✅</p>
)}

        </div>
      </div>
  
      <div className="section">
        <h3>Add Political Party</h3>
        <div className="form-group">
          <input type="text" placeholder="Party Name" value={party.name} onChange={(e) => setParty({ ...party, name: e.target.value })} />
          <input type="text" placeholder="Party Leader" value={party.leader} onChange={(e) => setParty({ ...party, leader: e.target.value })} />
          <button onClick={handleAddParty}>Add Party</button>
        </div>
      </div>
  
      {message && <p className="feedback">{message}</p>}
  
      <div className="section">
        <h3>Party List</h3>
        <ul className="styled-list">
          {parties.map((p) => (
            <li key={p.id}>
              {p.name} - {p.leader}
              <button onClick={() => handleDeleteParty(p.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
  
      <div className="section">
        <h3>Voting Results</h3>
        <ul className="styled-list">
          {parties.map((party) => (
            <li key={party.id}>
              {party.name} - {party.votes || 0} votes
            </li>
          ))}
        </ul>
      </div>
  
      <div className="section">
        <h3>User List</h3>
        <ul className="styled-list">
        {users.map((u) => (
  <li key={u.id}>
    <strong>{u.name}</strong> (ID: <code>{u.uid || u.id}</code>) - {u.dob}
              <button onClick={() => {
  setEditingUserId(u.id);
  setUser({ name: u.name, dob: u.dob, password: u.password });

  // Scroll to top of the form
  if (topRef.current) {
    topRef.current.scrollIntoView({ behavior: "smooth" });
  }
}}>Edit</button>
              <button onClick={() => handleDeleteUser(u.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
  
      <button className="logout-button" onClick={onLogout}>Logout</button>
    </div>
  );
};
export default AdminDashboard;
