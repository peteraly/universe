import React from 'react'

const ProfessionalSkeleton = ({ type = 'card', count = 1 }) => {
  const SkeletonCard = () => (
    <div className="card animate-pulse">
      <div className="card-body">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  )

  const SkeletonTable = () => (
    <div className="card animate-pulse">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="flex space-x-4">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[...Array(4)].map((_, i) => (
                <th key={i} className="px-6 py-3 text-left">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[...Array(5)].map((_, i) => (
              <tr key={i}>
                {[...Array(4)].map((_, j) => (
                  <td key={j} className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const SkeletonKPI = () => (
    <div className="card animate-pulse">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-8 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-3 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="w-20 h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  )

  const SkeletonRecommendation = () => (
    <div className="p-4 rounded-lg border border-gray-200 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <div className="h-5 bg-gray-200 rounded-full w-16"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="flex items-center space-x-4">
            <div className="h-3 bg-gray-200 rounded w-20"></div>
            <div className="h-3 bg-gray-200 rounded w-24"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
        <div className="flex space-x-2 ml-4">
          <div className="h-6 bg-gray-200 rounded w-16"></div>
          <div className="h-6 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  )

  const SkeletonSidebar = () => (
    <div className="w-64 bg-white border-r border-gray-200 h-full animate-pulse">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      </div>
      <div className="p-4 space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3 p-3">
            <div className="w-6 h-6 bg-gray-200 rounded"></div>
            <div className="space-y-1">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return <SkeletonCard />
      case 'table':
        return <SkeletonTable />
      case 'kpi':
        return <SkeletonKPI />
      case 'recommendation':
        return <SkeletonRecommendation />
      case 'sidebar':
        return <SkeletonSidebar />
      default:
        return <SkeletonCard />
    }
  }

  if (count === 1) {
    return renderSkeleton()
  }

  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, index) => (
        <div key={index}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  )
}

// Specialized skeleton components
export const CardSkeleton = (props) => <ProfessionalSkeleton type="card" {...props} />
export const TableSkeleton = (props) => <ProfessionalSkeleton type="table" {...props} />
export const KPISkeleton = (props) => <ProfessionalSkeleton type="kpi" {...props} />
export const RecommendationSkeleton = (props) => <ProfessionalSkeleton type="recommendation" {...props} />
export const SidebarSkeleton = (props) => <ProfessionalSkeleton type="sidebar" {...props} />

export default ProfessionalSkeleton
