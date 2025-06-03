import {
  CCard,
  CCardBody,
  CButton,
  CRow,
  CCol,
  CFormTextarea,
  CImage,
  CAvatar,
  CBadge,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CToaster,
  CToast,
  CToastHeader,
  CToastBody,
  CSpinner,
} from '@coreui/react'
import { useParams } from 'react-router-dom'
import {
  useGetVerificationByIdQuery,
  useVerifyDocumentsMutation,
  useVerifyLawyerMutation,
} from '../../../services/api'

import { useState, useEffect } from 'react'
import { fetchSignedUrl, fetchMultipleSignedUrls } from '../../../assets/utils/imageUtils'

const LawyerVerification = () => {
  const { id } = useParams()
  const { data, isLoading, error } = useGetVerificationByIdQuery(id)
  const [verifyDocuments, { isLoading: isVerifying }] = useVerifyDocumentsMutation()
  const [verifyLawyer, { isLoading: isSaving }] = useVerifyLawyerMutation()
  const [avatarUrl, setAvatarUrl] = useState('')
  const [note, setNote] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastColor, setToastColor] = useState('success')
  const lawyer = data?.data

  useEffect(() => {
    if (lawyer?.image) {
      fetchSignedUrl(lawyer.image).then((url) => setAvatarUrl(url))
    }
  }, [lawyer])

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <CSpinner color="primary" style={{ width: '3rem', height: '3rem' }} variant="grow" />
      </div>
    )
  }

  if (error) return <div>Error loading verification data</div>

  const handleNoteChange = (e) => setNote(e.target.value)
  const handleImageClick = (url) => {
    setSelectedImage(url)
    setShowModal(true)
  }

  const handleApprove = async (section, lawyer) => {
    const data = {
      verification_id: lawyer._id,
      section: section,
      is_verified: true,
    }

    try {
      await verifyDocuments(data).unwrap()
      triggerToast(`Successfully verified ${section}`, 'success')
    } catch (error) {
      console.error(error)
      triggerToast(`Failed to verify ${section}`, 'danger')
    }
  }

  const handleSave = async (status) => {
    const data = {
      lawyer_id: lawyer.lawyer,
      verification_status: status,
      ...(status === 'Rejected' && note && { rejection_reason: note }),
    }

    try {
      await verifyLawyer(data).unwrap()
      triggerToast(
        `Lawyer ${status === 'Verified' ? 'approved' : 'rejected'} successfully`,
        'success',
      )
    } catch (error) {
      console.error(error)
      triggerToast('Action failed. Please try again.', 'danger')
    }
  }

  const triggerToast = (message, color = 'success') => {
    setToastMessage(message)
    setToastColor(color)
    setShowToast(true)

    setTimeout(() => setShowToast(false), 3000)
  }
  return (
    <>
      <CToaster placement="top-end">
        {showToast && (
          <CToast
            visible
            color={toastColor}
            className="text-white align-items-center"
            onClose={() => setShowToast(false)}
          >
            <CToastHeader closeButton>
              <strong className="me-auto">Notification</strong>
            </CToastHeader>
            <CToastBody>{toastMessage}</CToastBody>
          </CToast>
        )}
      </CToaster>
      <CCard>
        <CCardBody>
          {/* Profile Header */}
          <CRow className="align-items-center mb-4 p-4 bg-light rounded">
            <CCol xs={12} md="auto" className="text-center">
              <div className="position-relative">
                <CImage
                  src={avatarUrl}
                  alt="Lawyer Proof"
                  style={{
                    width: '300px',
                    height: '200px',
                    borderRadius: '0px',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    cursor: 'pointer',
                  }}
                  crossOrigin="anonymous"
                  onClick={() => handleImageClick(avatarUrl)}
                />

                <CBadge
                  className="position-absolute bottom-0 end-0"
                  color={
                    lawyer?.verification_status === 'Verified'
                      ? 'success'
                      : lawyer?.verification_status === 'Pending'
                        ? 'warning'
                        : lawyer?.verification_status === 'Rejected'
                          ? 'danger'
                          : 'secondary'
                  }
                  style={{ transform: 'translate(25%, 25%)' }}
                >
                  {lawyer?.verification_status || 'Not Started'}
                </CBadge>
              </div>
            </CCol>
            <CCol className="ps-4">
              <h3 className="mb-3 fw-bold text-primary">{lawyer?.name}</h3>
              <div className="d-flex flex-column gap-2">
                <div className="d-flex align-items-center">
                  <i className="fas fa-id-card me-2 text-muted"></i>
                  <span className="text-muted">CNIC:</span>
                  <span className="ms-2 fw-medium">{lawyer?.cnic}</span>
                </div>
                <div className="d-flex align-items-center">
                  <i className="fas fa-calendar me-2 text-muted"></i>
                  <span className="text-muted">Date of Birth:</span>
                  <span className="ms-2 fw-medium">
                    {lawyer?.date_of_birth
                      ? new Date(lawyer?.date_of_birth).toLocaleDateString()
                      : ''}
                  </span>
                </div>
                <div className="d-flex align-items-center">
                  <i className="fas fa-venus-mars me-2 text-muted"></i>
                  <span className="text-muted">Gender:</span>
                  <span className="ms-2 fw-medium">{lawyer?.gender?.name}</span>
                </div>
              </div>
            </CCol>
          </CRow>

          {/* Proof Sections */}
          <VerificationSection
            title="ID Card Verification"
            images={lawyer?.proof_files}
            onApprove={() => handleApprove('cnic', lawyer)}
            isVerifying={isVerifying}
          />
          <VerificationSection
            title={`Provisional Bar - ${lawyer?.provisional_bar?.name?.name || ''}`}
            images={lawyer?.provisional_bar?.proof_files}
            onApprove={() => handleApprove('provisional_bar', lawyer)}
            isVerifying={isVerifying}
          />
          <VerificationSection
            title="High Court"
            images={lawyer?.high_court?.proof_files}
            onApprove={() => handleApprove('high_court', lawyer)}
            isVerifying={isVerifying}
          />
          <VerificationSection
            title="Supreme Court"
            images={lawyer?.supreme_court?.proof_files}
            onApprove={() => handleApprove('supreme_court', lawyer)}
            isVerifying={isVerifying}
          />
          <VerificationSection
            title="Barrister"
            images={lawyer?.barrister?.proof_files}
            onApprove={() => handleApprove('barrister', lawyer)}
            isVerifying={isVerifying}
          />
          {/* Notes Input */}
          <div className="mt-4">
            <h6>Add Note</h6>
            <CFormTextarea
              rows={3}
              value={note}
              placeholder="Images are blurred"
              onChange={handleNoteChange}
            />
          </div>
          {/* Action Buttons */}
          {isSaving ? (
            <div className="d-flex justify-content-end mt-4">
              <CSpinner size="sm" className="me-2" />
              <span>Saving...</span>
            </div>
          ) : (
            <div className="d-flex justify-content-end mt-4">
              <CButton color="danger" className="me-2" onClick={() => handleSave('Rejected')}>
                Reject
              </CButton>
              <CButton color="success" onClick={() => handleSave('Verified')}>
                Approve
              </CButton>
            </div>
          )}
          {/* Image Preview Modal */}
          <CModal visible={showModal} onClose={() => setShowModal(false)} size="lg">
            <CModalHeader onClose={() => setShowModal(false)}>
              <CModalTitle>Image Preview</CModalTitle>
            </CModalHeader>
            <CModalBody className="text-center">
              {selectedImage && (
                <CImage
                  src={selectedImage}
                  alt="Preview"
                  style={{
                    width: '300px',
                    height: '200px',
                    borderRadius: '0px',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    cursor: 'pointer',
                  }}
                  crossOrigin="anonymous"
                />
              )}
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={() => setShowModal(false)}>
                Close
              </CButton>
            </CModalFooter>
          </CModal>
        </CCardBody>
      </CCard>
    </>
  )
}

