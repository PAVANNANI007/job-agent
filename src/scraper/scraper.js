const { chromium } = require('playwright');

async function fetchJobs(search, processJobCallback) {
  const browser = await chromium.launch({
    headless: true,
  });

  const page = await browser.newPage();

  const url = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(
    search
  )}&location=India&f_TPR=r86400`;

  console.log("🌐 Opening:", url);

  await page.goto(url, { waitUntil: 'domcontentloaded' });

  // wait for public job cards
  await page.waitForSelector('.base-card', { timeout: 15000 });

  // scroll to load more jobs
  await page.mouse.wheel(0, 3000);
  await page.waitForTimeout(3000);

  // 🔥 EXTRACT JOB LIST (WITH CLEAN LINKS)
  const jobs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.base-card')).map(job => {
      const title =
        job.querySelector('.base-search-card__title')?.innerText?.trim();

      const company =
        job.querySelector('.base-search-card__subtitle')?.innerText?.trim();

      const rawLink =
        job.querySelector('a.base-card__full-link')?.href || '';

      // 🔥 Extract job ID and clean link
      const match = rawLink.match(/jobs\/view\/(\d+)/);

      const cleanLink = match
        ? `https://www.linkedin.com/jobs/view/${match[1]}`
        : rawLink;

      return {
        title,
        company,
        link: cleanLink,
      };
    });
  });

  console.log(`✅ Found ${jobs.length} jobs`);

  // 🔥 PROCESS EACH JOB
  for (const job of jobs.slice(0, 10)) {
    try {
      const detailPage = await browser.newPage();

      await detailPage.goto(job.link, {
        waitUntil: 'domcontentloaded',
      });

      // wait for page
      await detailPage.waitForTimeout(3000);

      // 🔥 Click "Show more" if exists
      try {
        const showMoreBtn = await detailPage.$(
          'button[aria-label="Show more description"]'
        );
        if (showMoreBtn) {
          await showMoreBtn.click();
          await detailPage.waitForTimeout(1000);
        }
      } catch {}

      // 🔥 Extract ONLY description section
      const description = await detailPage.evaluate(() => {
        const desc = document.querySelector(
          '.show-more-less-html__markup'
        );

        if (!desc) return '';

        let text = desc.innerText;

        // clean extra spaces
        text = text.replace(/\s+/g, ' ').trim();

        return text;
      });

      await detailPage.close();

      // 🔥 SEND CLEAN DATA
      await processJobCallback({
        ...job,
        description,
      });

      // anti-bot delay
      await page.waitForTimeout(1200 + Math.random() * 1000);

    } catch (err) {
      console.log("⚠️ Error:", err.message);
    }
  }

  await browser.close();
}

module.exports = { fetchJobs };