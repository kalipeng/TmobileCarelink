import React, { useState, useEffect } from 'react';
import { Search, Calendar, Bell, User, ArrowLeft } from 'lucide-react';
import './TMobilePatientDashboard.css';

// Mock WebSocket connection
const mockWebSocket = {
  onmessage: null,
  send: (data) => {
    console.log('Sending:', data);
  }
};

// Doctor Page Component
const DoctorPage = ({ user, onSignOut }) => {
  console.log('DoctorPage rendered with user:', user);
  
  const [currentDate, setCurrentDate] = useState('');
  const [patients, setPatients] = useState([
    { id: 1, name: 'ByeWind', sex: 'Female', surgeryDate: 'Jun 24, 2025', recoverStage: 'Early', status: 'Good' },
    { id: 2, name: 'Natali Craig', sex: 'Male', surgeryDate: 'Mar 10, 2025', recoverStage: 'Mid', status: 'Emergency' },
    { id: 3, name: 'Drew Cano', sex: 'Female', surgeryDate: 'Nov 10, 2025', recoverStage: 'Advanced', status: 'Warning' },
    { id: 4, name: 'Orlando Diggs', sex: 'Female', surgeryDate: 'Dec 20, 2025', recoverStage: 'Reintegration', status: 'Emergency' },
    { id: 5, name: 'Andi Lane', sex: 'Male', surgeryDate: 'Jul 25, 2025', recoverStage: 'Reintegration', status: 'Good' },
    { id: 6, name: 'ByeWind', sex: 'Female', surgeryDate: 'Dec 20, 2025', recoverStage: 'Early', status: 'Warning' },
    { id: 7, name: 'Natali Craig', sex: 'Male', surgeryDate: 'Jul 25, 2025', recoverStage: 'Mid', status: 'Good' }
  ]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [medicalNote, setMedicalNote] = useState('');
  const [recentNotes, setRecentNotes] = useState([
    {
      id: 1,
      title: 'Excellent Progress',
      timestamp: '18 hours ago',
      patientName: 'Natali Craig'
    },
    {
      id: 2,
      title: 'Adjusted Exercise Intensity',
      timestamp: '3 days ago',
      patientName: 'ByeWind'
    },
    {
      id: 3,
      title: 'Swelling After Session',
      timestamp: '1 week ago',
      patientName: 'Drew Cano'
    }
  ]);

  // Update current date on component mount and every minute
  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const options = { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      };
      setCurrentDate(now.toLocaleDateString('en-US', options));
    };

    updateDate();
    const interval = setInterval(updateDate, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const handleNoteSubmit = () => {
    if (selectedPatient && medicalNote) {
      const newNote = {
        id: Date.now(),
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        title: medicalNote.substring(0, 30) + (medicalNote.length > 30 ? '...' : ''),
        note: medicalNote,
        timestamp: 'Just now',
        doctor: user ? user.name : 'Dr. Unknown'
      };
      
      setRecentNotes(prev => [newNote, ...prev]);
      setMedicalNote('');
      setSelectedPatient(null);
      
      // Send note to server
      mockWebSocket.send(JSON.stringify({
        type: 'medicalNote',
        ...newNote
      }));
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Good':
        return 'doctor-status-good';
      case 'Emergency':
        return 'doctor-status-emergency';
      case 'Warning':
        return 'doctor-status-warning';
      default:
        return 'doctor-status-good';
    }
  };

  return (
    <div className="tmobile-patient-dashboard">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <div className="tmobile-logo">
            <svg width="30" height="24" viewBox="0 0 30 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.05 5.4H11.95C15.1 5.4 17.05 7.35 17.05 10.4C17.05 13.45 15.1 15.4 11.95 15.4H9.3V19.4H6.05V5.4ZM11.6 12.8C13.3 12.8 13.85 11.8 13.85 10.4C13.85 9 13.3 8 11.6 8H9.3V12.8H11.6Z" fill="#E20074"/>
              <path d="M18.75 5.4H22V19.4H18.75V5.4Z" fill="#E20074"/>
            </svg>
          </div>
          <h1 className="welcome-text">Welcome back {user?.name || 'Doctor'}!</h1>
        </div>
        
        <div className="header-right">
          <div className="search-container">
            <Search className="search-icon" size={16} />
            <input type="text" className="search-input" placeholder="Search" />
          </div>

          <div className="date-display">
            <Calendar size={16} className="calendar-icon" />
            <span>{currentDate}</span>
            <svg className="dropdown-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6L8 10L12 6" stroke="#6A6A6A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="app-content">
        {/* Back button and title */}
        <div className="content-header">
          <button className="back-button" onClick={onSignOut}>
            <ArrowLeft size={16} />
            Carelink Dashboard &gt;&gt;
          </button>
          
          <h2 className="page-title">ACL Rehabilitation - Doctor Dashboard</h2>
        </div>
        
        <div className="dashboard-container">
          {/* Left column - Patients table */}
          <div className="main-column">
            <div className="card doctor-patients-card">
              <h2 className="doctor-patients-title">Patients</h2>
              
              <div className="doctor-table-container">
                <table className="doctor-patients-table">
                  <thead>
                    <tr>
                      <th>Patient Name</th>
                      <th>Sex</th>
                      <th>Surgery Date</th>
                      <th>Recover Stage</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map(patient => (
                      <tr 
                        key={patient.id} 
                        className={selectedPatient?.id === patient.id ? 'selected' : ''}
                        onClick={() => setSelectedPatient(patient)}
                      >
                        <td>
                          <div className="patient-name-cell">
                            <div className="patient-icon">
                              <User size={16} />
                            </div>
                            {patient.name}
                          </div>
                        </td>
                        <td>{patient.sex}</td>
                        <td>{patient.surgeryDate}</td>
                        <td>{patient.recoverStage}</td>
                        <td>
                          <span className={`doctor-status-badge ${getStatusStyle(patient.status)}`}>
                            {patient.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* Right column - Notes section */}
          <div className="sidebar-column">
            <div className="card doctor-notes-card">
              <h3 className="doctor-notes-title">New Notes+</h3>
              
              {/* Note input */}
              <div className="doctor-note-input-section">
                <textarea
                  value={medicalNote}
                  onChange={(e) => setMedicalNote(e.target.value)}
                  className="doctor-note-textarea"
                  placeholder="Add Notes..."
                  rows={4}
                />
              </div>
              
              {/* Selected patient info */}
              {selectedPatient && (
                <div className="selected-patient-info">
                  <p><strong>Selected:</strong> {selectedPatient.name}</p>
                </div>
              )}
              
              {/* Past Notes */}
              <div className="doctor-past-notes-section">
                <div className="doctor-past-notes-header">
                  <h4>Past Notes</h4>
                  <button className="doctor-notes-filter-btn">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 4H14M4 8H12M6 12H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
                
                <div className="doctor-notes-list">
                  {recentNotes.map(note => (
                    <div key={note.id} className="doctor-note-item">
                      <div className="doctor-note-icon">
                        <User size={16} />
                      </div>
                      <div className="doctor-note-content">
                        <div className="doctor-note-title">{note.title}</div>
                        <div className="doctor-note-time">{note.timestamp}</div>
                      </div>
                      <div className="doctor-note-expand">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Add note button */}
              <button 
                onClick={handleNoteSubmit}
                className="doctor-add-note-btn"
                disabled={!selectedPatient || !medicalNote.trim()}
              >
                Add a note
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorPage;