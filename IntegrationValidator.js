/**
 * @class IntegrationValidator
 * @description Provides validation logic for integration-related data.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class IntegrationValidator {
  constructor() {}

  /**
   * Validates the payload for sending an email.
   * @param {object} data
   * @param {string} data.recipient
   * @param {string} data.subject
   * @param {string} data.body
   * @throws {Error} If validation fails.
   */
  validateEmailPayload({ recipient, subject, body }) {
    if (!recipient || !recipient.includes('@')) {
      throw new Error('Invalid email recipient.');
    }
    if (!subject) {
      throw new Error('Email subject cannot be empty.');
    }
    if (!body) {
      throw new Error('Email body cannot be empty.');
    }
  }

  /**
   * Validates the payload for sending an SMS.
   * @param {object} data
   * @param {string} data.phoneNumber
   * @param {string} data.message
   * @throws {Error} If validation fails.
   */
  validateSmsPayload({ phoneNumber, message }) {
    if (!phoneNumber || !/^\+?[1-9]\d{1,14}$/.test(phoneNumber)) { // E.164 format check
      throw new Error('Invalid phone number format.');
    }
    if (!message) {
      throw new Error('SMS message cannot be empty.');
    }
  }
}