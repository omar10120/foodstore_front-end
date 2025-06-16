import React, { useEffect, useState } from "react";
import axios from "axios";
import './css/profile.css'
function ProfileSeller(){ const userId = 27; // User ID to fetch
    const [userData, setUserData] = useState(null); // State to store user data
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state
  
    useEffect(() => {
      // Fetch user data from the API using axios
      const fetchUserData = async () => {
        try {
          const response = await axios.get(`http://localhost:8080/api/users/${userId}`);
          setUserData(response.data); // Save the fetched user data
        } catch (err) {
          setError(err.response ? err.response.data : err.message); // Set error message
        } finally {
          setLoading(false); // Stop loading
        }
      };
  
      fetchUserData();
    }, [userId]);
    if (loading) {
        return <div className="profile-container">Loading...</div>;
      }
    
      // Handle error state
      if (error) {
        return <div className="profile-container">Error: {error}</div>;
      }
    
    
      // Handle the case where `userData` is null (shouldn't happen after loading completes)
      if (!userData) {
        return <div className="profile-container">No user data available.</div>;
      }
    return(<div className="profile-container">
<div className="row_profile">
    <div className="col-12 col-sm-6 col-md-4 mb-4">
    
<div className="card_prfile">
<h1>Profile</h1>
<img className="imgProfile" src={`${process.env.PUBLIC_URL}/images/R.png`} alt="Profile" />
<p className="name">Name: {userData.userName}</p>
<p className="Email">Email: {userData.email}</p>
<p className="Type">Type: {userData.roleId?.roleName || "N/A"}</p>
<p className="PhoneNumber">Phone Number: {userData.phoneNumber}</p>


</div>
    </div>
</div>
    </div>)
}
export default  ProfileSeller;