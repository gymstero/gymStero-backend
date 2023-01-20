const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use('/', require('./routes'));

app.use((req, res) => {
  res.status(404).json({ message: 'Not Found', code: 404 });
});

const port = parseInt(process.env.PORT || 8080, 10);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
