const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const redis = require('redis');
const keys = require('./keys');
const pg = require('pg');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// postgres
const { Pool } = pg;
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});

pgClient.on('error', () => console.log('Lost pg connection.'));

pgClient
    .query('CREATE TABLE IF NOT EXISTS values (number INT)')
    .catch(err => console.log(err));

// redis
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});

const redisPublisher = redisClient.duplicate();

// routes
app.get('/', (req, res) => {
    res.send('Index route');
});

app.get('/values/all', async (req, res) => {
    const queryText = `SELECT * from values`;
    const values = await pgClient.query(queryText);
    res.send(values.rows);
});

app.get('/values/current', async (req, res) => {
    redisClient.hgetall('values', (err, values) => {
        res.send(values);
    });
});

app.post('/values', async (req, res) => {
    const index = req.body.index;

    if(parseInt(index) > 40) {
        return res.status(422).send('Index too high!!!');
    }

    redisClient.hset('values', index, 'Nothing yet!');
    redisPublisher.publish('insert', index);

    const queryText = `INSERT INTO values(number) VALUES($1)`;
    await pgClient.query(queryText, [index]);

    res.send({ working: true });
});

app.listen(5000, () => {
    console.log('express running on port 5000');
});

