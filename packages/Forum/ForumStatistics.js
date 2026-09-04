/**
 * @file ForumStatistics.js
 * @description Provides aggregated statistical and analytical metrics for the Forum package.
 */

// Import or fallback to ForumConstants
let ForumConstants;
try {
  ({ ForumConstants } = require('./ForumEntity.js'));
} catch (e) {
  ForumConstants = {
    CATEGORIES: ['INFRASTRUKTUR', 'LINGKUNGAN', 'KEAMANAN', 'KEGIATAN_WARGA', 'UMUM', 'ASPIRASI_MUSRENBANG'],
    STATUSES: ['DRAFT', 'PUBLISHED', 'LOCKED', 'ARCHIVED', 'HIDDEN'],
  };
}

class ForumStatistics {
  /**
   * @param {ForumRepository} repository
   * @param {object} analyticsService
   */
  constructor(repository, analyticsService) {
    /** @private */
    this.repository = repository;
    /** @private */
    this.analyticsService = analyticsService;
    /** @private */
    this.cache = typeof WK !== 'undefined' && typeof WK.cache === 'function' ? WK.cache('forum_stats') : null;
    /** @private */
    this.logger = typeof WK !== 'undefined' && typeof WK.logger === 'function' ? WK.logger('ForumStatistics') : console;
    /** @private */
    this.defaultCacheTTL = 300; // 5 minutes cache for forum metrics
  }

  /**
   * Retrieves high-level operational summary metrics for forum discussions.
   * @param {object} [filters={}] - Query filters.
   * @returns {object}
   */
  getSummary(filters = {}) {
    if (typeof WK !== 'undefined' && typeof WK.security === 'function') {
      WK.security().checkPermission('forum.statistics.view');
    }

    const cacheKey = `summary_${JSON.stringify(filters)}`;
    if (this.cache && typeof this.cache.get === 'function') {
      const cached = this.cache.get(cacheKey);
      if (cached) return cached;
    }

    const topics = this.repository.searchTopics(filters) || [];

    const summary = {
      totalTopics: topics.length,
      publishedTopics: topics.filter(t => t.status === 'PUBLISHED').length,
      lockedTopics: topics.filter(t => t.status === 'LOCKED').length,
      archivedTopics: topics.filter(t => t.status === 'ARCHIVED').length,
      hiddenTopics: topics.filter(t => t.status === 'HIDDEN').length,
      pinnedTopics: topics.filter(t => !!t.isPinned).length,
      totalComments: topics.reduce((sum, t) => sum + (Number(t.commentCount) || 0), 0),
      totalUpvotes: topics.reduce((sum, t) => sum + (Number(t.upvotes) || 0), 0),
      totalDownvotes: topics.reduce((sum, t) => sum + (Number(t.downvotes) || 0), 0),
      totalViews: topics.reduce((sum, t) => sum + (Number(t.viewCount) || 0), 0),
    };

    if (this.cache && typeof this.cache.set === 'function') {
      this.cache.set(cacheKey, summary, this.defaultCacheTTL);
    }

    return summary;
  }

  /**
   * Calculates the distribution of topics by category.
   * @param {object} [filters={}] - Query filters.
   * @returns {object[]}
   */
  getCategoryDistribution(filters = {}) {
    if (typeof WK !== 'undefined' && typeof WK.security === 'function') {
      WK.security().checkPermission('forum.statistics.view');
    }

    const cacheKey = `cat_dist_${JSON.stringify(filters)}`;
    if (this.cache && typeof this.cache.get === 'function') {
      const cached = this.cache.get(cacheKey);
      if (cached) return cached;
    }

    const topics = this.repository.searchTopics(filters) || [];
    const categories = (ForumConstants && ForumConstants.CATEGORIES) || [];

    const distribution = categories.map(category => {
      const count = topics.filter(t => t.category === category).length;
      return {
        name: this._formatLabel(category),
        code: category,
        value: count,
      };
    });

    if (this.cache && typeof this.cache.set === 'function') {
      this.cache.set(cacheKey, distribution, this.defaultCacheTTL);
    }

    return distribution;
  }

  /**
   * Calculates the distribution of topics by lifecycle status.
   * @param {object} [filters={}] - Query filters.
   * @returns {object[]}
   */
  getStatusDistribution(filters = {}) {
    if (typeof WK !== 'undefined' && typeof WK.security === 'function') {
      WK.security().checkPermission('forum.statistics.view');
    }

    const topics = this.repository.searchTopics(filters) || [];
    const statuses = (ForumConstants && ForumConstants.STATUSES) || [];

    return statuses.map(status => ({
      name: this._formatLabel(status),
      code: status,
      value: topics.filter(t => t.status === status).length,
    }));
  }

  /**
   * Retrieves top topics sorted by highest engagement score.
   * @param {number} [limit=5] - Number of topics to return.
   * @param {object} [filters={}] - Query filters.
   * @returns {object[]}
   */
  getTopTopics(limit = 5, filters = {}) {
    if (typeof WK !== 'undefined' && typeof WK.security === 'function') {
      WK.security().checkPermission('forum.statistics.view');
    }

    const topics = this.repository.searchTopics(filters) || [];

    const scoredTopics = topics.map(t => {
      const upvotes = Number(t.upvotes) || 0;
      const comments = Number(t.commentCount) || 0;
      const views = Number(t.viewCount) || 0;
      // Engagement formula: 3 points per comment, 2 points per upvote, 1 point per 10 views
      const score = (comments * 3) + (upvotes * 2) + Math.floor(views / 10);

      return {
        id: t.id,
        title: t.title,
        category: t.category,
        status: t.status,
        upvotes: upvotes,
        commentCount: comments,
        viewCount: views,
        score: score,
        createdAt: t.createdAt,
      };
    });

    return scoredTopics
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Retrieves most recent discussion topics.
   * @param {number} [limit=5] - Number of topics to return.
   * @param {object} [filters={}] - Query filters.
   * @returns {object[]}
   */
  getRecentTopics(limit = 5, filters = {}) {
    if (typeof WK !== 'undefined' && typeof WK.security === 'function') {
      WK.security().checkPermission('forum.statistics.view');
    }

    const topics = this.repository.searchTopics(filters) || [];

    return topics
      .slice()
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, limit)
      .map(t => ({
        id: t.id,
        title: t.title,
        category: t.category,
        status: t.status,
        commentCount: t.commentCount || 0,
        createdAt: t.createdAt,
      }));
  }

  /**
   * Retrieves engagement and topic creation trends from the Analytics Service.
   * @param {object} [filters={}] - Query filters.
   * @returns {object} Time series chart data.
   */
  getEngagementTrend(filters = {}) {
    if (typeof WK !== 'undefined' && typeof WK.security === 'function') {
      WK.security().checkPermission('forum.statistics.view');
    }

    if (this.analyticsService && typeof this.analyticsService.getTimeSeries === 'function') {
      return this.analyticsService.getTimeSeries({
        metric: 'forum_topic_created',
        aggregation: 'count',
        period: 'monthly',
        dateRange: filters.dateRange || 'last_12_months',
        filters: filters,
      });
    }

    return { success: true, data: [] };
  }

  /**
   * Converts CONSTANT string to readable title.
   * @private
   */
  _formatLabel(str) {
    if (!str) return '';
    return str.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}

module.exports = ForumStatistics;

