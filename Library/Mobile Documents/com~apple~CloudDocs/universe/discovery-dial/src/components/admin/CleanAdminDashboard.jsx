import React, { useState } from 'react'

const CleanAdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRows, setSelectedRows] = useState(new Set())

  // Mock data - clean and minimal
  const events = [
    { id: 1, name: 'Summer Concert', date: '2024-07-15', status: 'active', venue: 'Central Park' },
    { id: 2, name: 'Tech Workshop', date: '2024-07-20', status: 'pending', venue: 'Innovation Hub' },
    { id: 3, name: 'Art Exhibition', date: '2024-07-25', status: 'active', venue: 'Gallery One' },
    { id: 4, name: 'Food Festival', date: '2024-08-01', status: 'inactive', venue: 'Downtown Plaza' }
  ]

  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelectAll = () => {
    if (selectedRows.size === filteredEvents.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(filteredEvents.map(e => e.id)))
    }
  }

  const handleSelectRow = (id) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedRows(newSelected)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600'
      case 'pending': return 'text-yellow-600'
      case 'inactive': return 'text-gray-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Minimal */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-medium text-gray-900">Admin</h1>
          <a href="/" className="text-sm text-gray-600 hover:text-gray-900">← Back to App</a>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        {/* Search - Minimal */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Table - Clean and Minimal */}
        <div className="border border-gray-200 rounded">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === filteredEvents.length && filteredEvents.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Venue</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(event.id)}
                      onChange={() => handleSelectRow(event.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{event.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{event.date}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{event.venue}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button className="text-sm text-blue-600 hover:text-blue-800">Edit</button>
                      <button className="text-sm text-red-600 hover:text-red-800">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer - Minimal Info */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>{filteredEvents.length} events</span>
          {selectedRows.size > 0 && (
            <span>{selectedRows.size} selected</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default CleanAdminDashboard
