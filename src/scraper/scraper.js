const { chromium } = require('playwright');

const MAX_PAGES = 4; // safe limit

async function fetchJobs(search, processJobCallback) {
  const browser = await chromium.launch({
    headless: false, // keep false for stability
  });

  const page = await browser.newPage();

  const url = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(search)}&location=India&f_TPR=r86400`;

  await page.goto(url, { waitUntil: 'domcontentloaded' });

  // wait for job list
  await page.waitForSelector('.job-card-container', { timeout: 15000 });

  let totalProcessed = 0;

  for (let pageNum = 1; pageNum <= MAX_PAGES; pageNum++) {
    console.log(`📄 Page ${pageNum}`);

    // scroll job list
    await page.mouse.wheel(0, 4000);
    await page.waitForTimeout(2000);

    const jobCards = await page.$$('.job-card-container');

    console.log(`🔍 Jobs on page: ${jobCards.length}`);

    for (let i = 0; i < jobCards.length; i++) {
      try {
        const jobCard = jobCards[i];

        // ensure visible
        await jobCard.scrollIntoViewIfNeeded();

        // click job
        await jobCard.click();

        // wait for right panel
        await page.waitForSelector('#job-details', { timeout: 5000 });

        // human delay
        await page.waitForTimeout(1200 + Math.random() * 1000);

        const job = await page.evaluate(() => {
          const title =
            document.querySelector('.job-details-jobs-unified-top-card__job-title')
              ?.innerText?.trim();

          const company =
            document.querySelector('.job-details-jobs-unified-top-card__company-name')
              ?.innerText?.trim();

          const description =
            document.querySelector('#job-details')
              ?.innerText?.trim() || '';

          const link = window.location.href;

          return { title, company, description, link };
        });

        if (!job?.title || !job?.company) continue;

        totalProcessed++;

        // 🔥 process immediately (score + filter + notify)
        await processJobCallback(job);

        // anti-bot delay
        await page.waitForTimeout(1000 + Math.random() * 1000);

      } catch (err) {
        console.log("⚠️ Job error:", err.message);
        continue;
      }
    }

    // 👉 pagination NEXT button (from your DOM)
    const nextButton = await page.$('.jobs-search-pagination__button--next');

    if (!nextButton) {
      console.log("⛔ No more pages");
      break;
    }

    console.log("➡️ Moving to next page");

    await nextButton.click();

    // wait for new page content
    await page.waitForTimeout(4000);
  }

  console.log(`✅ Total jobs processed: ${totalProcessed}`);

  await browser.close();
}

module.exports = { fetchJobs };