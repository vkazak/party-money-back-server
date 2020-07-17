const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const dbUri = process.env.MONGO_URI;
mongoose.connect(dbUri, { 
    useNewUrlParser: true, 
    useCreateIndex: true, 
    useUnifiedTopology: true 
});
const connection = mongoose.connection;
connection.once('open', () => { console.log('DB has successfully connected') });

const usersRouter = require('./routes/users');
const partiesRouter = require('./routes/parties');
const paymentsRouter = require('./routes/payments');
const calculatorRouter = require('./routes/calculator');

app.use('/users', usersRouter);
app.use('/parties', partiesRouter);
app.use('/payments', paymentsRouter);
app.use('/calculate', calculatorRouter);

app.listen(port, () => {
    console.log(`Server is litening on ${port} port.`)
})