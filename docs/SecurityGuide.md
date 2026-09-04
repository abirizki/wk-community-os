# Governance Security Guide

This guide focuses on the security features provided by the `Governance` package. For general application security, please refer to the main `030_SECURITY_GUIDE.md`.

---

## 1. Security Monitoring

The `SecurityMonitoringService` provides real-time detection of potentially malicious activities by subscribing to key events on the `EventBus`.

### Key Monitored Events:

*   **`Auth.Login.Failed`:**
    *   **Detection:** Tracks the number of failed login attempts from a single IP address within a specific timeframe (e.g., 1 hour).
    *   **Action:** If the number of attempts exceeds a predefined threshold (e.g., 5 attempts), a `CRITICAL` priority notification is sent to the administrator role, alerting them to a potential brute-force attack.

*   **`Permission.Changed` / `User.Role.Changed`:**
    *   **Detection:** Listens for any changes to a user's role or a role's permissions.
    *   **Action:** Logs a high-priority warning message. In a future release, this could trigger an immediate email notification to an administrator or require a secondary approval for such changes.

## 2. Access Reviews

The `AccessReviewService` provides tools for periodic auditing of user permissions.

*   **`generateFullReport()`:** This method generates a comprehensive report detailing every user, their assigned role, and all permissions granted to that role. This report is essential for quarterly or annual access reviews.
*   **Usage:** An administrator can run this service and export the resulting JSON or have it formatted into a Google Sheet for review by management or external auditors.

## 3. Risk Management

The `RiskAssessmentService` provides a simple, built-in risk register to track operational and security risks. Administrators should use this service to document identified risks and their mitigation plans, allowing for proactive governance rather than reactive fixes.