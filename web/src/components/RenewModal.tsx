import { useState, useMemo } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { Resource } from '../types'
import { renewResource } from '../api'
import SmartDateInput from './SmartDateInput'

interface RenewModalProps {
  resource: Resource
  onClose: () => void
  onSuccess: () => void
}

export default function RenewModal({ resource, onClose, onSuccess }: RenewModalProps) {
  const [mode, setMode] = useState<'days' | 'date'>('days')
  const [days, setDays] = useState(30)
  const [expireAt, setExpireAt] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // 计算续期后的预计到期日期
  const predictedExpireDate = useMemo(() => {
    if (mode === 'date' && expireAt) {
      return new Date(expireAt)
    }
    // 如果已过期，从今天开始计算；否则从当前到期日开始
    const baseTime = resource.expire_at * 1000 < Date.now() 
      ? Date.now() 
      : resource.expire_at * 1000
    return new Date(baseTime + days * 24 * 60 * 60 * 1000)
  }, [mode, days, expireAt, resource.expire_at])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'days') {
        await renewResource(resource.id, { days })
      } else {
        // 将日期转换为 Unix 时间戳（秒）
        const timestamp = Math.floor(new Date(expireAt).getTime() / 1000)
        await renewResource(resource.id, { expire_at: timestamp })
      }
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : '续约失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">续约资源</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              正在续约: <span className="font-medium text-gray-900">{resource.name}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              当前到期: {new Date(resource.expire_at * 1000).toLocaleDateString('zh-CN')}
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('days')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                mode === 'days'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              续期天数
            </button>
            <button
              type="button"
              onClick={() => setMode('date')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                mode === 'date'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              指定日期
            </button>
          </div>

          {mode === 'days' ? (
            <div>
              <label htmlFor="days" className="block text-sm font-medium text-gray-700 mb-2">
                续期天数
              </label>
              <div className="flex gap-2">
                {[7, 30, 90, 365].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDays(d)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      days === d
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {d}天
                  </button>
                ))}
              </div>
              <input
                id="days"
                type="number"
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value) || 0)}
                min={1}
                className="w-full mt-3 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="mt-2 text-sm text-indigo-600">
                预计到期: {predictedExpireDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          ) : (
            <div>
              <label htmlFor="expireAt" className="block text-sm font-medium text-gray-700 mb-2">
                新到期日期
              </label>
              <SmartDateInput
                id="expireAt"
                value={expireAt}
                onChange={setExpireAt}
                placeholder="输入或粘贴日期..."
                required={mode === 'date'}
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading || (mode === 'date' && !expireAt)}
              className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? '续约中...' : '确认续约'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
