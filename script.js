const rowsContainer = document.getElementById("rowsContainer");
const heroBanner = document.getElementById("heroBanner");
const searchBox = document.getElementById("searchBox");
const categoryFilter = document.getElementById("categoryFilter");
const languageFilter = document.getElementById("languageFilter");
const yearFromInput = document.getElementById("yearFrom");
const yearToInput = document.getElementById("yearTo");
const ratingMinInput = document.getElementById("ratingMin");
const runtimeMaxInput = document.getElementById("runtimeMax");
const searchBtn = document.getElementById("searchBtn");
const themeBtn = document.getElementById("themeBtn");
const toggleSearchBtn = document.getElementById("toggleSearchBtn");
const controlsPanel = document.getElementById("controlsPanel");
const notifyBtn = document.getElementById("notifyBtn");
const notifyPanel = document.getElementById("notifyPanel");
const notifyList = document.getElementById("notifyList");

const fallbackPoster = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='780' height='1170' viewBox='0 0 780 1170'%3E%3Crect width='780' height='1170' fill='%230b0b0b'/%3E%3Crect width='780' height='220' fill='%23e50914'/%3E%3Ctext x='50%25' y='57%25' fill='white' font-size='84' font-family='Arial' text-anchor='middle'%3EFLIXORA%3C/text%3E%3Ctext x='50%25' y='64%25' fill='%23d4d4d4' font-size='34' font-family='Arial' text-anchor='middle'%3EPoster Unavailable%3C/text%3E%3C/svg%3E";
const omdbCacheKey = "flixoraOmdbCacheV4";
const defaultOmdbApiKey = "564727fa";
const externalCatalogCacheKey = "flixoraExternalCatalogV1";
const externalCatalogTarget = 140;
const externalPosterCsvUrl = "https://raw.githubusercontent.com/vectorsss/movielens_100k_1m_extension/master/data/ml-100k/movie_posters.csv";
const externalLinksCsvUrl = "https://raw.githubusercontent.com/vectorsss/movielens_100k_1m_extension/master/data/ml-100k/links_artificial.csv";
let heroIndex = 0;
let selectedShowcaseId = "";
let heroSlides = [];
const invalidPosterIds = new Set();
let posterRefreshTimer = null;

