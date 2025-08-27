import React from 'react'
import { CCard, CCardBody, CRow, CCol } from '@coreui/react'

const DaySchedule = ({ day, locations }) => {
  // Filter out locations with no slots or empty slots array
  const locationsWithSlots = locations.filter(
    (location) => Array.isArray(location.slots) && location.slots.length > 0,
  )

  // Handle empty state: show a message if no slots are available for this day
  if (locationsWithSlots.length === 0) {
    return (
      <CCard
        className="mb-4 border-0"
        style={{
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,249,250,0.95) 100%)',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
          borderRadius: '16px',
          overflow: 'hidden',
          backdropFilter: 'blur(10px)',
        }}
      >
        <CCardBody>
          <CCard
            className="border-0 shadow-none"
            style={{
              backgroundColor: '#fff',
              borderRadius: '10px',
              padding: '16px',
              border: '1px solid #f0f0f0',
            }}
          >
            <CCardBody className="p-0">
              {/* Day Header */}
              <h5
                style={{
                  fontWeight: '600',
                  fontSize: '1.1rem',
                  marginBottom: '16px',
                  color: '#000',
                }}
              >
                {day}
              </h5>
              <div className="text-muted" style={{ fontSize: '0.98rem', marginBottom: '10px' }}>
                No slots available for this day.
              </div>
            </CCardBody>
          </CCard>
        </CCardBody>
      </CCard>
    )
  }

  return (
    <CCard
      className="mb-4 border-0"
      style={{
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,249,250,0.95) 100%)',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
        borderRadius: '16px',
        overflow: 'hidden',
        backdropFilter: 'blur(10px)',
      }}
    >
      <CCardBody>
        <CCard
          className="border-0 shadow-none"
          style={{
            backgroundColor: '#fff',
            borderRadius: '10px',
            padding: '16px',
            border: '1px solid #f0f0f0',
          }}
        >
          <CCardBody className="p-0">
            {/* Day Header */}
            <h5
              style={{
                fontWeight: '600',
                fontSize: '1.1rem',
                marginBottom: '16px',
                color: '#000',
              }}
            >
              {day}
            </h5>

            {/* Locations with available slots only */}
            {locationsWithSlots.map((location, index) => (
              <div key={index} style={{ marginBottom: '20px' }}>
                {/* Location Name */}
                <h6
                  style={{
                    fontWeight: '500',
                    fontSize: '0.95rem',
                    marginBottom: '10px',
                    color: '#000',
                  }}
                >
                  {location.name}
                </h6>

                {/* Slots */}
                <CRow className="g-2">
                  {location.slots.map((slot, idx) => (
                    <CCol key={idx} xs="auto" className="p-1">
                      <div
                        style={{
                          padding: '6px 16px',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          fontWeight: '500',
                          background:
                            'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,249,250,0.95) 100%)',
                          color: '#000',
                          border: '1px solid #ddd',
                          cursor: 'default',
                          transition: 'all 0.2s ease-in-out',
                        }}
                      >
                        {slot}
                      </div>
                    </CCol>
                  ))}
                </CRow>
              </div>
            ))}
          </CCardBody>
        </CCard>
      </CCardBody>
    </CCard>
  )
}

export default DaySchedule
