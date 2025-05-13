import React, { useState } from 'react';
import { User, Eye, EyeOff, AlertCircle, Calendar, Users, Activity } from 'lucide-react';

// T-Mobile Brand Colors
const colors = {
  magenta: '#E20074',
  white: '#FFFFFF',
  black: '#000000',
  lightGray: '#E8E8E8',
  darkGray: '#6A6A6A',
  berry: '#861B54'
};

// Mock users database - Now including age, gender, and recovery stage
const mockUsers = {
  patients: [
    { 
      id: 1, 
      username: 'john_doe', 
      password: 'patient123', 
      name: 'John Doe',
      age: 35,
      gender: 'male',
      recoveryStage: 'early'
    },
    { 
      id: 2, 
      username: 'jane_smith', 
      password: 'patient456', 
      name: 'Jane Smith',
      age: 42,
      gender: 'female',
      recoveryStage: 'mid'
    },
    { 
      id: 3, 
      username: 'bob_johnson', 
      password: 'patient789', 
      name: 'Bob Johnson',
      age: 28,
      gender: 'male',
      recoveryStage: 'late'
    }
  ],
  doctors: [
    { id: 1, username: 'dr_smith', password: 'doctor123', name: 'Dr. Smith' },
    { id: 2, username: 'dr_jones', password: 'doctor456', name: 'Dr. Jones' }
  ]
};

const SignInPage = ({ userType, onSignIn, switchUserType }) => {
  // Sign In State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Form toggle state
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  
  // Sign Up State
  const [signUpData, setSignUpData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: '',
    recoveryStage: ''
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
      onSignIn(user);
    } else {
      setError('Invalid username or password');
    }
    
    setIsLoading(false);
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

    if (!signUpData.age || !signUpData.gender || !signUpData.recoveryStage) {
      setSignUpError('Please fill in all required fields');
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

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create new user
    const newUser = {
      id: mockUsers.patients.length + 1,
      username: signUpData.username,
      password: signUpData.password,
      name: signUpData.username, // You might want to add a name field
      age: parseInt(signUpData.age),
      gender: signUpData.gender,
      recoveryStage: signUpData.recoveryStage
    };

    // Add to mock database (in real app, this would be an API call)
    mockUsers.patients.push(newUser);

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

  const switchMode = () => {
    setIsSignUpMode(!isSignUpMode);
    setError('');
    setSignUpError('');
    // Reset forms
    setUsername('');
    setPassword('');
    setSignUpData({
      username: '',
      password: '',
      confirmPassword: '',
      age: '',
      gender: '',
      recoveryStage: ''
    });
  };

  // 使用重要性更高的样式来覆盖App.css
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

  return (
    <div style={containerStyle}>
      <div style={{ 
        width: '100%', 
        maxWidth: isSignUpMode ? '480px' : '440px',
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
            ACL REHAB
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#FFFFFF90',
            margin: '0',
            fontWeight: '400',
            fontFamily: 'inherit'
          }}>
            Physical Therapy Platform
          </p>
        </div>

        {/* Sign In/Up Card */}
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
              {isSignUpMode ? 
                'PATIENT SIGN UP' : 
                `${userType === 'patient' ? 'PATIENT' : 'DOCTOR'} SIGN IN`
              }
            </h2>
          </div>

          {!isSignUpMode ? (
            // Sign In Form
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
          ) : (
            // Sign Up Form
            <form onSubmit={handleSignUp} style={{ textAlign: 'left' }}>
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

              <div style={{ marginBottom: '24px' }}>
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

              <div style={{ marginBottom: '32px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: colors.black,
                  marginBottom: '8px',
                  fontFamily: 'inherit'
                }}>
                  Surgery Recovery Stage
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={signUpData.recoveryStage}
                    onChange={(e) => handleSignUpDataChange('recoveryStage', e.target.value)}
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
                    <option value="">Select recovery stage</option>
                    <option value="pre-surgery">Pre-Surgery</option>
                    <option value="early">Early Recovery (0-2 weeks)</option>
                    <option value="mid">Mid Recovery (2-6 weeks)</option>
                    <option value="late">Late Recovery (6-12 weeks)</option>
                    <option value="full">Full Recovery (12+ weeks)</option>
                  </select>
                  <Activity
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
                disabled={isSignUpLoading || !signUpData.username || !signUpData.password || !signUpData.confirmPassword || !signUpData.age || !signUpData.gender || !signUpData.recoveryStage}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '700',
                  border: 'none',
                  cursor: isSignUpLoading || !signUpData.username || !signUpData.password || !signUpData.confirmPassword || !signUpData.age || !signUpData.gender || !signUpData.recoveryStage ? 'not-allowed' : 'pointer',
                  backgroundColor: isSignUpLoading || !signUpData.username || !signUpData.password || !signUpData.confirmPassword || !signUpData.age || !signUpData.gender || !signUpData.recoveryStage ? colors.lightGray : colors.magenta,
                  color: colors.white,
                  transition: 'all 0.2s ease',
                  boxShadow: isSignUpLoading || !signUpData.username || !signUpData.password || !signUpData.confirmPassword || !signUpData.age || !signUpData.gender || !signUpData.recoveryStage ? 'none' : '0 4px 14px 0 rgba(226, 0, 116, 0.39)',
                  transform: isSignUpLoading ? 'scale(0.98)' : 'scale(1)',
                  fontFamily: 'inherit'
                }}
              >
                {isSignUpLoading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
              </button>
            </form>
          )}

          {/* Demo credentials button - only show in sign in mode */}
          {!isSignUpMode && (
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
                onMouseEnter={(e) => e.target.style.color = colors.berry}
                onMouseLeave={(e) => e.target.style.color = colors.magenta}
              >
                Use Demo Credentials
              </button>
            </div>
          )}

          {/* Switch user type - only show in sign in mode for doctor option */}
          {!isSignUpMode && (
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
                {userType === 'patient' ? 'Are you a doctor?' : 'Are you a patient?'}
              </p>
              <button
                type="button"
                onClick={switchUserType}
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
                onMouseEnter={(e) => e.target.style.color = colors.berry}
                onMouseLeave={(e) => e.target.style.color = colors.magenta}
              >
                Sign in as {userType === 'patient' ? 'Doctor' : 'Patient'}
              </button>
            </div>
          )}

          {/* Toggle between Sign In and Sign Up */}
          <div style={{ 
            marginTop: '32px', 
            textAlign: 'center',
            paddingTop: '20px',
            borderTop: `1px solid ${colors.lightGray}`
          }}>
            <p style={{ 
              color: colors.darkGray, 
              margin: '0 0 12px 0',
              fontSize: '14px',
              fontFamily: 'inherit'
            }}>
              {isSignUpMode ? 'Already have an account?' : 'Don\'t have an account?'}
            </p>
            <button
              type="button"
              onClick={switchMode}
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
              onMouseEnter={(e) => e.target.style.color = colors.berry}
              onMouseLeave={(e) => e.target.style.color = colors.magenta}
            >
              {isSignUpMode ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;