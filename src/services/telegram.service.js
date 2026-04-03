const axios = require('axios');
const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = require('../config/env');

async function sendTelegram(job) {
  const msg = `🚀 ${job.title} (${job.score}%)
${job.company}
${job.link}`;

  await axios.post(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    { chat_id: TELEGRAM_CHAT_ID, text: msg }
  );
}

module.exports = { sendTelegram };