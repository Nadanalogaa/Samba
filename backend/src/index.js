const app = require('./app');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Cash Bill API running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/cash/health`);
});
