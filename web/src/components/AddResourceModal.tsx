import { useState } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { createResource } from '../api'
import SmartDateInput from './SmartDateInput'
import { useI18n } from '../i18n'

interface AddResourceModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function AddResourceModal({ onClose, onSuccess }: AddResourceModalProps) {
  const { t } = useI18n()
  const [name, setName] = useState('')
  const [group, setGroup] = useState('')
  const [expireAt, setExpireAt] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // 将日期转换为 Unix 时间戳（秒）
      const timestamp = Math.floor(new Date(expireAt).getTime() / 1000)
      await createResource({
        name,
        group,
        expire_at: timestamp,
      })
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('addFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">{t('addResourceTitle')}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              {t('resourceNameLabel')} <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder={t('resourceNamePlaceholder')}
              required
            />
          </div>

          <div>
            <label htmlFor="group" className="block text-sm font-medium text-gray-700 mb-2">
              {t('groupLabel')}
            </label>
            <input
              id="group"
              type="text"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder={t('groupPlaceholder')}
            />
          </div>

          <div>
            <label htmlFor="expireAt" className="block text-sm font-medium text-gray-700 mb-2">
              {t('expireDateLabel')} <span className="text-red-500">*</span>
            </label>
            <SmartDateInput
              id="expireAt"
              value={expireAt}
              onChange={setExpireAt}
              placeholder={t('datePlaceholder')}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? t('adding') : t('confirm')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
