/**
 * @class PaymentHistoryEntity
 * @description Records a payment transaction for an SPPT.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-03
 */
class PaymentHistoryEntity {
  /**
   * @param {object} params
   * @param {string} params.id - Unique identifier for the payment record.
   * @param {string} params.spptId - The ID of the SPPT this payment is for.
   * @param {string} params.paymentDate - ISO 8601 date of the payment.
   * @param {number} params.paymentAmount - The amount paid.
   * @param {string} params.paymentMethod - Method of payment (e.g., 'BANK_TRANSFER', 'CASH', 'E_WALLET').
   * @param {string} params.status - Status of the payment (e.g., 'SUCCESS', 'FAILED', 'PENDING').
   * @param {string} [params.transactionId] - Optional transaction ID from payment gateway.
   * @param {string} params.createdAt - ISO 8601 timestamp.
   */
  constructor({
    id,
    spptId,
    paymentDate,
    paymentAmount,
    paymentMethod,
    status,
    transactionId,
    createdAt
  }) {
    this.id = id;
    this.spptId = spptId;
    this.paymentDate = paymentDate;
    this.paymentAmount = paymentAmount;
    this.paymentMethod = paymentMethod;
    this.status = status;
    this.transactionId = transactionId || null;
    this.createdAt = createdAt;
  }
}