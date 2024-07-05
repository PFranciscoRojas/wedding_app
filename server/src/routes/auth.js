const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
  const { name } = req.body;
  if (name) {
    res.json({ success: true, name });
  } else {
    res.status(400).json({ success: false, message: 'Name is required' });
  }
});

module.exports = router;