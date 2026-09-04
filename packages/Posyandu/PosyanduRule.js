/**
 * @file PosyanduRule.js
 * @description Health evaluation rules, stunting detection, and risk analysis for Posyandu.
 * @domain CommunityHealth
 * @package Posyandu (Epic Posyandu / P80)
 */

const { PosyanduConstants } = require('./PosyanduEntity.js');

class PosyanduRule {
  /**
   * Evaluate nutritional status (Gizi) and stunting classification for Balita based on age, weight, and height.
   * @param {number} ageInMonths
   * @param {number} weightKg
   * @param {number} heightCm
   * @returns {{ nutritionStatus: string, stuntingStatus: string }}
   */
  evaluateNutritionAndStunting(ageInMonths, weightKg, heightCm) {
    const months = Math.max(0, Number(ageInMonths) || 0);
    const weight = Number(weightKg) || 0;
    const height = Number(heightCm) || 0;

    // Expected standard reference formulas (WHO reference approximation)
    const expectedHeight = 50 + (months * 1.25);
    const expectedWeight = 3.5 + (months * 0.4);

    // 1. Evaluate Stunting Status (Height-for-Age)
    let stuntingStatus = 'NORMAL';
    if (height < expectedHeight * 0.85) {
      stuntingStatus = 'SEVERELY_STUNTED';
    } else if (height < expectedHeight * 0.92) {
      stuntingStatus = 'STUNTED';
    }

    // 2. Evaluate Nutrition Status (Weight-for-Age)
    let nutritionStatus = 'GIZI_BAIK';
    if (weight < expectedWeight * 0.70) {
      nutritionStatus = 'GIZI_BURUK';
    } else if (weight < expectedWeight * 0.85) {
      nutritionStatus = 'GIZI_KURANG';
    } else if (weight > expectedWeight * 1.30) {
      nutritionStatus = 'GIZI_LEBIH';
    }

    return { nutritionStatus, stuntingStatus };
  }

  /**
   * Evaluate High-Risk Pregnancy (Bumil Risti) based on Upper Arm Circumference (LILA) and Blood Pressure.
   * @param {number|null} armCircumferenceCm
   * @param {number|null} systolic
   * @returns {boolean}
   */
  evaluateHighRiskBumil(armCircumferenceCm, systolic) {
    if (armCircumferenceCm !== undefined && armCircumferenceCm !== null && Number(armCircumferenceCm) < 23.5) {
      return true; // KEK (Kurang Energi Kronis)
    }
    if (systolic !== undefined && systolic !== null && Number(systolic) >= 140) {
      return true; // Hipertensi Gestasional
    }
    return false;
  }

  /**
   * Evaluate weight stagnation (weight not increasing compared to previous visit).
   * @param {number} currentWeight
   * @param {number|null} previousWeight
   * @returns {boolean}
   */
  evaluateWeightStagnation(currentWeight, previousWeight) {
    if (previousWeight === undefined || previousWeight === null) return false;
    return Number(currentWeight) <= Number(previousWeight);
  }

  /**
   * Determine visit status based on risk flags.
   * @param {boolean} isHighRisk
   * @param {boolean} isStagnant
   * @returns {string}
   */
  determineVisitStatus(isHighRisk, isStagnant = false) {
    if (isHighRisk || isStagnant) {
      return 'FOLLOW_UP_NEEDED';
    }
    return 'COMPLETED';
  }

  /**
   * Validate target group enum.
   * @param {string} targetGroup
   */
  checkValidTargetGroup(targetGroup) {
    if (!PosyanduConstants.TARGET_GROUPS.includes(targetGroup)) {
      throw new Error(
        `Business Rule Violation: Invalid Posyandu targetGroup '${targetGroup}'. Allowed: [${PosyanduConstants.TARGET_GROUPS.join(', ')}].`
      );
    }
  }
}

module.exports = { PosyanduRule };

