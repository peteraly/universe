import React, { useState } from 'react'

const VenueTaxonomyEditor = ({ data, onUpdate, canEdit }) => {
  const [localData, setLocalData] = useState(data || { categories: [], subcategories: {} })
  const [newCategory, setNewCategory] = useState('')
  const [newSubcategory, setNewSubcategory] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const handleAddCategory = () => {
    if (newCategory.trim() && !localData.categories.includes(newCategory.trim())) {
      const updatedData = {
        ...localData,
        categories: [...localData.categories, newCategory.trim()],
        subcategories: {
          ...localData.subcategories,
          [newCategory.trim()]: []
        }
      }
      setLocalData(updatedData)
      onUpdate(updatedData)
      setNewCategory('')
    }
  }

  const handleRemoveCategory = (category) => {
    const updatedData = {
      ...localData,
      categories: localData.categories.filter(c => c !== category),
      subcategories: Object.fromEntries(
        Object.entries(localData.subcategories).filter(([key]) => key !== category)
      )
    }
    setLocalData(updatedData)
    onUpdate(updatedData)
  }

  const handleAddSubcategory = () => {
    if (selectedCategory && newSubcategory.trim()) {
      const updatedData = {
        ...localData,
        subcategories: {
          ...localData.subcategories,
          [selectedCategory]: [
            ...(localData.subcategories[selectedCategory] || []),
            newSubcategory.trim()
          ]
        }
      }
      setLocalData(updatedData)
      onUpdate(updatedData)
      setNewSubcategory('')
    }
  }

  const handleRemoveSubcategory = (category, subcategory) => {
    const updatedData = {
      ...localData,
      subcategories: {
        ...localData.subcategories,
        [category]: localData.subcategories[category].filter(s => s !== subcategory)
      }
    }
    setLocalData(updatedData)
    onUpdate(updatedData)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Venue Taxonomy Editor</h3>
        <p className="text-sm text-gray-600">
          Manage venue categories and subcategories for event classification
        </p>
      </div>

      {/* Add New Category */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Add New Category</h4>
        <div className="flex space-x-3">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Enter category name"
            disabled={!canEdit}
            className={`flex-1 border border-gray-300 rounded px-3 py-2 ${
              canEdit ? '' : 'bg-gray-100 cursor-not-allowed'
            }`}
          />
          <button
            onClick={handleAddCategory}
            disabled={!canEdit || !newCategory.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Category
          </button>
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-4 py-3 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-900">Categories ({localData.categories.length})</h4>
        </div>
        <div className="divide-y divide-gray-200">
          {localData.categories.map((category) => (
            <div key={category} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-sm font-medium text-gray-900">{category}</h5>
                {canEdit && (
                  <button
                    onClick={() => handleRemoveCategory(category)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* Subcategories */}
              <div className="ml-4">
                <div className="flex items-center space-x-3 mb-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    <option value="">Select category for subcategory</option>
                    {localData.categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={newSubcategory}
                    onChange={(e) => setNewSubcategory(e.target.value)}
                    placeholder="Enter subcategory"
                    disabled={!canEdit}
                    className={`border border-gray-300 rounded px-2 py-1 text-sm ${
                      canEdit ? '' : 'bg-gray-100 cursor-not-allowed'
                    }`}
                  />
                  <button
                    onClick={handleAddSubcategory}
                    disabled={!canEdit || !selectedCategory || !newSubcategory.trim()}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(localData.subcategories[category] || []).map((subcategory) => (
                    <span
                      key={subcategory}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {subcategory}
                      {canEdit && (
                        <button
                          onClick={() => handleRemoveSubcategory(category, subcategory)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Categories</p>
              <p className="text-2xl font-semibold text-gray-900">{localData.categories.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Subcategories</p>
              <p className="text-2xl font-semibold text-gray-900">
                {Object.values(localData.subcategories).reduce((sum, subs) => sum + subs.length, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Avg Subcategories</p>
              <p className="text-2xl font-semibold text-gray-900">
                {localData.categories.length > 0 
                  ? Math.round(Object.values(localData.subcategories).reduce((sum, subs) => sum + subs.length, 0) / localData.categories.length)
                  : 0
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {!canEdit && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Read-Only Access</h4>
              <p className="text-sm text-yellow-700">You don't have permission to modify venue taxonomy.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VenueTaxonomyEditor


