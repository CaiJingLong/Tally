import { useState, useEffect } from 'react'
import { X, User, Lock } from 'lucide-react'
import { useI18n } from '../i18n'
import { getCurrentUser, updateUsername, updatePassword } from '../api'

interface SettingsModalProps {
  onClose: () => void
  onLogout: () => void
}

export default function SettingsModal({ onClose, onLogout }: SettingsModalProps) {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState<'username' | 'password'>('username')
  const [currentUsername, setCurrentUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Username form
  const [newUsername, setNewUsername] = useState('')

  // Password form
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser()
        setCurrentUsername(user.username)
      } catch (err) {
        console.error('Failed to fetch user:', err)
      }
    }
    fetchUser()
  }, [])

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUsername.trim()) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await updateUsername(newUsername.trim())
      setSuccess(t('usernameUpdated'))
      setCurrentUsername(newUsername.trim())
      setNewUsername('')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('updateFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword.length < 6) {
      setError(t('passwordTooShort'))
      return
    }

    if (newPassword !== confirmPassword) {
      setError(t('passwordMismatch'))
      return
    }

    setLoading(true)

    try {
      await updatePassword(oldPassword, newPassword)
      setSuccess(t('passwordUpdated'))
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      // 密码修改成功后，延迟登出
      setTimeout(() => {
        onLogout()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('updateFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">{t('settingsTitle')}</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => {
              setActiveTab('username')
              setError('')
              setSuccess('')
            }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'username'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <User className="w-4 h-4" />
            {t('changeUsername')}
          </button>
          <button
            onClick={() => {
              setActiveTab('password')
              setError('')
              setSuccess('')
            }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'password'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Lock className="w-4 h-4" />
            {t('changePassword')}
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg">{success}</div>
          )}

          {activeTab === 'username' ? (
            <form onSubmit={handleUpdateUsername} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('currentUsername')}
                </label>
                <div className="px-3 py-2 bg-gray-100 rounded-lg text-gray-600">
                  {currentUsername}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('newUsername')}
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder={t('newUsernamePlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading || !newUsername.trim()}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg transition-colors"
              >
                {loading ? t('updating') : t('updateUsername')}
              </button>
            </form>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('oldPassword')}
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder={t('oldPasswordPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('newPassword')}
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t('newPasswordPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('confirmPassword')}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('confirmPasswordPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                  minLength={6}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !oldPassword || !newPassword || !confirmPassword}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg transition-colors"
              >
                {loading ? t('updating') : t('updatePassword')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
