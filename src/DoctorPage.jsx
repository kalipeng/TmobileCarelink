import React, { useState } from 'react';

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
        doctor: user ? user.name : 'Dr. Unknown'
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
          onClick={onSignOut}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Sign Out
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

export default DoctorPage;