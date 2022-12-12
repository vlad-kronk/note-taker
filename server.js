const express = require('express');
const path = require('path');
const {v4 : uuidv4} = require('uuid')
const fs = require('fs');

const app = express();
const PORT = 3001;

app.use(express.static('public'));

// for GET '*' serve the homepage
app.get('/*', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));

// for GET 'notes' serve the notes page
app.get('/*', (req, res) => res.sendFile(path.join(__dirname, 'public/notes.html')));

