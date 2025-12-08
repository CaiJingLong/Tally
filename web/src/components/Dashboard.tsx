import { useState, useEffect, useMemo } from 'react'
import { LogOut, Plus, Search, RefreshCw, Trash2, Calendar, Clock, Pencil, Download } from 'lucide-react'
import { Resource } from '../types'
import { getResources, getGroups, deleteResource, exportBackup } from '../api'
import AddResourceModal from './AddResourceModal'
import RenewModal from './RenewModal'
import EditResourceModal from './EditResourceModal'

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

  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      const matchesSearch =
        searchQuery === '' ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.group.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesGroup = selectedGroup === '' || r.group === selectedGroup
      return matchesSearch && matchesGroup
    })
  }, [resources, searchQuery, selectedGroup])

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
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>退出</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索资源名称或分组..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
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

          <button
            onClick={handleExportBackup}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            title="导出备份"
          >
            <Download className="w-5 h-5" />
            <span className="hidden sm:inline">备份</span>
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
            {/* 移动端卡片视图 */}
            <div className="md:hidden space-y-4">
              {filteredResources.map((resource) => (
                <div
                  key={resource.id}
                  className="bg-white rounded-xl shadow-sm border p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{resource.name}</h3>
                      {resource.group && (
                        <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {resource.group}
                        </span>
                      )}
                    </div>
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
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Calendar className="w-4 h-4" />
                    <span>到期: {formatDate(resource.expire_at)}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t">
                    <button
                      onClick={() => setEditingResource(resource)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                    >
                      <Pencil className="w-4 h-4" />
                      <span>编辑</span>
                    </button>
                    <button
                      onClick={() => setRenewingResource(resource)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors text-sm"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>续约</span>
                    </button>
                    <button
                      onClick={() => handleDelete(resource.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>删除</span>
                    </button>
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
    </div>
  )
}
