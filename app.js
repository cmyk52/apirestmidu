const express = require('express');
const app = express();
const movies = require('./movies.json');
const crypto = require('crypto');
const cors = require('cors');
app.use(cors());
app.disable('x-powered-by'); // desactiva el header por defecto de express


//Middleware
// Esto realiza la operacion en la ruta "/" detectando el archivo json
app.use(express.json());


//rutas
app.get('/', (req, res) => {
    res.send('Hola mundo');
})


const ACCEPTED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8080',
    'http://127.0.0.1:5500',
]


//Todos los recursos que sean movies se encuentren en esta ruta
app.get('/movies', (req, res) => {
    const origin = req.header('origin');
    if (ACCEPTED_ORIGINS.includes(req.headers.origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    // res.header('Access-Control-Allow-Origin', '*'); //Solucion problema de CORS, el * es para todos los origenes.

    // Si existe un filtro por genero
    const { genre } = req.query;

    // Evalua si existe un filtro por genero y lo filtra
    if (genre) {
        const filteredMovies = movies.filter(
            movies => movies.genre.some(g => g.toLowerCase() === genre.toLowerCase()) // Con esta linea evitamos el key sensitive


        );
        // Devuelve el array filtrado
        return res.json(filteredMovies);
    }

    // Devolvera todos los recursos si no existe un filtro por genero
    res.json(movies);
})

//Recupera a traves del endpoint la informacion de un solo recurso
app.get('/movies/:id', (req, res) => {
    const id = req.params.id;
    const movie = movies.find(m => m.id === id);
    if (movie) { return res.json(movie) }
    res.status(404).json({ error: 'Movie not found' })
})




//POST
app.post('/movies', (req, res) => {


    const { title, year, director, duration, poster, genre, rate } = req.body; //desestructuramos el cuerpo de la request del body, esto sera capturado por el middleware de express.json

    const newMovie = {
        id: crypto.randomUUID(),
        title,
        year,
        director,
        duration,
        poster,
        genre,
        rate
    }


    movies.push(newMovie);
    res.status(201).json(newMovie);

})



//PATCH

app.patch('/movies/:id', (req, res) => {
    const id = req.params.id;
    const movieIndex = movies.findIndex(m => m.id === id);

    if (movieIndex === -1) {
        return res.status(404).json({ error: 'Movie not found' });
    }

    const movie = movies[movieIndex];
    const { title, year, director, duration, poster, genre, rate } = req.body;

    movie.title = title || movie.title;
    movie.year = year || movie.year;
    movie.director = director || movie.director;
    movie.duration = duration || movie.duration;
    movie.poster = poster || movie.poster;
    movie.genre = genre || movie.genre;
    movie.rate = rate || movie.rate;

    return res.json(movies[movieIndex]);

})

app.options('/movies/:id', (req, res) => {
    const origin = req.header('origin');
    if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
        res.header('Access-Control-Allow-Origin', origin);
    }
})

//DELETE
app.delete('/movies/:id', (req, res) => {
    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id);
    if (movieIndex === -1) {
        return res.status(404).json({ error: 'Movie not found' });
    }
    movies.splice(movieIndex, 1);
    return res.json({ message: 'Movie deleted' });
})
















const PORT = process.env.PORT || 3000 // puerto

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
})