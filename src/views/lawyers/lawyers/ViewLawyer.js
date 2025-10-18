import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CAvatar,
  CListGroup,
  CListGroupItem,
  CButton,
  CFormTextarea,
  CSpinner,
  CToaster,
  CToast,
  CToastBody,
  CToastHeader,
  CImage,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPhone, cilEnvelopeClosed, cilCalendar, cilUser, cilBadge } from '@coreui/icons'
import { useUpdateLawyerMutation } from '../../../services/api'
import { fetchSignedUrl } from '../../../assets/utils/imageUtils'
import { DynamicModal } from '../../../components'
import { useSelector } from 'react-redux'

const LawyerView = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [updateLawyer, { isLoading, isSuccess }] = useUpdateLawyerMutation()
  const lawyer = location.state?.lawyer
  const [note, setNote] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastColor, setToastColor] = useState('success')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('')
  const [proofFileUrl, setProofFileUrl] = useState('')
  const [proofFileLoading, setProofFileLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState('')
  const theme = useSelector((state) => state.ui.theme)

  // Fix: Ensure modal opens by using a function to set both modalType and showModal together
  const openModal = (type) => {
    setModalType(type)
    setShowModal(true)
  }

  useEffect(() => {
    const loadAvatar = async () => {
      if (lawyer?.image) {
        try {
          const url = await fetchSignedUrl(lawyer.image)
          setAvatarUrl(url)
        } catch (error) {
          setAvatarUrl('')
        }
      }
    }
    loadAvatar()
  }, [lawyer])

  useEffect(() => {
    const loadProofFile = async () => {
      if (lawyer?.proof_file) {
        setProofFileLoading(true)
        try {
          const url = await fetchSignedUrl(lawyer.proof_file)
          setProofFileUrl(url)
        } catch (error) {
          setProofFileUrl('')
        } finally {
          setProofFileLoading(false)
        }
      }
    }
    loadProofFile()
  }, [lawyer])

  if (!lawyer) return <p>No lawyer data available</p>

  const { name, phone, email, age, dob, whatsapp, gender_id, image, lawyer_details } = lawyer

  const handleStatusChange = async (status) => {
    try {
      const updateData = {
        lawyer_id: lawyer._id,
        status,
      }

      if (note.trim()) {
        updateData.note = note
      }

      const result = await updateLawyer(updateData)

      if (result?.data?.success === true) {
        setToastMessage(`Lawyer ${status} successfully`)
        setToastColor('success')
        setShowToast(true)
        navigate('/registration', { state: { modified: true } })
      } else {
        setToastMessage(result?.data?.message)
        setToastColor('danger')
        setShowToast(true)
      }
    } catch (error) {
      console.error(`${status} error:`, error)
      setToastMessage(error?.data?.message || `Failed to ${status} lawyer`)
      setToastColor('danger')
      setShowToast(true)
    }
  }

  const handleModalConfirm = () => {
    const status = modalType === 'approve' ? 'approved' : 'rejected'
    handleStatusChange(status)
    setShowModal(false)
  }

  return (
    <>
      <CToaster placement="top-end">
        {showToast && (
          <CToast
            visible={showToast}
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

      <CCard className="mb-4 shadow-lg border-0">
        <CCardHeader className="bg-gradient-warning py-3">
          {theme === 'light' ? (
            <h4 className="mb-0 text-dark">Lawyer Profile</h4>
          ) : (
            <h4 className="mb-0 text-white">Lawyer Profile</h4>
          )}
        </CCardHeader>
        <CCardBody className="p-4">
          <CRow className="mb-4">
            <CCol md={3} className="text-center">
              <div className="position-relative d-inline-block">
                <CImage
                  src={avatarUrl || ''}
                  size="xxl"
                  className="mb-3 border shadow-sm"
                  style={{
                    objectFit: 'cover',
                    width: '180px',
                    height: '180px',
                    borderRadius: '15px',
                  }}
                />
                <div className="position-absolute bottom-0 end-0">
                  <CButton
                    color="warning"
                    size="sm"
                    className="rounded-circle shadow-sm"
                    style={{ width: '35px', height: '35px' }}
                  >
                    <CIcon icon={cilUser} />
                  </CButton>
                </div>
              </div>
              <h4 className="fw-bold mt-3 mb-1">{name}</h4>
              <p className="text-muted mb-0">Professional Lawyer</p>
            </CCol>
            <CCol md={9}>
              <CListGroup flush className="shadow-sm rounded">
                <CListGroupItem className="d-flex align-items-center py-3">
                  <CIcon icon={cilPhone} className="text-primary me-3" />
                  <div>
                    <small className="text-muted d-block">Phone Number</small>
                    <strong>{phone}</strong>
                  </div>
                </CListGroupItem>
                <CListGroupItem className="d-flex align-items-center py-3">
                  <CIcon icon={cilPhone} className="text-primary me-3" />
                  <div>
                    <small className="text-muted d-block">Whatsapp Number</small>
                    <strong>{whatsapp}</strong>
                  </div>
                </CListGroupItem>
                <CListGroupItem className="d-flex align-items-center py-3">
                  <CIcon icon={cilEnvelopeClosed} className="text-primary me-3" />
                  <div>
                    <small className="text-muted d-block">Email Address</small>
                    <strong>{email}</strong>
                  </div>
                </CListGroupItem>
                <CListGroupItem className="d-flex align-items-center py-3">
                  <CIcon icon={cilCalendar} className="text-primary me-3" />
                  <div>
                    <small className="text-muted d-block">Date of Birth</small>
                    <strong>{new Date(dob).toLocaleDateString()}</strong>
                  </div>
                </CListGroupItem>
                <CListGroupItem className="d-flex align-items-center py-3">
                  <CIcon icon={cilUser} className="text-primary me-3" />
                  <div>
                    <small className="text-muted d-block">Age & Gender</small>
                    <strong>{`${age} years / ${gender_id?.name}`}</strong>
                  </div>
                </CListGroupItem>
              </CListGroup>
            </CCol>
          </CRow>

          {lawyer_details && (
            <div className="mt-4">
              <h5 className="mb-3 d-flex align-items-center">
                <CIcon icon={cilBadge} className="text-primary me-2" />
                Professional Details
              </h5>
              <CRow>
                <CCol md={6}>
                  <CListGroup flush className="shadow-sm rounded">
                    <CListGroupItem className="d-flex align-items-center py-3">
                      <div>
                        <small className="text-muted d-block">CNIC Number</small>
                        <strong>{lawyer_details?.cnic}</strong>
                      </div>
                    </CListGroupItem>
                    <CListGroupItem className="d-flex align-items-center py-3">
                      <div>
                        <small className="text-muted d-block">City</small>
                        <strong>{lawyer_details?.city}</strong>
                      </div>
                    </CListGroupItem>
                    <CListGroupItem className="d-flex align-items-center py-3">
                      <div>
                        <small className="text-muted d-block">Verification Status</small>
                        <span
                          className={`badge ${
                            lawyer_details.status === 'approved'
                              ? 'bg-success'
                              : lawyer_details.status === 'pending'
                                ? 'bg-warning'
                                : 'bg-danger'
                          } px-3 py-2`}
                        >
                          {lawyer_details.status ? lawyer_details.status : 'Pending'}
                        </span>
                      </div>
                    </CListGroupItem>
                    <CListGroupItem className="d-flex align-items-center py-3">
                      <div>
                        <small className="text-muted d-block">Court Type</small>
                        <strong>{lawyer_details.court_type}</strong>
                      </div>
                    </CListGroupItem>
                  </CListGroup>
                </CCol>
              </CRow>
            </div>
          )}

          {/* Proof Document Section */}
          {lawyer?.proof_file && (
            <div className="mt-4">
              <h6 className="mb-2">Proof Document</h6>
              <div className="d-flex flex-wrap gap-3 mb-3 align-items-center justify-content-center">
                <div
                  style={{
                    width: '250px',
                    height: '200px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '2px solid #f6bd60',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#faf8ee',
                    position: 'relative',
                    boxShadow: '0 6px 24px rgba(246,189,96,0.08)',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setSelectedImage(proofFileUrl)
                    setShowModal(true)
                  }}
                >
                  {proofFileLoading ? (
                    <span className="d-flex align-items-center justify-content-center w-100 h-100">
                      <CSpinner size="lg" />
                    </span>
                  ) : proofFileUrl ? (
                    <CImage
                      src={proofFileUrl}
                      crossOrigin="anonymous"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        borderRadius: '16px',
                        background: '#fffbe5',
                      }}
                    />
                  ) : (
                    <span className="small text-muted p-3">No document image to show</span>
                  )}

                  {/* Label overlay */}
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 8,
                      right: 10,
                      background: 'rgba(246,189,96,.95)',
                      color: '#5a4400',
                      padding: '3px 12px',
                      fontWeight: 600,
                      fontSize: '14px',
                      borderRadius: '8px',
                      boxShadow: '0 2px 12px rgba(246,189,96,0.12)',
                      letterSpacing: '.03em',
                    }}
                  >
                    Proof File
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4">
            <h5 className="mb-3">Add Notes</h5>
            <CFormTextarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Enter notes here..."
              rows={4}
              className="mb-3"
            />
            <div className="d-flex gap-2 justify-content-end">
              <CButton
                color="danger"
                onClick={() => {
                  if (!note.trim()) {
                    setToastMessage('Note is required to reject')
                    setToastColor('danger')
                    setShowToast(true)
                    return
                  }
                  openModal('reject')
                }}
                disabled={isLoading}
              >
                Reject
              </CButton>

              <CButton
                color="success"
                variant="outline"
                onClick={() => {
                  openModal('approve')
                }}
                disabled={isLoading}
              >
                Approve
              </CButton>
            </div>
          </div>
        </CCardBody>
      </CCard>
      <DynamicModal
        visible={showModal}
        iconType={modalType === 'approve' ? 'success' : 'danger'}
        message={`Are you sure you want to ${modalType === 'approve' ? 'approve' : 'reject'} this lawyer?`}
        confirmLabel={modalType === 'approve' ? 'Approve' : 'Reject'}
        cancelLabel={modalType === 'approve' ? 'Cancel' : 'Close'}
        onCancel={() => setShowModal(false)}
        onConfirm={handleModalConfirm}
        confirmColor={modalType === 'approve' ? 'success' : 'warning'}
        cancelColor={modalType === 'approve' ? 'warning' : 'warning'}
      />

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 9999,
          }}
          onClick={() => {
            setSelectedImage('')
            setShowModal(false)
          }}
        >
          <div
            className="position-relative"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '90vh' }}
          >
            <img
              src={selectedImage}
              alt="Proof document"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '8px',
              }}
            />
            <CButton
              color="light"
              className="position-absolute top-0 end-0 m-2"
              onClick={() => {
                setSelectedImage('')
                setShowModal(false)
              }}
              style={{ zIndex: 10000 }}
            >
              ×
            </CButton>
          </div>
        </div>
      )}
    </>
  )
}

export default LawyerView
