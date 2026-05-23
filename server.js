const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const BOT_TOKEN = process.env.BOT_TOKEN;

// Указываем серверу искать фронтенд внутри папки public
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/create-stars-invoice', async (req, res) => {
    const { item, stars } = req.body;

    if (!BOT_TOKEN) {
        return res.status(500).json({ error: "Токен бота не настроен на сервере" });
    }

    try {
        const title = "SnakeStars Донат";
        const description = `Покупка: ${item}`;
        const payload = `payload_user_${Date.now()}`;
        const currency = "XTR"; 
        const prices = [{ label: item, amount: parseInt(stars) }];

        const tgUrl = `https://api.telegram.org/bot${BOT_TOKEN}/createInvoiceLink`;
        const response = await axios.post(tgUrl, {
            title, description, payload, currency, prices
        });

        if (response.data.ok) {
            res.json({ invoiceLink: response.data.result });
        } else {
            res.status(400).json({ error: "Telegram не смог создать инвойс" });
        }
    } catch (error) {
        console.error("Ошибка инвойса:", error.message);
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