const baseCatalog = [
    {
        id: "m1",
        title: "Oppenheimer",
        type: "Movie",
        releaseDate: "2023-07-21",
        runtime: 180,
        maturity: "adult",
        categories: ["Trending", "Drama"],
        poster: "https://m.media-amazon.com/images/M/MV5BN2JkMDc5MGQtZjg3YS00NmFiLWIyZmQtZTJmNTM5MjVmYTQ4XkEyXkFqcGc@._V1_SX300.jpg",
        imdbRating: "8.2",
        description: "A historical thriller about J. Robert Oppenheimer and the making of the atomic bomb.",
        streams: {
            English: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            Hindi: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
            Tamil: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
        }
    },
    {
        id: "m2",
        title: "Inception",
        type: "Movie",
        releaseDate: "2010-07-16",
        runtime: 148,
        maturity: "adult",
        categories: ["Trending", "Action", "Drama"],
        poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
        imdbRating: "8.8",
        description: "A skilled thief enters dreams to steal secrets and plant an idea.",
        streams: {
            English: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            Hindi: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
            Tamil: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
        }
    },
    {
        id: "m3",
        title: "Interstellar",
        type: "Movie",
        releaseDate: "2014-11-07",
        runtime: 169,
        maturity: "adult",
        categories: ["Trending", "Drama", "Romance"],
        poster: "https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_SX300.jpg",
        imdbRating: "8.7",
        description: "Explorers travel through a wormhole in space to save humanity.",
        streams: {
            English: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
            Hindi: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
        }
    },
    {
        id: "m4",
        title: "The Dark Knight",
        type: "Movie",
        releaseDate: "2008-07-18",
        runtime: 152,
        maturity: "adult",
        categories: ["Trending", "Action", "Drama"],
        poster: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg",
        imdbRating: "9.1",
        description: "Batman battles the Joker in Gotham's darkest showdown.",
        streams: {
            English: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            Hindi: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
            Tamil: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
        }
    },
    {
        id: "m5",
        title: "Avengers: Endgame",
        type: "Movie",
        releaseDate: "2019-04-26",
        runtime: 181,
        maturity: "teen",
        categories: ["Trending", "Action", "Drama"],
        poster: "https://m.media-amazon.com/images/M/MV5BMTc5MDE2ODcwNV5BMl5BanBnXkFtZTgwMzI2NzQ2NzM@._V1_SX300.jpg",
        imdbRating: "8.4",
        description: "The Avengers unite for a final mission to reverse the snap.",
        streams: {
            English: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
            Hindi: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
            Tamil: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
        }
    },
    {
        id: "m6",
        title: "Kung Fu Panda",
        type: "Movie",
        releaseDate: "2008-06-06",
        runtime: 92,
        maturity: "kids",
        categories: ["Comedy", "Action", "Trending"],
        poster: "https://m.media-amazon.com/images/M/MV5BZDU5MDNiMGItYjVmZi00NDUxLTg2OTktNGE0NzNlNzM4NzgyXkEyXkFqcGc@._V1_SX300.jpg",
        imdbRating: "7.6",
        description: "Po, an unlikely hero, trains to become the Dragon Warrior.",
        streams: {
            English: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
            Tamil: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
        }
    },
    {
        id: "m7",
        title: "La La Land",
        type: "Movie",
        releaseDate: "2016-12-25",
        runtime: 128,
        maturity: "teen",
        categories: ["Romance", "Drama", "Comedy", "Trending"],
        poster: "https://m.media-amazon.com/images/M/MV5BMzUzNDM2NzM2MV5BMl5BanBnXkFtZTgwNTM3NTg4OTE@._V1_SX300.jpg",
        imdbRating: "8.0",
        description: "A jazz musician and an actress chase dreams in Los Angeles.",
        streams: {
            English: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
            Hindi: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
        }
    },
    {
        id: "m8",
        title: "Titanic",
        type: "Movie",
        releaseDate: "1997-12-19",
        runtime: 194,
        maturity: "teen",
        categories: ["Romance", "Drama"],
        poster: "https://m.media-amazon.com/images/M/MV5BYzYyN2FiZmUtYWYzMy00MzViLWJkZTMtOGY1ZjgzNWMwN2YxXkEyXkFqcGc@._V1_SX300.jpg",
        imdbRating: "8.0",
        description: "A love story unfolds aboard the doomed RMS Titanic.",
        streams: {
            English: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
            Hindi: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
        }
    },
    {
        id: "m9",
        title: "The Conjuring",
        type: "Movie",
        releaseDate: "2013-07-19",
        runtime: 112,
        maturity: "adult",
        categories: ["Horror", "Drama", "Trending"],
        poster: "https://m.media-amazon.com/images/M/MV5BMTM3NjA1NDMyMV5BMl5BanBnXkFtZTcwMDQzNDMzOQ@@._V1_SX300.jpg",
        imdbRating: "7.5",
        description: "Paranormal investigators help a family terrorized by dark forces.",
        streams: {
            English: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
            Hindi: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4"
        }
    },
    {
        id: "m10",
        title: "Get Out",
        type: "Movie",
        releaseDate: "2017-02-24",
        runtime: 104,
        maturity: "adult",
        categories: ["Horror", "Drama", "Trending"],
        poster: "https://m.media-amazon.com/images/M/MV5BMjUxMDQwNjcyNl5BMl5BanBnXkFtZTgwNzcwMzc0MTI@._V1_SX300.jpg",
        imdbRating: "7.8",
        description: "A weekend visit to meet parents turns into a chilling nightmare.",
        streams: {
            English: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
            Hindi: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
        }
    },
    {
        id: "m11",
        title: "Vikram",
        type: "Movie",
        releaseDate: "2022-06-03",
        runtime: 175,
        maturity: "adult",
        categories: ["Trending", "Action", "Drama"],
        poster: "https://via.placeholder.com/780x1170?text=Vikram",
        imdbRating: "8.3",
        description: "An elite black-ops officer tracks a deadly syndicate in a high-stakes revenge mission.",
        officialProviders: ["JioHotstar", "ZEE5", "Netflix"],
        streams: {
            Tamil: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
            Hindi: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
            English: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        }
    },
    {
        id: "m12",
        title: "Leo",
        type: "Movie",
        releaseDate: "2023-10-19",
        runtime: 164,
        maturity: "adult",
        categories: ["Trending", "Action", "Drama"],
        poster: "https://via.placeholder.com/780x1170?text=Leo",
        imdbRating: "7.2",
        description: "A cafe owner with a hidden past faces ruthless gangsters and a violent conspiracy.",
        officialProviders: ["Netflix", "Sun NXT"],
        streams: {
            Tamil: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
            Hindi: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
            English: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
        }
    },
    {
        id: "m13",
        title: "Jailer",
        type: "Movie",
        releaseDate: "2023-08-10",
        runtime: 168,
        maturity: "adult",
        categories: ["Trending", "Action", "Drama"],
        poster: "https://via.placeholder.com/780x1170?text=Jailer",
        imdbRating: "7.1",
        description: "A retired jailer is forced back into action after a dangerous cartel targets his family.",
        officialProviders: ["Sun NXT", "Prime Video"],
        streams: {
            Tamil: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            Hindi: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
            English: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
        }
    },
    {
        id: "m14",
        title: "Master",
        type: "Movie",
        releaseDate: "2021-01-13",
        runtime: 179,
        maturity: "adult",
        categories: ["Trending", "Action", "Drama"],
        poster: "https://via.placeholder.com/780x1170?text=Master",
        imdbRating: "7.3",
        description: "An alcoholic professor clashes with a feared criminal while working at a juvenile home.",
        officialProviders: ["Prime Video", "Netflix"],
        streams: {
            Tamil: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
            Hindi: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
            Telugu: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4"
        }
    },
    {
        id: "m15",
        title: "Kaithi",
        type: "Movie",
        releaseDate: "2019-10-25",
        runtime: 145,
        maturity: "adult",
        categories: ["Trending", "Action", "Drama"],
        poster: "https://via.placeholder.com/780x1170?text=Kaithi",
        imdbRating: "8.4",
        description: "A recently released prisoner fights through one violent night to meet his daughter.",
        officialProviders: ["Prime Video", "Sun NXT"],
        streams: {
            Tamil: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
            Hindi: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
            English: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        }
    },
    {
        id: "m16",
        title: "Soorarai Pottru",
        type: "Movie",
        releaseDate: "2020-11-12",
        runtime: 153,
        maturity: "teen",
        categories: ["Trending", "Drama"],
        poster: "https://via.placeholder.com/780x1170?text=Soorarai+Pottru",
        imdbRating: "8.7",
        description: "An ambitious entrepreneur challenges the airline industry to make air travel affordable.",
        officialProviders: ["Prime Video"],
        streams: {
            Tamil: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            Hindi: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
            Telugu: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
        }
    },
    {
        id: "m17",
        title: "Jai Bhim",
        type: "Movie",
        releaseDate: "2021-11-02",
        runtime: 164,
        maturity: "adult",
        categories: ["Trending", "Drama"],
        poster: "https://via.placeholder.com/780x1170?text=Jai+Bhim",
        imdbRating: "8.8",
        description: "A dedicated lawyer takes up a tribal woman's case against police injustice.",
        officialProviders: ["Prime Video"],
        streams: {
            Tamil: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
            Hindi: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
            English: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
        }
    },
    {
        id: "m18",
        title: "Ponniyin Selvan: I",
        type: "Movie",
        releaseDate: "2022-09-30",
        runtime: 167,
        maturity: "teen",
        categories: ["Trending", "Action", "Drama"],
        poster: "https://via.placeholder.com/780x1170?text=Ponniyin+Selvan+I",
        imdbRating: "7.6",
        description: "A Chola messenger navigates royal conspiracies in an epic historical saga.",
        officialProviders: ["Prime Video", "Sun NXT"],
        streams: {
            Tamil: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
            Hindi: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
            Telugu: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
        }
    },
    {
        id: "m19",
        title: "96",
        type: "Movie",
        releaseDate: "2018-10-04",
        runtime: 158,
        maturity: "teen",
        categories: ["Trending", "Romance", "Drama"],
        poster: "https://via.placeholder.com/780x1170?text=96",
        imdbRating: "8.5",
        description: "Two school sweethearts reunite years later and reflect on love, memory, and regret.",
        officialProviders: ["Sun NXT", "Prime Video"],
        streams: {
            Tamil: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
            Hindi: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
        }
    },
    {
        id: "m20",
        title: "Love Today",
        type: "Movie",
        releaseDate: "2022-11-04",
        runtime: 154,
        maturity: "teen",
        categories: ["Trending", "Comedy", "Romance"],
        poster: "https://via.placeholder.com/780x1170?text=Love+Today",
        imdbRating: "8.0",
        description: "A young couple swaps phones for a day and uncovers uncomfortable truths.",
        officialProviders: ["Netflix", "Sun NXT"],
        streams: {
            Tamil: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            Telugu: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
            Hindi: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
        }
    },
    {
        id: "s1",
        title: "Stranger Things",
        type: "Web Series",
        releaseDate: "2016-07-15",
        runtime: 51,
        maturity: "teen",
        categories: ["Web Series", "Drama", "Horror", "Trending"],
        poster: "https://m.media-amazon.com/images/M/MV5BNjRiMTA4NWUtNmE0ZC00NGM0LWJhMDUtZWIzMDM5ZDIzNTg3XkEyXkFqcGc@._V1_SX300.jpg",
        imdbRating: "8.6",
        description: "A group of kids in Hawkins face secret experiments and supernatural dangers.",
        streams: {
            English: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
            Hindi: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
            Tamil: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4"
        },
        episodes: [
            { season: 1, episode: 1, title: "The Vanishing", stream: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" },
            { season: 1, episode: 2, title: "The Weirdo", stream: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4" },
            { season: 1, episode: 3, title: "Holly Jolly", stream: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4" }
        ]
    },
    {
        id: "s2",
        title: "Money Heist",
        type: "Web Series",
        releaseDate: "2017-05-02",
        runtime: 70,
        maturity: "adult",
        categories: ["Web Series", "Action", "Drama", "Trending"],
        poster: "https://m.media-amazon.com/images/M/MV5BZjkxZWJiNTUtYjQwYS00MTBlLTgwODQtM2FkNWMyMjMwOGZiXkEyXkFqcGc@._V1_SX300.jpg",
        imdbRating: "8.2",
        description: "A mysterious Professor recruits criminals for a high-stakes heist.",
        streams: {
            English: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
            Hindi: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
            Spanish: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
        }
    },
    {
        id: "s3",
        title: "Wednesday",
        type: "Web Series",
        releaseDate: "2022-11-23",
        runtime: 50,
        maturity: "teen",
        categories: ["Web Series", "Horror", "Comedy", "Trending"],
        poster: "https://m.media-amazon.com/images/M/MV5BMDE1NjNmZjgtZTg0OC00NjkxLWEzYzItMDNkMTc3YjgxZWQyXkEyXkFqcGc@._V1_SX300.jpg",
        imdbRating: "8.0",
        description: "Wednesday Addams investigates a supernatural mystery at Nevermore Academy.",
        streams: {
            English: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
            Hindi: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
        }
    },
    {
        id: "s4",
        title: "The Boys",
        type: "Web Series",
        releaseDate: "2019-07-26",
        runtime: 58,
        maturity: "adult",
        categories: ["Web Series", "Action", "Drama", "Trending"],
        poster: "https://m.media-amazon.com/images/M/MV5BMGRlZDE2ZGEtZTU5Mi00ODdkLWFmMTEtY2UwMmViNWNmZjczXkEyXkFqcGc@._V1_SX300.jpg",
        imdbRating: "8.6",
        description: "A vigilante team takes on corrupt superheroes.",
        streams: {
            English: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            Hindi: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
        }
    },
    {
        id: "s5",
        title: "Mirzapur",
        type: "Web Series",
        releaseDate: "2018-11-15",
        runtime: 60,
        maturity: "adult",
        categories: ["Web Series", "Action", "Drama", "Trending"],
        poster: "https://m.media-amazon.com/images/M/MV5BZTFjMzMxZTUtYTMyNy00OWNhLTk4ODQtNGI1NjI1NjJhMzc3XkEyXkFqcGc@._V1_SX300.jpg",
        imdbRating: "8.4",
        description: "A violent power struggle unfolds in the lawless city of Mirzapur.",
        streams: {
            Hindi: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
            Tamil: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
            English: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        }
    }
];

let catalog = [];
const rowOrder = ["Continue Watching", "Recommended", "Downloads", "Trending", "Action", "Comedy", "Romance", "Drama", "Web Series", "Horror"];
const currentRouteView = getRouteView();

function currentUser() {
    return (localStorage.getItem("flixoraUser") || "guest").toLowerCase();
}

function currentProfile() {
    return (localStorage.getItem("flixoraProfile") || "Main").toLowerCase();
}

function keyFor(name) {
    return `flixora:${name}:${currentUser()}:${currentProfile()}`;
}

function readJson(key, fallback) {
    try {
        return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    } catch (err) {
        return fallback;
    }
}

function writeJson(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function normalizePosterUrl(url) {
    if (!url) return "";
    return String(url).trim().replace(/^http:\/\//i, "https://").replace("..jpg", ".jpg");
}

function normalizeTitleKey(title) {
    return String(title || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}

function uniqueCatalogItems(items) {
    const seen = new Set();
    return items.filter((item) => {
        const year = String(item.releaseDate || "").slice(0, 4);
        const key = `${normalizeTitleKey(item.title)}|${year}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function mergeItemsIntoCatalog(items) {
    catalog = uniqueCatalogItems([...catalog, ...items]);
}

function parseExternalPosterMap(csvText) {
    const map = {};
    String(csvText || "")
        .split(/\r?\n/)
        .forEach((line) => {
            const trimmed = line.trim();
            if (!trimmed) return;
            const idx = trimmed.indexOf(",");
            if (idx < 1) return;
            const id = Number(trimmed.slice(0, idx));
            const poster = normalizePosterUrl(trimmed.slice(idx + 1));
            if (id && poster) map[id] = poster;
        });
    return map;
}

function parseExternalLinkRows(csvText) {
    const rows = [];
    String(csvText || "")
        .split(/\r?\n/)
        .slice(1)
        .forEach((line) => {
            const trimmed = line.trim();
            if (!trimmed) return;
            const first = trimmed.indexOf(",");
            const last = trimmed.lastIndexOf(",");
            const secondLast = trimmed.lastIndexOf(",", last - 1);
            if (first < 0 || secondLast < 0 || last < 0) return;
            const movieId = Number(trimmed.slice(0, first));
            const title = trimmed.slice(first + 1, secondLast).replace(/^"|"$/g, "").trim();
            const imdbIdRaw = trimmed.slice(secondLast + 1, last).replace(/^"|"$/g, "").trim();
            const tmdbIdRaw = trimmed.slice(last + 1).replace(/^"|"$/g, "").trim();
            if (!movieId || !title) return;
            rows.push({
                movieId,
                title,
                imdbIdRaw,
                tmdbIdRaw
            });
        });
    return rows;
}

function toImdbId(raw) {
    const digits = String(raw || "").replace(/\D/g, "");
    if (!digits) return "";
    return `tt${digits.padStart(7, "0")}`;
}

function pickCategoryByIndex(index) {
    const categoryCycle = ["Action", "Comedy", "Romance", "Drama", "Horror"];
    return categoryCycle[index % categoryCycle.length];
}

function inferPrimaryLanguage(title) {
    const t = normalizeTitleKey(title);
    if (/( tamil| kollywood| vijay| rajini | kamal | chennai | suriya )/.test(` ${t} `)) return "Tamil";
    if (/( hindi| bollywood| mumbai )/.test(` ${t} `)) return "Hindi";
    return "English";
}

function buildPreviewStreams(primaryLanguage) {
    const streams = {
        English: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        Hindi: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        Tamil: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
    };
    if (primaryLanguage && streams[primaryLanguage]) return { [primaryLanguage]: streams[primaryLanguage], ...streams };
    return streams;
}

function buildExternalCatalogItem(row, poster, index) {
    const titleWithYear = row.title;
    const yearMatch = titleWithYear.match(/\((\d{4})\)\s*$/);
    const year = yearMatch ? yearMatch[1] : "2015";
    const title = titleWithYear.replace(/\((\d{4})\)\s*$/, "").trim();
    const language = inferPrimaryLanguage(title);
    const category = pickCategoryByIndex(index);
    return {
        id: `x${row.movieId}`,
        title,
        type: "Movie",
        releaseDate: `${year}-01-01`,
        runtime: 100 + ((index % 6) * 10),
        maturity: index % 7 === 0 ? "adult" : "teen",
        categories: ["Trending", category],
        poster: normalizePosterUrl(poster),
        imdbID: toImdbId(row.imdbIdRaw),
        imdbRating: (6.8 + ((index % 20) * 0.1)).toFixed(1),
        description: `${title} is available to explore on Flixora.`,
        officialProviders: ["Prime Video", "Netflix", "JioHotstar"],
        streams: buildPreviewStreams(language)
    };
}

async function fetchTextSafe(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) return "";
        return await res.text();
    } catch (err) {
        return "";
    }
}

async function fetchExternalCatalog(limit) {
    const [posterCsv, linksCsv] = await Promise.all([fetchTextSafe(externalPosterCsvUrl), fetchTextSafe(externalLinksCsvUrl)]);
    if (!posterCsv || !linksCsv) return [];
    const posterMap = parseExternalPosterMap(posterCsv);
    const rows = parseExternalLinkRows(linksCsv);
    const items = rows
        .map((row, index) => buildExternalCatalogItem(row, posterMap[row.movieId], index))
        .filter((item) => item.poster && item.poster !== fallbackPoster);
    return uniqueCatalogItems(items).slice(0, limit);
}

async function loadExternalCatalog() {
    let cached = readJson(externalCatalogCacheKey, []);
    if (!Array.isArray(cached) || cached.length < 100) {
        cached = await fetchExternalCatalog(externalCatalogTarget);
        if (cached.length) writeJson(externalCatalogCacheKey, cached);
    }
    if (Array.isArray(cached) && cached.length) mergeItemsIntoCatalog(cached);
}

function requireLogin() {
    if (!localStorage.getItem("flixoraUser")) window.location.href = "login.html";
}

function getSettings() {
    return readJson("flixoraSettings", {});
}

function getRouteView() {
    const view = new URLSearchParams(window.location.search).get("view");
    if (view === "shows" || view === "movies") return view;
    return "home";
}

function updateRouteNavState() {
    document.querySelectorAll("[data-nav]").forEach((link) => {
        const isActive = link.getAttribute("data-nav") === currentRouteView;
        link.classList.toggle("active", isActive);
    });
}

function isShowItem(item) {
    if (!item) return false;
    if (item.type === "Web Series" || item.type === "TV Serial" || item.type === "Series") return true;
    return (item.categories || []).some((category) => category === "Web Series" || category === "TV Serial");
}

function applyRouteView(items) {
    if (currentRouteView === "shows") return items.filter((item) => isShowItem(item));
    if (currentRouteView === "movies") return items.filter((item) => item.type === "Movie");
    return items;
}

function getPrimaryLanguage(item) {
    const langs = Object.keys(item.streams || {});
    if (!langs.length) return "Other";
    const ordered = ["English", "Hindi", "Tamil", "Telugu", "Spanish", "Korean", "Japanese", "French", "German"];
    const found = ordered.find((lang) => langs.includes(lang));
    return found || langs[0];
}

function getViewHeading() {
    if (currentRouteView === "shows") return "Unlimited web series and shows";
    if (currentRouteView === "movies") return "Unlimited movies in every language";
    return "Unlimited films, series and more";
}

function getViewSubtitle() {
    if (currentRouteView === "shows") return "Latest multi-language web series and TV shows on Flixora.";
    if (currentRouteView === "movies") return "Latest multi-language movie releases on Flixora.";
    return "Watch latest mixed releases across movies and web series.";
}

function applySavedTheme() {
    if (localStorage.getItem("flixoraTheme") === "light") document.body.classList.add("light");
}

function applyUserSettings() {
    const settings = getSettings();
    if (settings.category) categoryFilter.value = settings.category;
    if (settings.language) languageFilter.value = settings.language;
}

function toggleTheme() {
    document.body.classList.toggle("light");
    localStorage.setItem("flixoraTheme", document.body.classList.contains("light") ? "light" : "dark");
}

function mergeAdminCatalog() {
    const custom = readJson("flixoraAdminCatalog", []);
    const tamilCatalog = Array.isArray(window.tamilMoviesCatalog) ? window.tamilMoviesCatalog : [];
    catalog = uniqueCatalogItems([...baseCatalog, ...tamilCatalog, ...custom]);
}

function applyKidsMode(items) {
    const settings = getSettings();
    if (!settings.kidsMode) return items;
    return items.filter((item) => item.maturity === "kids" || item.maturity === "teen");
}

function releaseTimeValue(item) {
    const time = new Date(item.releaseDate || "").getTime();
    return Number.isFinite(time) ? time : 0;
}

function trimText(text, max) {
    const value = String(text || "").trim();
    if (value.length <= max) return value;
    return `${value.slice(0, max - 1)}...`;
}

function getShowcaseItems(items, limit = 28) {
    const source = Array.isArray(items) && items.length ? items : catalog;
    const pool = source
        .filter((item) => (item.type === "Movie" || isShowItem(item)) && hasRealPoster(item))
        .sort((a, b) => releaseTimeValue(b) - releaseTimeValue(a));
    if (!pool.length) return [];

    const buckets = new Map();
    pool.forEach((item) => {
        const lang = getPrimaryLanguage(item);
        if (!buckets.has(lang)) buckets.set(lang, []);
        buckets.get(lang).push(item);
    });

    const preferredLangOrder = ["English", "Hindi", "Tamil", "Telugu", "Spanish", "Korean", "Japanese", "French", "German"];
    const languages = Array.from(buckets.keys()).sort((a, b) => {
        const aIndex = preferredLangOrder.indexOf(a);
        const bIndex = preferredLangOrder.indexOf(b);
        if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
    });

    const mixed = [];
    const seen = new Set();
    let hasMore = true;

    while (mixed.length < limit && hasMore) {
        hasMore = false;
        languages.forEach((lang) => {
            const bucket = buckets.get(lang);
            while (bucket && bucket.length) {
                const next = bucket.shift();
                if (seen.has(next.id)) continue;
                seen.add(next.id);
                mixed.push(next);
                hasMore = true;
                break;
            }
        });
    }

    return mixed.length ? mixed.slice(0, limit) : pool.slice(0, limit);
}

function getLatestReleaseItems(items, limit = 18) {
    return getShowcaseItems(items, limit);
}

function renderHomeShowcase(items) {
    if (!heroBanner) return;
    const showcase = getShowcaseItems(items, 30);
    if (!showcase.length) {
        heroBanner.innerHTML = "";
        return;
    }

    const featured = showcase[0];
    const collageTiles = showcase
        .map((item) => `<article class="hero-collage-tile"><img src="${getPosterUrl(item)}" alt="${item.title}" data-item-id="${item.id}"></article>`)
        .join("");

    heroBanner.classList.remove("hero--showcase");
    heroBanner.classList.add("hero--landing");
    heroBanner.innerHTML = `
        <div class="hero-collage-grid">${collageTiles}</div>
        <div class="hero-landing-overlay"></div>
        <div class="hero-landing-copy">
            <h2>${getViewHeading()}</h2>
            <p>${getViewSubtitle()}</p>
            <button class="hero-cta-btn" id="heroCtaBtn">Get Started</button>
        </div>`;

    bindHeroPosterFailure(heroBanner);

    heroBanner.querySelectorAll("img[data-item-id]").forEach((img) => {
        img.addEventListener("click", (evt) => {
            evt.stopPropagation();
            const itemId = img.getAttribute("data-item-id");
            const target = showcase.find((entry) => entry.id === itemId);
            if (target) openModal(target);
        });
    });

    const ctaBtn = document.getElementById("heroCtaBtn");
    if (ctaBtn) {
        ctaBtn.addEventListener("click", (evt) => {
            evt.stopPropagation();
            rowsContainer.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }

    if (featured) {
        heroBanner.style.cursor = "pointer";
        heroBanner.onclick = () => openModal(featured);
    } else {
        heroBanner.style.cursor = "default";
        heroBanner.onclick = null;
    }
}

function buildLatestMixedHeroSlides(limit = 10) {
    return getShowcaseItems(catalog, limit).map((item) => {
        const year = String(item.releaseDate || "").slice(0, 4) || "Latest";
        const rating = item.imdbRating ? ` | IMDb ${item.imdbRating}` : "";
        const language = getPrimaryLanguage(item);
        return {
            itemId: item.id,
            title: item.title,
            subtitle: `Latest ${language} ${item.type.toLowerCase()} | ${year}${rating}`,
            image: getPosterUrl(item)
        };
    });
}

function buildHeroCollageSlide() {
    const latestMixed = getShowcaseItems(catalog, 28);
    if (latestMixed.length < 10) return null;
    return {
        kind: "collage",
        title: getViewHeading(),
        subtitle: getViewSubtitle(),
        cta: "Get Started",
        itemId: latestMixed[0].id,
        posters: latestMixed.map((item) => ({
            id: item.id,
            title: item.title,
            image: getPosterUrl(item)
        }))
    };
}

function refreshHeroSlides() {
    const latestMixedSlides = buildLatestMixedHeroSlides();
    const collageSlide = buildHeroCollageSlide();
    if (latestMixedSlides.length) {
        heroSlides = collageSlide ? [collageSlide, ...latestMixedSlides] : latestMixedSlides;
        if (heroIndex >= heroSlides.length) heroIndex = 0;
        return;
    }
    heroSlides = Array.isArray(heroData) ? heroData : [];
    if (heroIndex >= heroSlides.length) heroIndex = 0;
}

function bindHeroPosterFailure(heroElement) {
    const imgs = heroElement.querySelectorAll("img[data-item-id]");
    imgs.forEach((img) => {
        img.referrerPolicy = "no-referrer";
        img.addEventListener("error", () => {
            const itemId = img.getAttribute("data-item-id");
            if (itemId) invalidPosterIds.add(itemId);
            queuePosterRefresh();
        });
    });
}

function renderPosterHeroSlide(item) {
    heroBanner.classList.remove("hero--landing");
    heroBanner.innerHTML = `<img src="${item.image}" alt="${item.title}" data-item-id="${item.itemId || ""}"><div class="hero-overlay"><h2>${item.title}</h2><p>${item.subtitle}</p></div>`;
    bindHeroPosterFailure(heroBanner);
    if (item.itemId) {
        heroBanner.style.cursor = "pointer";
        heroBanner.onclick = () => {
            const target = catalog.find((x) => x.id === item.itemId);
            if (target) openModal(target);
        };
    } else {
        heroBanner.style.cursor = "default";
        heroBanner.onclick = null;
    }
}

function renderCollageHeroSlide(item) {
    heroBanner.classList.add("hero--landing");
    const tiles = (item.posters || [])
        .map((poster) => `<article class="hero-collage-tile"><img src="${poster.image}" alt="${poster.title}" data-item-id="${poster.id}"></article>`)
        .join("");
    heroBanner.innerHTML = `
        <div class="hero-collage-grid">${tiles}</div>
        <div class="hero-landing-overlay"></div>
        <div class="hero-landing-copy">
            <h2>${item.title}</h2>
            <p>${item.subtitle}</p>
            <button class="hero-cta-btn" id="heroCtaBtn">${item.cta || "Explore"}</button>
        </div>`;
    bindHeroPosterFailure(heroBanner);
    const ctaBtn = document.getElementById("heroCtaBtn");
    if (ctaBtn) {
        ctaBtn.addEventListener("click", (evt) => {
            evt.stopPropagation();
            if (searchBox) searchBox.focus();
            rowsContainer.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }
    if (item.itemId) {
        heroBanner.style.cursor = "pointer";
        heroBanner.onclick = () => {
            const target = catalog.find((x) => x.id === item.itemId);
            if (target) openModal(target);
        };
    } else {
        heroBanner.style.cursor = "default";
        heroBanner.onclick = null;
    }
}

function rotateHero() {
    if (!heroBanner) return;
    if (!heroSlides.length) refreshHeroSlides();
    if (!heroSlides.length) return;
    const item = heroSlides[heroIndex];
    if (item.kind === "collage") renderCollageHeroSlide(item);
    else renderPosterHeroSlide(item);
    heroIndex = (heroIndex + 1) % heroSlides.length;
}

function getPosterUrl(item) {
    return normalizePosterUrl(item.omdbPoster || item.poster);
}

function hasRealPoster(item) {
    if (!item || invalidPosterIds.has(item.id)) return false;
    const url = getPosterUrl(item);
    if (!url || url === fallbackPoster) return false;
    if (url.startsWith("data:image/svg+xml")) return false;
    return !/placeholder\.com|dummyimage\.com/i.test(url);
}

function queuePosterRefresh() {
    if (posterRefreshTimer) return;
    posterRefreshTimer = setTimeout(() => {
        posterRefreshTimer = null;
        runFilters();
    }, 40);
}

function hasPlaceholderPoster(item) {
    const url = getPosterUrl(item);
    if (!url || url === fallbackPoster) return true;
    if (url.startsWith("data:image/svg+xml")) return true;
    return /placeholder\.com|dummyimage\.com/i.test(url);
}

function readOmdbCache() {
    return readJson(omdbCacheKey, {});
}

function saveOmdbCache(cache) {
    writeJson(omdbCacheKey, cache);
}

function getOmdbType(item) {
    return item.type === "Movie" ? "movie" : "series";
}

async function findOmdbTitle(item, apiKey) {
    const year = String(item.releaseDate || "").slice(0, 4);
    const params = new URLSearchParams({ apikey: apiKey, t: item.title, type: getOmdbType(item) });
    if (year) params.set("y", year);
    const res = await fetch(`https://www.omdbapi.com/?${params.toString()}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.Response === "False") return null;
    return {
        imdbID: data.imdbID || "",
        poster: data.Poster && data.Poster !== "N/A" ? data.Poster : "",
        imdbRating: data.imdbRating || "",
        plot: data.Plot || "",
        actors: data.Actors && data.Actors !== "N/A" ? data.Actors : "",
        rated: data.Rated && data.Rated !== "N/A" ? data.Rated : ""
    };
}

function applyOmdbToItem(item, data) {
    if (!data) return;
    if (data.poster) item.omdbPoster = normalizePosterUrl(data.poster);
    if (data.imdbID) item.imdbID = data.imdbID;
    if (data.imdbRating) item.imdbRating = data.imdbRating;
    if (data.plot) item.omdbPlot = data.plot;
    if (data.actors) item.omdbActors = data.actors;
    if (data.rated) item.rated = data.rated;
}

async function loadRealPostersFromOmdb() {
    const apiKey = (getSettings().omdbApiKey || defaultOmdbApiKey || "").trim();
    if (!apiKey) return;
    const cache = readOmdbCache();
    const targets = catalog.filter((item) => hasPlaceholderPoster(item) || !item.imdbID);
    await Promise.all(
        targets.map(async (item) => {
            if (cache[item.id]) return applyOmdbToItem(item, cache[item.id]);
            const data = await findOmdbTitle(item, apiKey);
            if (!data) return;
            cache[item.id] = data;
            applyOmdbToItem(item, data);
        })
    );
    saveOmdbCache(cache);
}

function getContinueMap() {
    return readJson(keyFor("continue"), {});
}

function getDownloads() {
    return readJson(keyFor("downloads"), []);
}

function saveDownloads(list) {
    writeJson(keyFor("downloads"), list);
}

function tickDownloads() {
    const list = getDownloads();
    let changed = false;
    list.forEach((d) => {
        if (d.progress >= 100) return;
        d.progress = Math.min(100, d.progress + Math.floor(Math.random() * 20 + 10));
        d.status = d.progress >= 100 ? "done" : "downloading";
        changed = true;
    });
    if (changed) saveDownloads(list);
}

function getRecommended(items) {
    const history = getContinueMap();
    const watchedIds = Object.keys(history);
    if (!watchedIds.length) return items.filter((x) => x.categories.includes("Trending")).slice(0, 8);
    const watched = catalog.filter((x) => watchedIds.includes(x.id));
    const scoreCats = new Set(watched.flatMap((x) => x.categories));
    return items.filter((x) => x.categories.some((c) => scoreCats.has(c))).slice(0, 10);
}

function getContinueItems() {
    const map = getContinueMap();
    return catalog.filter((x) => map[x.id] && map[x.id].currentTime > 20);
}

function getDownloadItems() {
    const ids = new Set(getDownloads().map((x) => x.id));
    return catalog.filter((x) => ids.has(x.id));
}

function getNotifications(items) {
    const now = Date.now();
    const recent = items.filter((x) => now - new Date(x.releaseDate).getTime() < 1000 * 60 * 60 * 24 * 120);
    const notes = [];
    recent.slice(0, 4).forEach((x) => notes.push(`New release: ${x.title}`));
    items.filter((x) => x.episodes && x.episodes.length).slice(0, 3).forEach((x) => notes.push(`Episodes available: ${x.title}`));
    return notes;
}

function renderNotifications(items) {
    if (!notifyList) return;
    const notes = getNotifications(items);
    notifyList.innerHTML = notes.length ? notes.map((n) => `<p class="notice">${n}</p>`).join("") : "<p class='notice'>No new alerts.</p>";
}

function renderRow(title, items, type) {
    if (!items.length) return;
    const section = document.createElement("section");
    section.className = "row";
    section.innerHTML = `<h2>${title}</h2>`;
    const row = document.createElement("div");
    row.className = "movie-row";
    const continueMap = getContinueMap();
    const downloads = getDownloads();
    items.forEach((item) => {
        if (!hasRealPoster(item)) return;
        const posterUrl = getPosterUrl(item);
        if (!posterUrl) return;
        const card = document.createElement("article");
        card.className = "movie-card";
        const c = continueMap[item.id];
        const d = downloads.find((x) => x.id === item.id);
        const progress = type === "Continue Watching" && c ? `${Math.floor((c.currentTime / Math.max(c.duration || 1, 1)) * 100)}% watched` : "";
        const download = d ? `${d.status} ${d.progress}%` : "";
        card.innerHTML = `
            <img src="${posterUrl}" alt="${item.title}">
            <div class="card-body">
                <h4>${item.title}</h4>
                <p class="card-meta">${item.type} | ${item.releaseDate} | ${item.runtime || "?"}m</p>
                ${progress ? `<p class="card-meta">${progress}</p>` : ""}
                ${download ? `<p class="card-meta">${download}</p>` : ""}
            </div>`;
        const posterEl = card.querySelector("img");
        if (posterEl) {
            posterEl.loading = "lazy";
            posterEl.decoding = "async";
            posterEl.referrerPolicy = "no-referrer";
            posterEl.addEventListener("error", () => {
                invalidPosterIds.add(item.id);
                card.remove();
                if (!row.children.length) section.remove();
                queuePosterRefresh();
            });
        }
        card.addEventListener("click", () => openModal(item));
        row.appendChild(card);
    });
    if (!row.children.length) return;
    section.appendChild(row);
    rowsContainer.appendChild(section);
}

function normalizeSearchText(value) {
    return String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function buildSearchText(item) {
    const parts = [
        item.title,
        item.type,
        item.description,
        item.omdbPlot,
        String(item.releaseDate || "").slice(0, 4),
        (item.categories || []).join(" "),
        Object.keys(item.streams || {}).join(" ")
    ];
    return normalizeSearchText(parts.join(" "));
}

function renderEmptyState(query) {
    const section = document.createElement("section");
    section.className = "row";
    const heading = document.createElement("h2");
    heading.textContent = "No Results";
    const text = document.createElement("p");
    text.className = "notice";
    text.textContent = query
        ? `No titles found for "${query}". Try another keyword or clear some filters.`
        : "No titles match the selected filters.";
    section.appendChild(heading);
    section.appendChild(text);
    rowsContainer.appendChild(section);
}

function runFilters() {
    const query = (searchBox.value || "").trim();
    const queryTokens = normalizeSearchText(query).split(" ").filter(Boolean);
    const category = categoryFilter.value;
    const language = languageFilter.value;
    const yearFrom = yearFromInput ? Number(yearFromInput.value || 0) : 0;
    const yearTo = yearToInput ? Number(yearToInput.value || 9999) : 9999;
    const ratingMin = ratingMinInput ? Number(ratingMinInput.value || 0) : 0;
    const runtimeMax = runtimeMaxInput ? Number(runtimeMaxInput.value || 9999) : 9999;

    let filtered = applyKidsMode(catalog).filter((item) => {
        const year = Number(String(item.releaseDate || "").slice(0, 4) || 0);
        const imdb = Number(item.imdbRating || 0);
        const searchable = buildSearchText(item);
        const matchesQuery = !queryTokens.length || queryTokens.every((token) => searchable.includes(token));
        const matchesCategory = category === "All" || item.categories.includes(category);
        const matchesLanguage = language === "All" || Object.prototype.hasOwnProperty.call(item.streams || {}, language);
        const matchesYear = year >= yearFrom && year <= yearTo;
        const matchesRating = imdb >= ratingMin;
        const matchesRuntime = Number(item.runtime || 0) <= runtimeMax;
        return matchesQuery && matchesCategory && matchesLanguage && matchesYear && matchesRating && matchesRuntime;
    });

    filtered = filtered.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
    filtered = applyRouteView(filtered);
    filtered = filtered.filter((item) => hasRealPoster(item));

    const routeSource = applyRouteView(applyKidsMode(catalog));
    renderHomeShowcase(filtered.length ? filtered : routeSource);
    rowsContainer.innerHTML = "";

    const hasRouteFilter = currentRouteView !== "home";
    const hasActiveFilters = Boolean(
        queryTokens.length ||
            category !== "All" ||
            language !== "All" ||
            hasRouteFilter
    );

    if (hasActiveFilters) {
        if (filtered.length) {
            const modeLabel = currentRouteView === "shows" ? "Shows" : currentRouteView === "movies" ? "Movies" : "Filtered Results";
            const rowLabel = queryTokens.length ? `Search Results (${filtered.length})` : `${modeLabel} (${filtered.length})`;
            renderRow(rowLabel, filtered, "Filtered");
        } else {
            renderEmptyState(query);
        }
        renderNotifications(filtered);
        return;
    }

    renderRow("Latest Releases", getLatestReleaseItems(filtered, 18), "Latest Releases");
    renderRow("Continue Watching", getContinueItems().filter((x) => filtered.some((y) => y.id === x.id)), "Continue Watching");
    renderRow("Recommended", getRecommended(filtered), "Recommended");
    renderRow("Downloads", getDownloadItems().filter((x) => filtered.some((y) => y.id === x.id)), "Downloads");

    rowOrder.slice(3).forEach((rowName) => {
        const rowItems = filtered.filter((x) => x.categories.includes(rowName));
        renderRow(rowName, rowItems, rowName);
    });

    renderNotifications(filtered);
}

function searchShows() {
    runFilters();
}

function toWatchRouteItem(item) {
    if (!item) return null;
    const copy = { ...item };
    if (item.streams) copy.streams = { ...item.streams };
    if (Array.isArray(item.categories)) copy.categories = [...item.categories];
    if (Array.isArray(item.officialProviders)) copy.officialProviders = [...item.officialProviders];
    if (Array.isArray(item.episodes)) copy.episodes = item.episodes.map((ep) => ({ ...ep }));
    return copy;
}

function saveWatchRouteState(item) {
    const selected = toWatchRouteItem(item);
    if (!selected) return;
    const snapshot = applyKidsMode(catalog)
        .filter((entry) => hasRealPoster(entry))
        .slice(0, 320)
        .map((entry) => toWatchRouteItem(entry));
    const selectedRaw = JSON.stringify(selected);
    const catalogRaw = JSON.stringify(snapshot);
    sessionStorage.setItem("flixoraWatchSelectedV1", selectedRaw);
    sessionStorage.setItem("flixoraWatchCatalogV1", catalogRaw);
    localStorage.setItem("flixoraWatchSelectedV1", selectedRaw);
    localStorage.setItem("flixoraWatchCatalogV1", catalogRaw);
}

function openModal(item) {
    if (!hasRealPoster(item)) return;
    saveWatchRouteState(item);
    const params = new URLSearchParams();
    if (item.id) params.set("id", item.id);
    window.location.href = params.toString() ? `watch.html?${params.toString()}` : "watch.html";
}

function wireNavActions() {
    document.getElementById("logoutLink").addEventListener("click", () => {
        localStorage.removeItem("flixoraUser");
        localStorage.removeItem("flixoraUserName");
        localStorage.removeItem("flixoraAccountId");
    });
}

function bindEvents() {
    if (searchBtn) searchBtn.addEventListener("click", runFilters);
    if (searchBox) searchBox.addEventListener("keyup", (e) => e.key === "Enter" && runFilters());
    if (searchBox) searchBox.addEventListener("input", runFilters);
    [categoryFilter, languageFilter].forEach((el) => el && el.addEventListener("change", runFilters));
    if (toggleSearchBtn && controlsPanel) {
        toggleSearchBtn.setAttribute("aria-expanded", String(controlsPanel.classList.contains("open")));
        toggleSearchBtn.classList.toggle("is-active", controlsPanel.classList.contains("open"));
        toggleSearchBtn.addEventListener("click", () => {
            const isOpen = controlsPanel.classList.toggle("open");
            toggleSearchBtn.classList.toggle("is-active", isOpen);
            toggleSearchBtn.setAttribute("aria-expanded", String(isOpen));
        });
    }
    themeBtn.addEventListener("click", toggleTheme);
    if (notifyBtn && notifyPanel) notifyBtn.addEventListener("click", () => notifyPanel.classList.toggle("hidden"));
}

async function init() {
    requireLogin();
    mergeAdminCatalog();
    await loadExternalCatalog();
    applySavedTheme();
    applyUserSettings();
    updateRouteNavState();
    await loadRealPostersFromOmdb();
    setInterval(() => {
        tickDownloads();
        runFilters();
    }, 4500);
    bindEvents();
    wireNavActions();
    runFilters();
}

init();
window.searchShows = searchShows;

