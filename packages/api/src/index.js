require('dotenv').config({ path: '../../.env' });
const express = require('express');
const paymentRoutes = require('./routes/payment-route');
const { info, error } = require('../../core/src/common/logger');
const { port } = require("./config");

const app = express();
app.use(express.json());

app.use('/api/v1/payments', paymentRoutes);

app.listen(port, () => {
    info(`Server is running on port ${port}`);
});

module.exports = app;
