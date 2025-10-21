import React from 'react'
import { CRow, CCol, CImage, CButton, CBadge, CCard, CCardBody, CContainer } from '@coreui/react'
import { cilSwapHorizontal, cilPencil } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'

// const booking = {
//   lawyer: {
//     name: 'Barr. Ali Raza',
//     email: 'abc123@gmail.com',
//     phone: '0300-123442321',
//     age: 24,
//     gender: 'Male',
//     specialty: ['Tax', 'FBR/FBI'],
//   },
//   client: {
//     name: 'Shahzaib',
//     email: 'abc123@gmail.com',
//     phone: '0321-55434521',
//     age: 28,
//     gender: 'Male',
//     reason: 'Tax, FBR',
//   },
//   category: 'Criminal Defense',
//   type: 'Home Office',
//   date: '08/05/2025',
//   time: '8:00PM',
//   address: '056/1, Phase 3, Sector W, Bahria Town Near RailwayStation Rawalpindi, Islamabad',
// }

const BookingDetail = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const booking = location?.state?.booking

  // Helper functions
  const getAge = (dob) => {
    if (!dob) return '-'
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString()
  }

  const lawyerCategories = booking?.lawyer?.categories?.map((cat) => cat?.name).join(', ') || '-'

  return (
    <CContainer className="my-4">
      <h4 className="fw-bold mb-3">Booking Details</h4>

      <CCard className="border-0 shadow-sm position-relative">
        {/* Edit pill (top-right) */}
        {/* <CButton
          color="light"
          variant="outline"
          size="sm"
          className="position-absolute top-0 end-0 m-3"
        >
          <CIcon icon={cilPencil} className="me-2" />
          Edit
        </CButton> */}

        <CCardBody className="pt-4 pb-3 position-relative">
          {/* vertical orange divider */}
          <div
            className="d-none d-md-block position-absolute top-0"
            style={{
              marginTop: '20px',
              top: '16px',
              bottom: '0',
              left: '45%',
              width: '1px',
              background: 'rgb(244, 180, 0)',
              height: '40%',
            }}
          />

          <CRow className="gx-4">
            {/* Lawyer Details */}
            <CCol md={6}>
              <h6 className="fw-bold mb-4" style={{ letterSpacing: '0.5px' }}>
                Lawyer Details
              </h6>

              <CRow className="g-4 align-items-start">
                {/* Left: avatar */}
                <CCol xs="auto" className="text-center">
                  <div
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      display: 'inline-block',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                      marginBottom: '1.5rem',
                    }}
                  >
                    <CImage
                      src={booking?.lawyer?.image}
                      width={120}
                      height={120}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                </CCol>

                {/* Right: text info */}
                <CCol>
                  <div style={{ marginBottom: '18px' }}>
                    <h5
                      className="fw-bold mb-1"
                      style={{
                        lineHeight: '1.4',
                        letterSpacing: '0.2px',
                        fontSize: '1.25rem',
                        display: 'inline-block',
                        verticalAlign: 'middle',
                      }}
                    >
                      {booking?.lawyer?.name}
                    </h5>
                    <span
                      className="ms-2"
                      style={{ color: '#f4b400', fontSize: 20, verticalAlign: 'middle' }}
                      aria-label="verified"
                      title="Verified"
                    >
                      ★
                    </span>
                  </div>
                  <div style={{ lineHeight: '1.8', fontSize: '1.05rem' }}>
                    <p className="mb-2">
                      <strong>Email Address: </strong>
                      <span className="ms-1">{booking?.lawyer?.email || '-'}</span>
                    </p>
                    <p className="mb-2">
                      <strong>Phone: </strong>
                      <span className="ms-1">{booking?.lawyer?.phone || '-'}</span>
                    </p>
                    <p className="mb-2">
                      <strong>Gender: </strong>
                      <span className="ms-1">{booking?.lawyer?.gender || '-'}</span>
                    </p>
                    <p className="mb-2">
                      <strong>Age: </strong>
                      <span className="ms-1">{getAge(booking?.lawyer?.dob)} yrs</span>
                    </p>
                    <p className="mb-2">
                      <strong>Whatsapp: </strong>
                      <span className="ms-1">{booking?.lawyer?.whatsapp || '-'}</span>
                    </p>
                  </div>
                  <div
                    style={{
                      lineHeight: '1.8',
                      fontSize: '1.05rem',
                      maxWidth: '320px',
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    <p className="mb-2" style={{ marginBottom: 0 }}>
                      <strong>Categories: </strong>
                      <span className="ms-1">{lawyerCategories}</span>
                    </p>
                  </div>
                </CCol>
              </CRow>
            </CCol>

            {/* Client Details */}
            <CCol md={6}>
              <h6 className="fw-bold mb-3" style={{ letterSpacing: '0.5px' }}>
                Client Details
              </h6>

              <CRow className="g-4 align-items-start">
                {/* Left: avatar + stacked button */}
                <CCol xs="auto" className="text-center">
                  <div
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      display: 'inline-block',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                      marginBottom: '1.5rem',
                    }}
                  >
                    <CImage
                      src={booking?.user?.image}
                      width={120}
                      height={120}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div className="d-grid">
                    <CButton color="light" variant="outline">
                      View Profile
                    </CButton>
                  </div>
                </CCol>

                {/* Right: text info */}
                <CCol>
                  <div style={{ marginBottom: '18px' }}>
                    <h5
                      className="fw-bold mb-1"
                      style={{
                        lineHeight: '1.4',
                        letterSpacing: '0.2px',
                        fontSize: '1.25rem',
                        display: 'inline-block',
                        verticalAlign: 'middle',
                      }}
                    >
                      {booking?.user?.name}
                    </h5>
                  </div>
                  <div style={{ lineHeight: '1.8', fontSize: '1.05rem' }}>
                    <p className="mb-2">
                      <strong>Email Address: </strong>
                      <span className="ms-1">{booking?.user?.email || '-'}</span>
                    </p>
                    <p className="mb-2">
                      <strong>Phone: </strong>
                      <span className="ms-1">{booking?.user?.phone || '-'}</span>
                    </p>
                    <p className="mb-2">
                      <strong>Gender: </strong>
                      <span className="ms-1">{booking?.user?.gender || '-'}</span>
                    </p>
                    <p className="mb-2">
                      <strong>Age: </strong>
                      <span className="ms-1">{getAge(booking?.user?.dob)} yrs</span>
                    </p>
                    <p className="mb-2">
                      <strong>Whatsapp: </strong>
                      <span className="ms-1">{booking?.user?.whatsapp || '-'}</span>
                    </p>
                  </div>
                </CCol>
              </CRow>
            </CCol>
          </CRow>

          <hr className="mt-4 mb-3" style={{ borderColor: '#e0e0e0' }} />

          <CCard className="border-0 shadow-sm position-relative mt-4">
            <CCardBody className="pt-4 pb-3 position-relative">
              <div className="mb-2">
                <p className="mb-2">
                  <strong>Status: </strong>
                  <CBadge
                    color={
                      booking?.status === 'completed'
                        ? 'success'
                        : booking?.status === 'cancelled'
                          ? 'danger'
                          : 'secondary'
                    }
                    className="ms-1"
                  >
                    {booking?.status || '-'}
                  </CBadge>
                </p>
                <p className="mb-2">
                  <strong>Appointment Type: </strong>
                  <CBadge color="dark" className="ms-1">
                    {booking?.location || '-'}
                  </CBadge>
                </p>
                <p className="mb-2">
                  <strong>Appointment Date / Time: </strong>
                  {formatDate(booking?.date)} | {booking?.slot || '-'}
                </p>
                <p className="mb-2">
                  <strong>Payment Status: </strong>
                  <CBadge
                    color={
                      booking?.payments?.status === 'paid'
                        ? 'success'
                        : booking?.payments?.status === 'unpaid'
                          ? 'warning'
                          : 'secondary'
                    }
                    className="ms-1"
                  >
                    {booking?.payments?.status || '-'}
                  </CBadge>
                </p>
                <p className="mb-2">
                  <strong>Payment Type: </strong>
                  <span className="ms-1">{booking?.payments?.payment_type || '-'}</span>
                </p>
                <p className="mb-2">
                  <strong>Payable Amount: </strong>
                  <span className="ms-1">
                    {typeof booking?.payments?.payable_amount === 'number'
                      ? `Rs. ${booking.payments.payable_amount}`
                      : '-'}
                  </span>
                </p>
                <p className="mb-2">
                  <strong>Total Amount: </strong>
                  <span className="ms-1">
                    {typeof booking?.payments?.total_amount === 'number'
                      ? `Rs. ${booking.payments.total_amount}`
                      : '-'}
                  </span>
                </p>
                {booking?.location !== 'Online' && (
                  <p className="mb-0">
                    <strong>Address: </strong>
                    <span className="ms-1">{booking?.address || '-'}</span>
                  </p>
                )}
              </div>
            </CCardBody>
          </CCard>

          {/* Footer Buttons (right-aligned) */}
          <div className="d-flex justify-content-end mt-4">
            <CButton color="danger" variant="outline" className="me-3 px-4">
              Cancel Booking
            </CButton>
            <CButton color="warning" className="text-white px-4">
              Reschedule Booking
            </CButton>
          </div>
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default BookingDetail
