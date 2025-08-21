import React from 'react'
import { CCard, CCardBody, CRow, CCol } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCheckCircle } from '@coreui/icons'

const getCardBg = () => ({
  background:
    'linear-gradient(135deg, var(--cui-body-bg) 60%, var(--cui-primary-bg, #e3f2fd) 100%)',
  borderRadius: '12px',
  border: '1px solid var(--cui-gray-200, #e0e0e0)',
})

const getInnerCardBg = () => ({
  background: '#fff',
  borderRadius: '10px',
  border: '1px solid var(--cui-gray-200, #e0e0e0)',
})

const getTextColor = () => ({
  color: 'var(--cui-body-color, #222)',
})

const getMutedTextColor = () => ({
  color: 'var(--cui-gray-700, #555)',
})

const LawyerProfileHeader = ({ lawyer }) => {
  return (
    <CCard className="mb-4 border-0" style={getCardBg()}>
      <CCardBody>
        <CRow className="align-items-center">
          {/* Left Section - Profile Picture */}
          <CCol md="2" className="text-center">
            <div
              style={{
                width: '140px',
                height: '140px',
                borderRadius: '50%',
                background: '#ccc',
                overflow: 'hidden',
                margin: 'auto',
              }}
            >
              <img
                src={lawyer?.image || 'https://via.placeholder.com/150'}
                alt="Lawyer"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '50%',
                }}
              />
            </div>
          </CCol>

          {/* Middle Section - Lawyer Details */}
          <CCol md="6">
            <div className="d-flex align-items-center mb-2">
              <h4 className="fw-bold mb-0 me-2" style={getTextColor()}>
                {lawyer?.name}
              </h4>
              <CIcon
                icon={cilCheckCircle}
                style={{
                  color: '#fbc02d',
                  fontSize: '1.2rem',
                  marginTop: '2px',
                }}
              />
            </div>
            <p className="mb-1" style={getMutedTextColor()}>
              <strong>Email Address :</strong> {lawyer?.email}
            </p>
            <p className="mb-1" style={getMutedTextColor()}>
              <strong>Phone:</strong> {lawyer?.phone}
            </p>
            <p className="mb-1" style={getMutedTextColor()}>
              <strong>Age/Gender:</strong> {lawyer?.age}yrs/{lawyer?.gender}
            </p>
            <p className="mb-0" style={getMutedTextColor()}>
              <strong>Specialty:</strong> {lawyer?.specialty}
            </p>
          </CCol>

          {/* Right Section - Revenue Cards in one row */}
          <CCol md="4">
            <CRow className="g-2">
              {[
                { label: 'Total Revenue', value: lawyer?.totalRevenue },
                { label: 'Cash Revenue', value: lawyer?.cashRevenue },
                { label: 'Online Revenue', value: lawyer?.onlineRevenue },
              ].map((item, idx) => (
                <CCol xs="4" key={idx}>
                  <CCard
                    className="border-0 shadow-sm text-center"
                    style={{
                      ...getInnerCardBg(),
                      padding: '12px 6px',
                      minHeight: '80px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <p
                      className="mb-1 fw-semibold"
                      style={{ fontSize: '0.9rem', ...getMutedTextColor() }}
                    >
                      {item.label}
                    </p>
                    <h5
                      className="fw-bold"
                      style={{
                        fontSize: '1.1rem',
                        color: '#222',
                        marginBottom: 0,
                      }}
                    >
                      {item?.value?.toLocaleString() ?? '--'}
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: 'var(--cui-gray-600, #888)',
                          marginLeft: '2px',
                        }}
                      >
                        PKR
                      </span>
                    </h5>
                  </CCard>
                </CCol>
              ))}
            </CRow>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  )
}

export default LawyerProfileHeader
