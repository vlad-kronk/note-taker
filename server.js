const express = require('express');
const path = require('path');
const {v4 : uuidv4} = require('uuid')
const fs = require('fs');

const app = express();
const PORT = 3001;

// set up the express to parse data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// serve static files

app.use(express.static('public'));

// for GET 'notes' serve the notes page
app.get('/notes', (req, res) => res.sendFile(path.join(__dirname, 'public/notes.html')));

// for GET '' serve the homepage
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));


// handle API requests

app.get('/api/notes', (req, res) => {
  fs.readFile(path.join(__dirname, 'db/db.json'), (err, data) => {
    if (err) {
      console.error(err);
    } else {
      res.status(201).json(JSON.parse(data))
    }
  })
});

app.post('/api/notes', (req, res) => {
  // log that request has been recieved
  console.info(`${req.method} request recieved on port ${PORT}`);

  // send response back to client
  // res.status(201).send("Request recieved");

  // initialize response var to send back to client
  let response;

  // did the user submit anything in the body of the req
  if (req.body && req.body.title) {
    response = {
      status: 'success',
      // set up a response data object with a unique ID along with the post request body content
      data: {
        "title": req.body.title,
        "text": req.body.text,
        "id": uuidv4()
      }
    };

    // read from the database to set up an array with the current set of notes
    fs.readFile(path.join(__dirname, 'db/db.json'), (err, data) => {
      if (err) {
        console.error(err);
      } else {
        // initialize array with current notes
        let notesArray = JSON.parse(data);

        // push the response object with the note and id onto the end of the array
        notesArray.push(response.data);

        // write the updated array to the database
        fs.writeFile(path.join(__dirname, 'db/db.json'), JSON.stringify(notesArray, null, 4), (err) => {
          err ? console.log(`Note "${response.title}" has been written to file`) : console.error(err);
        });
      }
    })

    res.status(201).json(response);
  } else {
    res.status(400).json('Request body must contain at least a title');
  }

  console.log(`${response.data.title}\n${response.data.text}`);
});

app.delete('/api/notes/:id', (req, res) => {
  const id = req.params.id;
  
  // read from the database
  fs.readFile(path.join(__dirname, 'db/db.json'), (err, data) => {
    if (err) {
      console.error(err);
    } else {
      // initialize array with current notes
      let notesArray = JSON.parse(data);

      // search for and remove the requested note
      const deletedNote = notesArray.splice(notesArray.findIndex((note) => note.id === id), 1);

      // did the array contain the requested note?
      if (deletedNote !== -1) {
        // write updated array to database
        fs.writeFile(path.join(__dirname, 'db/db.json'), JSON.stringify(notesArray, null, 4), (err) => {
          err ? console.log(`Note "${deletedNote.title}" has been deleted`) : console.error(err);
        });
        res.status(201).json(deletedNote);
      } else {
        res.status(404).json('Not found')
      }
      
    }
  })
})







app.listen(PORT, () =>
  console.log(`serving on port ${PORT}`)
);