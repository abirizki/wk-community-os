/**
 * @class ComplaintCategoryService
 * @description Manages the predefined categories and sub-categories for complaints.
 * This service provides a centralized way to retrieve and validate complaint categories.
 */
class ComplaintCategoryService {
  constructor() {
    /** @private */
    this.categories = this._loadCategories();
    WK.logger().info('ComplaintCategoryService initialized.');
  }

  /**
   * Loads the predefined complaint categories and sub-categories.
   * In a production system, this would likely come from a configuration file
   * or a dedicated master data repository.
   * @private
   * @returns {object[]} An array of category objects.
   */
  _loadCategories() {
    return [
      {
        id: 'INFRASTRUCTURE',
        name: 'Infrastruktur',
        subCategories: ['Jalan Rusak', 'Drainase Tersumbat', 'Lampu Jalan Mati', 'Sampah Menumpuk']
      },
      {
        id: 'SOCIAL',
        name: 'Sosial',
        subCategories: ['Keamanan Lingkungan', 'Tawuran', 'Narkoba', 'Kekerasan Dalam Rumah Tangga']
      },
      {
        id: 'ADMINISTRATION',
        name: 'Administrasi',
        subCategories: ['Pelayanan Lambat', 'Persyaratan Sulit', 'Pungli']
      },
      {
        id: 'PUBLIC_SERVICE',
        name: 'Pelayanan Publik',
        subCategories: ['Air Bersih', 'Listrik', 'Internet', 'Transportasi']
      },
      {
        id: 'HEALTH',
name: 'Kesehatan',
        subCategories: ['Fasilitas Kesehatan', 'Tenaga Medis', 'Obat-obatan']
      },
      {
        id: 'EDUCATION',
        name: 'Pendidikan',
        subCategories: ['Fasilitas Sekolah', 'Kualitas Pengajar', 'Biaya Pendidikan']
      },
      {
        id: 'DISASTER',
        name: 'Bencana',
        subCategories: ['Banjir', 'Longsor', 'Kebakaran']
      },
      {
        id: 'EMERGENCY',
        name: 'Darurat',
        subCategories: ['Kecelakaan', 'Kriminalitas', 'Medis']
      },
      {
        id: 'OTHER',
        name: 'Lain-lain',
        subCategories: []
      }
    ];
  }

  /**
   * Retrieves all available complaint categories.
   * @returns {object[]} An array of category objects.
   */
  getAllCategories() {
    return this.categories;
  }

  /**
   * Checks if a given category ID is valid.
   * @param {string} categoryId - The ID of the category to check.
   * @returns {boolean} True if the category is valid, false otherwise.
   */
  isValidCategory(categoryId) {
    return this.categories.some(cat => cat.id === categoryId);
  }

  /**
   * Checks if a given sub-category is valid for a specific category.
   * @param {string} categoryId - The ID of the parent category.
   * @param {string} subCategoryName - The name of the sub-category to check.
   * @returns {boolean} True if the sub-category is valid, false otherwise.
   */
  isValidSubCategory(categoryId, subCategoryName) {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category && category.subCategories.includes(subCategoryName);
  }
}