const { TOP_COMPANIES } = require('../constants/companies');

const PRIMARY = ['javascript'];
const SECONDARY = ['react','next','node','nestjs','mongodb','aws'];
const OTHERS = ['typescript','angular','python','java','docker'];

const EXCLUDE = ['senior','lead','manager','10+'];
const seenJobs = new Set();

function getText(job) {
  return (job.title || '').toLowerCase();
}

function calculateScore(job) {
  const text = getText(job);

  if (!PRIMARY.some(s => text.includes(s))) return 0;

  const hasSecondary = SECONDARY.some(s => text.includes(s));
  const hasOthers = OTHERS.some(s => text.includes(s));

  if (hasSecondary && hasOthers) return 90;
  if (hasSecondary) return 70;
  return 55;
}

function isTargetCompany(company) {
  return TOP_COMPANIES.some(c =>
    (company || '').toLowerCase().includes(c)
  );
}

function processJobs(jobs) {
  return jobs
    .map(job => ({
      ...job,
      score: calculateScore(job),
      isTarget: isTargetCompany(job.company),
    }))
    .filter(job => {
      const title = job.title?.toLowerCase() || '';

      return (
        job.score > 0 &&
        !EXCLUDE.some(e => title.includes(e)) &&
        isValidExperience(job) // ✅ NEW FILTER
      );
    })
    .sort((a, b) => b.score - a.score);
}

function isNewJob(job) {
  if (seenJobs.has(job.link)) return false;
  seenJobs.add(job.link);
  return true;
}

function extractExperience(text) {
  const expRegex = /(\d+)\s*[-–to]+\s*(\d+)\s*(years|yrs)/i;

  const match = text.match(expRegex);

  if (!match) return null;

  return {
    min: parseInt(match[1]),
    max: parseInt(match[2]),
  };
}

function isValidExperience(job) {
  const text = (job.title + ' ' + (job.description || '')).toLowerCase();

  const exp = extractExperience(text);

  if (!exp) return false; // skip if not mentioned

  return exp.min >= 2 && exp.max <= 4;
}

module.exports = { processJobs, isNewJob };