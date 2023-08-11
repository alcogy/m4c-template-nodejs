import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import bodyParser from 'body-parser'
import { Pool } from 'pg';
import { Account, Signup, Signin } from './models';
import { sign, verify } from 'jsonwebtoken';

dotenv.config();

const app: Express = express();
const port = "8080";

const jwt_secret_key = 'as2d67bw3er';

const connectionInfo = {
  host: 'm3se-database',
  database: 'm3se-db',
  user: 'user',
  password: 'pass',
  port: 5432,
}

const verification = (req: Request, res: Response, next: Function) => {
  
  if (req.headers.authorization === undefined ||
      req.headers.authorization.indexOf('Bearer ') === -1) {
    return res.status(500).send('none auth token');
  }
  
  const token = req.headers.authorization.split(' ')[1];
  verify(token, jwt_secret_key, (err, decoded) => {
    if (err) return res.status(500).send(err.message);
        
    next();
  })   
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', async (req: Request, res: Response) => {
  res.send('hello auth service');
});

app.post('/signin', async (req: Request, res: Response) => {
  try {
    const body = req.body as Signin;

    const pool = new Pool(connectionInfo);
    await pool.connect();

    const query = {
      text: `SELECT * FROM account WHERE email = $1`,
      values: [body.email],
    };

    const records = await pool.query(query);
    const account = records.rows[0] as Account;
    const result = await bcrypt.compare(body.password, account.password);
    const token = sign({user: account}, jwt_secret_key, { expiresIn: '1w' });
    
    res.cookie('m3s', { token: token });
    res.status(200).send({ result: result, token: token });
  } catch (error) {
    console.error(error);
    res.status(500).send({ result: false, message: error });
  }
});

app.post('/signup', async (req: Request, res: Response) => {
  try {
    const body = req.body as Signup;
   
    const salt = await bcrypt.genSalt(10);
    const pass = await bcrypt.hash(body.password, salt);
    
    const pool = new Pool(connectionInfo);
    await pool.connect();
  
    const query = {
      text: 'INSERT INTO account(id, name, email, password, salt) VALUES(DEFAULT, $1, $2, $3, $4)',
      values: [body.name, body.email, pass, salt],
    };
  
    await pool.query(query);
  
    res.status(200).send({ result: true });

  } catch (error) {
    console.error(error);
    res.status(500).send({ result: false, message: error });
  }
});

app.post('/forget-password', (req: Request, res: Response) => {
  res.send('forget-password');
});

app.post('/delete', (req: Request, res: Response) => {
  res.send('delete');
});

// Dummy API for confirm verification
app.get('/dummy', verification, (req: Request, res: Response) => {
  console.log("hellouser");
  res.status(200).send(`verified!`);
});

// Entry point.
app.listen(port, () => console.log(`[server]:${port}`));