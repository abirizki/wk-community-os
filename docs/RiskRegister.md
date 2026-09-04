# Pilot Risk Register

This document tracks potential risks to the pilot program, their impact, and mitigation strategies.

---

| ID | Risk Description | Likelihood (1-5) | Impact (1-5) | Owner | Mitigation Strategy | Status |
|----|------------------|------------------|--------------|-------|---------------------|--------|
| R01 | Low user adoption or resistance to change from pilot users. | 3 | 5 | Project Manager | Conduct thorough, hands-on training. Emphasize "what's in it for me" for each role. Provide dedicated, high-touch support during the first week. | Open |
| R02 | Critical bug discovered in a core workflow (e.g., Letter generation). | 2 | 5 | Tech Lead | Have development team on standby for rapid hotfixes. Prepare and test the `RollbackPlan.md`. | Open |
| R03 | Performance issues due to Google Apps Script quotas being hit. | 3 | 4 | Tech Lead | Monitor execution logs daily. Link a GCP project to the Apps Script project to be ready to increase quotas if needed. | Open |
| R04 | Internet connectivity issues at the Kelurahan or for RT/RW users. | 4 | 3 | Project Manager | This is an external factor. The system's web-based nature is a known dependency. Ensure users have alternative access methods (e.g., mobile data). | Open |
| R05 | Demo data is found to be unrealistic or insufficient for testing. | 2 | 3 | Data Analyst | Review the generated data with a Kelurahan staff member before the pilot begins. Be prepared to run the seeder again with adjustments. | Open |
| R06 | Negative feedback on user interface (UI/UX) is overwhelmingly high. | 3 | 4 | Product Owner | Collect specific, actionable feedback. While a full UI redesign is out of scope, identify "quick win" improvements for the go-live version. | Open |