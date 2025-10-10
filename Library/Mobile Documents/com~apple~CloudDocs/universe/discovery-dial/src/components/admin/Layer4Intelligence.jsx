import React from 'react'
import ZeroInboxWidget from './ZeroInboxWidget'

const Layer4Intelligence = ({ recommendations = [], onApprove, onReject, onShowDetails }) => {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <ZeroInboxWidget
          recommendations={recommendations}
          onApprove={onApprove}
          onReject={onReject}
          onShowDetails={onShowDetails}
        />
      </div>
    </div>
  )
}

export default Layer4Intelligence
