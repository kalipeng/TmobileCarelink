import React, { useState } from 'react';
import { User, Eye, EyeOff, AlertCircle, Calendar, Users, Activity, Heart, Stethoscope } from 'lucide-react';
import { saveUserInfo } from './firebase';

// T-Mobile Brand Colors
const colors = {
  magenta: '#E20074',
  white: '#FFFFFF',
  black: '#000000',
  lightGray: '#E8E8E8',
  darkGray: '#6A6A6A',
  berry: '#861B54'
};

// Healthcare Programs Available in CareLink
const healthcarePrograms = {
  aclTherapy: {
    id: 'acl-therapy',
    name: 'ACL Therapy Exercise',
    description: 'General exercise program for ACL recovery',
    icon: '🏃‍♂️',
    color: '#2196F3'
  },
  aclRehab: {
    id: 'acl-rehab',
    name: 'ACL Rehabilitation Monitor',
    description: 'Real-time knee angle monitoring with AI guidance',
    icon: '🦵',
    color: '#4CAF50',
    isOurProduct: true
  },
  hypertension: {
    id: 'hypertension',
    name: 'Hypertension Monitoring',
    description: 'Blood pressure tracking and medication alerts',
    icon: '❤️',
    color: '#FF9800'
  }
};

// Mock users database - simplified without recovery stage
const mockUsers = {
  patients: [
    { 
      id: 1, 
      username: 'john_doe', 
      password: 'patient123', 
      name: 'John Doe',
      age: 35,
      gender: 'male',
      program: 'acl-rehab'
    },
    { 
      id: 2, 
      username: 'jane_smith', 
      password: 'patient456', 
      name: 'Jane Smith',
      age: 42,
      gender: 'female',
      program: 'acl-therapy'
    },
    { 
      id: 3, 
      username: 'bob_johnson', 
      password: 'patient789', 
      name: 'Bob Johnson',
      age: 55,
      gender: 'male',
      program: 'hypertension'
    }
  ],
  doctors: [
    { id: 1, username: 'dr_smith', password: 'doctor123', name: 'Dr. Smith' },
    { id: 2, username: 'dr_jones', password: 'doctor456', name: 'Dr. Jones' }
  ]
};

