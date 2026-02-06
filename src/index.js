const express = require('express');
const cors = require('cors');
const kmpRoutes = require('./routes/kmp');
const rabinKarpRoutes = require('./routes/rabin-karp');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/kmp', kmpRoutes);
app.use('/api/rabin-karp', rabinKarpRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'String Matching Algorithm API' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
