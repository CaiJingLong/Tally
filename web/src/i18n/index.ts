import { createContext, useContext } from 'react'

export type Locale = 'zh' | 'en'

export const translations = {
  zh: {
    // Header
    appTitle: 'Tally - 资源管理',
    backup: '备份',
    restore: '还原',
    logout: '退出',

    // Toolbar
    searchPlaceholder: '搜索（支持拼音）...',
    searchRegex: '正则表达式...',
    searchGlob: 'Glob 模式 (* ? 通配符)...',
    allGroups: '全部分组',
    addResource: '添加资源',

    // Search modes
    normalSearch: '普通搜索（支持拼音）',
    globMode: 'Glob 模式',
    regexMode: '正则表达式',

    // Resource list
    loading: '加载中...',
    noResources: '暂无资源，点击上方按钮添加',
    noMatch: '没有匹配的资源',
    expired: '已过期',
    daysRemaining: '天',
    daysRemainingShort: '剩{days}天',

    // Table headers
    resourceName: '资源名称',
    group: '分组',
    expireDate: '到期日期',
    remainingDays: '剩余天数',
    actions: '操作',

    // Actions
    edit: '编辑',
    renew: '续约',
    delete: '删除',
    cancel: '取消',
    confirm: '确认',
    save: '保存',

    // Add Resource Modal
    addResourceTitle: '添加资源',
    resourceNameLabel: '资源名称',
    resourceNamePlaceholder: '输入资源名称',
    groupLabel: '分组',
    groupPlaceholder: '输入或选择分组',
    expireDateLabel: '到期日期',
    datePlaceholder: '输入或粘贴日期...',
    adding: '添加中...',

    // Edit Resource Modal
    editResourceTitle: '编辑资源',
    saving: '保存中...',

    // Renew Modal
    renewTitle: '续约资源',
    renewingFor: '正在续约:',
    currentExpire: '当前到期:',
    byDays: '按天',
    byYears: '按年',
    byDate: '指定日期',
    renewDays: '续期天数',
    renewYears: '续期年数（自然年）',
    newExpireDate: '新到期日期',
    predictedExpire: '预计到期:',
    naturalYearHint: '自然年续期保持月日不变',
    renewing: '续约中...',
    confirmRenew: '确认续约',

    // Restore Modal
    restoreTitle: '还原备份',
    selectBackupFile: '选择备份文件',
    clickToSelect: '点击选择 JSON 备份文件',
    backupVersion: '备份版本:',
    exportTime: '导出时间:',
    resourceCount: '包含 {count} 条资源',
    restoreMode: '还原模式',
    appendMode: '追加模式',
    appendModeDesc: '保留现有资源，添加备份中的资源',
    overwriteMode: '覆盖模式',
    overwriteModeDesc: '删除所有现有资源，仅保留备份中的资源',
    restoring: '还原中...',
    confirmRestore: '确认还原',
    restoreSuccess: '还原成功！导入了 {count} 条资源',

    // Errors
    invalidBackupFormat: '无效的备份文件格式',
    parseError: '无法解析备份文件',
    readError: '读取文件失败',
    renewFailed: '续约失败',
    addFailed: '添加失败',
    editFailed: '编辑失败',
    restoreFailed: '还原失败',

    // Confirm dialogs
    confirmDelete: '确定要删除这个资源吗？',

    // Time units
    day: '天',
    year: '年',
  },
  en: {
    // Header
    appTitle: 'Tally - Resource Manager',
    backup: 'Backup',
    restore: 'Restore',
    logout: 'Logout',

    // Toolbar
    searchPlaceholder: 'Search (supports pinyin)...',
    searchRegex: 'Regular expression...',
    searchGlob: 'Glob pattern (* ? wildcards)...',
    allGroups: 'All Groups',
    addResource: 'Add Resource',

    // Search modes
    normalSearch: 'Normal search (supports pinyin)',
    globMode: 'Glob mode',
    regexMode: 'Regular expression',

    // Resource list
    loading: 'Loading...',
    noResources: 'No resources yet, click the button above to add',
    noMatch: 'No matching resources',
    expired: 'Expired',
    daysRemaining: 'days',
    daysRemainingShort: '{days}d left',

    // Table headers
    resourceName: 'Resource Name',
    group: 'Group',
    expireDate: 'Expire Date',
    remainingDays: 'Remaining',
    actions: 'Actions',

    // Actions
    edit: 'Edit',
    renew: 'Renew',
    delete: 'Delete',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',

    // Add Resource Modal
    addResourceTitle: 'Add Resource',
    resourceNameLabel: 'Resource Name',
    resourceNamePlaceholder: 'Enter resource name',
    groupLabel: 'Group',
    groupPlaceholder: 'Enter or select group',
    expireDateLabel: 'Expire Date',
    datePlaceholder: 'Enter or paste date...',
    adding: 'Adding...',

    // Edit Resource Modal
    editResourceTitle: 'Edit Resource',
    saving: 'Saving...',

    // Renew Modal
    renewTitle: 'Renew Resource',
    renewingFor: 'Renewing:',
    currentExpire: 'Current expiry:',
    byDays: 'By Days',
    byYears: 'By Years',
    byDate: 'By Date',
    renewDays: 'Renewal days',
    renewYears: 'Renewal years (calendar)',
    newExpireDate: 'New expire date',
    predictedExpire: 'Expected expiry:',
    naturalYearHint: 'Calendar year keeps month and day unchanged',
    renewing: 'Renewing...',
    confirmRenew: 'Confirm Renewal',

    // Restore Modal
    restoreTitle: 'Restore Backup',
    selectBackupFile: 'Select Backup File',
    clickToSelect: 'Click to select JSON backup file',
    backupVersion: 'Backup version:',
    exportTime: 'Export time:',
    resourceCount: 'Contains {count} resources',
    restoreMode: 'Restore Mode',
    appendMode: 'Append Mode',
    appendModeDesc: 'Keep existing resources, add resources from backup',
    overwriteMode: 'Overwrite Mode',
    overwriteModeDesc: 'Delete all existing resources, keep only backup resources',
    restoring: 'Restoring...',
    confirmRestore: 'Confirm Restore',
    restoreSuccess: 'Restore successful! Imported {count} resources',

    // Errors
    invalidBackupFormat: 'Invalid backup file format',
    parseError: 'Unable to parse backup file',
    readError: 'Failed to read file',
    renewFailed: 'Renewal failed',
    addFailed: 'Add failed',
    editFailed: 'Edit failed',
    restoreFailed: 'Restore failed',

    // Confirm dialogs
    confirmDelete: 'Are you sure you want to delete this resource?',

    // Time units
    day: 'day',
    year: 'year',
  },
} as const

export type TranslationKey = keyof typeof translations.zh

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
}

export const I18nContext = createContext<I18nContextType | null>(null)

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}

export function createTranslator(locale: Locale) {
  return (key: TranslationKey, params?: Record<string, string | number>): string => {
    let text: string = translations[locale][key] || translations.zh[key] || key
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v))
      })
    }
    return text
  }
}