const CareLink = ({ onSignIn, switchUserType }) => {
  // Main state
  const [currentStep, setCurrentStep] = useState('landing'); // 'landing', 'signin', 'signup', 'program-selection'
  const [userType, setUserType] = useState('patient');
  
  // Sign In State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Sign Up State
  const [signUpData, setSignUpData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: '',
    selectedProgram: ''
  });
  const [signUpError, setSignUpError] = useState('');
  const [isSignUpLoading, setIsSignUpLoading] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const users = userType === 'patient' ? mockUsers.patients : mockUsers.doctors;
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      if (userType === 'patient' && user.program !== 'acl-rehab') {
        setError('This account does not belong to this platform. Please log in to the corresponding program.');
        setIsLoading(false);
        return;
      }
      onSignIn(user);
    } else {
      setError('Invalid username or password');
    }
    
    setIsLoading(false);
  };

  const handleProgramSelection = (programId) => {
    setSignUpData(prev => ({
      ...prev,
      selectedProgram: programId
    }));
    setCurrentStep('signup');
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsSignUpLoading(true);
    setSignUpError('');

    // Validation
    if (signUpData.password !== signUpData.confirmPassword) {
      setSignUpError('Passwords do not match');
      setIsSignUpLoading(false);
      return;
    }

    // Check if username already exists
    const existingUser = mockUsers.patients.find(u => u.username === signUpData.username);
    if (existingUser) {
      setSignUpError('Username already exists');
      setIsSignUpLoading(false);
      return;
    }

    // Validate required fields - now only need basic info + program
    if (!signUpData.age || !signUpData.gender) {
      setSignUpError('Please fill in all required fields');
      setIsSignUpLoading(false);
      return;
    }

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create new user
    const newUser = {
      id: mockUsers.patients.length + 1,
      username: signUpData.username,
      password: signUpData.password,
      name: signUpData.username,
      age: parseInt(signUpData.age),
      gender: signUpData.gender,
      program: signUpData.selectedProgram
    };

    // Add to mock database
    mockUsers.patients.push(newUser);

    // Save to appropriate Firebase database based on program
    await saveUserInfo(signUpData.username, {
      name: signUpData.username,
      age: parseInt(signUpData.age),
      gender: signUpData.gender,
      program: signUpData.selectedProgram,
      createdAt: Date.now()
    }, signUpData.selectedProgram); // Pass program to route to correct Firebase

    // Auto sign in the new user
    onSignIn(newUser);
    
    setIsSignUpLoading(false);
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

  const handleSignUpDataChange = (field, value) => {
    setSignUpData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetState = () => {
    setUsername('');
    setPassword('');
    setError('');
    setSignUpData({
      username: '',
      password: '',
      confirmPassword: '',
      age: '',
      gender: '',
      selectedProgram: ''
    });
    setSignUpError('');
  };

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #E20074 0%, #B8005A 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    overflowY: 'auto'
  };

  // Landing Page
  if (currentStep === 'landing') {
    return (
      <div style={containerStyle}>
        <div style={{ 
          width: '100%', 
          maxWidth: '500px',
          position: 'relative',
          zIndex: 1001
        }}>
          {/* Logo/Header */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '40px',
            color: colors.white
          }}>
            <h1 style={{
              fontSize: '48px',
              fontWeight: '700',
              color: colors.white,
              margin: '0 0 8px 0',
              letterSpacing: '-1px',
              fontFamily: 'inherit'
            }}>
              T-Mobile CareLink
            </h1>
            <p style={{
              fontSize: '18px',
              color: '#FFFFFF90',
              margin: '0',
              fontWeight: '400',
              fontFamily: 'inherit'
            }}>
              Connected Healthcare Platform
            </p>
          </div>

          {/* Landing Card */}
          <div style={{
            backgroundColor: colors.white,
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            padding: '40px',
            backdropFilter: 'blur(20px)',
            position: 'relative',
            zIndex: 1002,
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: colors.magenta,
              margin: '0 0 32px 0',
              letterSpacing: '-0.5px',
              fontFamily: 'inherit'
            }}>
              Welcome to CareLink
            </h2>

            <div style={{ marginBottom: '32px' }}>
              <button
                onClick={() => {
                  resetState();
                  setCurrentStep('signin');
                }}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '700',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: colors.magenta,
                  color: colors.white,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 14px 0 rgba(226, 0, 116, 0.39)',
                  fontFamily: 'inherit',
                  marginBottom: '16px'
                }}
              >
                SIGN IN
              </button>

              <button
                onClick={() => {
                  resetState();
                  setCurrentStep('program-selection');
                }}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '700',
                  border: `2px solid ${colors.magenta}`,
                  cursor: 'pointer',
                  backgroundColor: colors.white,
                  color: colors.magenta,
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit'
                }}
              >
                SIGN UP FOR NEW PROGRAM
              </button>
            </div>

            <div style={{ 
              marginTop: '32px', 
              textAlign: 'center' 
            }}>
              <p style={{ 
                color: colors.darkGray, 
                margin: '0 0 12px 0',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}>
                Are you a healthcare provider?
              </p>
              <button
                type="button"
                onClick={() => {
                  setUserType('doctor');
                  setCurrentStep('signin');
                }}
                style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: colors.magenta,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit'
                }}
              >
                Doctor Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Program Selection Page
  if (currentStep === 'program-selection') {
    return (
      <div style={containerStyle}>
        <div style={{ 
          width: '100%', 
          maxWidth: '600px',
          position: 'relative',
          zIndex: 1001
        }}>
          <div style={{
            backgroundColor: colors.white,
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            padding: '40px',
            backdropFilter: 'blur(20px)',
            position: 'relative',
            zIndex: 1002
          }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: colors.magenta,
                margin: '0 0 16px 0',
                letterSpacing: '-0.5px',
                fontFamily: 'inherit'
              }}>
                Select Healthcare Program
              </h2>
              <p style={{
                fontSize: '16px',
                color: colors.darkGray,
                margin: '0',
                fontFamily: 'inherit'
              }}>
                Choose the program that best fits your healthcare needs
              </p>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
              {Object.entries(healthcarePrograms).map(([key, program]) => (
                <div
                  key={key}
                  onClick={() => handleProgramSelection(program.id)}
                  style={{
                    padding: '24px',
                    border: `2px solid ${colors.lightGray}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: colors.white,
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = colors.magenta;
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = colors.lightGray;
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '24px', marginRight: '12px' }}>{program.icon}</span>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: colors.black,
                      margin: '0',
                      fontFamily: 'inherit'
                    }}>
                      {program.name}
                    </h3>
                  </div>
                  
                  <p style={{
                    fontSize: '14px',
                    color: colors.darkGray,
                    margin: '0',
                    fontFamily: 'inherit'
                  }}>
                    {program.description}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <button
                onClick={() => setCurrentStep('landing')}
                style={{
                  fontSize: '14px',
                  color: colors.magenta,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  textDecoration: 'underline',
                  fontFamily: 'inherit'
                }}
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sign In Page
  if (currentStep === 'signin') {
    return (
      <div style={containerStyle}>
        <div style={{ 
          width: '100%', 
          maxWidth: '440px',
          position: 'relative',
          zIndex: 1001
        }}>
          <div style={{
            backgroundColor: colors.white,
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            padding: '40px',
            backdropFilter: 'blur(20px)',
            position: 'relative',
            zIndex: 1002
          }}>
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '32px' 
            }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: colors.magenta,
                margin: '0',
                letterSpacing: '-0.5px',
                fontFamily: 'inherit'
              }}>
                {userType === 'patient' ? 'PATIENT' : 'DOCTOR'} SIGN IN
              </h2>
            </div>

            <form onSubmit={handleSignIn} style={{ textAlign: 'left' }}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: colors.black,
                  marginBottom: '8px',
                  fontFamily: 'inherit'
                }}>
                  Username
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ 
                      width: '100%',
                      padding: '14px 16px',
                      paddingRight: '50px',
                      border: `2px solid ${colors.lightGray}`,
                      borderRadius: '12px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      fontWeight: '500',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit'
                    }}
                    placeholder="Enter your username"
                    onFocus={(e) => e.target.style.borderColor = colors.magenta}
                    onBlur={(e) => e.target.style.borderColor = colors.lightGray}
                  />
                  <User
                    size={20}
                    style={{
                      position: 'absolute',
                      right: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: colors.darkGray
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: colors.black,
                  marginBottom: '8px',
                  fontFamily: 'inherit'
                }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ 
                      width: '100%',
                      padding: '14px 16px',
                      paddingRight: '50px',
                      border: `2px solid ${colors.lightGray}`,
                      borderRadius: '12px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      fontWeight: '500',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit'
                    }}
                    placeholder="Enter your password"
                    onFocus={(e) => e.target.style.borderColor = colors.magenta}
                    onBlur={(e) => e.target.style.borderColor = colors.lightGray}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    {showPassword ? 
                      <EyeOff size={20} style={{ color: colors.darkGray }} /> : 
                      <Eye size={20} style={{ color: colors.darkGray }} />
                    }
                  </button>
                </div>
              </div>

              {error && (
                <div style={{
                  marginBottom: '24px',
                  padding: '16px',
                  borderRadius: '12px',
                  backgroundColor: '#FEF2F2',
                  color: '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '14px',
                  fontWeight: '500',
                  fontFamily: 'inherit'
                }}>
                  <AlertCircle size={20} style={{ marginRight: '12px', flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !username || !password}
                style={{ 
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '700',
                  border: 'none',
                  cursor: isLoading || !username || !password ? 'not-allowed' : 'pointer',
                  backgroundColor: isLoading || !username || !password ? colors.lightGray : colors.magenta,
                  color: colors.white,
                  transition: 'all 0.2s ease',
                  boxShadow: isLoading || !username || !password ? 'none' : '0 4px 14px 0 rgba(226, 0, 116, 0.39)',
                  transform: isLoading ? 'scale(0.98)' : 'scale(1)',
                  fontFamily: 'inherit'
                }}
              >
                {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
              </button>
            </form>

            <div style={{ 
              marginTop: '24px', 
              textAlign: 'center' 
            }}>
              <button
                type="button"
                onClick={fillDemoCredentials}
                style={{
                  fontSize: '14px',
                  color: colors.magenta,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  textDecoration: 'underline',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit'
                }}
              >
                Use Demo Credentials
              </button>
            </div>

            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <button
                onClick={() => setCurrentStep('landing')}
                style={{
                  fontSize: '14px',
                  color: colors.magenta,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  textDecoration: 'underline',
                  fontFamily: 'inherit'
                }}
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sign Up Page (after program selection)
  if (currentStep === 'signup') {
    const selectedProgram = healthcarePrograms[Object.keys(healthcarePrograms).find(key => 
      healthcarePrograms[key].id === signUpData.selectedProgram
    )];

    return (
      <div style={containerStyle}>
        <div style={{ 
          width: '100%', 
          maxWidth: '480px',
          position: 'relative',
          zIndex: 1001
        }}>
          <div style={{
            backgroundColor: colors.white,
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            padding: '40px',
            backdropFilter: 'blur(20px)',
            position: 'relative',
            zIndex: 1002
          }}>
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '32px' 
            }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: colors.magenta,
                margin: '0 0 16px 0',
                letterSpacing: '-0.5px',
                fontFamily: 'inherit'
              }}>
                PATIENT SIGN UP
              </h2>
              
              {selectedProgram && (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#F0F9FF',
                  borderRadius: '8px',
                  border: `1px solid ${selectedProgram.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ marginRight: '8px' }}>{selectedProgram.icon}</span>
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: colors.black,
                    fontFamily: 'inherit'
                  }}>
                    {selectedProgram.name}
                  </span>
                </div>
              )}
            </div>

            <form onSubmit={handleSignUp} style={{ textAlign: 'left' }}>
              {/* Username */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: colors.black,
                  marginBottom: '8px',
                  fontFamily: 'inherit'
                }}>
                  Username
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={signUpData.username}
                    onChange={(e) => handleSignUpDataChange('username', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      paddingRight: '50px',
                      border: `2px solid ${colors.lightGray}`,
                      borderRadius: '12px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      fontWeight: '500',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit'
                    }}
                    placeholder="Choose a username"
                    onFocus={(e) => e.target.style.borderColor = colors.magenta}
                    onBlur={(e) => e.target.style.borderColor = colors.lightGray}
                  />
                  <User
                    size={20}
                    style={{
                      position: 'absolute',
                      right: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: colors.darkGray
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: colors.black,
                  marginBottom: '8px',
                  fontFamily: 'inherit'
                }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={signUpData.password}
                    onChange={(e) => handleSignUpDataChange('password', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      paddingRight: '50px',
                      border: `2px solid ${colors.lightGray}`,
                      borderRadius: '12px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      fontWeight: '500',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit'
                    }}
                    placeholder="Create a password"
                    onFocus={(e) => e.target.style.borderColor = colors.magenta}
                    onBlur={(e) => e.target.style.borderColor = colors.lightGray}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    {showPassword ? 
                      <EyeOff size={20} style={{ color: colors.darkGray }} /> : 
                      <Eye size={20} style={{ color: colors.darkGray }} />
                    }
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: colors.black,
                  marginBottom: '8px',
                  fontFamily: 'inherit'
                }}>
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={signUpData.confirmPassword}
                    onChange={(e) => handleSignUpDataChange('confirmPassword', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: `2px solid ${colors.lightGray}`,
                      borderRadius: '12px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      fontWeight: '500',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit'
                    }}
                    placeholder="Confirm your password"
                    onFocus={(e) => e.target.style.borderColor = colors.magenta}
                    onBlur={(e) => e.target.style.borderColor = colors.lightGray}
                  />
                </div>
              </div>

              {/* Age */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: colors.black,
                  marginBottom: '8px',
                  fontFamily: 'inherit'
                }}>
                  Age
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    value={signUpData.age}
                    onChange={(e) => handleSignUpDataChange('age', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      paddingRight: '50px',
                      border: `2px solid ${colors.lightGray}`,
                      borderRadius: '12px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      fontWeight: '500',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit'
                    }}
                    placeholder="Enter your age"
                    min="1"
                    max="120"
                    onFocus={(e) => e.target.style.borderColor = colors.magenta}
                    onBlur={(e) => e.target.style.borderColor = colors.lightGray}
                  />
                  <Calendar
                    size={20}
                    style={{
                      position: 'absolute',
                      right: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: colors.darkGray
                    }}
                  />
                </div>
              </div>

              {/* Gender */}
              <div style={{ marginBottom: '32px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: colors.black,
                  marginBottom: '8px',
                  fontFamily: 'inherit'
                }}>
                  Gender
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={signUpData.gender}
                    onChange={(e) => handleSignUpDataChange('gender', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      paddingRight: '50px',
                      border: `2px solid ${colors.lightGray}`,
                      borderRadius: '12px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      fontWeight: '500',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                      backgroundColor: colors.white,
                      appearance: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = colors.magenta}
                    onBlur={(e) => e.target.style.borderColor = colors.lightGray}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                  <Users
                    size={20}
                    style={{
                      position: 'absolute',
                      right: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: colors.darkGray,
                      pointerEvents: 'none'
                    }}
                  />
                </div>
              </div>

              {signUpError && (
                <div style={{
                  marginBottom: '24px',
                  padding: '16px',
                  borderRadius: '12px',
                  backgroundColor: '#FEF2F2',
                  color: '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '14px',
                  fontWeight: '500',
                  fontFamily: 'inherit'
                }}>
                  <AlertCircle size={20} style={{ marginRight: '12px', flexShrink: 0 }} />
                  <span>{signUpError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSignUpLoading || !signUpData.username || !signUpData.password || !signUpData.confirmPassword || !signUpData.age || !signUpData.gender}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '700',
                  border: 'none',
                  cursor: isSignUpLoading || !signUpData.username || !signUpData.password || !signUpData.confirmPassword || !signUpData.age || !signUpData.gender ? 'not-allowed' : 'pointer',
                  backgroundColor: isSignUpLoading || !signUpData.username || !signUpData.password || !signUpData.confirmPassword || !signUpData.age || !signUpData.gender ? colors.lightGray : colors.magenta,
                  color: colors.white,
                  transition: 'all 0.2s ease',
                  boxShadow: isSignUpLoading || !signUpData.username || !signUpData.password || !signUpData.confirmPassword || !signUpData.age || !signUpData.gender ? 'none' : '0 4px 14px 0 rgba(226, 0, 116, 0.39)',
                  transform: isSignUpLoading ? 'scale(0.98)' : 'scale(1)',
                  fontFamily: 'inherit'
                }}
              >
                {isSignUpLoading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <button
                onClick={() => setCurrentStep('program-selection')}
                style={{
                  fontSize: '14px',
                  color: colors.magenta,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  textDecoration: 'underline',
                  fontFamily: 'inherit'
                }}
              >
                ← Change Program
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2>Healthcare Programs</h2>
      <ul>
        {Object.values(healthcarePrograms).map(program => (
          <li key={program.id} style={{ color: program.color, marginBottom: 12 }}>
            <span style={{ fontSize: 24 }}>{program.icon}</span>
            <strong style={{ marginLeft: 8 }}>{program.name}</strong>
            <div style={{ fontSize: 14 }}>{program.description}</div>
            {program.isOurProduct && <span style={{ color: '#E20074', marginLeft: 8 }}>(Our Product)</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CareLink;
