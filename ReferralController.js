MASTER PROMPT — WK COMMUNITY OS
==========================================================
PRODUCTION SPRINT P8.3 — REFERRAL DATA LAYER
==========================================================

PROJECT
WK Community OS Enterprise Edition

MODE
Production Development

CURRENT DOMAIN
CommunityHealth

CURRENT PACKAGE
Referral

==========================================================
CURRENT STATUS
==========================================================

CORE LAYER:
COMPLETE

SERVICE LAYER:
COMPLETE

NEXT LAYER:
DATA LAYER

PREVIOUS PACKAGE:

MedicalRecord
Production Ready
Quality Gate PASS
16/16 TEST SUITES PASS

==========================================================
MISSION
==========================================================

Implement the DATA LAYER of the Referral package.

Generate ONLY:

packages/CommunityHealth/Referral/src/ReferralMigration.js

packages/CommunityHealth/Referral/src/ReferralSeeder.js

Use the existing WK:

Database

Migration

Seeder

Transaction

Configuration

MasterData

Logger

Versioning

Soft Delete

ID

Timestamp

contracts.

Do NOT redesign Framework/Core.

==========================================================
DO NOT MODIFY
==========================================================

Framework

Core

System

Citizen

Health

Posyandu

Mother

Pregnancy

ANC

Immunization

MedicalRecord

ReferralEntity.js

ReferralRepository.js

ReferralValidator.js

ReferralPermission.js

ReferralRule.js

ReferralService.js

ReferralController.js

Do not redesign completed layers.

==========================================================
MISSION PRINCIPLE
==========================================================

Referral Data Layer owns persistence infrastructure for
the Referral transaction only.

It MUST NOT become the owner of:

Citizen

HealthProfile

MedicalRecord

Mother

Pregnancy

ANC

Posyandu

Immunization

Provider

Facility

Medicine

==========================================================
PERSISTENCE MODEL
==========================================================

Migration schema MUST follow the actual completed:

ReferralEntity.js

ReferralRepository.js

ReferralValidator.js

ReferralRule.js

and existing WK database conventions.

Potential conceptual fields include:

id

citizenId

healthProfileId

referralNumber

referralType

referralStatus

priority

referralDate

sourceType

sourceId

destinationType

destinationId

destinationReference

reason

notes

referringProviderId

referringProviderType

receivingProviderId

receivingProviderType

followUpDate

followUpStatus

followUpNotes

completedAt

completedBy

cancelledAt

cancelledBy

createdAt

updatedAt

createdBy

updatedBy

deletedAt

deletedBy

version

IMPORTANT:

These are conceptual only.

DO NOT blindly create these fields.

Inspect the actual Entity and Repository implementation
and use the actual schema contract.

==========================================================
REFERENCE STRATEGY
==========================================================

If existing WK architecture uses:

Foreign Keys

use the established convention.

If existing architecture uses reference IDs without
database-level FK:

follow that convention.

DO NOT introduce a new relationship architecture.

==========================================================
CITIZEN RELATIONSHIP
==========================================================

Referral MUST reference an existing Citizen.

If database-level FK is supported consistently by WK:

use it.

Otherwise:

citizenId remains a validated application-level
reference.

Do not modify Citizen schema.

==========================================================
HEALTH PROFILE
==========================================================

If healthProfileId exists in the actual Entity:

follow the existing Health package reference convention.

Do not create HealthProfile tables.

Do not create duplicate health data.

==========================================================
SOURCE CONTEXT
==========================================================

Referral source is potentially polymorphic.

Examples:

MedicalRecord

Posyandu

Mother

Pregnancy

ANC

Immunization

Other configured context.

Do NOT create one FK column for every possible source
package unless the existing architecture explicitly
requires it.

Prefer existing polymorphic reference conventions.

==========================================================
DESTINATION
==========================================================

Destination may reference:

Provider

Facility

Clinic

Puskesmas

Hospital

Laboratory

Other configured destination.

Do NOT create Provider or Facility master tables here.

==========================================================
REFERRAL NUMBER
==========================================================

If actual ReferralEntity contains referralNumber:

support the existing sequence/number convention.

Do NOT create another sequence generator.

If number generation is application-level:

migration MUST NOT introduce a competing sequence system.

==========================================================
REFERRAL TYPE
==========================================================

Use actual MasterData.

Potential conceptual values:

Internal

External

Emergency

Specialist

FollowUp

Diagnostic

Other

