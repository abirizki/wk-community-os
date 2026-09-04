/**
 * @class PosyanduRepository
 * @description Handles all data access logic for the Posyandu module.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-03
 */
class PosyanduRepository {
  /**
   * @param {object} dbAdapter - The database adapter instance.
   */
  constructor(dbAdapter) {
    /** @private */
    this.motherProfiles = dbAdapter.setTable('posyandu_mother_profiles');
    /** @private */
    this.childProfiles = dbAdapter.setTable('posyandu_child_profiles');
    /** @private */
    this.visits = dbAdapter.setTable('posyandu_visits');
    /** @private */
    this.schedules = dbAdapter.setTable('posyandu_schedules');

    WK.logger().info('PosyanduRepository initialized for tables: posyandu_mother_profiles, posyandu_child_profiles, posyandu_visits, posyandu_schedules');
  }

  // --- Mother Profile Methods ---

  /**
   * Finds a mother's profile by her citizen ID.
   * @param {string} citizenId - The citizen ID of the mother.
   * @returns {MotherProfileEntity|null}
   */
  findMotherProfileByCitizenId(citizenId) {
    return this.motherProfiles.findOne({ citizenId: citizenId });
  }

  /**
   * Creates or updates a mother's health profile.
   * @param {object} profileData - The mother profile data.
   * @returns {MotherProfileEntity} The saved profile.
   */
  saveMotherProfile(profileData) {
    return this.motherProfiles.save(profileData, ['citizenId']);
  }

  // --- Child Profile Methods ---

  /**
   * Finds a child's profile by their citizen ID.
   * @param {string} citizenId - The citizen ID of the child.
   * @returns {ChildProfileEntity|null}
   */
  findChildProfileByCitizenId(citizenId) {
    return this.childProfiles.findOne({ citizenId: citizenId });
  }

  /**
   * Creates or updates a child's health profile.
   * @param {object} profileData - The child profile data.
   * @returns {ChildProfileEntity} The saved profile.
   */
  saveChildProfile(profileData) {
    return this.childProfiles.save(profileData, ['citizenId']);
  }

  // --- Posyandu Visit Methods ---

  /**
   * Creates a new Posyandu visit record.
   * @param {PosyanduVisitEntity} visitData - The visit data.
   * @returns {PosyanduVisitEntity}
   */
  createVisit(visitData) {
    return this.visits.create(visitData);
  }

  /**
   * Finds all visit records for a specific child.
   * @param {string} childCitizenId - The citizen ID of the child.
   * @returns {PosyanduVisitEntity[]}
   */
  findVisitsByChildId(childCitizenId) {
    return this.visits.findAll({ childCitizenId: childCitizenId }, { sortBy: 'visitDate', order: 'desc' });
  }

  // --- Posyandu Schedule Methods ---

  /**
   * Creates a new Posyandu schedule.
   * @param {PosyanduScheduleEntity} scheduleData - The schedule data.
   * @returns {PosyanduScheduleEntity}
   */
  createSchedule(scheduleData) {
    return this.schedules.create(scheduleData);
  }

  /**
   * Finds a schedule by its ID.
   * @param {string} id - The ID of the schedule.
   * @returns {PosyanduScheduleEntity|null}
   */
  findScheduleById(id) {
    return this.schedules.findById(id);
  }

  /**
   * Finds all upcoming schedules.
   * @returns {PosyanduScheduleEntity[]}
   */
  findUpcomingSchedules() {
    const today = new Date().toISOString().split('T')[0];
    return this.schedules.findAll({ eventDate: { $gte: today } }, { sortBy: 'eventDate', order: 'asc' });
  }
}