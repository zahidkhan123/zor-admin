import {
  CCard,
  CCardBody,
  CButton,
  CRow,
  CCol,
  CFormTextarea,
  CImage,
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
import { CTooltip } from '@coreui/react'
import { cilCheckCircle, cilClock, cilFlagAlt } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import {
  useGetVerificationByIdQuery,
  useVerifyLawyerMutation,
  useFlagLawyerMutation,
} from '../../../services/api'

import { useState, useEffect } from 'react'
import { fetchSignedUrl, fetchMultipleSignedUrls } from '../../../assets/utils/imageUtils'
import { DynamicModal } from '../../../components'

const LawyerVerification = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { fromTab, fromPage, searchTerm } = location.state || {}
  console.log(location.state)
  console.log(fromTab, fromPage, searchTerm)
  const handleBack = () => {
    navigate('/verification', {
      state: {
        fromTab,
        fromPage,
        searchTerm,
      },
    })
  }
  const { data, isLoading, error, refetch } = useGetVerificationByIdQuery(id, {
    refetchOnMountOrArgChange: true,
  })
  const [verifyLawyer, { isLoading: isSaving }] = useVerifyLawyerMutation()
  const [flagLawyer, { isLoading: isFlagging }] = useFlagLawyerMutation()
  const [avatarUrl, setAvatarUrl] = useState('')
  const [note, setNote] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastColor, setToastColor] = useState('success')
  const [showFlagModal, setShowFlagModal] = useState(false)

  const [documentStatus, setDocumentStatus] = useState({
    cnic: { status: null, files: [] },
    provisional_bar: { status: null, files: [] },
    high_court: { status: null, files: [] },
    supreme_court: { status: null, files: [] },
    barrister: { status: null, files: [] },
  })

  const lawyer = data?.data

  const initializeDocumentStatus = (lawyerData) => {
    setDocumentStatus({
      cnic: {
        status:
          lawyerData.is_verified_cnic === true
            ? 'approved'
            : lawyerData.is_verified_cnic === false
              ? 'declined'
              : null,
        files: lawyerData.proof_files || [],
      },
      provisional_bar: {
        status:
          lawyerData.provisional_bar?.is_verified === true
            ? 'approved'
            : lawyerData.provisional_bar?.is_verified === false
              ? 'declined'
              : null,
        files: lawyerData.provisional_bar?.proof_files || [],
      },
      high_court: {
        status:
          lawyerData.high_court?.is_verified === true
            ? 'approved'
            : lawyerData.high_court?.is_verified === false
              ? 'declined'
              : null,
        files: lawyerData.high_court?.proof_files || [],
      },
      supreme_court: {
        status:
          lawyerData.supreme_court?.is_verified === true
            ? 'approved'
            : lawyerData.supreme_court?.is_verified === false
              ? 'declined'
              : null,
        files: lawyerData.supreme_court?.proof_files || [],
      },
      barrister: {
        status:
          lawyerData.barrister?.is_verified === true
            ? 'approved'
            : lawyerData.barrister?.is_verified === false
              ? 'declined'
              : null,
        files: lawyerData.barrister?.proof_files || [],
      },
    })
  }

  useEffect(() => {
    if (lawyer) {
      if (lawyer.image) {
        fetchSignedUrl(lawyer.image).then((url) => setAvatarUrl(url))
      }
      initializeDocumentStatus(lawyer)
    }
  }, [lawyer])

  const handleFlagClick = () => {
    setShowFlagModal(true)
  }

  const handleNoteChange = (e) => setNote(e.target.value)

  const handleImageClick = (url) => {
    setSelectedImage(url)
    setShowModal(true)
  }

  const confirmFlagProfile = async () => {
    try {
      const lawyerId = lawyer.lawyer
      const result = await flagLawyer(lawyerId).unwrap()
      if (result.success) {
        // Option 1: Force parent refresh
        navigate('/verification', {
          state: { refresh: true, timestamp: Date.now() },
          replace: true,
        })

        // Option 2: Invalidate cache
        api.util.invalidateTags(['Lawyers', 'Verifications'])

        setShowFlagModal(false)
        triggerToast('Profile flagged successfully', 'success')
      }
    } catch (error) {
      console.error('Error flagging profile:', error)
      setShowFlagModal(false)
      triggerToast('Failed to flag profile', 'danger')
    }
  }
  const handleApproveDocument = (section) => {
    setDocumentStatus((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        status: 'approved',
      },
    }))
  }

  const handleDeclineDocument = (section) => {
    setDocumentStatus((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        status: 'declined',
      },
    }))
  }

  const handleSave = async () => {
    const mapStatus = (status) =>
      status === 'approved' ? true : status === 'declined' ? false : undefined

    const verificationData = {
      lawyer_id: lawyer.lawyer,
      document_verification: {
        cnic: mapStatus(documentStatus.cnic.status),
        provisional_bar: mapStatus(documentStatus.provisional_bar.status),
        high_court: mapStatus(documentStatus.high_court.status),
        supreme_court: mapStatus(documentStatus.supreme_court.status),
        barrister: mapStatus(documentStatus.barrister.status),
      },
      ...(note && { note }),
    }

    try {
      await verifyLawyer(verificationData).unwrap()
      const updated = await refetch()
      triggerToast('Verification status updated successfully', 'success')
      if (updated?.data?.data) {
        initializeDocumentStatus(updated.data.data)
      }
      // Navigate back with refresh flag
      navigate('/verification', {
        state: {
          fromTab,
          fromPage,
          searchTerm,
          refresh: true,
        },
      })
    } catch (error) {
      console.error(error)
      triggerToast('Failed to update verification status', 'danger')
    }
  }

  const triggerToast = (message, color = 'success') => {
    setToastMessage(message)
    setToastColor(color)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const hasChanges = () => {
    const mapStatus = (status) =>
      status === 'approved' ? true : status === 'declined' ? false : undefined
    return (
      mapStatus(documentStatus.cnic.status) !== lawyer?.is_verified_cnic ||
      mapStatus(documentStatus.provisional_bar.status) !== lawyer?.provisional_bar?.is_verified ||
      mapStatus(documentStatus.high_court.status) !== lawyer?.high_court?.is_verified ||
      mapStatus(documentStatus.supreme_court.status) !== lawyer?.supreme_court?.is_verified ||
      mapStatus(documentStatus.barrister.status) !== lawyer?.barrister?.is_verified
    )
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <CSpinner color="primary" style={{ width: '3rem', height: '3rem' }} variant="grow" />
      </div>
    )
  }

  if (error) return <div>Error loading verification data</div>

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
          <CRow className="align-items-center mb-4 p-4 position-relative">
            <div
              style={{
                position: 'absolute',
                top: 7,
                right: 20,
                zIndex: 2,
                padding: 8,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'flex-end',
              }}
              className="flag-icon-hover"
            >
              <CIcon
                icon={cilFlagAlt}
                size="xl"
                className="text-danger cursor-pointer"
                onClick={handleFlagClick}
                title="Flag this profile"
                style={{
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.10))',
                  transition: 'transform 0.15s',
                }}
              />
            </div>
            <DynamicModal
              visible={showFlagModal}
              iconType="danger"
              message="Are you sure you want to flag this profile?"
              confirmLabel="Yes, Flag"
              cancelLabel="Cancel"
              onCancel={() => setShowFlagModal(false)}
              onConfirm={confirmFlagProfile}
              confirmColor="danger"
              cancelColor="secondary"
            />
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
                  <span className="ms-2 fw-medium">{lawyer?.gender_id?.name}</span>
                </div>
              </div>
            </CCol>
          </CRow>

          <VerificationSection
            title="ID Card Verification"
            images={documentStatus.cnic.files}
            status={documentStatus.cnic.status}
            currentStatus={lawyer?.is_verified_cnic}
            onApprove={() => handleApproveDocument('cnic')}
            onDecline={() => handleDeclineDocument('cnic')}
            imageLabel="CNIC Picture"
            infoFields={[
              { label: 'Name', value: lawyer?.name },
              { label: 'Gender', value: lawyer?.gender?.name },
              {
                label: 'DOB',
                value: lawyer?.date_of_birth
                  ? new Date(lawyer?.date_of_birth).toLocaleDateString()
                  : '',
              },
              { label: 'CNIC', value: lawyer?.cnic },
            ]}
          />

          <VerificationSection
            title={`Provisional Bar - ${lawyer?.provisional_bar?.name?.name || ''}`}
            images={documentStatus.provisional_bar.files}
            status={documentStatus.provisional_bar.status}
            currentStatus={lawyer?.provisional_bar?.is_verified}
            onApprove={() => handleApproveDocument('provisional_bar')}
            onDecline={() => handleDeclineDocument('provisional_bar')}
            imageLabel="Certificate Picture"
            infoFields={[
              {
                label: 'Registration Number',
                value: lawyer?.provisional_bar?.registration_number,
              },
              {
                label: 'Eligibility Date',
                value: lawyer?.provisional_bar?.license_issue_date?.slice(0, 10),
              },
            ]}
          />

          <VerificationSection
            title="High Court"
            images={documentStatus.high_court.files}
            status={documentStatus.high_court.status}
            currentStatus={lawyer?.high_court?.is_verified}
            onApprove={() => handleApproveDocument('high_court')}
            onDecline={() => handleDeclineDocument('high_court')}
            imageLabel="Certificate Picture"
            infoFields={[
              {
                label: 'License Number',
                value: lawyer?.high_court?.license_number,
              },
              {
                label: 'Eligibility Date',
                value: lawyer?.high_court?.license_expiry?.slice(0, 10),
              },
            ]}
          />

          <VerificationSection
            title="Supreme Court"
            images={documentStatus.supreme_court.files}
            status={documentStatus.supreme_court.status}
            currentStatus={lawyer?.supreme_court?.is_verified}
            onApprove={() => handleApproveDocument('supreme_court')}
            onDecline={() => handleDeclineDocument('supreme_court')}
            imageLabel="Certificate Picture"
            infoFields={[
              {
                label: 'License Number',
                value: lawyer?.supreme_court?.license_number,
              },
              {
                label: 'Eligibility Date',
                value: lawyer?.supreme_court?.license_expiry?.slice(0, 10),
              },
            ]}
          />

          <VerificationSection
            title="Barrister"
            images={documentStatus.barrister.files}
            status={documentStatus.barrister.status}
            currentStatus={lawyer?.barrister?.is_verified}
            onApprove={() => handleApproveDocument('barrister')}
            onDecline={() => handleDeclineDocument('barrister')}
            imageLabel="Proof Picture"
          />

          <div className="mt-4">
            <h6>Add Note</h6>
            <CFormTextarea
              rows={3}
              value={note}
              placeholder="Add any notes here..."
              onChange={handleNoteChange}
            />
          </div>

          {lawyer?.verification_status === 'Rejected' && (
            <div className="mt-4">
              <h6>Rejection Reason</h6>
              <CFormTextarea
                rows={3}
                value={lawyer?.rejection_reason}
                placeholder="Rejection Reason"
                disabled
              />
            </div>
          )}
          <div className="d-flex justify-content-between mt-4">
            <div>
              <CButton color="secondary" onClick={handleBack}>
                Back
              </CButton>
            </div>
            <div>
              {isSaving ? (
                <div className="d-flex align-items-center">
                  <CSpinner size="sm" className="me-2" />
                  <span>Saving...</span>
                </div>
              ) : (
                <CButton color="success" onClick={handleSave}>
                  Save
                </CButton>
              )}
            </div>
          </div>

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
                    objectFit: 'cover',
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

