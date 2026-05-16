const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  
  if (!uri || uri.includes('YOUR_') || uri.includes('placeholder')) {
    console.log('⚠️  No valid MONGO_URI found. Starting with local MongoDB...');
    try {
      await mongoose.connect('mongodb://127.0.0.1:27017/teamflow');
      console.log('✅ Connected to Local MongoDB on port 27017');
    } catch (localErr) {
      console.error('❌ Local MongoDB also failed:', localErr.message);
      console.log('📌 Please set a valid MONGO_URI in backend/.env');
      console.log('📌 Get free URI from: https://cloud.mongodb.com');
      process.exit(1);
    }
  } else {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log('✅ MongoDB Atlas Connected');
    } catch (err) {
      console.error('❌ Atlas connection failed:', err.message);
      console.log('🔄 Trying local MongoDB...');
      try {
        await mongoose.connect('mongodb://127.0.0.1:27017/teamflow');
        console.log('✅ Fallback: Local MongoDB Connected');
      } catch (localErr) {
        console.error('❌ All MongoDB connections failed');
        process.exit(1);
      }
    }
  }
};

module.exports = connectDB;

