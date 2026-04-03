const { fetchJobs } = require('./scraper/scraper');
const { processJobs } = require('./services/job.service');
const { sendTelegram } = require('./services/telegram.service');
const { sendWhatsApp } = require('./services/whatsapp.service');

async function processJob(job) {
  const processed = processJobs([job]);
  if (!processed.length) return;

  const finalJob = processed[0];

  console.log(`✅ ${finalJob.title} (${finalJob.score}%)`);
  
  if (finalJob.score >= 90 && finalJob.isTarget) {
    await sendWhatsApp(finalJob);
  } else {
    await sendTelegram(finalJob);
  }
}

async function checkJobs() {
  console.log("🔍 Checking jobs...");
  await fetchJobs('javascript developer', processJob);
}

checkJobs();
setInterval(checkJobs, 5 * 60 * 1000);