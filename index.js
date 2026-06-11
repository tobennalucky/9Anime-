import express from 'express';
import fetch from 'node-fetch'; // Needed if using Node < 18
import axios from 'axios';


const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', async (req, res) => {
  const imageList = [
    'beast.jpg',
    'butterfly 2.jpg',
    'butterfly hashira.jpg',
    'Fine Demon.jpg',
    'fire hashira.jpg',
    'love hashira.jpg',
    'mist hashira.jpg',
    'Tangiro.jpg'
  ];
  const randomImage = `images/${imageList[Math.floor(Math.random() * imageList.length)]}`;

  try {
    // Fetch quote
    const quoteResponse = await fetch('https://api.animechan.io/v1/quotes/random');
    const quoteData = await quoteResponse.json();

    const content = quoteData.data?.content || "Anime is not just a genre, it's a way of life.";
    const animeName = quoteData.data?.anime?.name || "Every Anime";
    const characterName = quoteData.data?.character?.name || "Tobenna";

    // Fetch top anime
    const topResponse = await axios.get('https://api.jikan.moe/v4/top/anime?limit=10');
    const topAnime = topResponse.data;
    const anime = Array.isArray(topAnime.data)
      ? topAnime.data.map(item => ({
          id: item.mal_id,
          title: item.title_english || item.title,
          image_url: item.images.webp.large_image_url,
          status: item.status,
          episodes: item.episodes,
          rating: item.rating,
          type: item.type,
          year: item.year
        }))
      : [];
    // Fetch current season anime
    const seasonResponse = await axios.get('https://api.jikan.moe/v4/seasons/upcoming?limit=6');
    const seasonData = seasonResponse.data;
    const season = Array.isArray(seasonData.data)
      ? seasonData.data.map(item => ({
          id: item.mal_id,
          title: item.title_english || item.title,
          image_url: item.images.webp.large_image_url,
          status: item.status,
          episodes: item.episodes,
          rating: item.rating,
          type: item.type,
          year: item.year,
          day: item.aired.prop.from.day,
          month: item.aired.prop.from.month 
        }))
      : [];

    // Render everything in one go
    res.render("index.ejs", {
      quote: content,
      animename: animeName,
      character: characterName,
      image: randomImage,
      anime: anime,
      season: season

    });

  } catch (error) {
    console.error('Error fetching data:', error);
    res.render("index.ejs", {
      quote: "Anime is not just a genre, it's a way of life.",
      animename: "Every Anime",
      character: "Tobenna",
      image: randomImage,
      anime: []
    });
  }
});

app.get ('/view/:id', async (req, res) => {
    const animeId = req.params.id;
    try {
        const response = await axios.get(`https://api.jikan.moe/v4/anime/${animeId}`);
        const animeData = response.data;
        if (!animeData.data) {
            return res.status(404).send("Anime not found");
        }  
        const anime = {
            id: animeData.data.mal_id,
            title: animeData.data.title_english || animeData.data.title,
            image_url: animeData.data.images.webp.large_image_url,
            year: animeData.data.year,
            season: animeData.data.season,
            synopsis: animeData.data.synopsis,
            episodes: animeData.data.episodes,
            genres: animeData.data.genres.map(genre => genre.name).join(', '),
            studios: animeData.data.studios.name,
            licensors: animeData.data.licensors.map(licensor => licensor.name).join(', '),
            producers: animeData.data.producers.map(producer => producer.name).join(', '),
            trailer: animeData.data.trailer?.embed_url || '',
            myurl: animeData.data.url

        }
        
        res.render("view.ejs", { anime: anime });
    } catch (error) {
        console.error('Error fetching anime data:', error);
        res.status(500).send("Error fetching anime data");
    }
});

app.get('/viewseason/:id', async (req, res) => {
    const seasonId = req.params.id;
    try {
        const response = await axios.get(`https://api.jikan.moe/v4/anime/${seasonId}`);
        const seasonData = response.data;
        if (!seasonData.data) {
            return res.status(404).send("Season not found");
        }
        const season = {
            id: seasonData.data.mal_id,
            title: seasonData.data.title_english || seasonData.data.title,
            image_url: seasonData.data.images.webp.large_image_url,
            year: seasonData.data.year,
            season: seasonData.data.season,
            synopsis: seasonData.data.synopsis,
            episodes: seasonData.data.episodes,
            genres: seasonData.data.genres.map(genre => genre.name).join(', '),
            studios: seasonData.data.studios.map(studio => studio.name).join(', '),
            licensors: seasonData.data.licensors.map(licensor => licensor.name).join(', '),
            producers: seasonData.data.producers.map(producer => producer.name).join(', '),
            trailer: seasonData.data.trailer?.embed_url || '',
            myurl: seasonData.data.url

        };

        res.render("viewseason.ejs", { season: season });
    } catch (error) {
        console.error('Error fetching season data:', error);
        res.status(500).send("Error fetching season data");
    }
});


      

app.get('/home', (req, res) => {
  res.redirect('/');
});

app.get('/about', (req, res) => {
  res.render("about.ejs");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
