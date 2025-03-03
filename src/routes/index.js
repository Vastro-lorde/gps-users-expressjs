const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes');
const { ElasticLogger } = require('../utils/elastic-search-logger');

router.use('/users', userRoutes);
router.get('/', (req, res) => {
    ElasticLogger.info("Homepage accessed", { user: "guest" });
  res.json({
    message: 'Welcome to the API',
  });
});

module.exports = router;