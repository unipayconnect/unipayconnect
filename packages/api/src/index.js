require("module-alias/register");
require('dotenv').config({ path: '../../.env' });
const express = require('express');
const paymentRoutes = require('./routes/payment-route');
const { info } = require('@core/common/logger');
const { port } = require("./config");
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/v1/payments', paymentRoutes);

app.listen(port, () => {
    info(`Server is running on port ${port}`);
});

module.exports = app;
