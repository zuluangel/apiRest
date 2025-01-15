const zod = require('zod');

const movieSchema = zod.object({
  title: zod.string({
    required_error: 'Title is required',
    invalid_type_error: 'Title must be a string',
    }).min(1, 'Title must be at least 1 character'),
  year: zod.number({
    required_error: 'Year is required',
    invalid_type_error: 'Year must be an integer number between 1880 and the current year.',
  }).int({
    invalid_type_error: 'Year must be an integer between 1880 and the current year.',
  }).min(1800).max(new Date().getFullYear()),
  genre: zod.array(zod.enum([
    'Action',
    'Adventure',
    'Comedy',
    'Drama',
    'Fantasy',
    'Horror',
    'Mystery',
    'Thriller',
    'Western',
    'Sci-Fi',
    'Animation',
    'Documentary',
    'Biography',
    'Crime',
    'Romance',
    'Family',
    'War',
    'History',
    'Music',
    'Sport',
    'Musical',
  ]),{
    required_error: 'Genres is required',
    invalid_type_error: 'Genre must be a valid genre',
    
  }).min(1, 'At least one genre is required'),
  director: zod.string(),
  duration: zod.number().int().min(0),
  rate: zod.number().min(0).max(10),
  poster: zod.string().url({
    message: 'Poster must be a valid URL',
  })
});

function validateMovie(input) {
  return movieSchema.safeParse(input);//This method will return an object with the data and the error
}

function validatePartialMovie(input) {
  return movieSchema.partial().safeParse(input);
}

module.exports = {validateMovie, validatePartialMovie};