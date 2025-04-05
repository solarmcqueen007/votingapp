import React, { useState, useEffect } from "react";
import { db, collection, getDocs, addDoc, query, where, doc, updateDoc, getDoc, onSnapshot } from "./firebase";
import './UserDashboard.css';

const UserDashboard = ({ user, onLogout }) => {
    const [parties, setParties] = useState([]);
    const [votedParty, setVotedParty] = useState(null);
    const [message, setMessage] = useState("");
    const [timer, setTimer] = useState(null);
  const [votingEnabled, setVotingEnabled] = useState(false);
  const [isPublished, setIsPublished] = useState(false);



  useEffect(() => {
    const timerRef = doc(db, "settings", "votingTimer");
    const unsubscribe = onSnapshot(timerRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const { endTime, isEnabled } = data;
        const currentTime = Date.now();
        
        if (isEnabled && endTime > currentTime) {
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
    const timerRef = doc(db, "settings", "votingTimer");
    const unsubscribe = onSnapshot(timerRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setIsPublished(data.isPublished || false);
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




    // 🔹 Fetch Party List
    useEffect(() => {
      const fetchParties = async () => {
        const querySnapshot = await getDocs(collection(db, "parties"));
        setParties(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      };
    
      if (isPublished || votingEnabled) {
        fetchParties();
      }
    }, [isPublished, votingEnabled]);

  // 🔹 Check if user has already voted
  useEffect(() => {
    if (!user || !user.id) return; // Ensure user ID is available
  
    const checkUserVote = async () => {
      try {
        const q = query(collection(db, "votes"), where("userId", "==", user.id));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setVotedParty(querySnapshot.docs[0].data().partyId);
        }
      } catch (error) {
        console.error("Error fetching vote:", error);
      }
    };
  
    checkUserVote();
  }, [user]);

  // 🔹 Handle Voting
  const handleVote = async (partyId) => {
    if (!votingEnabled) {
      setMessage("Voting has not started yet.");
      return;
    }
    
    if (votedParty) {
      setMessage("You have already voted!");
      return;
    }
  
    try {
      console.log("🔍 Checking if user has already voted...");
  
      // ✅ 1. Check if user has already voted
      const userRef = doc(db, "users", user.id);
      const userDoc = await getDoc(userRef);
  
      if (userDoc.exists() && userDoc.data().votedParty) {
        setMessage(`You have already voted for ${userDoc.data().votedParty}`);
        return;
      }
  
      console.log("✅ User has not voted. Proceeding with voting...");
  
      // ✅ 2. Find party name from parties state
      const selectedParty = parties.find(p => p.id === partyId);
      if (!selectedParty) {
        setMessage("Error: Selected party not found.");
        return;
      }
  
      const partyName = selectedParty.name;  // ✅ Extract correct party name
  
      console.log("🟢 Found Party Name:", partyName);
  
      // ✅ 3. Store vote in "votes" collection
      await addDoc(collection(db, "votes"), {
        userId: user.id,
        partyId,
        partyName,   // ✅ Now correctly sending partyName
        timestamp: new Date().toISOString(),
      });
  
      console.log("✅ Vote recorded in 'votes' collection!");
  
      // ✅ 4. Update user document to store voted party
      await updateDoc(userRef, {
        votedParty: partyName,
        hasVoted: true,
      });
  
      console.log("✅ User document updated with voted party!");
  
      // ✅ 5. Increment vote count in the selected party document
      const partyRef = doc(db, "parties", partyId);
      const partyDoc = await getDoc(partyRef);
  
      if (partyDoc.exists()) {
        const currentVotes = partyDoc.data().votes || 0;
        await updateDoc(partyRef, {
          votes: currentVotes + 1,
        });
  
        console.log("✅ Vote count updated for party:", partyName);
      } else {
        console.error("🚨 Party document does not exist in Firestore!");
        setMessage("Error: Selected party does not exist.");
        return;
      }
  
      // ✅ 6. Update state
      setVotedParty(partyName);
      setMessage(`Vote submitted successfully for ${partyName}!`);
  
    } catch (error) {
      console.error("🚨 Error submitting vote:", error);
      setMessage("Error submitting vote. Check console for details.");
    }
  };
  
  
  return (
    <div className="user-dashboard">
       <img src="/Screenshot 2025-04-04 230311-Photoroom.png" alt="App Logo" className="login-logo" />
      <h2>Welcome, {user.name}!</h2>
      <p className="user-uid">Your UID: <strong>{user.uid}</strong></p>
  
      {votingEnabled ? (
        <div className="voting-status open">
          <h3>🟢 Voting is Open</h3>
          <p>Time Remaining: <span className="timer">{timer}s</span></p>
        </div>
      ) : (
        <div className="voting-status closed">
    <h3>🔒 Voting is currently disabled.</h3>
    <p>Either the timer expired or the admin manually stopped it.</p>
  </div>
      )}
  {isPublished && (
  <div className="results-section">
    <h3>🗳️ Voting Results (Published)</h3>
    <ul className="result-list">
      {parties.map((party) => (
        <li key={party.id}>
          {party.name} - <strong>{party.votes || 0} votes</strong>
        </li>
      ))}
    </ul>
  </div>
)}
      <div className="vote-info">
        {user.votedParty ? (
          <p>You voted for: <strong>{user.votedParty}</strong></p>
        ) : (
          <p>You have not voted yet.</p>
        )}
      </div>
  
      <h3>Vote for a Party</h3>
      <ul className="party-list">
        {parties.map((party) => (
          <li key={party.id} className="party-card">
            <div className="party-details">
              <span className="party-name">{party.name}</span>
              <span className="party-leader">Leader: {party.leader}</span>
            </div>
            {votedParty === party.id ? (
              <span className="voted-badge">✅ You Voted</span>
            ) : (
              <button onClick={() => handleVote(party.id)}>Vote</button>
            )}
          </li>
        ))}
      </ul>
  
      {message && <p className="feedback-message">{message}</p>}
  
      <button className="logout-button" onClick={onLogout}>Logout</button>
    </div>
  );
};  

export default UserDashboard;
