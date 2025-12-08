import { useState, useRef } from 'react'
import { X, AlertCircle, Upload, FileJson, AlertTriangle } from 'lucide-react'
import { BackupData, restoreBackup } from '../api'

interface RestoreModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function RestoreModal({ onClose, onSuccess }: RestoreModalProps) {
  const [backupData, setBackupData] = useState<BackupData | null>(null)
  const [fileName, setFileName] = useState('')
  const [mode, setMode] = useState<'overwrite' | 'append'>('append')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    setFileName(file.name)

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string) as BackupData
        
        // 验证备份数据格式
        if (!data.version || !data.resources || !Array.isArray(data.resources)) {
          throw new Error('无效的备份文件格式')
        }
        
        setBackupData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : '无法解析备份文件')
        setBackupData(null)
      }
    }
    reader.onerror = () => {
      setError('读取文件失败')
      setBackupData(null)
    }
    reader.readAsText(file)
  }

  const handleRestore = async () => {
    if (!backupData) return

    setError('')
    setLoading(true)

    try {
      const result = await restoreBackup(backupData, mode)
      alert(`还原成功！导入了 ${result.imported} 条资源`)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : '还原失败')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('zh-CN')
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">还原备份</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 文件选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择备份文件
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
            >
              <Upload className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600">
                {fileName || '点击选择 JSON 备份文件'}
              </span>
            </button>
          </div>

          {/* 备份信息预览 */}
          {backupData && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileJson className="w-4 h-4" />
                <span>备份版本: {backupData.version}</span>
              </div>
              <div className="text-sm text-gray-600">
                导出时间: {formatDate(backupData.export_at)}
              </div>
              <div className="text-sm font-medium text-gray-900">
                包含 {backupData.resources.length} 条资源
              </div>
            </div>
          )}

          {/* 还原模式选择 */}
          {backupData && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                还原模式
              </label>
              <div className="space-y-2">
                <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="mode"
                    value="append"
                    checked={mode === 'append'}
                    onChange={() => setMode('append')}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="font-medium text-gray-900">追加模式</div>
                    <div className="text-sm text-gray-500">
                      保留现有资源，添加备份中的资源
                    </div>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-3 border border-orange-200 bg-orange-50 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors">
                  <input
                    type="radio"
                    name="mode"
                    value="overwrite"
                    checked={mode === 'overwrite'}
                    onChange={() => setMode('overwrite')}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="flex items-center gap-2 font-medium text-orange-700">
                      <AlertTriangle className="w-4 h-4" />
                      覆盖模式
                    </div>
                    <div className="text-sm text-orange-600">
                      删除所有现有资源，仅保留备份中的资源
                    </div>
                  </div>
                </label>
              </div>
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
              type="button"
              onClick={handleRestore}
              disabled={loading || !backupData}
              className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? '还原中...' : '确认还原'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
