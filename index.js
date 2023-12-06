import express from 'express';
import axios from 'axios';
import { config as dotenvConfig } from 'dotenv';
import session from 'express-session';


const app = express();
dotenvConfig();

app.use(session({
	secret: 'secret',
	resave: false,
	saveUninitialized: true
}))

app.get('/', (req, res) => {
	res.send('Hello World!');
})

app.get('/mekari-auth', async (req, res) => {
	let config = {
		method: 'get',
		maxBodyLength: Infinity,
		url: 'https://sandbox-account.mekari.com/auth?client_id=Vn3JVrDU7j2EMUqQ&response_type=code&scope=esign&lang=id',
		headers: {}
	};

	try {
		const response = await axios.request(config);
		res.send(JSON.stringify(response.data));
	} catch (error) {
		console.error(error);
		res.status(500).send('Request failed');
	}
});

app.get('/mekari-token', async (req, res) => {
	let data = JSON.stringify({
		"client_id": process.env.CLIENT_ID,
		"client_secret": process.env.CLIENT_SECRET,
		"grant_type": "authorization_code",
		"code": process.env.CODE
	});

	let config = {
		method: 'post',
		maxBodyLength: Infinity,
		url: 'https://sandbox-account.mekari.com/auth/oauth2/token',
		headers: {
			'Content-Type': 'application/json'
		},
		data: data
	};

	try {
		const response = await axios.request(config);
		req.session.refresh_token = response.data.refresh_token;
		res.send(JSON.stringify(response.data));
		console.log(req.session.refresh_token);

	} catch (error) {
		console.error(error);
		res.status(500).send('Request failed');
	}
});

app.get('/mekari-refresh', async (req, res) => {
	let data = JSON.stringify({
		"client_id": process.env.CLIENT_ID,
		"client_secret": process.env.CLIENT_SECRET,
		"grant_type": "refresh_token",
		"refresh_token": req.session.refresh_token
	});

	let config = {
		method: 'post',
		maxBodyLength: Infinity,
		url: 'https://sandbox-account.mekari.com/auth/oauth2/token',
		headers: {
			'Content-Type': 'application/json'
		},
		data: data
	};

	try {
		const response = await axios.request(config);
		req.session.refresh_token = response.data.refresh_token;
		res.send(JSON.stringify(response.data));
		console.log(req.session.refresh_token);
	} catch (error) {
		console.error(error);
		res.status(500).send('Request failed');
	}
});

app.listen(3000, () => console.log('App listening on port 3000!'));
