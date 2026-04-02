const axios = require('axios');
const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = require('../config/env');

async function sendTelegramBatch(jobs) {
  const message = jobs.slice(0, 10).map((job, i) =>
    `${i+1}. ${job.title} (${job.score}%)\n${job.company}\n${job.link}`
  ).join('\n\n');

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  await axios.post(url, {
    chat_id: TELEGRAM_CHAT_ID,
    text: `🚀 Job Updates\n\n${message}`,
  });
}

module.exports = { sendTelegramBatch };