// Reusable Verification Section Component
export const VerificationSection = ({ title, images = [], onApprove, isVerifying }) => {
  const [signedUrls, setSignedUrls] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const fetchImages = async () => {
      if (!images?.length) return
      try {
        const urls = await fetchMultipleSignedUrls(images.filter(Boolean))
        setSignedUrls(urls.filter(Boolean))
      } catch (error) {
        console.error('Error fetching signed URLs:', error)
      }
    }

    fetchImages()
  }, [images])

  if (!signedUrls.length) return null

  return (
    <CCard className="mb-4">
      <CCardBody>
        <h6 className="mb-3">{title}</h6>
        <CRow className="g-3 align-items-center">
          <CCol xs={12}>
            <div className="d-flex flex-wrap gap-3">
              {signedUrls.map((url, idx) => (
                <CImage
                  key={idx}
                  src={url}
                  thumbnail
                  style={{
                    width: '300px',
                    height: '200px',
                    borderRadius: '0px',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    cursor: 'pointer',
                  }}
                  crossOrigin="anonymous"
                  onClick={() => {
                    setSelectedImage(url)
                    setShowModal(true)
                  }}
                />
              ))}
            </div>
          </CCol>
        </CRow>

        {/* Approve/Decline Buttons */}
        {isVerifying ? (
          <div className="d-flex justify-content-end mt-3">
            <CSpinner size="sm" className="me-2" />
            <span>Verifying...</span>
          </div>
        ) : (
          <div className="d-flex justify-content-end mt-3">
            <CButton color="danger" variant="outline" className="me-2">
              Decline
            </CButton>
            <CButton color="success" onClick={onApprove}>
              Approve
            </CButton>
          </div>
        )}

        {/* Image Preview Modal */}
        <CModal
          visible={showModal}
          onClose={() => {
            setShowModal(false)
            setSelectedImage(null)
          }}
          size="lg"
        >
          <CModalHeader onClose={() => setShowModal(false)}>
            <CModalTitle>Image Preview</CModalTitle>
          </CModalHeader>
          <CModalBody className="text-center">
            {selectedImage && (
              <CImage
                src={selectedImage}
                alt="Preview"
                style={{
                  width: '500px',
                  height: '200px',
                  borderRadius: '0px',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  cursor: 'pointer',
                }}
                crossOrigin="anonymous"
              />
            )}
          </CModalBody>
          <CModalFooter>
            <CButton
              color="secondary"
              onClick={() => {
                setShowModal(false)
                setSelectedImage(null)
              }}
            >
              Close
            </CButton>
          </CModalFooter>
        </CModal>
      </CCardBody>
    </CCard>
  )
}
export default LawyerVerification
