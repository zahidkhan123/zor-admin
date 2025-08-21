import React from 'react'
import { CCard, CCardBody, CRow, CCol } from '@coreui/react'

const DaySchedule = ({ day, locations }) => {
  return (
    <CCard className="mb-4 border-0 shadow-sm rounded-3" style={{ backgroundColor: 'transparent' }}>
      <CCardBody>
        {/* Day Header */}
        <div
          className="d-flex align-items-center justify-content-between mb-3"
          style={{
            borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
            paddingBottom: '6px',
          }}
        >
          <h5
            className="fw-bold mb-0"
            style={{
              color: 'var(--cui-body-color)',
              fontSize: '1rem',
            }}
          >
            {day}
          </h5>
        </div>

        {/* Locations & Slots */}
        {locations.map((location, index) => (
          <div key={index} className="mb-4">
            {/* Location Title */}
            <h6
              className="fw-semibold mb-3"
              style={{
                color: 'var(--cui-body-color)',
                fontSize: '0.9rem',
                letterSpacing: '0.2px',
              }}
            >
              {location.name}
            </h6>

            {/* Time Slots */}
            <CRow className="g-2">
              {location.slots && location.slots.length > 0 ? (
                location.slots.map((slot, idx) => (
                  <CCol key={idx} xs="auto">
                    <div
                      className="slot-chip"
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        cursor: 'default',
                        background: 'transparent',
                        color: '#6c757d', // Bootstrap gray-600
                        border: '1px solid var(--cui-gray-300)',
                        boxShadow: 'none',
                        transition: 'none',
                      }}
                    >
                      {slot}
                    </div>
                  </CCol>
                ))
              ) : (
                <p className="text-muted ms-2">No slots available</p>
              )}
            </CRow>
          </div>
        ))}
      </CCardBody>
    </CCard>
  )
}

export default DaySchedule
