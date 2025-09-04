const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const FW_URL = "https://api.fireworks.ai/inference/v1/chat/completions";
const MODEL = "accounts/sentientfoundation/models/dobby-unhinged-llama-3-3-70b-new";
const API_KEY = process.env.FIREWORKS_API_KEY;

app.use(cors({ origin: "*" })); // Adjust origin for production
app.use(express.json());

app.post('/api/dobby', async (req, res) => {
    try {
        const { model, max_tokens, top_p, top_k, presence_penalty, frequency_penalty, temperature, messages } = req.body;
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: "Messages array is required" });
        }
        const body = {
            model: model || MODEL,
            max_tokens: max_tokens || 2048,
            top_p: top_p || 1,
            top_k: top_k || 40,
            presence_penalty: presence_penalty || 0,
            frequency_penalty: frequency_penalty || 0,
            temperature: temperature || 0.6,
            messages
        };
        const response = await fetch(FW_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`HTTP ${response.status}: ${text}`);
        }
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
