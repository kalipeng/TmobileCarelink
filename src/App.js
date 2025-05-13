import React, { useState } from 'react';
import SignInPage from './SignInPage';
import ACLRehabilitationApp from './ACLRehabilitationApp';
import DoctorPage from './DoctorPage';

function App() {
  const [userType, setUserType] = useState('patient');
  const [currentUser, setCurrentUser] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const handleSignIn = (user) => {
    console.log('Signing in user:', user);
    setCurrentUser(user);
    setIsSignedIn(true);
    if (user.username && user.username.startsWith('dr_')) {
      setUserType('doctor');
    } else {
      setUserType('patient');
    }
  };

  const handleSignOut = () => {
    console.log('Signing out user');
    setCurrentUser(null);
    setIsSignedIn(false);
  };

  const switchUserType = () => {
    console.log('Switching from', userType, 'to', userType === 'patient' ? 'doctor' : 'patient');
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

  if (userType === 'doctor') {
    return (
      <DoctorPage
        user={currentUser}
        onSignOut={handleSignOut}
        switchUserType={switchUserType}
      />
    );
  } else {
    return (
      <ACLRehabilitationApp 
        userType={userType}
        currentUser={currentUser}
        onSignOut={handleSignOut}
        switchUserType={switchUserType}
      />
    );
  }
}

export default App;