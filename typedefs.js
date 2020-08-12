/**
 * @typedef {Object} ModVersionInfo
 * @property {string} name name/id of the mod
 * @property {string} version version of the mod
 */
/**
 * @typedef {Object} FileMigration
 * @property {string} old current filename
 * @property {string} new new filename, null if no migration is planed
 */
/**
 * @typedef {Object} MigrationSummary
 * @property {bool} migrationsFound true if files where found that need migration
 * @property {bool} nonMigrationsFound true if files where found that don't need migration
 */
/**
 * @callback BoolAction
 * @returns {boolean}
 */