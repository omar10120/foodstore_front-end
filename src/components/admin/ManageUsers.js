import React, { useState, useEffect } from "react";
import { FiSettings, FiX, FiCheckCircle, FiTrash2 } from "react-icons/fi";
import { useSelector } from "react-redux";

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const usersPerPage = 5;
  
  const token = useSelector((state) => state.auth.token);

  // Fetch users data from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  // Handle status change
  const handleStatusChange = async (userId, newStatus) => {
    try {
      // Call API to update user status
      const response = await fetch(`http://localhost:8080/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ verified: newStatus === "Active" })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user status');
      }
      
      // Update local state
      setUsers(users.map(user => 
        user.userId === userId ? { ...user, verified: newStatus === "Active" } : user
      ));
    } catch (err) {
      console.error("Status update error:", err);
      alert(`Failed to update user status: ${err.message}`);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(userId);
      setDeleteError(null);
      
      const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      
      // Remove user from local state
      setUsers(users.filter(user => user.userId !== userId));
    } catch (err) {
      console.error("Delete error:", err);
      setDeleteError(err.message || "Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Render loading state
  if (loading) {
    return (
      <div className="manage-users">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="manage-users">
        <div className="error-alert">
          <strong>Error:</strong> {error}
          <button 
            className="btn-retry"
            onClick={fetchUsers}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-users">
      <div className="section-header">
        <h2>Manage Users</h2>
        <div className="actions">
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* <button className="btn-primary">
            + Add User
          </button> */}
        </div>
      </div>

      {deleteError && (
        <div className="delete-error">
          <strong>Delete failed:</strong> {deleteError}
          <button onClick={() => setDeleteError(null)}>Dismiss</button>
        </div>
      )}

      <div className="users-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Subscription</th>
              <th>Status</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length > 0 ? (
              currentUsers.map(user => (
                <tr key={user.userId}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        <img 
                          src={`https://i.pravatar.cc/40?u=${user.email}`} 
                          alt={user.userName} 
                        />
                      </div>
                      <div>
                        <div className="user-name">{user.userName}</div>
                        <div className="user-id">ID: {user.userId}</div>
                      </div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.roleId.roleName.toLowerCase()}`}>
                      {user.roleId.roleName}
                    </span>
                  </td>
                  <td>
                    <span className={`subscription-status ${user.subscriptionStatus ? 'active' : 'inactive'}`}>
                      {user.subscriptionStatus ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.verified ? 'active' : 'suspended'}`}>
                      {user.verified ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td>
                    {user.location?.address || 'N/A'}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-icon" title="Edit">
                        <FiSettings />
                      </button>
                      
                      {user.verified ? (
                        <button 
                          className="btn-icon danger" 
                          title="Suspend"
                          onClick={() => handleStatusChange(user.userId, "Suspended")}
                          disabled={deletingId === user.userId}
                        >
                          <FiX />
                        </button>
                      ) : (
                        <button 
                          className="btn-icon success" 
                          title="Activate"
                          onClick={() => handleStatusChange(user.userId, "Active")}
                          disabled={deletingId === user.userId}
                        >
                          <FiCheckCircle />
                        </button>
                      )}
                      
                      <button 
                        className="btn-icon danger" 
                        title="Delete User"
                        onClick={() => handleDeleteUser(user.userId)}
                        disabled={deletingId === user.userId}
                      >
                        {deletingId === user.userId ? (
                          <div className="deleting-spinner"></div>
                        ) : (
                          <FiTrash2 />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-users">
                  <div className="no-users-content">
                    <p>No users found</p>
                    {searchTerm && (
                      <button onClick={() => setSearchTerm('')}>
                        Clear search
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredUsers.length > 0 && (
        <div className="pagination">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>
          
          <span>Page {currentPage} of {totalPages}</span>
          
          <button 
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default ManageUsers;