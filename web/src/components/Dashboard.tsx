import { useState, useEffect, useMemo } from 'react'
import { LogOut, Plus, Search, RefreshCw, Trash2, Calendar, Clock, Pencil, Download, Upload, Regex, Asterisk, Type } from 'lucide-react'
import { pinyin, match } from 'pinyin-pro'
import { Resource } from '../types'
import { getResources, getGroups, deleteResource, exportBackup } from '../api'
import AddResourceModal from './AddResourceModal'
import RenewModal from './RenewModal'
import EditResourceModal from './EditResourceModal'
import RestoreModal from './RestoreModal'

interface DashboardProps {
  onLogout: () => void
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [resources, setResources] = useState<Resource[]>([])
  const [groups, setGroups] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [renewingResource, setRenewingResource] = useState<Resource | null>(null)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [showRestoreModal, setShowRestoreModal] = useState(false)
  const [searchMode, setSearchMode] = useState<'normal' | 'regex' | 'glob'>('normal')

  const fetchData = async () => {
    setLoading(true)
    try {
      const [resourcesData, groupsData] = await Promise.all([
        getResources(),
        getGroups(),
      ])
      setResources(resourcesData)
      setGroups(groupsData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // 搜索匹配函数
  const matchSearch = (text: string, query: string): boolean => {
    if (!query) return true
    const lowerText = text.toLowerCase()
    const lowerQuery = query.toLowerCase()

    if (searchMode === 'regex') {
      try {
        const regex = new RegExp(query, 'i')
        return regex.test(text)
      } catch {
        return false
      }
    }

    if (searchMode === 'glob') {
      // 简单 glob 支持: * 匹配任意字符, ? 匹配单个字符
      const pattern = query
        .replace(/[.+^${}()|[\]\\]/g, '\\$&') // 转义特殊字符
        .replace(/\*/g, '.*')
        .replace(/\?/g, '.')
      try {
        const regex = new RegExp(`^${pattern}$`, 'i')
        return regex.test(text)
      } catch {
        return false
      }
    }

    // 普通模式：支持拼音匹配
    if (lowerText.includes(lowerQuery)) return true
    
    // 拼音匹配
    const pinyinResult = match(text, query, { continuous: true })
    if (pinyinResult && pinyinResult.length > 0) return true

    // 拼音首字母匹配
    const firstLetters = pinyin(text, { pattern: 'first', toneType: 'none' }).replace(/\s/g, '')
    if (firstLetters.toLowerCase().includes(lowerQuery)) return true

    return false
  }

  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      const matchesSearch =
        searchQuery === '' ||
        matchSearch(r.name, searchQuery) ||
        matchSearch(r.group, searchQuery)
      const matchesGroup = selectedGroup === '' || r.group === selectedGroup
      return matchesSearch && matchesGroup
    })
  }, [resources, searchQuery, selectedGroup, searchMode])

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个资源吗？')) return
    try {
      await deleteResource(id)
      setResources((prev) => prev.filter((r) => r.id !== id))
    } catch (error) {
      console.error('Failed to delete resource:', error)
    }
  }

  const handleExportBackup = async () => {
    try {
      const backup = await exportBackup()
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `tally-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export backup:', error)
    }
  }

  const getRemainingDaysStyle = (days: number) => {
    if (days <= 0) return 'bg-red-100 text-red-700'
    if (days <= 7) return 'bg-orange-100 text-orange-700'
    if (days <= 30) return 'bg-yellow-100 text-yellow-700'
    return 'bg-green-100 text-green-700'
  }

  // 将 Unix 时间戳转换为日期字符串
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Tally - 资源管理</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportBackup}
              className="flex items-center gap-1.5 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="导出备份"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">备份</span>
            </button>
            <button
              onClick={() => setShowRestoreModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="还原备份"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">还原</span>
            </button>
            <div className="w-px h-6 bg-gray-200 mx-1" />
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">退出</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 flex">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={
                  searchMode === 'regex' ? '正则表达式...' :
                  searchMode === 'glob' ? 'Glob 模式 (* ? 通配符)...' :
                  '搜索（支持拼音）...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="flex border border-l-0 border-gray-300 rounded-r-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setSearchMode('normal')}
                className={`px-2.5 py-2 transition-colors ${
                  searchMode === 'normal'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}
                title="普通搜索（支持拼音）"
              >
                <Type className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setSearchMode('glob')}
                className={`px-2.5 py-2 border-l border-gray-300 transition-colors ${
                  searchMode === 'glob'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}
                title="Glob 模式"
              >
                <Asterisk className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setSearchMode('regex')}
                className={`px-2.5 py-2 border-l border-gray-300 transition-colors ${
                  searchMode === 'regex'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}
                title="正则表达式"
              >
                <Regex className="w-4 h-4" />
              </button>
            </div>
          </div>

          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
          >
            <option value="">全部分组</option>
            {groups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>添加资源</span>
          </button>
        </div>

        {/* Resource List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {resources.length === 0 ? '暂无资源，点击上方按钮添加' : '没有匹配的资源'}
          </div>
        ) : (
          <>
            {/* 移动端卡片视图 - 紧凑版 */}
            <div className="md:hidden space-y-2">
              {filteredResources.map((resource) => (
                <div
                  key={resource.id}
                  className="bg-white rounded-lg shadow-sm border px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900 text-sm truncate">{resource.name}</h3>
                        {resource.group && (
                          <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                            {resource.group}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                        <span>{formatDate(resource.expire_at)}</span>
                        <span
                          className={`font-medium ${
                            resource.remaining_days <= 0
                              ? 'text-red-600'
                              : resource.remaining_days <= 7
                              ? 'text-orange-600'
                              : resource.remaining_days <= 30
                              ? 'text-yellow-600'
                              : 'text-green-600'
                          }`}
                        >
                          {resource.remaining_days <= 0 ? '已过期' : `剩${resource.remaining_days}天`}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingResource(resource)}
                        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors"
                        title="编辑"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setRenewingResource(resource)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="续约"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(resource.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 桌面端表格视图 */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">名称</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">分组</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">到期时间</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">剩余天数</th>
                      <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredResources.map((resource) => (
                      <tr key={resource.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900">{resource.name}</span>
                        </td>
                        <td className="px-6 py-4">
                          {resource.group ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              {resource.group}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(resource.expire_at)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getRemainingDaysStyle(
                              resource.remaining_days
                            )}`}
                          >
                            <Clock className="w-3 h-3" />
                            {resource.remaining_days <= 0
                              ? '已过期'
                              : `${resource.remaining_days} 天`}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingResource(resource)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="编辑"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setRenewingResource(resource)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="续约"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(resource.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="删除"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Modals */}
      {showAddModal && (
        <AddResourceModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            fetchData()
          }}
        />
      )}

      {renewingResource && (
        <RenewModal
          resource={renewingResource}
          onClose={() => setRenewingResource(null)}
          onSuccess={() => {
            setRenewingResource(null)
            fetchData()
          }}
        />
      )}

      {editingResource && (
        <EditResourceModal
          resource={editingResource}
          onClose={() => setEditingResource(null)}
          onSuccess={() => {
            setEditingResource(null)
            fetchData()
          }}
        />
      )}

      {showRestoreModal && (
        <RestoreModal
          onClose={() => setShowRestoreModal(false)}
          onSuccess={() => {
            setShowRestoreModal(false)
            fetchData()
          }}
        />
      )}
    </div>
  )
}
