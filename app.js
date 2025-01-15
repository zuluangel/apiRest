const express = require('express');
//Built-in module for generating random ids
const crypto = require('node:crypto'); 
const movies = require('./movies.json');
const { validateMovie, validatePartialMovie } = require('./Schemas/movies');
const cors = require('cors');


const app = express();
app.disable('x-powered-by');
app.use(express.json());
//cors use the origin * by default, so it receives every origin 
//On this case we will adapt the middleware in order to constraint the origin
app.use(cors({
  origin: (origin, cb) => {
    const ACCEPTED_ORIGINS = ['http://localhost:8080', 'http://localhost:3000', 'https://movies.com' /*All the origins that we want to accept*/]

    if(ACCEPTED_ORIGINS.includes(origin) || !origin){
      return cb(null, true);
    }

    return cb(new Error('Not allowed by CORS'))
  }
}));

const PORT = process.env.PORT ?? 3000;

const ACCEPTED_ORIGINS = ['http://localhost:8080', 'http://localhost:3000', 'https://movies.com' /*All the origins that we want to accept*/];

app.get('/', (req, res) => {
  res.send(`<h1>This is the movies' official page!</h1>`);
});

app.get('/movies', (req, res) => {
  //CORS configuration without the cors package
  // res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
  // const origin = req.get('origin');
  // if (ACCEPTED_ORIGINS.includes(origin) || !origin ) {
  //   res.header('Access-Control-Allow-Origin', origin);
  // }

  const { genre } = req.query;
  if (genre) {
    const filtrdMovies = movies.filter(
      movie => movie.genre.some(g => g.toLowerCase() === genre.toLocaleLowerCase())
    )
    return res.json(filtrdMovies);
  }
  res.json(movies);
})

app.get('/movies/:id', (req, res) => {
  const { id } = req.params;
  const movie = movies.find(movie => movie.id === id);
  if (movie) return res.json(movie);
  res.status(404).send(`<h1>Movie with id ${id} does not exist!</h1>`);  
})

app.post('/movies', (req, res) => {
  const result = validateMovie(req.body);

  if(result.error) {
    //This status could be 422 (Unprocessable Entity)
    return res.status(400).json({ error: JSON.parse(result.error.message) });
  }

  //In order to validate the entered data we will use Zod
  //And we will create a schema Directory
  const newMovie = {
    id: crypto.randomUUID(), // uuid v4
    ...result.data
  }

  // The next line change the REST architecture
  movies.push(newMovie);
  res.status(201).json(newMovie); //This could update the client's cache
})

app.patch('/movies/:id', (req, res) => {
  const { id } = req.params;
  const result = validatePartialMovie(req.body);
  const movieIndex = movies.findIndex(movie => movie.id === id);

  if(!result.success) {
    return res.status(400).json({ error: JSON.parse(result.error.message) });
  }

  if (movieIndex === -1) return res.status(404).send(`<h1>Movie with id ${id} does not exist!</h1>`);

  const updatedMovie = {
    ...movies[movieIndex],
    ...result.data
  }

  movies[movieIndex] = updatedMovie;
  return res.json(updatedMovie);

})

app.delete('/movies/:id', (req, res) => {
  // const origin = req.get('origin');
  // if (ACCEPTED_ORIGINS.includes(origin) || !origin ){
  //   res.header('Access-Control-Allow-Origin', origin);
  // }

  const { id } = req.params;
  const movieIndex = movies.findIndex(movie => movie.id === id);

  if (movieIndex === -1) return res.status(404).json({ message: `Movie with id ${id} does not exist!` });

  movies.splice(movieIndex, 1);

  return res.status(204).json({ message: 'Movie deleted successfully' });
})

//These lines are not required when using cors pkg
// app.options('/movies/:id', (req, res) =>{
//   const origin = req.get('origin');
//   if (ACCEPTED_ORIGINS.includes(origin) || !origin ){
//     res.header('Access-Control-Allow-Origin', origin);
//     res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
//   }
//   res.send()
// })

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

