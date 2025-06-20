import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CImage,
  CBadge,
  CRow,
  CCol,
  CSpinner,
  CTooltip,
} from '@coreui/react'
import { fetchSignedUrl } from '../../assets/utils/imageUtils'
import { cilCheckCircle, cilXCircle } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

const UserView = () => {
  const { state } = useLocation()
  const user = state?.user
  const [signedUrl, setSignedUrl] = useState('')

  useEffect(() => {
    const fetchImages = async () => {
      if (!user?.image) return
      try {
        const url = await fetchSignedUrl(user.image)
        setSignedUrl(url)
      } catch (error) {
        console.error('Error fetching signed URL:', error)
      }
    }

    fetchImages()
  }, [user?.image])

  if (!user) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '200px' }}
      >
        <CSpinner color="primary" />
        <span className="ms-2">Loading user data...</span>
      </div>
    )
  }

  return (
    <CCard className="shadow-sm border-0">
      <CCardHeader className="bg-warning text-black d-flex justify-content-between align-items-center">
        <h5 className="mb-0">👤 User Profile</h5>
        <CBadge color={user.is_active ? 'success' : 'danger'}>
          {user.is_active ? 'Active' : 'Inactive'}
        </CBadge>
      </CCardHeader>

      <CCardBody>
        <CRow className="mb-4">
          <CCol md={4} className="text-center">
            <CImage
              src={signedUrl}
              alt="User Proof"
              fluid
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '10px',
                objectFit: 'cover',
              }}
              crossOrigin="anonymous"
            />
          </CCol>

          <CCol md={8}>
            <div className="d-flex align-items-center mb-2">
              <h4 className="mb-0">{user.name}</h4>
              <CTooltip content={user.is_verified ? 'Verified User' : 'Not Verified'}>
                <CIcon
                  icon={user.is_verified ? cilCheckCircle : cilXCircle}
                  className={`ms-2 ${user.is_verified ? 'text-success' : 'text-danger'}`}
                  size="lg"
                />
              </CTooltip>
              <CBadge color="info" className="ms-2">
                {user.user_type?.toUpperCase() === 'GUEST' ? 'User' : 'User'}
              </CBadge>
            </div>
            <p className="text-muted">ID: {user._id}</p>

            <div className="mb-3">
              <h6 className="fw-bold">📞 Contact Information</h6>
              <p>
                <strong>Email:</strong> {user.email || 'N/A'}
              </p>
              <p>
                <strong>Phone:</strong> {user.phone || 'N/A'}
              </p>
              {user.whatsapp && (
                <p>
                  <strong>WhatsApp:</strong> {user.whatsapp}
                </p>
              )}
            </div>

            <div className="mb-3">
              <h6 className="fw-bold">🧾 Personal Information</h6>
              {user.dob && (
                <p>
                  <strong>Date of Birth:</strong> {new Date(user.dob).toLocaleDateString()}
                </p>
              )}
              <p>
                <strong>Age:</strong> {user.age || 'N/A'}
              </p>
              <p>
                <strong>Gender:</strong> {user.gender_id?.name || 'N/A'}
              </p>
            </div>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  )
}

export default UserView
