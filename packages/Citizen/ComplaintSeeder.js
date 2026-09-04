/**
 * @class ComplaintSeeder
 * @description Seeds initial data for the Complaint module.
 * This is useful for development, testing, or initial setup.
 */
class ComplaintSeeder {
  /**
   * Runs the seeder to populate initial complaint data.
   * @param {number} [count=10] - The number of sample complaints to create.
   */
  static run(count = 10) {
    WK.security().checkPermission('system.seed'); // Seeding should be a high-level permission
    WK.logger().info(`Running Complaint module seeder to create ${count} sample complaints.`);

    const complaintRepo = WK.repository('complaint');
    const citizenService = WK.service('citizen');
    const categoryService = WK.service('complaint.category');

    const categories = categoryService.getAllCategories();
    if (categories.length === 0) {
      WK.logger().error('No complaint categories found. Cannot seed complaints.');
      throw new Error('No complaint categories found for seeding.');
    }

    // Get a sample citizen to link complaints to
    const sampleCitizen = citizenService.findAll({ status: 'Aktif' }, { limit: 1 })[0];
    if (!sampleCitizen) {
      WK.logger().error('No active citizens found. Cannot seed complaints.');
      throw new Error('No active citizens found for seeding.');
    }

    const statuses = ['SUBMITTED', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'CLOSED'];
    const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

    for (let i = 1; i <= count; i++) {
      const selectedCategory = categories[Math.floor(Math.random() * categories.length)];
      const selectedSubCategory = selectedCategory.subCategories.length > 0
        ? selectedCategory.subCategories[Math.floor(Math.random() * selectedCategory.subCategories.length)]
        : null;
      const selectedStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const selectedPriority = priorities[Math.floor(Math.random() * priorities.length)];

      const complaintData = {
        id: WK.helper().generateUuid(),
        trackingNumber: `CMP-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${i.toString().padStart(3, '0')}`,
        citizenId: sampleCitizen.id,
        householdId: sampleCitizen.householdId,
        category: selectedCategory.id,
        subCategory: selectedSubCategory,
        title: `Keluhan Contoh ${i}: ${selectedCategory.name} - ${selectedSubCategory || 'Umum'}`,
        description: `Ini adalah deskripsi detail untuk keluhan contoh nomor ${i} mengenai ${selectedSubCategory || selectedCategory.name}.`,
        location: `Jl. Contoh No. ${i}, RT ${sampleCitizen.address.rt}/RW ${sampleCitizen.address.rw}`,
        coordinates: { lat: -6.2088 + (Math.random() * 0.01), lng: 106.8456 + (Math.random() * 0.01) },
        priority: selectedPriority,
        status: selectedStatus,
        attachments: [],
        assignedToUserId: (selectedStatus === 'ASSIGNED' || selectedStatus === 'IN_PROGRESS' || selectedStatus === 'RESOLVED') ? 'OFFICER_ID_1' : null,
        assignedToRoleId: (selectedStatus === 'ASSIGNED' || selectedStatus === 'IN_PROGRESS' || selectedStatus === 'RESOLVED') ? 'OFFICER' : null,
        resolutionDetails: (selectedStatus === 'RESOLVED' || selectedStatus === 'CLOSED') ? 'Masalah telah diselesaikan dengan tindakan X dan Y.' : null,
        citizenConfirmation: (selectedStatus === 'CLOSED') ? 'CONFIRMED' : null,
        rejectionReason: (selectedStatus === 'REJECTED') ? 'Tidak memenuhi kriteria keluhan.' : null,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random date in last 30 days
        updatedAt: new Date().toISOString(),
        submittedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        resolvedAt: (selectedStatus === 'RESOLVED' || selectedStatus === 'CLOSED') ? new Date().toISOString() : null,
        closedAt: (selectedStatus === 'CLOSED') ? new Date().toISOString() : null,
        timeline: [
          {
            timestamp: new Date().toISOString(),
            action: 'SUBMITTED',
            comment: 'Complaint submitted by citizen.',
            userId: sampleCitizen.id,
            userRole: 'CITIZEN'
          }
        ]
      };

      try {
        complaintRepo.create(complaintData);
        WK.logger().debug(`Seeded complaint: ${complaintData.trackingNumber}`);
      } catch (e) {
        WK.logger().error(`Failed to seed complaint ${complaintData.trackingNumber}: ${e.message}`, e.stack);
      }
    }
    WK.logger().info(`Complaint module seeder completed. Created ${count} sample complaints.`);
  }
}