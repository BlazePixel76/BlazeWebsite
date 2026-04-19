// config.example.js - Firebase configuration template
// INSTRUCTIONS:
// 1. Copy this file and rename it to "config.js"
// 2. Replace the placeholder values with your actual Firebase credentials
// 3. Never commit config.js to GitHub - it contains sensitive keys
// 4. Keep config.js in your .gitignore

const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "your-auth-domain-here.firebaseapp.com",
    databaseURL: "https://your-database-url-here.firebaseio.com",
    projectId: "your-project-id-here",
    storageBucket: "your-storage-bucket-here.firebasestorage.app",
    messagingSenderId: "your-messaging-sender-id-here",
    appId: "your-app-id-here"
};

export { firebaseConfig };