Do NOT duplicate globally managed MasterData.

==========================================================
REFERRAL STATUS
==========================================================

Use actual configured status values.

Potential:

Draft

Pending

Accepted

InProgress

Completed

Rejected

Cancelled

Expired

Do NOT create duplicate status configuration if global
MasterData already owns it.

==========================================================
PRIORITY
==========================================================

If priority is persisted:

use actual configured values.

Potential:

Normal

Urgent

Emergency

Do NOT create clinical triage logic.

==========================================================
SENSITIVE FIELDS
==========================================================

Potential sensitive fields:

reason

notes

source context

destination context

provider references

followUpNotes

These fields MUST follow existing database and privacy
conventions.

Do not:

Log values

Seed values

Expose values through migration errors.

==========================================================
TEXT FIELD TYPES
==========================================================

Use actual WK database conventions.

Do NOT blindly use:

VARCHAR(255)

for potentially long fields.

Do not use unlimited storage unless existing WK schema
conventions permit it.

==========================================================
INDEXES
==========================================================

Indexes MUST be based on actual Repository queries.

Potential indexes:

citizenId

healthProfileId

referralNumber

referralStatus

referralType

priority

referralDate

sourceType

sourceId

destinationType

destinationId

followUpDate

followUpStatus

createdAt

updatedAt

deletedAt

IMPORTANT:

Only create indexes actually justified by repository
access patterns.

Avoid excessive indexes.

Do NOT index sensitive long-text fields such as:

reason

notes

followUpNotes

unless actual query requirements and database support
justify it.

==========================================================
SOFT DELETE
==========================================================

Use existing WK soft-delete convention:

deletedAt

deletedBy

Normal Repository queries must exclude deleted records.

Migration MUST support actual Repository behavior.

==========================================================
VERSIONING
==========================================================

Use existing:

version

optimistic concurrency

Do not create another version mechanism.

==========================================================
TIMESTAMPS
==========================================================

Use existing WK convention:

createdAt

updatedAt

createdBy

updatedBy

Do not create custom timestamp handling.

==========================================================
MIGRATION CONTRACT
==========================================================

Follow actual WK Migration framework.

Implement appropriate equivalents of:

up()

down()

validate()

rollback()

getVersion()

isCompatible()

If actual Framework uses different names:

USE THE ACTUAL CONTRACT.

Do not invent a new migration API.

==========================================================
MIGRATION SAFETY
==========================================================

Migration MUST be:

Idempotent

Repeatable

Rollback-safe

Environment-aware

Production-safe

Non-destructive

Migration MUST NOT:

Drop Citizen schema

Drop Health schema

Drop MedicalRecord schema

Drop Posyandu schema

Drop Mother schema

Drop Pregnancy schema

Drop ANC schema

Drop Immunization schema

Delete production referrals

Delete production medical records

Modify unrelated packages.

==========================================================
MIGRATION VERSION
==========================================================

Use actual WK package migration/version conventions.

Do not create another migration registry.

Repeated execution must not:

Duplicate columns

Duplicate indexes

Corrupt schema

Overwrite data

==========================================================
ROLLBACK
==========================================================

Use existing WK rollback policy.

Do NOT blindly destroy production data.

If Framework distinguishes:

development rollback

test rollback

production rollback

follow that implementation.

==========================================================
SEEDER RESPONSIBILITY
==========================================================

ReferralSeeder MUST seed ONLY static package
configuration that genuinely belongs to Referral.

It MUST NOT create referral transactions.

==========================================================
DO NOT SEED
==========================================================

Never seed:

Citizen

HealthProfile

MedicalRecord

Referral

Mother

Pregnancy

ANC

Posyandu

Immunization

Provider

Facility

Diagnosis

Treatment

Prescription

Referral notes

Follow-up transactions

==========================================================
MASTER DATA
==========================================================

Before seeding configuration:

Inspect existing global MasterData.

Do NOT duplicate globally owned values.

If Referral requires package-specific configuration:

seed only values that are actually owned by Referral.

Potential categories:

Referral Type

Referral Status

Priority

Follow-Up Status

Context Type

ONLY where actual WK architecture requires package
ownership.

==========================================================
SEEDER IDEMPOTENCY
==========================================================

Seeder MUST be safe to run repeatedly.

First run:

Initialize missing configuration.

Second run:

Do NOT duplicate values.

Existing valid values:

MUST NOT be overwritten unexpectedly.

