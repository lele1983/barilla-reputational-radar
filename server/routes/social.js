import { Router } from 'express';
import { osQuery, osCount } from '../services/opensearch.js';

const router = Router();

// GET /api/social/overview - General social overview (total posts, platforms, engagement)
router.get('/overview', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const now = new Date();
    const from = new Date(now - days * 86400000).toISOString();

    const result = await osQuery({
      size: 0,
      query: {
        range: { published_at: { gte: from, format: 'strict_date_optional_time||epoch_millis' } }
      },
      aggs: {
        platforms: { terms: { field: 'channel.type', size: 10 } },
        post_types: { terms: { field: 'post_type', size: 10 } },
        total_engagement: { sum: { field: 'engagement' } },
        avg_engagement_rate: { avg: { field: 'engagement_rate' } },
        daily_volume: {
          date_histogram: { field: 'published_at', calendar_interval: 'day' },
          aggs: {
            by_platform: { terms: { field: 'channel.type', size: 5 } },
            engagement: { sum: { field: 'engagement' } }
          }
        }
      }
    });

    const aggs = result.aggregations;
    res.json({
      totalPosts: result.hits.total.value,
      platforms: aggs.platforms.buckets.map(b => ({ name: b.key, count: b.doc_count })),
      postTypes: aggs.post_types.buckets.map(b => ({ name: b.key, count: b.doc_count })),
      totalEngagement: aggs.total_engagement.value,
      avgEngagementRate: aggs.avg_engagement_rate.value,
      dailyVolume: aggs.daily_volume.buckets.map(b => ({
        date: b.key_as_string,
        count: b.doc_count,
        engagement: b.engagement.value,
        platforms: b.by_platform.buckets.map(p => ({ name: p.key, count: p.doc_count }))
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/social/mentions?brand=barilla&days=30 - Brand mentions
router.get('/mentions', async (req, res) => {
  try {
    const brand = req.query.brand || 'barilla';
    const days = parseInt(req.query.days) || 30;
    const from = new Date(Date.now() - days * 86400000).toISOString();

    const result = await osQuery({
      size: 50,
      query: {
        bool: {
          must: [
            {
              bool: {
                should: [
                  { match: { caption: brand } },
                  { match: { 'mentions.name': brand === 'barilla' ? 'barillaitalia' : brand } },
                  { match: { 'sponsored_mentions.name': brand === 'barilla' ? 'barillaitalia' : brand } }
                ]
              }
            },
            { range: { published_at: { gte: from, format: 'strict_date_optional_time||epoch_millis' } } }
          ]
        }
      },
      sort: [{ engagement: { order: 'desc' } }],
      aggs: {
        by_platform: { terms: { field: 'channel.type', size: 5 } },
        by_type: { terms: { field: 'post_type', size: 10 } },
        sponsored_count: { filter: { term: { is_sponsored: true } } },
        daily_trend: {
          date_histogram: { field: 'published_at', calendar_interval: 'day' },
          aggs: { engagement: { sum: { field: 'engagement' } } }
        },
        top_hashtags: { terms: { field: 'hashtags', size: 20 } },
        avg_engagement: { avg: { field: 'engagement' } },
        avg_engagement_rate: { avg: { field: 'engagement_rate' } },
        total_engagement: { sum: { field: 'engagement' } }
      }
    });

    const mentions = result.hits.hits.map(h => ({
      id: h._id,
      ...h._source,
      // Flatten for frontend
      platform: h._source.channel?.type,
      channelName: h._source.channel?.name,
    }));

    const aggs = result.aggregations;
    res.json({
      total: result.hits.total.value,
      mentions,
      byPlatform: aggs.by_platform.buckets.map(b => ({ name: b.key, count: b.doc_count })),
      byType: aggs.by_type.buckets.map(b => ({ name: b.key, count: b.doc_count })),
      sponsoredCount: aggs.sponsored_count.doc_count,
      organicCount: result.hits.total.value - aggs.sponsored_count.doc_count,
      dailyTrend: aggs.daily_trend.buckets.map(b => ({
        date: b.key_as_string,
        count: b.doc_count,
        engagement: b.engagement.value
      })),
      topHashtags: aggs.top_hashtags.buckets.map(b => ({ tag: b.key, count: b.doc_count })),
      avgEngagement: aggs.avg_engagement.value,
      avgEngagementRate: aggs.avg_engagement_rate.value,
      totalEngagement: aggs.total_engagement.value
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/social/trending?days=7 - Trending topics/hashtags
router.get('/trending', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const from = new Date(Date.now() - days * 86400000).toISOString();

    const result = await osQuery({
      size: 0,
      query: {
        range: { published_at: { gte: from, format: 'strict_date_optional_time||epoch_millis' } }
      },
      aggs: {
        top_hashtags: {
          terms: { field: 'hashtags', size: 30 },
          aggs: { total_engagement: { sum: { field: 'engagement' } } }
        },
        top_creators: {
          terms: { field: 'channel.name', size: 20 },
          aggs: {
            total_engagement: { sum: { field: 'engagement' } },
            avg_engagement_rate: { avg: { field: 'engagement_rate' } },
            platform: { terms: { field: 'channel.type', size: 1 } },
            followers: { max: { field: 'followers' } }
          }
        }
      }
    });

    const aggs = result.aggregations;
    res.json({
      hashtags: aggs.top_hashtags.buckets.map(b => ({
        tag: b.key,
        count: b.doc_count,
        engagement: b.total_engagement.value
      })),
      creators: aggs.top_creators.buckets.map(b => ({
        name: b.key,
        posts: b.doc_count,
        engagement: b.total_engagement.value,
        avgEngagementRate: b.avg_engagement_rate.value,
        platform: b.platform.buckets[0]?.key,
        followers: b.followers.value
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/social/creators?days=30 - Top creators analysis
router.get('/creators', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const from = new Date(Date.now() - days * 86400000).toISOString();
    const topic = req.query.topic; // optional topic filter

    const must = [
      { range: { published_at: { gte: from, format: 'strict_date_optional_time||epoch_millis' } } }
    ];
    if (topic) must.push({ match: { caption: topic } });

    const result = await osQuery({
      size: 0,
      query: { bool: { must } },
      aggs: {
        top_creators: {
          terms: { field: 'channel.name', size: 30, order: { total_engagement: 'desc' } },
          aggs: {
            total_engagement: { sum: { field: 'engagement' } },
            avg_engagement: { avg: { field: 'engagement' } },
            avg_er: { avg: { field: 'engagement_rate' } },
            platform: { terms: { field: 'channel.type', size: 1 } },
            followers: { max: { field: 'followers' } },
            post_types: { terms: { field: 'post_type', size: 5 } },
            sponsored: { filter: { term: { is_sponsored: true } } }
          }
        }
      }
    });

    res.json({
      creators: result.aggregations.top_creators.buckets.map(b => ({
        name: b.key,
        posts: b.doc_count,
        totalEngagement: b.total_engagement.value,
        avgEngagement: b.avg_engagement.value,
        avgEngagementRate: b.avg_er.value,
        platform: b.platform.buckets[0]?.key,
        followers: b.followers.value,
        postTypes: b.post_types.buckets.map(p => ({ type: p.key, count: p.doc_count })),
        sponsoredPosts: b.sponsored.doc_count
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/social/sentiment?brand=barilla&days=30 - Sentiment proxy via engagement analysis
router.get('/sentiment', async (req, res) => {
  try {
    const brand = req.query.brand || 'barilla';
    const days = parseInt(req.query.days) || 30;
    const from = new Date(Date.now() - days * 86400000).toISOString();

    const result = await osQuery({
      size: 0,
      query: {
        bool: {
          must: [
            { match: { caption: brand } },
            { range: { published_at: { gte: from, format: 'strict_date_optional_time||epoch_millis' } } }
          ]
        }
      },
      aggs: {
        er_distribution: {
          histogram: { field: 'engagement_rate', interval: 0.01 }
        },
        high_engagement: {
          filter: { range: { engagement_rate: { gte: 0.02 } } }
        },
        weekly_trend: {
          date_histogram: { field: 'published_at', calendar_interval: 'week' },
          aggs: {
            avg_er: { avg: { field: 'engagement_rate' } },
            avg_engagement: { avg: { field: 'engagement' } },
            total_likes: { sum: { field: 'like_count' } },
            total_comments: { sum: { field: 'comment_count' } },
            total_shares: { sum: { field: 'share_count' } }
          }
        }
      }
    });

    const aggs = result.aggregations;
    res.json({
      total: result.hits.total.value,
      highEngagementPct: result.hits.total.value > 0
        ? (aggs.high_engagement.doc_count / result.hits.total.value * 100).toFixed(1)
        : 0,
      weeklyTrend: aggs.weekly_trend.buckets.map(b => ({
        week: b.key_as_string,
        posts: b.doc_count,
        avgEngagementRate: b.avg_er.value,
        avgEngagement: b.avg_engagement.value,
        likes: b.total_likes.value,
        comments: b.total_comments.value,
        shares: b.total_shares.value
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