export const VerificationSection = ({
  title,
  images = [],
  status,
  currentStatus,
  onApprove,
  onDecline,
  infoFields = [],
  imageLabel = '',
}) => {
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

  let approveColor = 'success'
  let declineColor = 'danger'
  let approveVariant = 'outline'
  let declineVariant = 'outline'

  if (status === 'approved') approveVariant = ''
  if (status === 'declined') declineVariant = ''

  return (
    <CCard className="mb-4">
      <CCardBody>
        <h5 className="mb-4 fw-bold d-flex align-items-center">
          {title}
          {status === 'approved' && (
            <CIcon icon={cilCheckCircle} className="text-success ms-2" title="Approved" />
          )}
          {status === 'declined' && (
            <CIcon icon={cilClock} className="text-danger ms-2" title="Declined" />
          )}
          {!status && <CIcon icon={cilClock} className="text-secondary ms-2" title="Pending" />}
        </h5>

        <CRow className="align-items-start">
          <CCol md={4}>
            {infoFields?.map(({ label, value }, idx) => (
              <div key={idx} className="mb-2 d-flex">
                <strong style={{ width: '120px' }}>{label}:</strong>
                <span className="ms-2">{value || '—'}</span>
              </div>
            ))}
          </CCol>

          <CCol md={8}>
            <div className="d-flex flex-wrap gap-3 mb-3 align-items-center justify-content-center">
              {signedUrls.map((url, idx) => (
                <CImage
                  key={idx}
                  src={url}
                  thumbnail
                  style={{ width: '250px', height: '200px', cursor: 'pointer' }}
                  crossOrigin="anonymous"
                  onClick={() => {
                    setSelectedImage(url)
                    setShowModal(true)
                  }}
                />
              ))}
            </div>
            <div className="d-flex gap-2 justify-content-end">
              <CButton
                color={declineColor}
                variant={declineVariant}
                onClick={onDecline}
                disabled={status === 'declined'}
              >
                Decline
              </CButton>
              <CButton
                color={approveColor}
                variant={approveVariant}
                onClick={onApprove}
                disabled={status === 'approved'}
              >
                Approve
              </CButton>
            </div>
          </CCol>
        </CRow>

        <CModal visible={showModal} onClose={() => setShowModal(false)} size="lg">
          <CModalHeader onClose={() => setShowModal(false)}>
            <CModalTitle>Image Preview</CModalTitle>
          </CModalHeader>
          <CModalBody className="text-center">
            {selectedImage && (
              <CImage
                src={selectedImage}
                alt="Preview"
                style={{ width: '500px', height: 'auto', objectFit: 'contain' }}
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
  )
}

export default LawyerVerification
