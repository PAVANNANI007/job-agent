const { fetchJobs } = require('./scraper/scraper');
const { processJobs, isNewJob } = require('./services/job.service');
const { sendWhatsAppBatch } = require('./services/whatsapp.service');
const { sendTelegramBatch } = require('./services/telegram.service');
const { log } = require('./utils/logger');

const SEARCHES = [
  'react developer',
  'node js developer',
  'full stack developer',
];

async function checkJobs() {
  log('🔍 Checking jobs...');

  const whatsappJobs = [];
  const telegramJobs = [];

  for (const search of SEARCHES) {
    const jobs = await fetchJobs(search);
    const processed = processJobs(jobs);

    for (const job of processed) {
      if (!isNewJob(job)) continue;

      if (job.score >= 90 && job.isTarget) {
        whatsappJobs.push(job);
      } else if (job.score >= 55) {
        telegramJobs.push(job);
      }
    }
  }
  if (whatsappJobs.length > 0) {
    await sendWhatsAppBatch(whatsappJobs);
    log(`🔥 WhatsApp sent (${whatsappJobs.length})`);
  }

  if (telegramJobs.length > 0) {
    await sendTelegramBatch(telegramJobs);
    log(`📩 Telegram sent (${telegramJobs.length})`);
  }
}

// run immediately
checkJobs();

// every 5 mins
setInterval(checkJobs, 30 * 1000);