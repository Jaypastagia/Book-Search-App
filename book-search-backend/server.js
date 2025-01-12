import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

// Helper function to calculate statistics
const calculateStatistics = (books) => {
    const authorsCount = {};
    let earliestDate = null;
    let latestDate = null;

    books.forEach((book) => {
        const { author, yearPublished } = book || {};

        if (author) {
            authorsCount[author] = (authorsCount[author] || 0) + 1;
        }

        if (yearPublished) {
            const date = new Date(`01-01-${yearPublished}`);
            if (!earliestDate || date < earliestDate) earliestDate = date;
            if (!latestDate || date > latestDate) latestDate = date;
        }
    });

    const mostCommonAuthor = Object.keys(authorsCount).reduce(
        (max, author) =>
            authorsCount[author] > (authorsCount[max] || 0) ? author : max,
        null
    );

    return {
        totalResults: books.length,
        mostCommonAuthor,
        earliestDate: earliestDate?.toISOString().split("T")[0],
        latestDate: latestDate?.toISOString().split("T")[0],
    };
};

// API endpoint to search books
app.get("/api/search", async (req, res) => {
    const { query } = req.query;
    const start = Date.now();
    try {
        let apiURL = `https://postman-library-api.glitch.me/books`
        apiURL += query ? `?search=${query}` : '';

        const response = await axios.get(apiURL);
        let books = response.data || [];
        books = books.map(data => {
            data.description = '"The Whispering Pines Mystery" is a gripping tale of suspense, secrets, and the enduring power of the past. It explores the depths of human nature, the fragility of trust, and the resilience of the human spirit in the face of adversity.';
            return data;
        });

        const statistics = calculateStatistics(books);
        const serverResponseTime = `${Date.now() - start}ms`;

        return res.json({ books, statistics, serverResponseTime });
    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch books" });
    }
});

const server = app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

export default server;