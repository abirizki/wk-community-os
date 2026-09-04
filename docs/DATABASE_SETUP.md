# WK Community OS - Database Setup Guide

**Document ID:** PROD-04
**Version:** 1.0
**Date:** 2026-08-04

---

## 1. Overview

The WK Community OS utilizes **Google Sheets** as its primary database. This approach leverages the Google Workspace environment and simplifies deployment. Each "table" in the database corresponds to a separate Google Sheet file stored in the administrator's Google Drive.

## 2. Setup Process

There is **no manual database setup required**. The database schema (i.e., the creation of all necessary Google Sheet files and their respective columns) is handled automatically by the application's migration service.

## 3. Execution

To create the database, the administrator must execute the `runAllMigrations` function from the Apps Script Editor after the initial deployment.

1.  Open the Apps Script project in the editor.
2.  From the function dropdown list, select `runAllMigrations`.
3.  Click the **Run** button.

The script will iterate through all enabled packages (`Citizen`, `Letter`, `Complaint`, etc.) and execute their migration files, creating the required Google Sheets in the root of the administrator's Google Drive.