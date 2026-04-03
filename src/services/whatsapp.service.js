const twilio = require('twilio');
const { TWILIO_SID, TWILIO_AUTH_TOKEN, WHATSAPP_TO } = require('../config/env');

const client = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);

async function sendWhatsApp(job) {
  await client.messages.create({
    from: 'whatsapp:+14155238886',
    body: `🔥 ${job.title}\n${job.company}\n${job.link}`,
    to: WHATSAPP_TO,
  });
}

module.exports = { sendWhatsApp };