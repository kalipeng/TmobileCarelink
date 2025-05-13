# ACL Rehabilitation App

A React-based application for ACL rehabilitation with separate interfaces for patients and doctors.

## Features

- **Patient Dashboard**: Track exercise progress, receive AI-powered feedback, and view doctor's notes
- **Doctor Dashboard**: Manage multiple patients, add medical notes, and monitor rehabilitation progress
- **Real-time Data Visualization**: Charts showing knee motion data (flexion angle, rotation, acceleration)
- **Pain Level Integration**: AI adjusts exercise recommendations based on reported pain levels
- **Multi-stage Rehabilitation**: Support for early, intermediate, and advanced recovery stages

## Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (version 14.0 or higher)
- **npm** (comes with Node.js)

### Installation

1. **Clone or download the project**
   ```bash
   git clone <your-repository-url>
   cd acl-rehabilitation-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install additional required packages**
   ```bash
   npm install recharts lucide-react
   ```

### Running the Application

1. **Start the development server**
   ```bash
   npm start
   ```

2. **Open your browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - The app will automatically reload when you make changes

## 📋 Demo Credentials

### Patient Login
- **Username**: `john_doe`
- **Password**: `patient123`

Alternative patients:
- `jane_smith` / `patient456`
- `bob_johnson` / `patient789`

### Doctor Login
- **Username**: `dr_smith`
- **Password**: `doctor123`

Alternative doctor:
- `dr_jones` / `doctor456`

## 📁 Project Structure

```
src/
├── App.js                    # Main application component
├── ACLRehabilitationApp.js   # Patient dashboard
├── DoctorPage.jsx           # Doctor dashboard
├── SignInPage.jsx           # Login interface
└── index.js                 # Application entry point
```

## 🔧 Configuration

### Environment Setup

Create a `.env` file in the root directory (optional for future use):
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000
```

### Tailwind CSS (Optional)

If you want to use Tailwind CSS for styling:

1. Install Tailwind CSS:
   ```bash
   npm install -D tailwindcss
   npx tailwindcss init
   ```

2. Update `tailwind.config.js`:
   ```javascript
   module.exports = {
     content: [
       "./src/**/*.{js,jsx,ts,tsx}",
     ],
     theme: {
       extend: {},
     },
     plugins: [],
   }
   ```

3. Add to your CSS file:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

## 🛠️ Development

### Available Scripts

- `npm start`: Run the app in development mode
- `npm test`: Launch the test runner
- `npm run build`: Build the app for production
- `npm run eject`: Eject from Create React App (⚠️ irreversible)

### Adding New Features

1. **Adding New Patient Data**:
   - Update the mock data in `ACLRehabilitationApp.js`
   - Modify the sensor data simulation in the `useEffect` hook

2. **Adding New Doctor Functionality**:
   - Extend the `DoctorPage.jsx` component
   - Add new state management for additional features

## Troubleshooting

### Common Issues

1. **"Module not found" errors**:
   - Run `npm install` to ensure all dependencies are installed
   - Check if all import paths are correct

2. **Styles not loading**:
   - Make sure Tailwind CSS is properly configured
   - Verify that CSS files are imported correctly

3. **Charts not rendering**:
   - Ensure `recharts` is installed: `npm install recharts`
   - Check browser console for any JavaScript errors

4. **Icons not displaying**:
   - Verify `lucide-react` is installed: `npm install lucide-react`

### Debugging Steps

1. **Check the browser console** (F12) for error messages
2. **Verify all files are in the correct locations**
3. **Ensure all dependencies are installed**
4. **Try restarting the development server**

## Future Enhancements

- [ ] Backend API integration
- [ ] Real WebSocket connections
- [ ] User authentication with JWT
- [ ] Data persistence with database
- [ ] Real sensor data integration
- [ ] Video exercise demonstrations
- [ ] Progress reports and analytics

## 📞 Support

If you encounter any issues or have questions:
1. Check the browser console for error messages
2. Verify all steps in this README are followed
3. Ensure all dependencies are properly installed

## 📄 License

This project is for demonstration purposes. Please ensure you have appropriate permissions for any medical applications.
