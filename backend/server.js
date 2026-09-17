require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/db/db');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`server is running on port ${PORT}....`);
    });
  } catch (error) {
    console.error('Server start failed:', error.message);
    process.exit(1);
  }
}

start();
