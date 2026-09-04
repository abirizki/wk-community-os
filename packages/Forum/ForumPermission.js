/**
 * @file ForumPermission.js
 * @description Defines and enforces Role-Based Access Control (RBAC) permissions for the Forum module.
 */

class ForumPermission {
  /**
   * @param {object} [security=null] - Security service instance.
   */
  constructor(security = null) {
    /** @private */
    this.security = security || (typeof WK !== 'undefined' && typeof WK.security === 'function' ? WK.security() : null);
  }

  /**
   * Checks if the active user possesses the given permission. Throws an Error if denied.
   * @param {string} permission - The permission string to verify.
   * @throws {Error} If permission is denied.
   */
  check(permission) {
    if (this.security && typeof this.security.checkPermission === 'function') {
      try {
        this.security.checkPermission(permission);
      } catch (e) {
        throw new Error(`Forum Permission denied for '${permission}': ${e.message}`);
      }
    }
  }

  /**
   * Verifies if the active user possesses the given permission without throwing.
   * @param {string} permission - The permission string to verify.
   * @returns {boolean}
   */
  has(permission) {
    if (this.security && typeof this.security.hasPermission === 'function') {
      try {
        return this.security.hasPermission(permission);
      } catch (e) {
        return false;
      }
    }
    return true;
  }

  // --- Granular Permission Checks ---

  checkReadTopic() {
    this.check('forum.topic.read');
  }

  checkCreateTopic() {
    this.check('forum.topic.create');
  }

  checkUpdateTopicOwn() {
    this.check('forum.topic.update.own');
  }

  checkDeleteTopicOwn() {
    this.check('forum.topic.delete.own');
  }

  checkPinTopic() {
    this.check('forum.topic.pin');
  }

  checkLockTopic() {
    this.check('forum.topic.lock');
  }

  checkModerateTopic() {
    this.check('forum.topic.moderate');
  }

  checkCreateComment() {
    this.check('forum.comment.create');
  }

  checkCastVote() {
    this.check('forum.vote.cast');
  }

  /**
   * Returns metadata for all registered Forum permissions.
   * @returns {object[]}
   */
  static getPermissions() {
    return [
      { id: 'forum.topic.read', description: 'Read and browse public forum topics' },
      { id: 'forum.topic.create', description: 'Create a new discussion topic in the forum' },
      { id: 'forum.topic.update.own', description: 'Edit own forum topic content' },
      { id: 'forum.topic.delete.own', description: 'Delete own forum topic' },
      { id: 'forum.topic.pin', description: 'Pin a topic to the top of the forum (RT/RW/Admin)' },
      { id: 'forum.topic.lock', description: 'Lock a topic from receiving new comments' },
      { id: 'forum.topic.moderate', description: 'Moderate, hide, or restore forum topics and comments' },
      { id: 'forum.comment.create', description: 'Post a comment on an active forum topic' },
      { id: 'forum.comment.delete.own', description: 'Delete own posted comment' },
      { id: 'forum.comment.moderate', description: 'Moderate or hide abusive comments' },
      { id: 'forum.vote.cast', description: 'Cast an upvote or downvote on a forum topic' },
      { id: 'forum.statistics.view', description: 'View forum analytics and citizen participation stats' },
    ];
  }
}

module.exports = ForumPermission;