==========================================================
SEEDER ENVIRONMENT SAFETY
==========================================================

Development:

May initialize package configuration.

Testing:

Must be deterministic.

Staging:

Follow normal deployment process.

Production:

NEVER create fake referral transactions.

==========================================================
NO FAKE HEALTH DATA
==========================================================

Seeder MUST NEVER create:

Fake referrals

Fake referral reasons

Fake referral notes

Fake clinical contexts

Fake destinations

Fake providers

Fake follow-ups

==========================================================
SEEDER CONTRACT
==========================================================

Follow actual WK Seeder framework.

Implement appropriate equivalents of:

seed()

validate()

isSeeded()

rollback()

getSeedVersion()

If actual framework differs:

USE ACTUAL CONTRACT.

==========================================================
TRANSACTION SAFETY
==========================================================

Use existing transaction infrastructure where applicable.

Migration and Seeder must respect existing atomicity.

Do NOT create another transaction manager.

==========================================================
ERROR HANDLING
==========================================================

Use existing WK errors.

Handle applicable:

MigrationError

SchemaError

RollbackError

SeedError

ConfigurationError

CompatibilityError

DuplicateConfiguration

DatabaseError

Do NOT expose:

SQL

Schema internals

Referral content

Sensitive health information

Internal paths

==========================================================
PERFORMANCE
==========================================================

Migration:

Avoid unnecessary schema scans.

Avoid redundant index creation.

Seeder:

Use batch operations where supported.

Avoid repeated MasterData queries.

Avoid N+1 configuration inserts.

==========================================================
DEPENDENCY SAFETY
==========================================================

ReferralSeeder MUST NOT depend on:

ReferralService

ReferralController

MedicalRecordService

HealthService

CitizenService

PregnancyService

ANCService

PosyanduService

ImmunizationService

MotherService

ProviderService

FacilityService

unless existing Framework explicitly requires
read-only configuration initialization.

Prefer zero transactional-domain dependencies.

==========================================================
PACKAGE BOUNDARY
==========================================================

Referral Data Layer owns ONLY:

Referral schema

Referral package configuration

Referral indexes

Referral migration metadata

Referral seed metadata

==========================================================
PRODUCTION DATA PROTECTION
==========================================================

ABSOLUTE REQUIREMENT.

Migration/Seeder MUST NEVER fabricate or modify:

Citizens

HealthProfiles

MedicalRecords

Referrals

Mothers

Pregnancies

ANC records

Posyandu records

Immunizations

Providers

Facilities

Clinical data

==========================================================
QUALITY REQUIREMENTS
==========================================================

Migration Ready

Rollback Safe

Seeder Safe

Idempotent

Production Data Safe

Privacy Safe

Security Safe

Citizen Compatible

Health Compatible

MedicalRecord Compatible

Posyandu Compatible

Mother Compatible

Pregnancy Compatible

ANC Compatible

Immunization Compatible

Testable

==========================================================
OUTPUT
==========================================================

Generate COMPLETE source code for ONLY:

ReferralMigration.js

ReferralSeeder.js

Never truncate.

Never summarize.

Never explain.

Do not generate documentation.

Do not modify unrelated files.

==========================================================
STOP CONDITION
==========================================================

After both files are completely implemented print ONLY:

------------------------------------

REFERRAL DATA LAYER COMPLETE

Completed Files:

ReferralMigration.js
ReferralSeeder.js

Remaining Layer:

Presentation / Analytics Layer

NEXT FILE:

packages/CommunityHealth/Referral/src/ReferralStatistics.js

------------------------------------

Do not proceed to Presentation / Analytics Layer until
the Data Layer is completely implemented.

==========================================================
SUCCESS CRITERIA
==========================================================

Referral Data Layer must be:

Production Ready

Migration Safe

Rollback Safe

Seeder Safe

Idempotent

Production Data Safe

Privacy Safe

Security Safe

Citizen Compatible

Health Compatible

MedicalRecord Compatible

Posyandu Compatible

Mother Compatible

Pregnancy Compatible

ANC Compatible

Immunization Compatible

Testable
==========================================================/**
 * @class ReferralController
 * @description Handles HTTP requests for the Referral package.
 */
class ReferralController {
  /**
   * @param {ReferralService} referralService
   */
  constructor(referralService) {
    /** @private */
    this.service = referralService;
    /** @private */
    this.logger = WK.logger('ReferralController');
  }

