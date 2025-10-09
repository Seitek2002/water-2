export type IStatus6b3Enum = 'active' | 'inactive' | 'archived';
/**
 * * `active` - Active
 * * `inactive` - Inactive
 * * `archived` - Archived
 */

export type IActEnum = 'draft' | 'review' | 'approved' | 'done';
export type IStageEnum = 'draft' | 'review' | 'approved' | 'done';
/**
 * * `draft` - Draft
 * * `review` - In Review
 * * `approved` - Approved
 * * `done` - Completed
 */

export type ITyTypeEnum = 'connection' | 'relocation' | 'load_increase';
/** Для поля "type" в ТУ (technical condition) по OpenAPI:
 *  * `connection` - Подключение
 *  * `relocation` - Вынос сетей
 *  * `load_increase` - Увеличение нагрузок
 */

export type IHistoryType = '+' | '~' | '-';

/**
 * * + - Created
 * * ~ - Updated
 * * - - Deleted
 */
