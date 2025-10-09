import React, { useState, useMemo } from 'react'

const EnhancedDataTable = ({ 
  data, 
  columns, 
  onEdit, 
  onDelete, 
  onSelect,
  loading = false,
  selectable = false,
  sortable = true,
  searchable = true,
  pagination = true,
  pageSize = 10
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRows, setSelectedRows] = useState(new Set())

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = data

    // Apply search filter
    if (searchTerm && searchable) {
      filtered = data.filter(row =>
        columns.some(col => {
          const value = row[col.key]
          return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        })
      )
    }

    // Apply sorting
    if (sortConfig.key && sortable) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key]
        const bVal = b[sortConfig.key]
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [data, searchTerm, sortConfig, columns, searchable, sortable])

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return filteredAndSortedData
    
    const startIndex = (currentPage - 1) * pageSize
    return filteredAndSortedData.slice(startIndex, startIndex + pageSize)
  }, [filteredAndSortedData, currentPage, pageSize, pagination])

  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize)

  const handleSort = (key) => {
    if (!sortable) return
    
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleSelectRow = (rowId) => {
    if (!selectable) return
    
    const newSelected = new Set(selectedRows)
    if (newSelected.has(rowId)) {
      newSelected.delete(rowId)
    } else {
      newSelected.add(rowId)
    }
    setSelectedRows(newSelected)
    onSelect?.(Array.from(newSelected))
  }

  const handleSelectAll = () => {
    if (!selectable) return
    
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set())
      onSelect?.([])
    } else {
      const allIds = paginatedData.map(row => row.id)
      setSelectedRows(new Set(allIds))
      onSelect?.(allIds)
    }
  }

  const getSortIcon = (key) => {
    if (!sortable) return null
    
    if (sortConfig.key !== key) {
      return <span className="text-gray-400">↕️</span>
    }
    
    return sortConfig.direction === 'asc' ? 
      <span className="text-blue-600">↑</span> : 
      <span className="text-blue-600">↓</span>
  }

  const formatCellValue = (value, type) => {
    if (value === null || value === undefined) return '-'
    
    switch (type) {
      case 'date':
        return new Date(value).toLocaleDateString()
      case 'datetime':
        return new Date(value).toLocaleString()
      case 'status':
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            value === 'active' ? 'bg-green-100 text-green-800' :
            value === 'inactive' ? 'bg-red-100 text-red-800' :
            value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {value}
          </span>
        )
      case 'boolean':
        return value ? '✓' : '✗'
      default:
        return value.toString()
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Table Header with Search */}
      {(searchable || pagination) && (
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            {searchable && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔍</span>
                </div>
              </div>
            )}
            
            {pagination && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredAndSortedData.length)} of {filteredAndSortedData.length} results
                </span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {selectable && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {getSortIcon(column.key)}
                  </div>
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, index) => (
              <tr
                key={row.id || index}
                className={`hover:bg-gray-50 transition-colors duration-200 ${
                  selectedRows.has(row.id) ? 'bg-blue-50' : ''
                }`}
              >
                {selectable && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(row.id)}
                      onChange={() => handleSelectRow(row.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCellValue(row[column.key], column.type)}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                        >
                          Edit
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row)}
                          className="text-red-600 hover:text-red-900 transition-colors duration-200"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1
                const isCurrentPage = page === currentPage
                const isNearCurrent = Math.abs(page - currentPage) <= 2
                const isFirstOrLast = page === 1 || page === totalPages
                
                if (!isCurrentPage && !isNearCurrent && !isFirstOrLast) {
                  if (page === 2 || page === totalPages - 1) {
                    return <span key={page} className="px-3 py-2 text-sm text-gray-500">...</span>
                  }
                  return null
                }
                
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg ${
                      isCurrentPage
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {paginatedData.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search terms' : 'No records to display'}
          </p>
        </div>
      )}
    </div>
  )
}

export default EnhancedDataTable
