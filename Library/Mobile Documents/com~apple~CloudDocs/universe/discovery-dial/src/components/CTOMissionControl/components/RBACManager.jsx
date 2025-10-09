import React, { useState } from 'react'

const RBACManager = ({ data, onUpdate, canEdit }) => {
  const [localData, setLocalData] = useState(data || { roles: [], permissions: {} })
  const [selectedRole, setSelectedRole] = useState('')
  const [newPermission, setNewPermission] = useState('')

  const allPermissions = [
    'events:read',
    'events:write',
    'events:delete',
    'config:read',
    'config:write',
    'health:read',
    'health:write',
    'users:read',
    'users:write',
    'users:delete',
    'admin:access',
    'rollback:execute'
  ]

  const handleAddPermission = () => {
    if (selectedRole && newPermission && !localData.permissions[selectedRole]?.includes(newPermission)) {
      const updatedData = {
        ...localData,
        permissions: {
          ...localData.permissions,
          [selectedRole]: [
            ...(localData.permissions[selectedRole] || []),
            newPermission
          ]
        }
      }
      setLocalData(updatedData)
      onUpdate(updatedData)
      setNewPermission('')
    }
  }

  const handleRemovePermission = (role, permission) => {
    const updatedData = {
      ...localData,
      permissions: {
        ...localData.permissions,
        [role]: localData.permissions[role].filter(p => p !== permission)
      }
    }
    setLocalData(updatedData)
    onUpdate(updatedData)
  }

  const handleTogglePermission = (role, permission) => {
    const currentPermissions = localData.permissions[role] || []
    const hasPermission = currentPermissions.includes(permission)
    
    const updatedData = {
      ...localData,
      permissions: {
        ...localData.permissions,
        [role]: hasPermission
          ? currentPermissions.filter(p => p !== permission)
          : [...currentPermissions, permission]
      }
    }
    setLocalData(updatedData)
    onUpdate(updatedData)
  }

  const getRoleDescription = (role) => {
    switch (role) {
      case 'super_admin': return 'Full system access with all permissions'
      case 'admin': return 'Administrative access with most permissions'
      case 'curator': return 'Event curation and management access'
      case 'agent': return 'Limited access for automated agents'
      case 'viewer': return 'Read-only access for viewing data'
      default: return 'Custom role'
    }
  }

  const getPermissionDescription = (permission) => {
    switch (permission) {
      case 'events:read': return 'View events and event data'
      case 'events:write': return 'Create and modify events'
      case 'events:delete': return 'Delete events (soft delete)'
      case 'config:read': return 'View system configuration'
      case 'config:write': return 'Modify system configuration'
      case 'health:read': return 'View system health metrics'
      case 'health:write': return 'Modify system health settings'
      case 'users:read': return 'View user information'
      case 'users:write': return 'Create and modify users'
      case 'users:delete': return 'Delete user accounts'
      case 'admin:access': return 'Access admin panel'
      case 'rollback:execute': return 'Execute system rollbacks'
      default: return 'Custom permission'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">RBAC Manager</h3>
        <p className="text-sm text-gray-600">
          Manage role-based access control and permissions
        </p>
      </div>

      {/* Add Permission */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Add Permission to Role</h4>
        <div className="flex space-x-3">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            disabled={!canEdit}
            className={`border border-gray-300 rounded px-3 py-2 ${
              canEdit ? '' : 'bg-gray-100 cursor-not-allowed'
            }`}
          >
            <option value="">Select role</option>
            {localData.roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <select
            value={newPermission}
            onChange={(e) => setNewPermission(e.target.value)}
            disabled={!canEdit}
            className={`border border-gray-300 rounded px-3 py-2 ${
              canEdit ? '' : 'bg-gray-100 cursor-not-allowed'
            }`}
          >
            <option value="">Select permission</option>
            {allPermissions.map(permission => (
              <option key={permission} value={permission}>{permission}</option>
            ))}
          </select>
          <button
            onClick={handleAddPermission}
            disabled={!canEdit || !selectedRole || !newPermission}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Permission
          </button>
        </div>
      </div>

      {/* Roles and Permissions */}
      <div className="space-y-4">
        {localData.roles.map((role) => (
          <div key={role} className="bg-white border border-gray-200 rounded-lg">
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 capitalize">
                    {role.replace('_', ' ')}
                  </h4>
                  <p className="text-xs text-gray-500">{getRoleDescription(role)}</p>
                </div>
                <div className="text-sm text-gray-500">
                  {localData.permissions[role]?.length || 0} permissions
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {allPermissions.map((permission) => {
                  const hasPermission = localData.permissions[role]?.includes(permission) || false
                  return (
                    <div key={permission} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={hasPermission}
                        onChange={() => handleTogglePermission(role, permission)}
                        disabled={!canEdit}
                        className="rounded border-gray-300"
                      />
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-900">
                          {permission}
                        </label>
                        <p className="text-xs text-gray-500">
                          {getPermissionDescription(permission)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Permission Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Roles</p>
              <p className="text-2xl font-semibold text-gray-900">{localData.roles.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Permissions</p>
              <p className="text-2xl font-semibold text-gray-900">
                {Object.values(localData.permissions).reduce((sum, perms) => sum + perms.length, 0)}
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
              <p className="text-sm text-yellow-700">You don't have permission to modify RBAC settings.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RBACManager
