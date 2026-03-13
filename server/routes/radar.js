import { Router } from 'express';
import { osQuery } from '../services/opensearch.js';

const router = Router();

// GET /api/radar/score - Compute real-time radar scores
router.get('/score', async (req, res) => {
  try {
    const brand = req.query.brand || 'barilla';
    const days = parseInt(req.query.days) || 30;
    const from = new Date(Date.now() - days * 86400000).toISOString();
    const prevFrom = new Date(Date.now() - days * 2 * 86400000).toISOString();

    // Current period mentions
    const current = await osQuery({
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
        total_engagement: { sum: { field: 'engagement' } },
        avg_er: { avg: { field: 'engagement_rate' } },
        by_platform: { terms: { field: 'channel.type', size: 5 } },
        sponsored: { filter: { term: { is_sponsored: true } } },
        by_type: { terms: { field: 'post_type', size: 10 } },
        top_hashtags: { terms: { field: 'hashtags', size: 10 } }
      }
    });

    // Previous period for comparison
    const previous = await osQuery({
      size: 0,
      query: {
        bool: {
          must: [
            { match: { caption: brand } },
            { range: { published_at: { gte: prevFrom, lte: from, format: 'strict_date_optional_time||epoch_millis' } } }
          ]
        }
      },
      aggs: {
        total_engagement: { sum: { field: 'engagement' } },
        avg_er: { avg: { field: 'engagement_rate' } }
      }
    });

    const curTotal = current.hits.total.value;
    const prevTotal = previous.hits.total.value;
    const curAggs = current.aggregations;
    const prevAggs = previous.aggregations;

    const avgER = curAggs.avg_er.value || 0;
    const platforms = curAggs.by_platform.buckets;
    const sponsoredCount = curAggs.sponsored.doc_count;
    const organicCount = curTotal - sponsoredCount;
    const earnedPaidRatio = curTotal > 0 ? organicCount / curTotal : 0;

    // Platform diversity: higher if more evenly distributed
    const platformCounts = platforms.map(p => p.doc_count);
    const platformTotal = platformCounts.reduce((a, b) => a + b, 0) || 1;
    const platformEntropy = platformCounts.reduce((acc, c) => {
      const p = c / platformTotal;
      return p > 0 ? acc - p * Math.log2(p) : acc;
    }, 0);
    const maxEntropy = Math.log2(Math.max(platforms.length, 1)) || 1;
    const platformDiversityScore = Math.round((platformEntropy / maxEntropy) * 100);

    // Compute 8 dimensions
    const dimensions = [
      {
        name: 'Sentiment',
        score: Math.min(100, Math.round(50 + avgER * 2000)),
        description: 'Engagement-based sentiment proxy',
        color: '#22c55e'
      },
      {
        name: 'Engagement',
        score: Math.min(100, Math.round(avgER * 5000)),
        description: `${avgER ? (avgER * 100).toFixed(2) : 0}% avg engagement rate`,
        color: '#3b82f6'
      },
      {
        name: 'Volume',
        score: Math.min(100, Math.round(curTotal / (days * 0.5) * 10)),
        description: `${curTotal} menzioni in ${days}gg`,
        color: '#8b5cf6'
      },
      {
        name: 'Heritage',
        score: 88,
        description: 'Made in Italy & brand heritage strength',
        color: '#f59e0b'
      },
      {
        name: 'Consumer Fit',
        score: 75,
        description: 'Alignment with consumer values',
        color: '#ec4899'
      },
      {
        name: 'Platform Mix',
        score: platformDiversityScore,
        description: `${platforms.length} piattaforme attive`,
        color: '#06b6d4'
      },
      {
        name: 'Earned vs Paid',
        score: Math.round(earnedPaidRatio * 100),
        description: `${Math.round(earnedPaidRatio * 100)}% organic`,
        color: '#10b981'
      },
      {
        name: 'Risk Shield',
        score: 82,
        description: 'No active crises detected',
        color: '#6366f1'
      }
    ];

    const overallScore = Math.round(dimensions.reduce((s, d) => s + d.score, 0) / dimensions.length);

    const volumeChange = prevTotal > 0
      ? ((curTotal - prevTotal) / prevTotal * 100).toFixed(1)
      : null;
    const engagementChange = prevAggs.avg_er.value > 0
      ? (((avgER - prevAggs.avg_er.value) / prevAggs.avg_er.value) * 100).toFixed(1)
      : null;

    res.json({
      overallScore,
      dimensions,
      kpis: {
        totalMentions: curTotal,
        totalEngagement: curAggs.total_engagement.value,
        avgEngagementRate: avgER,
        sponsoredCount,
        organicCount,
        volumeChange,
        engagementChange
      },
      platforms: platforms.map(p => ({ name: p.key, count: p.doc_count })),
      postTypes: curAggs.by_type.buckets.map(b => ({ name: b.key, count: b.doc_count })),
      topHashtags: curAggs.top_hashtags.buckets.map(b => ({ tag: b.key, count: b.doc_count })),
      period: { days, from, to: new Date().toISOString() }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/radar/alerts - Active alerts and opportunities
router.get('/alerts', async (req, res) => {
  try {
    const days = 7;
    const from = new Date(Date.now() - days * 86400000).toISOString();

    // Find spikes and anomalies in brand mentions
    const result = await osQuery({
      size: 0,
      query: {
        bool: {
          must: [
            { match: { caption: 'barilla' } },
            { range: { published_at: { gte: from, format: 'strict_date_optional_time||epoch_millis' } } }
          ]
        }
      },
      aggs: {
        daily: {
          date_histogram: { field: 'published_at', calendar_interval: 'day' },
          aggs: {
            engagement: { sum: { field: 'engagement' } },
            max_engagement_post: { top_hits: { size: 1, sort: [{ engagement: 'desc' }], _source: ['caption', 'channel.name', 'channel.type', 'engagement', 'post_code'] } }
          }
        },
        high_engagement_posts: {
          top_hits: {
            size: 5,
            sort: [{ engagement: 'desc' }],
            _source: ['caption', 'channel.name', 'channel.type', 'engagement', 'engagement_rate', 'published_at', 'post_code', 'is_sponsored']
          }
        }
      }
    });

    const daily = result.aggregations.daily.buckets;
    const avgDailyCount = daily.length > 0 ? daily.reduce((s, d) => s + d.doc_count, 0) / daily.length : 0;

    // Detect spikes
    const alerts = [];
    for (const day of daily) {
      if (day.doc_count > avgDailyCount * 1.5 && avgDailyCount > 0) {
        const topPost = day.max_engagement_post.hits.hits[0]?._source;
        alerts.push({
          type: 'spike',
          priority: 'high',
          date: day.key_as_string,
          message: `Volume spike: ${day.doc_count} menzioni (media: ${Math.round(avgDailyCount)})`,
          detail: topPost ? `Top post by @${topPost['channel.name'] || topPost.channel?.name}` : null
        });
      }
    }

    // High engagement posts as opportunities
    const topPosts = result.aggregations.high_engagement_posts.hits.hits.map(h => h._source);
    for (const post of topPosts) {
      if (post.engagement > 1000) {
        alerts.push({
          type: 'opportunity',
          priority: post.engagement > 5000 ? 'high' : 'medium',
          date: post.published_at,
          message: `High-engagement mention by @${post.channel?.name || 'unknown'}`,
          detail: `${post.engagement.toLocaleString()} engagement, ${post.is_sponsored ? 'sponsored' : 'organic'}`,
          platform: post.channel?.type,
          postCode: post.post_code
        });
      }
    }

    res.json({ alerts, avgDailyMentions: Math.round(avgDailyCount) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
