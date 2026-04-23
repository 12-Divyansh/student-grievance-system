import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { logout } = useContext(AuthContext);
  const [grievances, setGrievances] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Academic'
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchGrievances();
  }, []);

  const fetchGrievances = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/grievances');
      setGrievances(res.data);
    } catch (err) {
      console.error('Error fetching grievances:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    try {
      if (query.trim() === '') {
        fetchGrievances();
      } else {
        const res = await axios.get(`http://localhost:5000/api/grievances/search?title=${query}`);
        setGrievances(res.data);
      }
    } catch (err) {
      console.error('Error searching:', err);
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update
        await axios.put(`http://localhost:5000/api/grievances/${editingId}`, formData);
        setEditingId(null);
      } else {
        // Create
        await axios.post('http://localhost:5000/api/grievances', formData);
      }
      
      // Reset form and fetch updated list
      setFormData({ title: '', description: '', category: 'Academic' });
      fetchGrievances();
    } catch (err) {
      console.error('Error saving grievance:', err);
    }
  };

  const handleEdit = (g) => {
    setEditingId(g._id);
    setFormData({
      title: g.title,
      description: g.description,
      category: g.category,
      status: g.status // Usually users can't edit status, maybe admin does, but we include it if needed
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ title: '', description: '', category: 'Academic' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this grievance?')) {
      try {
        await axios.delete(`http://localhost:5000/api/grievances/${id}`);
        fetchGrievances();
      } catch (err) {
        console.error('Error deleting:', err);
      }
    }
  };

  return (
    <div>
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <div className="dashboard-actions">
          <button onClick={logout} className="btn btn-outline">
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Left Column: Form */}
        <div>
          <div className="panel">
            <h3 className="panel-title">{editingId ? 'Edit Grievance' : 'Submit New Grievance'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input 
                  type="text" 
                  name="title" 
                  className="form-control" 
                  value={formData.title} 
                  onChange={handleFormChange} 
                  required 
                  placeholder="E.g., Issue with library Wi-Fi"
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select 
                  name="category" 
                  className="form-control" 
                  value={formData.category} 
                  onChange={handleFormChange}
                >
                  <option value="Academic">Academic</option>
                  <option value="Hostel">Hostel</option>
                  <option value="Transport">Transport</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea 
                  name="description" 
                  className="form-control" 
                  value={formData.description} 
                  onChange={handleFormChange} 
                  required
                  placeholder="Provide detailed description of your issue..."
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update' : 'Submit'}
                </button>
                {editingId && (
                  <button type="button" className="btn btn-outline" onClick={handleCancelEdit}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: List */}
        <div>
          <div className="panel">
            <div className="panel-title">
              <h3>Your Grievances</h3>
            </div>
            
            <div className="search-box">
              <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
              </svg>
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search by title..." 
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>

            {loading ? (
              <p>Loading grievances...</p>
            ) : grievances.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <p>{searchQuery ? 'No grievances found matching your search.' : 'You have not submitted any grievances yet.'}</p>
              </div>
            ) : (
              <div className="grievance-list">
                {grievances.map(g => (
                  <div key={g._id} className="grievance-card">
                    <div className="grievance-header">
                      <div className="grievance-title">{g.title}</div>
                      <div className="card-actions">
                        <button className="action-btn" onClick={() => handleEdit(g)} title="Edit">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                          </svg>
                        </button>
                        <button className="action-btn delete" onClick={() => handleDelete(g._id)} title="Delete">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                            <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="grievance-desc">{g.description}</div>
                    
                    <div className="grievance-footer">
                      <span className="badge badge-category">{g.category}</span>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span className="grievance-date">{new Date(g.date).toLocaleDateString()}</span>
                        <span className={`badge ${g.status === 'Pending' ? 'badge-pending' : 'badge-resolved'}`}>
                          {g.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
