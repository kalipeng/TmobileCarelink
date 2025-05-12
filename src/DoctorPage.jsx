// SignInPage.jsx
import React, { useState } from 'react';
import { User, Eye, EyeOff, AlertCircle } from 'lucide-react';

// T-Mobile Brand Colors
const colors = {
  magenta: '#E20074',
  white: '#FFFFFF',
  black: '#000000',
  lightGray: '#E8E8E8',
  darkGray: '#6A6A6A',
  gradient: 'linear-gradient(135deg, #E20074 0%, #B8005A 100%)'
};

// Mock users database
const mockUsers = {
  patients: [
    { id: 1, username: 'john_doe', password: 'patient123', name: 'John Doe' },
    { id: 2, username: 'jane_smith', password: 'patient456', name: 'Jane Smith' },
    { id: 3, username: 'bob_johnson', password: 'patient789', name: 'Bob Johnson' }
  ],
  doctors: [
    { id: 1, username: 'dr_smith', password: 'doctor123', name: 'Dr. Smith' },
    { id: 2, username: 'dr_jones', password: 'doctor456', name: 'Dr. Jones' }
  ]
};

const SignInPage = ({ userType, onSignIn, switchUserType }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const users = userType === 'patient' ? mockUsers.patients : mockUsers.doctors;
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      onSignIn(user);
    } else {
      setError('Invalid username or password');
    }
    
    setIsLoading(false);
  };

  const fillDemoCredentials = () => {
    if (userType === 'patient') {
      setUsername('john_doe');
      setPassword('patient123');
    } else {
      setUsername('dr_smith');
      setPassword('doctor123');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.lightGray }}>
      <div className="w-full max-w-md p-4">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold" style={{ color: colors.black }}>
            <span style={{ color: colors.magenta }}>ACL</span> REHAB
          </h1>
          <p className="text-lg mt-2" style={{ color: colors.darkGray }}>
            Physical Therapy Platform
          </p>
        </div>

        {/* Sign In Card */}
        <div className="p-8 rounded-lg shadow-lg" style={{ backgroundColor: colors.white }}>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold" style={{ color: colors.magenta }}>
              {userType === 'patient' ? 'PATIENT' : 'DOCTOR'} SIGN IN
            </h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2" style={{ color: colors.black }}>
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-magenta-500"
                  style={{ 
                    borderColor: colors.lightGray,
                    transition: 'all 0.3s ease'
                  }}
                  placeholder="Enter your username"
                />
                <User className="absolute right-3 top-2.5" size={20} style={{ color: colors.darkGray }} />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2" style={{ color: colors.black }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-magenta-500"
                  style={{ 
                    borderColor: colors.lightGray,
                    transition: 'all 0.3s ease'
                  }}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5"
                >
                  {showPassword ? 
                    <EyeOff size={20} style={{ color: colors.darkGray }} /> : 
                    <Eye size={20} style={{ color: colors.darkGray }} />
                  }
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg flex items-center" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
                <AlertCircle size={20} className="mr-2" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 px-4 rounded-lg font-semibold transition-all duration-300 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
              }`}
              style={{ 
                backgroundColor: colors.magenta, 
                color: colors.white,
                transform: isLoading ? 'none' : 'scale(1.02)'
              }}
            >
              {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </form>

          {/* Demo credentials button */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="text-sm hover:underline transition-all duration-300"
              style={{ color: colors.magenta }}
            >
              Use Demo Credentials
            </button>
          </div>

          {/* Switch user type */}
          <div className="mt-6 text-center">
            <p style={{ color: colors.darkGray }}>
              {userType === 'patient' ? 'Are you a doctor?' : 'Are you a patient?'}
            </p>
            <button
              type="button"
              onClick={switchUserType}
              className="mt-2 text-sm font-semibold hover:underline transition-all duration-300"
              style={{ color: colors.magenta }}
            >
              Sign in as {userType === 'patient' ? 'Doctor' : 'Patient'}
            </button>
          </div>

          {/* Demo credentials info */}
          <div className="mt-6 p-3 rounded-lg" style={{ backgroundColor: colors.lightGray }}>
            <p className="text-xs font-semibold" style={{ color: colors.black }}>Demo Credentials:</p>
            <p className="text-xs mt-1" style={{ color: colors.darkGray }}>
              Patient: john_doe / patient123
            </p>
            <p className="text-xs" style={{ color: colors.darkGray }}>
              Doctor: dr_smith / doctor123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;