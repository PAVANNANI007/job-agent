const twilio = require('twilio');
const { TWILIO_SID, TWILIO_AUTH_TOKEN, WHATSAPP_TO } = require('../config/env');

const client = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);

async function sendWhatsAppBatch(jobs) {
  const message = jobs.slice(0, 5).map((job, i) =>
    `${i+1}. ${job.title}\n${job.company}\n${job.link}`
  ).join('\n\n');

  await client.messages.create({
    from: 'whatsapp:+14155238886',
    contentSid: 'HXb5b62575e6e4ff6129ad7c8efe1f983e',
    contentVariables: JSON.stringify({
      "1": `🔥 High Priority Jobs\n\n${message}`,
      "2": "Apply Fast 🚀"
    }),
    to: WHATSAPP_TO,
  });
}

module.exports = { sendWhatsAppBatch };