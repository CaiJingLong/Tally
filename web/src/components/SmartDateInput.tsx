import { useState, useRef, useEffect } from 'react'
import { Calendar, X } from 'lucide-react'

interface SmartDateInputProps {
  value: string // YYYY-MM-DD 格式
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  id?: string
}

// 解析多种日期格式
function parseSmartDate(input: string): Date | null {
  if (!input || !input.trim()) return null
  
  const trimmed = input.trim()
  
  // 尝试多种格式
  const patterns = [
    // ISO 格式: 2026-04-16T23:59:59
    /^(\d{4})-(\d{1,2})-(\d{1,2})(?:T|\s)(\d{1,2}):(\d{1,2}):(\d{1,2})/,
    // 华为云格式: 2026/04/16 23:59:59 GMT+08:00
    /^(\d{4})\/(\d{1,2})\/(\d{1,2})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})/,
    // 阿里云格式: 2026-04-16 23:59:59 GMT+08:00
    /^(\d{4})-(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})/,
    // 简单日期时间: 2026-04-16 23:59:59
    /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})/,
    // 仅日期: 2026-04-16 或 2026/04/16
    /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/,
    // 中文格式: 2026年04月16日
    /^(\d{4})年(\d{1,2})月(\d{1,2})日/,
    // 美式格式: 04/16/2026
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
  ]

  for (const pattern of patterns) {
    const match = trimmed.match(pattern)
    if (match) {
      let year: number, month: number, day: number
      
      // 美式格式特殊处理
      if (pattern === patterns[patterns.length - 1]) {
        month = parseInt(match[1], 10)
        day = parseInt(match[2], 10)
        year = parseInt(match[3], 10)
      } else {
        year = parseInt(match[1], 10)
        month = parseInt(match[2], 10)
        day = parseInt(match[3], 10)
      }

      // 验证日期有效性
      if (year >= 1970 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        const date = new Date(year, month - 1, day)
        if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) {
          return date
        }
      }
    }
  }

  // 尝试直接解析
  const directParse = new Date(trimmed)
  if (!isNaN(directParse.getTime())) {
    return directParse
  }

  return null
}

// 格式化为 YYYY-MM-DD
function formatToYYYYMMDD(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 格式化为显示格式
function formatForDisplay(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function SmartDateInput({
  value,
  onChange,
  placeholder = '输入或粘贴日期...',
  required = false,
  id,
}: SmartDateInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [showPicker, setShowPicker] = useState(false)
  const [parseError, setParseError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 同步外部值到输入框
  useEffect(() => {
    if (value) {
      setInputValue(formatForDisplay(value))
      setParseError(false)
    } else {
      setInputValue('')
    }
  }, [value])

  // 点击外部关闭日期选择器
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    
    // 尝试解析
    const parsed = parseSmartDate(newValue)
    if (parsed) {
      onChange(formatToYYYYMMDD(parsed))
      setParseError(false)
    } else if (newValue === '') {
      onChange('')
      setParseError(false)
    } else {
      setParseError(true)
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text')
    const parsed = parseSmartDate(pastedText)
    
    if (parsed) {
      e.preventDefault()
      const formatted = formatToYYYYMMDD(parsed)
      onChange(formatted)
      setInputValue(formatForDisplay(formatted))
      setParseError(false)
    }
    // 如果无法解析，让默认粘贴行为继续
  }

  const handleDatePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    setInputValue(formatForDisplay(newValue))
    setShowPicker(false)
    setParseError(false)
  }

  const handleClear = () => {
    onChange('')
    setInputValue('')
    setParseError(false)
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onPaste={handlePaste}
          onFocus={() => setShowPicker(false)}
          placeholder={placeholder}
          required={required}
          className={`w-full px-4 py-2.5 pr-20 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
            parseError ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowPicker(!showPicker)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            <Calendar className="w-4 h-4" />
          </button>
        </div>
      </div>

      {parseError && (
        <p className="mt-1 text-xs text-red-500">
          无法识别日期格式，请重新输入
        </p>
      )}

      {showPicker && (
        <div className="absolute z-10 mt-1 p-3 bg-white border border-gray-200 rounded-lg shadow-lg">
          <input
            type="date"
            value={value}
            onChange={handleDatePickerChange}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <p className="mt-2 text-xs text-gray-500">
            支持粘贴多种格式：
            <br />
            2026/04/16 23:59:59
            <br />
            2026-04-16 23:59:59
            <br />
            2026年04月16日
          </p>
        </div>
      )}
    </div>
  )
}
