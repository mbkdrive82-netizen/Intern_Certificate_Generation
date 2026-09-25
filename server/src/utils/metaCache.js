const Company = require('../models/Company');
const Course = require('../models/Course');
const CertificateTemplate = require('../models/CertificateTemplate');
const Setting = require('../models/Setting');

let cachedMeta = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours TTL (invalidated on updates)

const getMetadata = async (forceRefresh = false) => {
  const now = Date.now();
  if (!forceRefresh && cachedMeta && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedMeta;
  }

  try {
    const [companies, courses, template, settings] = await Promise.all([
      Company.find().lean(),
      Course.find().lean(),
      CertificateTemplate.findOne({ isActive: true }).lean(),
      Setting.find().lean()
    ]);

    const settingsMap = {};
    (settings || []).forEach(s => {
      if (s.key) settingsMap[s.key] = s.value;
    });

    cachedMeta = {
      companies: companies || [],
      courses: courses || [],
      template: template || null,
      settings: settingsMap
    };
    lastFetchTime = now;
  } catch (err) {
    console.error('[Metadata Cache Error]:', err);
    if (!cachedMeta) {
      cachedMeta = { companies: [], courses: [], template: null, settings: {} };
    }
  }

  return cachedMeta;
};

const invalidateMetadataCache = () => {
  cachedMeta = null;
  lastFetchTime = 0;
};

const findCompanyByName = (companies, name) => {
  if (!name || !companies || !companies.length) return companies?.[0] || null;
  const clean = name.trim().toLowerCase();
  return (
    companies.find(c => c.name && c.name.trim().toLowerCase() === clean) ||
    companies.find(c => c.name && c.name.toLowerCase().includes(clean)) ||
    companies[0]
  );
};

const findCourseByName = (courses, name) => {
  if (!name || !courses || !courses.length) return null;
  const clean = name.trim().toLowerCase();
  return (
    courses.find(c => c.name && c.name.trim().toLowerCase() === clean) ||
    courses.find(c => c.name && c.name.toLowerCase().includes(clean)) ||
    null
  );
};

module.exports = {
  getMetadata,
  invalidateMetadataCache,
  findCompanyByName,
  findCourseByName
};
