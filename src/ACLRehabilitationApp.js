import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, CheckCircle, Activity, Brain, User } from 'lucide-react';
import { db, ref, onValue } from './firebase'; // 路径根据实际情况调整

// Mock WebSocket connection
const mockWebSocket = {
  onmessage: null,
  send: (data) => {
    console.log('Sending:', data);
  }
};

// T-Mobile品牌颜色 - 按照品牌指南更新
const colors = {
  magenta: '#E20074',    // T-Mobile Magenta - 主色调
  white: '#FFFFFF',      // 纯白色
  black: '#000000',      // 纯黑色
  berry: '#861B54',      // Berry - 深色辅助色
  lightGray: '#E8E8E8',  // 浅灰色
  darkGray: '#6A6A6A',   // 深灰色
  gradient: 'linear-gradient(135deg, #E20074 0%, #861B54 100%)'
};

const ACLRehabilitationApp = ({ user, onSignOut }) => {
  console.log('ACLRehabilitationApp rendered with user:', user);
  
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
    const sensorRef = ref(db, 'user_001/data');
    const unsubscribe = onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const sortedKeys = Object.keys(data).sort((a, b) => Number(a) - Number(b));
        const newData = sortedKeys.map(key => {
          const item = data[key];
          return {
            time: key, // 或 new Date(Number(key)).toLocaleTimeString()，看你的 key 格式
            flexionAngle: item.predicted_angle,
            rotation: item.mpu1?.gyro_z,
            acceleration: item.mpu1?.acc_z,
            suggestions: item.suggestions ?? []
          };
        }).filter(d => typeof d.flexionAngle === 'number'); // 只保留有 predicted_angle 的数据
        setSensorData(newData.slice(-30));
      }
    });
    return () => unsubscribe();
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

  const toggleExercise = () => {
    setExerciseStatus(exerciseStatus === 'running' ? 'stopped' : 'running');
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">ACL Rehabilitation - Patient Dashboard</h1>
        <button
          onClick={onSignOut}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Sign Out
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

      {sensorData.length > 0 && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <strong>Latest Suggestions:</strong>
          <ul>
            {sensorData[sensorData.length - 1].suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
          <div>
            <strong>Predicted Angle:</strong> {sensorData[sensorData.length - 1].flexionAngle}
          </div>
        </div>
      )}
    </div>
  );
};

export default ACLRehabilitationApp;