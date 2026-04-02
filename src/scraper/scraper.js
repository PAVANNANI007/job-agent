const { chromium } = require('playwright');

async function fetchJobs(search) {
  const browser = await chromium.launch({
    headless: true, // safe now
  });

  const page = await browser.newPage();

  const url = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(search)}&location=India&f_TPR=r300`;

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // wait for job cards (public page)
    await page.waitForSelector('.base-card', { timeout: 15000 });

    // scroll to load more jobs
    await page.mouse.wheel(0, 3000);
    await page.waitForTimeout(3000);

    const jobs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.base-card')).map(job => {
        const title =
          job.querySelector('.base-search-card__title')?.innerText?.trim();

        const company =
          job.querySelector('.base-search-card__subtitle')?.innerText?.trim();

        const link =
          job.querySelector('a.base-card__full-link')?.href;

        return { title, company, link, description: '' };
      });
    });

    console.log(`✅ Jobs found for "${search}":`, jobs.length);

    return jobs.filter(j => j.title && j.company);

  } catch (err) {
    console.log("❌ Scraping error:", err.message);
    return [];
  } finally {
    await browser.close();
  }
}

module.exports = { fetchJobs };