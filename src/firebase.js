import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBGKFS6W04apJF_TChrOJpcswZTReHsbV8",
  authDomain: "kneeheal-320a8.firebaseapp.com",
  databaseURL: "https://kneeheal-320a8-default-rtdb.firebaseio.com",
  projectId: "kneeheal-320a8",
  storageBucket: "kneeheal-320a8.firebasestorage.app",
  messagingSenderId: "507872774645",
  appId: "1:507872774645:web:9c8764037a2a21c5bdb8bc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 储存用户信息
function saveUserInfo(userId, userData, program) {
  if (program !== 'acl-rehab') {
    // 不存入你们的数据库
    return Promise.resolve();
  }
  return set(ref(db, `users/${userId}/info`), userData);
}

// 新增：保存 predicted_angle
function savePredictedAngle(userId, readingId, angle) {
  return set(ref(db, `${userId}/data/${readingId}/predicted_angle`), angle);
}

// 只在这里统一导出一次
export { db, ref, onValue, set, saveUserInfo, savePredictedAngle };