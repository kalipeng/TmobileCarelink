import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, CheckCircle, Activity, Bell, Calendar, Search, ArrowLeft } from 'lucide-react';
import { db, ref, onValue } from './firebase'; // Firebase imports
import './TMobilePatientDashboard.css';

// Mock WebSocket connection
const mockWebSocket = {
  send: (data) => {
    console.log('Sending:', data);
  }
};

const TMobilePatientDashboard = ({ user, onBack, onSignOut }) => {
  // Debug: Log user data
  console.log('TMobilePatientDashboard received user:', user);
  
  // States
  const [sensorData, setSensorData] = useState([]);
  const [suggestion, setSuggestion] = useState("Great progress! Current flexion at 78° - approaching your 80° goal");
  const [safetyLevel, setSafetyLevel] = useState(0); // 0: Safe, 1: Warning, 2: Dangerous
  const [painLevel, setPainLevel] = useState(1);
  const [currentDate, setCurrentDate] = useState('');
  
  // Patient information - computed from user data
  const patientInfo = useMemo(() => {
    console.log('Computing patientInfo with user:', user);
    const info = {
      name: user?.name || 'Patient',
      age: user?.age?.toString() || '32',
      gender: user?.gender || 'male',
      surgeryStage: 'intermediate', // Default, could be enhanced to come from user data
      recoveryStage: '45°/80°', // Default goal, could be personalized
      duration: '30mins' // Default session duration
    };
    console.log('Computed patientInfo:', info);
    return info;
  }, [user?.name, user?.age, user?.gender]);

  // Recommended angles based on surgery stage
  const stageRecommendations = {
    'early': { maxFlexion: 90, minFlexion: 0, maxRotation: 5 },
    'intermediate': { maxFlexion: 120, minFlexion: 0, maxRotation: 10 },
    'advanced': { maxFlexion: 140, minFlexion: 0, maxRotation: 15 }
  };
  
  // Function to adjust recommendations based on pain level
  const getAdjustedRecommendations = (baseRecommendations, painLevel) => {
    let adjustmentFactor = 1.0;
    
    if (painLevel >= 8) {
      adjustmentFactor = 0.6; // Reduce by 40% for severe pain
    } else if (painLevel >= 6) {
      adjustmentFactor = 0.75; // Reduce by 25% for moderate pain
    } else if (painLevel >= 4) {
      adjustmentFactor = 0.9; // Reduce by 10% for mild pain
    } else if (painLevel <= 2) {
      adjustmentFactor = 1.05; // Increase by 5% for minimal pain
    }
    
    return {
      maxFlexion: Math.round(baseRecommendations.maxFlexion * adjustmentFactor),
      minFlexion: baseRecommendations.minFlexion,
      maxRotation: Math.round(baseRecommendations.maxRotation * adjustmentFactor)
    };
  };

  // Function to format timestamp for display
  const formatTimeForDisplay = (timestamp) => {
    // If timestamp is a number (Unix timestamp), convert to Date
    if (typeof timestamp === 'number' || !isNaN(timestamp)) {
      const date = new Date(parseInt(timestamp));
      return date.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
    }
    
    // If timestamp is already a date string, try to parse it
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
    }
    
    // If we can't parse it, use the original value but make it shorter
    return String(timestamp).slice(-8); // Show last 8 characters
  };

  // Get real-time sensor data from Firebase
  useEffect(() => {
    const sensorRef = ref(db, 'user_001/data');

    const unsubscribe = onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      console.log('Raw Firebase data:', data); // 添加调试日志

      if (data) {
        const sortedKeys = Object.keys(data).sort((a, b) => Number(a) - Number(b));
        console.log('Sorted keys:', sortedKeys); // 添加调试日志

        // Calculate adjusted recommendations based on current pain level
        const baseRecommendations = stageRecommendations[patientInfo.surgeryStage] || stageRecommendations.intermediate;
        const adjustedRecommendations = getAdjustedRecommendations(baseRecommendations, painLevel);
        const targetAngle = adjustedRecommendations.maxFlexion;

        const filtered = sortedKeys
          .map((key, index) => {
            const item = data[key] || {};
            console.log('Processing item:', key, item); // 添加调试日志
            
            // Create a more readable time format
            let displayTime;
            
            // If we have a timestamp field in the item, use it
            if (item.timestamp) {
              displayTime = formatTimeForDisplay(item.timestamp);
            } else {
              // Generate a relative time based on index (simulate real-time data)
              const now = new Date();
              const timeOffset = (index - sortedKeys.length + 1) * 5000; // 5 seconds between each data point
              const dataTime = new Date(now.getTime() + timeOffset);
              displayTime = dataTime.toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
              });
            }
            
            return {
              time: displayTime,
              rawTime: key, // Keep original for sorting if needed
              flexionAngle: item.flexionAngle ?? null,
              supposedAngle: targetAngle, // Use adjusted target angle instead of 0
              rotation: item.mpu1?.gyro_z ?? null,
              acceleration: item.mpu1?.acc_z ?? null,
              suggestions: item.suggestions ?? []
            };
          })
          .filter(d => d.flexionAngle !== null); // 放宽过滤条件

        console.log('Filtered data:', filtered); // 添加调试日志
        console.log('Using target angle:', targetAngle, 'for pain level:', painLevel); // 添加调试日志

        // 只显示最新15条有预测的点
        const latestData = filtered.slice(-15);
        console.log('Latest 15 data points:', latestData); // 添加调试日志
        setSensorData(latestData);

        // Set suggestion from the latest data point if available
        if (latestData.length > 0 && latestData[latestData.length - 1].suggestions?.length > 0) {
          setSuggestion(latestData[latestData.length - 1].suggestions[0]);
        }
      }
    });

    return () => unsubscribe();
  }, [painLevel, patientInfo.surgeryStage]); // Add painLevel and surgeryStage as dependencies

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

  const handlePainFeedback = (level) => {
    setPainLevel(level);
    // Send pain feedback to server
    if (user && user.id) {
      mockWebSocket.send(JSON.stringify({
        type: 'painFeedback',
        patientId: user.id,
        painLevel: level,
        timestamp: new Date().toISOString()
      }));
    }
  };

  return (
    <div className="tmobile-patient-dashboard">
      {/* Header with logo and search */}
      <header className="app-header">
        <div className="header-left">
          <div className="tmobile-logo">
            <svg width="30" height="24" viewBox="0 0 30 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.05 5.4H11.95C15.1 5.4 17.05 7.35 17.05 10.4C17.05 13.45 15.1 15.4 11.95 15.4H9.3V19.4H6.05V5.4ZM11.6 12.8C13.3 12.8 13.85 11.8 13.85 10.4C13.85 9 13.3 8 11.6 8H9.3V12.8H11.6Z" fill="#E20074"/>
              <path d="M18.75 5.4H22V19.4H18.75V5.4Z" fill="#E20074"/>
            </svg>
          </div>
          <h1 className="welcome-text">Welcome back {user?.name || 'Patient'}!</h1>
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
          
          <h2 className="page-title">ACL Rehabilitation - Patient Dashboard</h2>
        </div>
        
        <div className="dashboard-container">
          {/* Left column - Main content */}
          <div className="main-column">
            {/* Doctor instruction */}
            <div className="card instruction-card">
              <div className="instruction-label">Doctor instruction</div>
              <div className="instruction-text">Limit flexion to 80° maximum regardless of pain level.</div>
            </div>
            
            {/* Exercise section */}
            <div className="card exercise-card">
              <div className="exercise-label">Exercise</div>
              <h3 className="exercise-title">Realtime Angle</h3>
              
              <div className="chart-legend">
                <div className="legend-item">
                  <div className="legend-dot predicted"></div>
                <span>Predicted Angle</span>
              </div>
                <div className="legend-item">
                  <div className="legend-dot supposed"></div>
                <span>Target Angle (Pain Level {painLevel})</span>
              </div>
            </div>
            
              <div className="chart-container">
            <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={sensorData} margin={{ top: 5, right: 5, left: 5, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 10, angle: -45 }}
                  textAnchor="end"
                  height={50}
                  interval="preserveStartEnd"
                />
                    <YAxis domain={[-30, 90]} />
                <Tooltip 
                  labelFormatter={(value) => `Time: ${value}`}
                  formatter={(value, name) => [
                    typeof value === 'number' ? `${value.toFixed(1)}°` : value,
                    name
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="flexionAngle" 
                      stroke="#E20074" 
                  strokeWidth={2} 
                  dot={false}
                      name="Predicted Angle"
                />
                <Line 
                  type="monotone" 
                      dataKey="supposedAngle" 
                  stroke="#dddddd" 
                      strokeWidth={1.5} 
                      strokeDasharray="3 3" 
                      dot={false}
                  name={`Target Angle (Pain Level ${painLevel})`}
                    />
                    {/* Additional data lines that may be useful */}
                    {sensorData.length > 0 && sensorData[0].rotation !== null && (
                      <Line 
                        type="monotone" 
                        dataKey="rotation" 
                        stroke="#861B54" 
                        strokeWidth={1.5} 
                        dot={false}
                        name="Rotation"
                        hide={true} // Hidden by default, can be toggled in Legend
                      />
                    )}
                    {sensorData.length > 0 && sensorData[0].acceleration !== null && (
                      <Line 
                        type="monotone" 
                        dataKey="acceleration" 
                        stroke="#4CAF50" 
                        strokeWidth={1.5} 
                  dot={false}
                        name="Acceleration"
                        hide={true} // Hidden by default, can be toggled in Legend
                />
                    )}
              </LineChart>
            </ResponsiveContainer>
              </div>
              
              <div className="progress-feedback">
                {suggestion || "Great progress! Current flexion at 78° - approaching your 80° goal"}
            </div>
            
              {patientInfo.surgeryStage && (
                <div className="recommendations-section">
                  <h4 className="recommendations-title">Recommended limits:</h4>
                  <div className="recommendations-details">
                    <div className="recommendation-item">
                      <span>Base max flexion:</span>
                      <span>{stageRecommendations[patientInfo.surgeryStage]?.maxFlexion || 120}°</span>
                    </div>
                    <div className="recommendation-item">
                      <span>Current target angle (chart line):</span>
                      <span><strong>{getAdjustedRecommendations(stageRecommendations[patientInfo.surgeryStage] || stageRecommendations.intermediate, painLevel).maxFlexion}°</strong></span>
                    </div>
                    <div className="recommendation-item">
                      <span>Adjusted for pain level {painLevel}:</span>
                      <span>{getAdjustedRecommendations(stageRecommendations[patientInfo.surgeryStage] || stageRecommendations.intermediate, painLevel).maxFlexion}°</span>
                    </div>
                    {painLevel >= 6 && (
                      <div className="recommendation-warning">
                        ⚠️ Limits reduced due to elevated pain level
                      </div>
                    )}
                    {painLevel <= 2 && (
                      <div className="recommendation-success">
                        ✓ Limits slightly increased due to low pain level
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="pain-level-section">
                <h4 className="pain-level-title">What is your pain Level</h4>
                <div className="pain-level-buttons">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                  <button
                    key={level}
                      className={`pain-button ${painLevel === level ? 'active' : ''}`}
                    onClick={() => handlePainFeedback(level)}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
            {/* AI suggestion */}
            <div className="card suggestion-card">
              <h3 className="suggestion-title">AI suggestion</h3>
              <p className="suggestion-text">Your 5G-powered recovery coach analyzes patterns to optimize your healing journey.</p>
            
              <div className="suggestion-boxes">
                <div className="suggestion-box">
                  <h4 className="box-title">Personal Rehabilitation Coach</h4>
                  <p className="box-text">Great progress! Current flexion at 78° - approaching your 80° goal.</p>
              </div>
              
                <div className="suggestion-box">
                  <h4 className="box-title">Safety Monitoring</h4>
                  <p className="box-text">Consider adding 5 more minutes to today's session.</p>
              </div>
              
                <div className="suggestion-box">
                  <h4 className="box-title">Recovery Stage Guidance</h4>
                  <p className="box-text">Maintain controlled movements to prevent strain.</p>
              </div>
            </div>
          </div>
        </div>
        
          {/* Right column - Sidebar */}
          <div className="sidebar-column">
            {/* Profile card */}
            <div className="profile-card">
              <div className="avatar-container">
                <div className="avatar">{user?.name?.charAt(0)?.toUpperCase() || 'P'}</div>
              </div>
              
              <div className="profile-details">
                <div className="profile-row">
                  <span className="profile-label">Name:</span>
                  <span className="profile-value">{patientInfo.name}</span>
            </div>
                <div className="profile-row">
                  <span className="profile-label">Age:</span>
                  <span className="profile-value">{patientInfo.age}</span>
              </div>
                <div className="profile-row">
                  <span className="profile-label">Gender:</span>
                  <span className="profile-value">
                    {patientInfo.gender === 'male' ? 'Male' : patientInfo.gender === 'female' ? 'Female' : 'Other'}
                  </span>
              </div>
                <div className="profile-row">
                  <span className="profile-label">Recovery Stage:</span>
                  <span className="profile-value">
                    {patientInfo.surgeryStage.charAt(0).toUpperCase() + patientInfo.surgeryStage.slice(1)}
                  </span>
              </div>
            </div>
          </div>

          {/* Today's Goal */}
            <div className="goal-card">
              <h3 className="goal-title">Today's Goal</h3>
              <div className="goal-details">
                <div className="goal-row">
                  <span className="goal-label">Flexion:</span>
                  <span className="goal-value">{patientInfo.recoveryStage}</span>
              </div>
                <div className="goal-row">
                  <span className="goal-label">Duration:</span>
                  <span className="goal-value">{patientInfo.duration}</span>
              </div>
            </div>
          </div>

          {/* Notifications */}
            <div className="notification-card">
              <h3 className="notification-title">Notification</h3>
              <ul className="notification-list">
                <li className="notification-item">
                  <Bell size={16} className="notification-icon" />
                  <div className="notification-content">
                    <div className="notification-text">Dr smith add a note</div>
                    <div className="notification-time">Just now</div>
                </div>
              </li>
                <li className="notification-item">
                  <AlertCircle size={16} className="notification-icon warning" />
                  <div className="notification-content">
                    <div className="notification-text">Warning - Excess rehab angle</div>
                    <div className="notification-time">59 minutes ago</div>
                </div>
              </li>
                <li className="notification-item">
                  <CheckCircle size={16} className="notification-icon success" />
                  <div className="notification-content">
                    <div className="notification-text">You fixed a bug.</div>
                    <div className="notification-time">12 hours ago</div>
                </div>
              </li>
                <li className="notification-item">
                  <Bell size={16} className="notification-icon" />
                  <div className="notification-content">
                    <div className="notification-text">Andi Lane subscribed to you.</div>
                    <div className="notification-time">Today, 11:59 AM</div>
                </div>
              </li>
            </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TMobilePatientDashboard;