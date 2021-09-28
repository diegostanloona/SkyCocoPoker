// const user = {
//   name: "",
//   email: "",
//   password: "",
//   signupdate: ""
// }
//
// const player = {
//   user: "",
//   game: "",
//   turn: "",
//   status: "waiting, ready, fold, loser, winner",
//   bet: 0,
//   givenCards: [],
//   finalCards: []
// }
//
// const game = {
//   players: [],
//   round1: [],
//   round2: "",
//   round3: "",
//   date: "",
//   code: "",
//   status: ""
// }

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const gamesRoutes = require('./routes/games-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PATCH, DELETE');
    next();
});

app.get('/', (req, res, next) => {
    res.json({message: "Test message"});
});

app.use('/api/games', gamesRoutes);

app.use('/api/users', usersRoutes);

app.use((req, res, next) => {
    return next(new HttpError('No se ha encontrado esta dirección.', 404));
});

app.use((err, req, res, next) => {
    res.status(err.code || 500).json({ message: err.message || "Error." });
});

mongoose
    .connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}/${process.env.DB_NAME}?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        const server = app.listen(process.env.PORT || 5000);
        console.log("Listening on port " + (process.env.PORT || 5000));
        const io = require('./util/socket').init(server);
        io.on('connection', socket => {
        });
    })
    .catch(err => {
        console.log("ERROR!!!");
        console.log(err.message);
        console.log(err);
        console.log(process.env);
    });
