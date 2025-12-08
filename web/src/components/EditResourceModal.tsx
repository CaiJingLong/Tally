import { useState, useEffect } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { Resource } from '../types'
import { updateResource } from '../api'
import SmartDateInput from './SmartDateInput'

interface EditResourceModalProps {
  resource: Resource
  onClose: () => void
  onSuccess: () => void
}

export default function EditResourceModal({ resource, onClose, onSuccess }: EditResourceModalProps) {
  const [name, setName] = useState(resource.name)
  const [group, setGroup] = useState(resource.group)
  const [expireAt, setExpireAt] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // 将 Unix 时间戳转换为 YYYY-MM-DD 格式
    const date = new Date(resource.expire_at * 1000)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    setExpireAt(`${year}-${month}-${day}`)
  }, [resource.expire_at])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const timestamp = Math.floor(new Date(expireAt).getTime() / 1000)
      await updateResource(resource.id, {
        name,
        group,
        expire_at: timestamp,
      })
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">编辑资源</h2>
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
              资源名称 <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="例如：阿里云服务器"
              required
            />
          </div>

          <div>
            <label htmlFor="group" className="block text-sm font-medium text-gray-700 mb-2">
              分组
            </label>
            <input
              id="group"
              type="text"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="例如：云服务"
            />
          </div>

          <div>
            <label htmlFor="expireAt" className="block text-sm font-medium text-gray-700 mb-2">
              到期时间 <span className="text-red-500">*</span>
            </label>
            <SmartDateInput
              id="expireAt"
              value={expireAt}
              onChange={setExpireAt}
              placeholder="输入或粘贴日期..."
              required
            />
          </div>

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
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
