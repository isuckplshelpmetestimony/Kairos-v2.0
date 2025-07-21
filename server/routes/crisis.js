import sql from '../database/connection.js';
import { requireAuth, requirePremium } from '../middleware/auth.js';
import express from 'express';
const router = express.Router();

// GET /api/crisis/companies
router.get('/companies', requireAuth, requirePremium, async (req, res) => {
  try {
    const {
      industry,
      crisis_category,
      crisis_score_min = 1,
      crisis_score_max = 10,
      limit = 20,
      offset = 0,
      sort_by = 'crisis_score',
      sort_order = 'desc'
    } = req.query;

    // Build WHERE clause dynamically
    let whereConditions = ['is_active = true'];
    let queryParams = [];

    if (industry) {
      const industries = Array.isArray(industry) ? industry : [industry];
      whereConditions.push(`industry_sector = ANY($${queryParams.length + 1})`);
      queryParams.push(industries);
    }

    if (crisis_category) {
      const categories = Array.isArray(crisis_category) ? crisis_category : [crisis_category];
      whereConditions.push(`crisis_category = ANY($${queryParams.length + 1})`);
      queryParams.push(categories);
    }

    whereConditions.push(`crisis_score >= $${queryParams.length + 1}`);
    queryParams.push(parseInt(crisis_score_min));

    whereConditions.push(`crisis_score <= $${queryParams.length + 1}`);
    queryParams.push(parseInt(crisis_score_max));

    const whereClause = whereConditions.join(' AND ');

    // Validate sort parameters
    const validSortColumns = ['crisis_score', 'last_intelligence_update', 'company_name'];
    const validSortOrders = ['asc', 'desc'];

    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'crisis_score';
    const sortDirection = validSortOrders.includes(sort_order) ? sort_order : 'desc';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM crisis_companies WHERE ${whereClause}`;
    const countResult = await sql(countQuery, queryParams);
    const totalCount = parseInt(countResult[0].total);

    // Get companies with pagination
    const companiesQuery = `
      SELECT
        cc.*,
        (
          SELECT json_agg(cs.signal_title ORDER BY cs.confidence_score DESC)
          FROM crisis_signals cs
          WHERE cs.company_id = cc.id
          LIMIT 3
        ) as primary_crisis_signals,
        (
          SELECT COUNT(*)
          FROM company_decision_makers cdm
          WHERE cdm.company_id = cc.id
        ) as decision_maker_count
      FROM crisis_companies cc
      WHERE ${whereClause}
      ORDER BY ${sortColumn} ${sortDirection}
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;

    queryParams.push(parseInt(limit), parseInt(offset));
    const companies = await sql(companiesQuery, queryParams);

    res.json({
      companies,
      total_count: totalCount,
      has_more: (parseInt(offset) + parseInt(limit)) < totalCount,
      filters_applied: {
        industry: industry || null,
        crisis_category: crisis_category || null,
        score_range: [parseInt(crisis_score_min), parseInt(crisis_score_max)]
      }
    });

  } catch (error) {
    console.error('Error fetching crisis companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// GET /api/crisis/companies/:id
router.get('/companies/:id', requireAuth, requirePremium, async (req, res) => {
  try {
    const companyId = parseInt(req.params.id);

    // Get company details
    const companyQuery = `
      SELECT * FROM crisis_companies
      WHERE id = $1 AND is_active = true
    `;
    const companyResult = await sql(companyQuery, [companyId]);

    if (companyResult.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const company = companyResult[0];

    // Get crisis signals
    const signalsQuery = `
      SELECT * FROM crisis_signals
      WHERE company_id = $1
      ORDER BY signal_date DESC, confidence_score DESC
    `;
    const signals = await sql(signalsQuery, [companyId]);

    // Get decision makers
    const contactsQuery = `
      SELECT * FROM company_decision_makers
      WHERE company_id = $1
      ORDER BY decision_authority_level DESC, transformation_influence_score DESC
    `;
    const decisionMakers = await sql(contactsQuery, [companyId]);

    // Build crisis timeline
    const timelineQuery = `
      SELECT
        signal_date as date,
        json_agg(signal_title ORDER BY confidence_score DESC) as events,
        COUNT(*) as event_count
      FROM crisis_signals
      WHERE company_id = $1
      GROUP BY signal_date
      ORDER BY signal_date DESC
      LIMIT 10
    `;
    const timelineResult = await sql(timelineQuery, [companyId]);

    const crisisTimeline = timelineResult.map(row => ({
      date: row.date,
      events: row.events,
      crisis_score_change: Math.floor(Math.random() * 5) - 2 // TODO: Calculate actual score change
    }));

    res.json({
      company,
      crisis_signals: signals,
      decision_makers: decisionMakers,
      crisis_timeline: crisisTimeline
    });

  } catch (error) {
    console.error('Error fetching company details:', error);
    res.status(500).json({ error: 'Failed to fetch company details' });
  }
});

export default router; 