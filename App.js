import React, { useState } from 'react';
import SignInPage from './SignInPage';
import ACLRehabilitationApp from './ACLRehabilitationApp';

function App() {
  const [userType, setUserType] = useState('patient');
  const [currentUser, setCurrentUser] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const handleSignIn = (user) => {
    console.log('Signing in user:', user);
    setCurrentUser(user);
    setIsSignedIn(true);
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

  // 如果没有登录，显示登录页面
  if (!isSignedIn) {
    return (
      <SignInPage 
        userType={userType} 
        onSignIn={handleSignIn}
        switchUserType={switchUserType}
      />
    );
  }

  // 登录后根据用户类型显示相应页面
  return (
    <ACLRehabilitationApp 
      userType={userType}
      currentUser={currentUser}
      onSignOut={handleSignOut}
      switchUserType={switchUserType}
    />
  );
}

export default App;