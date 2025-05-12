import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, CheckCircle, Activity, Brain, UserPlus, User } from 'lucide-react';
import SignInPage from './SignInPage';

const colors = {
  magenta: '#E20074',
  white: '#FFFFFF',
  black: '#000000',
  lightGray: '#E8E8E8',
  darkGray: '#6A6A6A',
  gradient: 'linear-gradient(135deg, #E20074 0%, #B8005A 100%)'
};

// Mock WebSocket connection
const mockWebSocket = {
  onmessage: null,
  send: (data) => {
    console.log('Sending:', data);
  }
};

// Patient Page Component
const PatientPage = ({ patientId, setCurrentUser }) => {
  const [sensorData, setSensorData] = useState([]);
  const [suggestion, setSuggestion] = useState('');
  const [safetyLevel, setSafetyLevel] = useState(0);
  const [painLevel, setPainLevel] = useState(0);
  const [exerciseStatus, setExerciseStatus] = useState('stopped');
  
  // Patient information
  const [patientInfo, setPatientInfo] = useState({
    age: '',
    gender: '',
    surgeryStage: '',
    inputComplete: false
  });
  
  // Doctor's notes (in real app, this would come from backend)
  const [doctorNotes, setDoctorNotes] = useState([
    {
      date: '2023-12-15',
      note: 'Limit flexion to 80° maximum regardless of pain level. Avoid rotation beyond 5° in all cases.',
      doctor: 'Dr. Smith'
    },
    {
      date: '2023-12-10',
      note: 'Patient showing good progress. May increase exercise duration but maintain current angle limits.',
      doctor: 'Dr. Smith'
    }
  ]);

  // Recommended angles based on surgery stage
  const stageRecommendations = {
    'early': { maxFlexion: 90, minFlexion: 0, maxRotation: 5 },
    'intermediate': { maxFlexion: 120, minFlexion: 0, maxRotation: 10 },
    'advanced': { maxFlexion: 140, minFlexion: 0, maxRotation: 15 }
  };
  
  // Function to adjust recommendations based on pain level
  const getAdjustedRecommendations = (baseRecommendations, painLevel) => {
    // Pain-based adjustment factors
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

  // Simulate sensor data updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newData = {
        time: new Date().toLocaleTimeString(),
        flexionAngle: Math.random() * 60 + 20,
        rotation: Math.random() * 20 - 10,
        acceleration: Math.random() * 2
      };
      
      setSensorData(prev => [...prev.slice(-30), newData]);
      
      // Simulate AI suggestion with specific angle recommendations
      if (patientInfo.inputComplete && patientInfo.surgeryStage) {
        const baseLimits = stageRecommendations[patientInfo.surgeryStage];
        const adjustedLimits = getAdjustedRecommendations(baseLimits, painLevel);
        
        // Check if pain level is too high
        if (painLevel >= 7) {
          setSuggestion(`⚠️ HIGH PAIN DETECTED! Reduce intensity immediately. Recommended maximum flexion reduced to ${adjustedLimits.maxFlexion}° (from ${baseLimits.maxFlexion}°). Please move more gently.`);
          setSafetyLevel(2);
        } else if (newData.flexionAngle > adjustedLimits.maxFlexion) {
          setSuggestion(`REDUCE flexion angle to ${adjustedLimits.maxFlexion}°. Current: ${newData.flexionAngle.toFixed(1)}° (exceeds adjusted limit based on pain level ${painLevel})`);
          setSafetyLevel(2);
        } else if (newData.flexionAngle > adjustedLimits.maxFlexion * 0.9) {
          setSuggestion(`CAUTION: Approaching adjusted maximum flexion limit. Target: ${adjustedLimits.maxFlexion}°. Current: ${newData.flexionAngle.toFixed(1)}°`);
          setSafetyLevel(1);
        } else if (Math.abs(newData.rotation) > adjustedLimits.maxRotation) {
          setSuggestion(`EXCESSIVE rotation detected! Limit to ${adjustedLimits.maxRotation}°. Current: ${Math.abs(newData.rotation).toFixed(1)}°`);
          setSafetyLevel(2);
        } else if (newData.flexionAngle < adjustedLimits.maxFlexion * 0.7) {
          if (painLevel <= 3) {
            setSuggestion(`Good control with low pain! You can safely increase flexion to ${(adjustedLimits.maxFlexion * 0.9).toFixed(0)}°. Current: ${newData.flexionAngle.toFixed(1)}°`);
            setSafetyLevel(0);
          } else {
            setSuggestion(`Maintain current range due to pain level ${painLevel}. Current flexion: ${newData.flexionAngle.toFixed(1)}° is appropriate.`);
            setSafetyLevel(0);
          }
        } else {
          setSuggestion(`EXCELLENT! Maintaining optimal range for pain level ${painLevel}. Current flexion: ${newData.flexionAngle.toFixed(1)}° (Safe range: ${(adjustedLimits.maxFlexion * 0.7).toFixed(0)}-${(adjustedLimits.maxFlexion * 0.9).toFixed(0)}°)`);
          setSafetyLevel(0);
        }
      } else {
        setSuggestion('Please complete patient information to receive personalized guidance.');
        setSafetyLevel(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handlePainFeedback = (level) => {
    setPainLevel(level);
    // Send pain feedback to server
    mockWebSocket.send(JSON.stringify({
      type: 'painFeedback',
      patientId,
      painLevel: level,
      timestamp: new Date().toISOString()
    }));
  };

  const toggleExercise = () => {
    setExerciseStatus(exerciseStatus === 'running' ? 'stopped' : 'running');
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">ACL Rehabilitation - Patient Dashboard</h1>
        <button
          onClick={() => setCurrentUser('doctor')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Switch to Doctor View
        </button>
      </div>

      {/* Patient Information Input */}
      {!patientInfo.inputComplete && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Patient Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
              <input
                type="number"
                value={patientInfo.age}
                onChange={(e) => setPatientInfo({...patientInfo, age: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="Enter age"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <select
                value={patientInfo.gender}
                onChange={(e) => setPatientInfo({...patientInfo, gender: e.target.value})}
                className="w-full p-2 border rounded"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Surgery Recovery Stage</label>
              <select
                value={patientInfo.surgeryStage}
                onChange={(e) => setPatientInfo({...patientInfo, surgeryStage: e.target.value})}
                className="w-full p-2 border rounded"
              >
                <option value="">Select stage</option>
                <option value="early">Early Stage (0-6 weeks)</option>
                <option value="intermediate">Intermediate Stage (6-12 weeks)</option>
                <option value="advanced">Advanced Stage (12+ weeks)</option>
              </select>
            </div>
          </div>
          <button
            onClick={() => setPatientInfo({...patientInfo, inputComplete: true})}
            disabled={!patientInfo.age || !patientInfo.gender || !patientInfo.surgeryStage}
            className={`mt-4 px-6 py-2 rounded ${
              !patientInfo.age || !patientInfo.gender || !patientInfo.surgeryStage
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            Continue to Exercise
          </button>
        </div>
      )}
      
      {/* Real-time Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-lg shadow-md ${safetyLevel === 0 ? 'bg-green-100' : safetyLevel === 1 ? 'bg-yellow-100' : 'bg-red-100'}`}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Safety Status</h3>
            {safetyLevel === 0 ? <CheckCircle className="text-green-600" /> : <AlertCircle className={safetyLevel === 1 ? 'text-yellow-600' : 'text-red-600'} />}
          </div>
          <p className="text-sm mt-2">{safetyLevel === 0 ? 'Safe' : safetyLevel === 1 ? 'Warning' : 'Dangerous'}</p>
        </div>
        
        <div className="p-4 rounded-lg shadow-md bg-white">
          <h3 className="font-semibold">Current Exercise</h3>
          <div className="flex items-center mt-2">
            <Activity className={exerciseStatus === 'running' ? 'text-green-600 animate-pulse' : 'text-gray-400'} />
            <span className="ml-2">{exerciseStatus === 'running' ? 'In Progress' : 'Stopped'}</span>
          </div>
          <button
            onClick={toggleExercise}
            className={`mt-2 px-4 py-2 rounded w-full ${exerciseStatus === 'running' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
          >
            {exerciseStatus === 'running' ? 'Stop Exercise' : 'Start Exercise'}
          </button>
        </div>
        
        <div className="p-4 rounded-lg shadow-md bg-white">
          <h3 className="font-semibold">Pain Level</h3>
          <div className="flex justify-between mt-2">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
              <button
                key={level}
                onClick={() => handlePainFeedback(level)}
                className={`w-8 h-8 rounded ${painLevel === level ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
              >
                {level}
              </button>
            ))}
          </div>
          <p className="text-sm mt-2">Current pain: {painLevel}/10</p>
        </div>
      </div>
      
      {/* Real-time Charts */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Real-time Knee Motion Data</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={sensorData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="flexionAngle" stroke="#2563eb" name="Flexion Angle (°)" />
            <Line type="monotone" dataKey="rotation" stroke="#dc2626" name="Rotation (°)" />
            <Line type="monotone" dataKey="acceleration" stroke="#16a34a" name="Acceleration (m/s²)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* AI Suggestions */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Brain className="text-purple-600 mr-2" />
            <h2 className="text-xl font-semibold">AI Feedback</h2>
          </div>
          {patientInfo.inputComplete && (
            <div className="text-sm text-gray-600">
              Stage: {patientInfo.surgeryStage.charAt(0).toUpperCase() + patientInfo.surgeryStage.slice(1)} | 
              Age: {patientInfo.age} | 
              Gender: {patientInfo.gender.charAt(0).toUpperCase() + patientInfo.gender.slice(1)}
            </div>
          )}
        </div>
        <div className={`p-4 rounded-lg ${safetyLevel === 0 ? 'bg-green-50 text-green-800' : safetyLevel === 1 ? 'bg-yellow-50 text-yellow-800' : 'bg-red-50 text-red-800'}`}>
          <p className="text-lg font-semibold">{suggestion}</p>
          {patientInfo.inputComplete && patientInfo.surgeryStage && (
            <div className="mt-3 text-sm border-t pt-2">
              <p className="font-semibold">Recommended limits for {patientInfo.surgeryStage} stage:</p>
              <ul className="list-disc list-inside">
                <li>Base max flexion: {stageRecommendations[patientInfo.surgeryStage].maxFlexion}°</li>
                <li>Adjusted for pain level {painLevel}: {getAdjustedRecommendations(stageRecommendations[patientInfo.surgeryStage], painLevel).maxFlexion}°</li>
                <li>Max rotation: {getAdjustedRecommendations(stageRecommendations[patientInfo.surgeryStage], painLevel).maxRotation}°</li>
              </ul>
              {painLevel >= 6 && (
                <p className="mt-2 text-red-600 font-semibold">
                  ⚠️ Limits reduced due to elevated pain level
                </p>
              )}
              {painLevel <= 2 && (
                <p className="mt-2 text-green-600 font-semibold">
                  ✓ Limits slightly increased due to low pain level
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Doctor's Notes Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <div className="border-2 border-blue-500 bg-blue-50 p-3 rounded mb-4">
          <p className="text-blue-800 font-bold text-center">
            ⚕️ IMPORTANT: Always follow doctor's instructions over AI suggestions
          </p>
          <p className="text-blue-700 text-sm text-center">
            If there is any conflict between AI feedback and doctor's notes, please follow your doctor's guidance
          </p>
        </div>
        
        <div className="flex items-center mb-4">
          <User className="text-blue-600 mr-2" />
          <h2 className="text-xl font-semibold">Doctor's Notes</h2>
        </div>
        
        {doctorNotes.length > 0 ? (
          <div className="space-y-3">
            {doctorNotes.map((note, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-blue-600">{note.doctor}</span>
                  <span className="text-sm text-gray-500">{note.date}</span>
                </div>
                <p className="text-gray-700">{note.note}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No doctor's notes available</p>
        )}
      </div>
    </div>
  );
};

// Doctor Page Component
const DoctorPage = ({ setCurrentUser }) => {
  const [patients, setPatients] = useState([
    { id: 1, name: 'John Doe', lastExercise: '2023-12-20', status: 'Active', painTrend: 'Decreasing' },
    { id: 2, name: 'Jane Smith', lastExercise: '2023-12-19', status: 'Warning', painTrend: 'Stable' },
    { id: 3, name: 'Bob Johnson', lastExercise: '2023-12-18', status: 'Needs Review', painTrend: 'Increasing' }
  ]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [medicalNote, setMedicalNote] = useState('');
  const [recentNotes, setRecentNotes] = useState([]);

  const handleNoteSubmit = () => {
    if (selectedPatient && medicalNote) {
      const newNote = {
        id: Date.now(),
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        note: medicalNote,
        timestamp: new Date().toLocaleString(),
        doctor: 'Dr. Smith'
      };
      
      setRecentNotes(prev => [newNote, ...prev]);
      setMedicalNote('');
      
      // Send note to server
      mockWebSocket.send(JSON.stringify({
        type: 'medicalNote',
        ...newNote
      }));
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">ACL Rehabilitation - Doctor Dashboard</h1>
        <button
          onClick={() => setCurrentUser('patient')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Switch to Patient View
        </button>
      </div>
      
      {/* Patient List */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Patient Overview</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left">Patient</th>
                <th className="p-3 text-left">Last Exercise</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Pain Trend</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(patient => (
                <tr key={patient.id} className="border-b">
                  <td className="p-3">{patient.name}</td>
                  <td className="p-3">{patient.lastExercise}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-sm ${
                      patient.status === 'Active' ? 'bg-green-100 text-green-800' :
                      patient.status === 'Warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="p-3">{patient.painTrend}</td>
                  <td className="p-3">
                    <button
                      onClick={() => setSelectedPatient(patient)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                    >
                      Add Note
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Medical Note Input */}
      {selectedPatient && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Add Medical Note for {selectedPatient.name}</h2>
          <div>
            <textarea
              value={medicalNote}
              onChange={(e) => setMedicalNote(e.target.value)}
              className="w-full h-32 p-3 border rounded mb-4"
              placeholder="Enter medical notes, adjustments to rehab plan, or special instructions..."
            />
            <button
              onClick={handleNoteSubmit}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              Submit Note
            </button>
          </div>
        </div>
      )}
      
      {/* Recent Notes */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Recent Medical Notes</h2>
        {recentNotes.length === 0 ? (
          <p className="text-gray-500">No recent notes</p>
        ) : (
          <div className="space-y-4">
            {recentNotes.map(note => (
              <div key={note.id} className="border-b pb-4">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">{note.patientName}</span>
                  <span className="text-sm text-gray-500">{note.timestamp}</span>
                </div>
                <p className="text-gray-700">{note.note}</p>
                <p className="text-sm text-gray-500 mt-1">By: {note.doctor}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function App() {
  const [userType, setUserType] = useState('patient');
  const [currentUser, setCurrentUser] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const handleSignIn = (user) => {
    setCurrentUser(user);
    setIsSignedIn(true);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setIsSignedIn(false);
  };

  const switchUserType = () => {
    setUserType(userType === 'patient' ? 'doctor' : 'patient');
  };

  if (!isSignedIn) {
    return (
      <SignInPage 
        userType={userType} 
        onSignIn={handleSignIn}
        switchUserType={switchUserType}
      />
    );
  }

  // 根据用户类型显示相应的页面
  if (userType === 'patient') {
    return <PatientPage patientId={currentUser.id} setCurrentUser={setCurrentUser} />;
  } else {
    return <DoctorPage setCurrentUser={setCurrentUser} />;
  }
}

export default App;