const { TOP_COMPANIES } = require('../constants/companies');

const PRIMARY = ['javascript'];
const SECONDARY = ['react','next','node','nestjs','mongodb','aws'];
const OTHERS = ['typescript','docker','java','python'];

function getText(job) {
  return (job.title + ' ' + job.description).toLowerCase();
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

// 🔥 ADVANCED EXPERIENCE EXTRACTION
function extractExperienceAll(text) {
  if (!text) return [];

  text = text.toLowerCase();

  const matches = [];

  // 3+ years
  [...text.matchAll(/(\d+)\s*\+\s*(years|yrs)/g)]
    .forEach(m => matches.push({ min: +m[1], max: null }));

  // 2-4 years
  [...text.matchAll(/(\d+)\s*(?:-|to)\s*(\d+)/g)]
    .forEach(m => matches.push({ min: +m[1], max: +m[2] }));

  // single
  [...text.matchAll(/(\d+)\s*(years|yrs)/g)]
    .forEach(m => matches.push({ min: +m[1], max: +m[1] }));

  return matches;
}

// 🎯 FINAL FILTER
function isValidExperience(job) {
  const exps = extractExperienceAll(job.description);

  if (!exps.length) return false;

  return exps.some(exp => {
    if (exp.max === null) {
      return exp.min >= 2 && exp.min <= 4;
    }
    return exp.min >= 2 && exp.max <= 4;
  });
}

function isTargetCompany(company) {
  return TOP_COMPANIES.some(c =>
    (company || '').toLowerCase().includes(c)
  );
}

function processJobs(jobs) {
  if (!jobs || !jobs.length) return [];

  return jobs
    .map(job => ({
      ...job,
      score: calculateScore(job),
      isTarget: isTargetCompany(job.company),
    }))
    .filter(job => job.score > 0 && isValidExperience(job))
    .sort((a, b) => b.score - a.score);
}

module.exports = { processJobs };