  /**
   * Handles request to create a new referral.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  create(req) {
    try {
      const result = this.service.createReferral(req.body);
      return WK.response().json(result, 201);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 400);
    }
  }

  /**
   * Handles request to update a referral.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  update(req) {
    try {
      const { id } = req.params;
      const result = this.service.updateReferral(id, req.body);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }

  /**
   * Handles request to delete a referral.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  delete(req) {
    try {
      const { id } = req.params;
      this.service.deleteReferral(id);
      return WK.response().json(null, 204);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }

  /**
   * Handles request to find a referral by its ID.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  findById(req) {
    try {
      const { id } = req.params;
      const result = this.service.getReferral(id);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 404);
    }
  }

  /**
   * Handles request to find referral history for a citizen.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  history(req) {
    try {
      const { citizenId } = req.params;
      const result = this.service.getHistory(citizenId);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 404);
    }
  }

  /**
   * Handles request to find the latest referral for a citizen.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  findLatest(req) {
    try {
      const { citizenId } = req.params;
      const result = this.service.getLatestByCitizen(citizenId);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 404);
    }
  }

  /**
   * Handles request to search for referral records.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  search(req) {
    try {
      const { query, options } = req.query;
      const result = this.service.search(query, options);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 400);
    }
  }

  /**
   * Handles request to list all referral records.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  list(req) {
    try {
      const { options } = req.query;
      const result = this.service.list(options);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 400);
    }
  }

  /**
   * Handles request to accept a referral.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  accept(req) {
    try {
      const { id } = req.params;
      const { receivingProviderId, receivingProviderType } = req.body;
      const result = this.service.acceptReferral(id, receivingProviderId, receivingProviderType);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }

  /**
   * Handles request to reject a referral.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  reject(req) {
    try {
      const { id } = req.params;
      const { rejectionReason } = req.body;
      const result = this.service.rejectReferral(id, rejectionReason);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }

  /**
   * Handles request to cancel a referral.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  cancel(req) {
    try {
      const { id } = req.params;
      const { cancellationReason } = req.body;
      const result = this.service.cancelReferral(id, cancellationReason);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }

  /**
   * Handles request to complete a referral.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  complete(req) {
    try {
      const { id } = req.params;
      const { completionNotes } = req.body;
      const result = this.service.completeReferral(id, completionNotes);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }

  /**
   * Handles request to schedule a follow-up.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  scheduleFollowUp(req) {
    try {
      const { id } = req.params;
      const { followUpDate, followUpNotes } = req.body;
      const result = this.service.scheduleFollowUp(id, followUpDate, followUpNotes);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }

  /**
   * Handles request to update follow-up details.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  updateFollowUp(req) {
    try {
      const { id } = req.params;
      const result = this.service.updateFollowUp(id, req.body);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }

  /**
   * Handles request to update referral destination.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  updateDestination(req) {
    try {
      const { id } = req.params;
      const { destinationType, destinationId, destinationReference } = req.body;
      const result = this.service.updateDestination(id, destinationType, destinationId, destinationReference);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }

  /**
   * Handles request to update provider information.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  updateProvider(req) {
    try {
      const { id } = req.params;
      const { referringProviderId, referringProviderType, receivingProviderId, receivingProviderType } = req.body;
      const result = this.service.updateProvider(id, referringProviderId, referringProviderType, receivingProviderId, receivingProviderType);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }

  /**
   * Handles request to update referral notes.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  updateNotes(req) {
    try {
      const { id } = req.params;
      const { noteContent } = req.body;
      const result = this.service.updateNotes(id, noteContent);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }

  /**
   * Handles request to update the generic status of a referral.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  updateStatus(req) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = this.service.updateStatus(id, status);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }

  /**
   * Handles request to get pending referrals.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  findPending(req) {
    try {
      const { filters, options } = req.query;
      const result = this.service.getPending(filters, options);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 400);
    }
  }

  /**
   * Handles request to get active referrals.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  findActive(req) {
    try {
      const { filters, options } = req.query;
      const result = this.service.getActive(filters, options);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 400);
    }
  }

  /**
   * Handles request to get completed referrals.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  findCompleted(req) {
    try {
      const { filters, options } = req.query;
      const result = this.service.getCompleted(filters, options);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 400);
    }
  }

  /**
   * Handles request to get recent activity.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  recentActivity(req) {
    try {
      const { filters, limit } = req.query;
      const result = this.service.getRecentActivity(filters, limit);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 400);
    }
  }
}