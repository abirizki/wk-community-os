# WK Community OS - UAT Scenarios

**Document ID:** UAT-02
**Version:** 1.0
**Date:** 2026-08-05

---

## Instructions

Please execute the following scenarios in order. For each step, verify that the "Expected Result" occurs. Mark the overall outcome for each scenario in your `UAT_ACCEPTANCE_CHECKLIST.md`.

---

### Scenario 1: Citizen Login and Profile Verification
*   **Actor:** Test Citizen

| Step | Action | Expected Result |
| :--- | :--- | :--- |
| 1 | Open the WK Community OS web application URL in your browser. | The login page is displayed. |
| 2 | Enter the username and password provided for the **Citizen** account. | You are successfully logged in and redirected to the Citizen Dashboard. |
| 3 | On the dashboard, look for your name in the top right corner. | Your name ("Test Citizen") is displayed correctly. |
| 4 | Find and click on the "My Profile" or "Profil Saya" menu item. | Your profile page is displayed, showing your NIK, address, and other details. |
| 5 | Review the information on the profile page. | All personal data is accurate and matches the information provided. |

---

### Scenario 2: Create a Letter Request
*   **Actor:** Test Citizen

| Step | Action | Expected Result |
| :--- | :--- | :--- |
| 1 | While logged in as the Citizen, navigate to "Layanan Surat" (Letter Service). | A list of available letter types is shown. |
| 2 | Click the "Request" button for "Surat Pengantar". | A form for the letter request is displayed. |
| 3 | Fill in the "Keperluan" (Purpose) field with: `UAT Test - Mengurus KTP`. | The text is entered correctly. |
| 4 | Click the "Submit" or "Ajukan" button. | A success message appears. You are redirected to your request list. |
| 5 | Find the new request in the list. | The request is listed with the status **PENDING_RT_APPROVAL**. |

---

### Scenario 3: Approve a Letter Request
*   **Actors:** Test RT Head, Test RW Head, Test Kelurahan Staff

| Step | Action | Expected Result |
| :--- | :--- | :--- |
| 1 | **(As RT)** Log out from the Citizen account and log in as the **RT Head**. | You are logged into the RT Dashboard. A new task or notification is visible. |
| 2 | Find the letter request from the Test Citizen and click "Approve". | The request status changes to **PENDING_RW_APPROVAL**. |
| 3 | **(As RW)** Log out and log in as the **RW Head**. | You are logged into the RW Dashboard. A new task or notification is visible. |
| 4 | Find the same letter request and click "Approve". | The request status changes to **PENDING_KELURAHAN_APPROVAL**. |
| 5 | **(As Kelurahan Staff)** Log out and log in as **Kelurahan Staff**. | You are logged into the Kelurahan Dashboard. The request is in your queue. |
| 6 | Find the request, assign a letter number, and click "Process & Complete". | The request status changes to **COMPLETED**. A link to download the PDF appears. |
| 7 | Click the download link. | A PDF file of the "Surat Pengantar" is downloaded and opens correctly. |

---

### Scenario 4: Submit and Process a Complaint
*   **Actors:** Test Citizen, Test Kelurahan Staff

| Step | Action | Expected Result |
| :--- | :--- | :--- |
| 1 | **(As Citizen)** Log in as the **Test Citizen**. | You are on the Citizen Dashboard. |
| 2 | Navigate to "Layanan Pengaduan" (Complaint Service) and create a new complaint. | The complaint submission form is displayed. |
| 3 | Enter the title `UAT Test - Jalan Rusak` and a description. | The text is entered correctly. |
| 4 | Submit the complaint. | The complaint appears in your list with the status **SUBMITTED**. |
| 5 | **(As Kelurahan Staff)** Log in as **Kelurahan Staff**. | You are on the Kelurahan Dashboard. |
| 6 | Find the new complaint and change its status to `IN_PROGRESS`. | The status is updated successfully. |
| 7 | Add a comment: `Tim akan melakukan survei lokasi.` and save. | The comment is added to the complaint's history. |
| 8 | Change the status to `RESOLVED`. | The status is updated successfully. |

---

### Scenario 5: Verify Notifications
*   **Actor:** Test Citizen

| Step | Action | Expected Result |
| :--- | :--- | :--- |
| 1 | Log in as the **Test Citizen**. | You are on the Citizen Dashboard. |
| 2 | Click on the notification bell icon or navigate to the Inbox. | A list of notifications is displayed. |
| 3 | Review the list of notifications. | You see notifications for each status change of your letter request (e.g., "Approved by RT", "Completed") and your complaint ("In Progress", "Resolved"). |

---

### Scenario 6: Verify Dashboard Analytics
*   **Actor:** Test Kelurahan Staff

| Step | Action | Expected Result |
| :--- | :--- | :--- |
| 1 | Log in as **Kelurahan Staff**. | You are on the Kelurahan Dashboard. |
| 2 | Look at the main scorecard widgets. | The "Letters Processed Today" count is at least 1. The "Open Complaints" count has changed appropriately based on your actions in Scenario 4. |
| 3 | Navigate to the "Analytics" or "Reports" section. | The analytics dashboard is displayed. |
| 4 | Find a report for "Letter Services". | The report shows at least one letter processed today, with a processing time that can be calculated. |