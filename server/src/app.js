const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const photosRoutes = require('./routes/photos');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/photos', photosRoutes);

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
