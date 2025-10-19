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
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilPhone,
  cilEnvelopeClosed,
  cilCalendar,
  cilUser,
  cilBadge,
  cilCloudUpload,
  cilXCircle,
} from '@coreui/icons'
import { useUpdateLawyerMutation, useUploadImageMutation } from '../../../services/api'
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
  const [uploadImage] = useUploadImageMutation()
  const [approvalProofImage, setApprovalProofImage] = useState(null)
  const [approvalProofPreview, setApprovalProofPreview] = useState(null)
  const [uploadingApprovalImage, setUploadingApprovalImage] = useState(false)
  const theme = useSelector((state) => state.ui.theme)
  const [proofFileUrl, setProofFileUrl] = useState('')
  const [proofFileLoading, setProofFileLoading] = useState(false)

  // Added state to handle modal for viewing proof image
  const [viewImageModal, setViewImageModal] = useState(false)
  const [modalImageSrc, setModalImageSrc] = useState('')

  // Added state for approval proof modal as well
  const [viewApprovalImageModal, setViewApprovalImageModal] = useState(false)
  const [approvalModalImageSrc, setApprovalModalImageSrc] = useState('')

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
    const fetchProofFileUrl = async () => {
      setProofFileUrl('')
      setProofFileLoading(false)
      if (lawyer?.lawyer_details?.proof_file) {
        setProofFileLoading(true)
        try {
          const url = await fetchSignedUrl(lawyer.lawyer_details.proof_file)
          setProofFileUrl(url)
        } catch (e) {
          setProofFileUrl('')
        }
        setProofFileLoading(false)
      }
    }
    fetchProofFileUrl()
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

      // Include approval proof image data if approving
      if (status === 'approved' && approvalProofImage && approvalProofImage.url) {
        // updateData.approvalProofImageUrl = approvalProofImage.url
        updateData.proof_file = approvalProofImage.key
      }

      const result = await updateLawyer(updateData)
      console.log('result ', result)
      if (result?.data?.success === true) {
        setToastMessage(`Lawyer ${status} successfully`)
        setToastColor('success')
        setShowToast(true)
        navigate('/registration', {
          state: {
            modified: true,
            tab: location.state?.fromTab || (status === 'approved' ? 'approved' : 'rejected'),
            page: location.state?.fromPage || 1,
            from: location.state?.from || 'registrations',
          },
        })
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

  const handleApprovalFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB')
      return
    }

    setApprovalProofImage(file)
    setUploadingApprovalImage(true)

    const reader = new FileReader()
    reader.onload = (e) => {
      setApprovalProofPreview(e.target.result)
    }
    reader.readAsDataURL(file)

    try {
      const formDataObj = new FormData()
      formDataObj.append('image', file)
      const response = await uploadImage(formDataObj).unwrap()
      if (response.success) {
        setApprovalProofImage((prev) => ({
          ...prev,
          url: response.data.url,
          key: response.data.key,
        }))
      }
    } catch (error) {
      alert('Failed to upload image. Please try again.')
      setApprovalProofImage(null)
      setApprovalProofPreview(null)
    } finally {
      setUploadingApprovalImage(false)
    }
  }

  // Function to handle opening image modal
  const handleOpenImageModal = (imgUrl) => {
    setModalImageSrc(imgUrl)
    setViewImageModal(true)
  }

  // Function to handle opening approval proof modal (for preview)
  const handleOpenApprovalImageModal = (imgUrl) => {
    setApprovalModalImageSrc(imgUrl)
    setViewApprovalImageModal(true)
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

      {/* PROOF MODAL FOR PROOF DOCUMENT */}
      <CModal
        visible={viewImageModal}
        onClose={() => setViewImageModal(false)}
        alignment="center"
        size="lg"
        backdrop="static"
        className="proof-image-modal"
      >
        <CModalHeader>
          <CModalTitle>Proof Document Preview</CModalTitle>
          {/* <CButton
            color="light"
            className="ms-auto border-0"
            onClick={() => setViewImageModal(false)}
            style={{ boxShadow: 'none' }}
          >
            <CIcon icon={cilXCircle} />
          </CButton> */}
        </CModalHeader>
        <CModalBody style={{ background: '#faf8ee', minHeight: 300 }}>
          <div className="d-flex flex-column align-items-center justify-content-center w-100">
            {modalImageSrc ? (
              <img
                src={modalImageSrc}
                alt="Proof Document"
                style={{
                  maxWidth: '100%',
                  maxHeight: '480px',
                  borderRadius: '18px',
                  boxShadow: '0 4px 32px rgba(246,189,96,0.09)',
                  background: '#fffbe7',
                  objectFit: 'contain',
                  padding: '4px',
                  border: '2px solid #f6bd60',
                }}
              />
            ) : (
              <span>No image available!</span>
            )}
          </div>
        </CModalBody>
        <CModalFooter className="justify-content-end">
          <CButton color="secondary" onClick={() => setViewImageModal(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>

      {/* PROOF MODAL FOR APPROVAL PROOF DOCUMENT */}
      <CModal
        visible={viewApprovalImageModal}
        onClose={() => setViewApprovalImageModal(false)}
        alignment="center"
        size="lg"
        backdrop="static"
        className="proof-image-modal"
      >
        <CModalHeader>
          <CModalTitle>Approval Proof Document Preview</CModalTitle>
          <CButton
            color="light"
            className="ms-auto border-0"
            onClick={() => setViewApprovalImageModal(false)}
            style={{ boxShadow: 'none' }}
          >
            <CIcon icon={cilXCircle} />
          </CButton>
        </CModalHeader>
        <CModalBody style={{ background: '#faf8ee', minHeight: 300 }}>
          <div className="d-flex flex-column align-items-center justify-content-center w-100">
            {approvalModalImageSrc ? (
              <img
                src={approvalModalImageSrc}
                alt="Approval Document"
                style={{
                  maxWidth: '100%',
                  maxHeight: '480px',
                  borderRadius: '18px',
                  boxShadow: '0 4px 32px rgba(246,189,96,0.09)',
                  background: '#fffbe7',
                  objectFit: 'contain',
                  padding: '4px',
                  border: '2px solid #f6bd60',
                }}
              />
            ) : (
              <span>No image available!</span>
            )}
          </div>
        </CModalBody>
        <CModalFooter className="justify-content-end">
          <CButton color="secondary" onClick={() => setViewApprovalImageModal(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>

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
              {/* Show proof_file image if available */}
              {lawyer_details?.proof_file && (
                <div className="mt-4">
                  <h6 className="mb-2">Proof Document</h6>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1.5rem',
                      flexWrap: 'nowrap',
                      width: '100%',
                    }}
                  >
                    <div
                      style={{
                        width: '400px',
                        height: '200px',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        border: '2px solid #f6bd60',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#faf8ee',
                        position: 'relative',
                        boxShadow: '0 6px 32px rgba(246,189,96,0.08)',
                        marginBottom: '10px',
                        cursor: proofFileUrl ? 'pointer' : 'default',
                      }}
                      onClick={() => {
                        if (proofFileUrl) handleOpenImageModal(proofFileUrl)
                      }}
                      title={proofFileUrl ? 'Click to view full image' : ''}
                    >
                      {proofFileLoading ? (
                        <span className="d-flex align-items-center justify-content-center w-100 h-100">
                          <CSpinner size="lg" />
                        </span>
                      ) : proofFileUrl ? (
                        <img
                          src={proofFileUrl}
                          alt="Proof Document"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            display: 'block',
                            borderRadius: '16px',
                            background: '#fffbe5',
                            cursor: 'pointer',
                          }}
                        />
                      ) : (
                        <span className="small text-muted">No document image to show</span>
                      )}
                      {/* Optional overlay/label */}
                      <span
                        style={{
                          position: 'absolute',
                          bottom: 9,
                          right: 12,
                          background: 'rgba(246,189,96,.95)',
                          color: '#5a4400',
                          padding: '3px 16px',
                          fontWeight: 600,
                          fontSize: '16px',
                          borderRadius: '10px',
                          boxShadow: '0 2px 16px rgba(246,189,96,0.12)',
                          letterSpacing: '.04em',
                          opacity: proofFileUrl ? 1 : 0.4,
                          pointerEvents: 'none',
                        }}
                      >
                        Proof File
                      </span>
                    </div>
                    {proofFileUrl && (
                      <div className="d-flex flex-column align-items-start justify-content-start mt-2">
                        <span style={{ fontSize: '14px', color: '#9b6601' }}>
                          Click image to view in large
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          {lawyer_details?.status === 'rejected' && (
            <div className="mt-4">
              <h5 className="mb-3">Note</h5>
              <CFormTextarea rows={2} value={lawyer_details?.note} placeholder="Note" disabled />
            </div>
          )}

          {/* Upload Proof Section for Approval */}
          {lawyer_details?.status !== 'approved' && (
            <div className="mt-4">
              <h5 className="mb-3">Upload Approval Proof Document</h5>
              <div className="d-flex flex-column align-items-start">
                {approvalProofPreview ? (
                  <div style={{ width: '300px', position: 'relative' }}>
                    <img
                      src={approvalProofPreview}
                      alt="Approval proof preview"
                      className="img-fluid rounded border"
                      style={{
                        maxHeight: '150px',
                        width: '100%',
                        objectFit: 'cover',
                        boxShadow: '0 4px 16px rgba(255,193,7,0.06)',
                        border: '2px solid #f6bd60',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleOpenApprovalImageModal(approvalProofPreview)}
                      title="Click to preview"
                    />
                    {approvalProofImage && approvalProofImage.url && (
                      <div className="mt-2 p-2 bg-success-subtle rounded border border-success w-100">
                        <div className="small text-success fw-medium">
                          ✓ Approval proof uploaded successfully
                        </div>
                        <div className="small text-muted">File: {approvalProofImage.name}</div>
                      </div>
                    )}
                    {uploadingApprovalImage && (
                      <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-25 rounded">
                        <CSpinner size="sm" className="text-white" />
                      </div>
                    )}
                    <div className="mt-2 d-flex gap-2 flex-wrap">
                      <CButton
                        size="sm"
                        color="secondary"
                        variant="outline"
                        onClick={() => document.getElementById('approvalProofUpload').click()}
                        disabled={uploadingApprovalImage}
                      >
                        Change Document
                      </CButton>
                      <CButton
                        size="sm"
                        color="danger"
                        variant="outline"
                        onClick={() => {
                          setApprovalProofImage(null)
                          setApprovalProofPreview(null)
                        }}
                        disabled={uploadingApprovalImage}
                      >
                        Remove
                      </CButton>
                      <CButton
                        size="sm"
                        color="info"
                        variant="outline"
                        onClick={() => handleOpenApprovalImageModal(approvalProofPreview)}
                        disabled={!approvalProofPreview}
                        title="Preview approval proof"
                      >
                        View
                      </CButton>
                    </div>
                    <div>
                      <span style={{ fontSize: '12px', color: '#846101' }}>
                        Click preview to enlarge image
                      </span>
                    </div>
                  </div>
                ) : (
                  <div
                    className="d-flex flex-column align-items-center justify-content-center rounded-3 border py-4 px-3"
                    style={{
                      borderStyle: 'dashed',
                      borderColor: '#f6bd60',
                      backgroundColor: '#fffdfa',
                      minHeight: '150px',
                      width: '300px',
                      cursor: 'pointer',
                      transition: 'box-shadow 0.2s',
                      boxShadow: '0 1px 6px rgba(246,189,96,.08)',
                    }}
                    onClick={() => document.getElementById('approvalProofUpload').click()}
                  >
                    {uploadingApprovalImage ? (
                      <div className="text-center">
                        <CSpinner size="sm" />
                        <div className="mt-2 small text-muted">Uploading...</div>
                      </div>
                    ) : (
                      <>
                        <CIcon icon={cilCloudUpload} className="text-warning mb-2" size="xl" />
                        <div className="text-center">
                          <div className="small fw-medium text-dark">
                            Click to upload approval proof
                          </div>
                          <div className="small text-muted">PNG, JPG up to 5MB</div>
                        </div>
                      </>
                    )}
                  </div>
                )}
                <input
                  type="file"
                  id="approvalProofUpload"
                  name="approvalProof"
                  accept="image/*"
                  onChange={handleApprovalFileUpload}
                  className="d-none"
                  disabled={uploadingApprovalImage}
                />
              </div>
            </div>
          )}

          <div className="row justify-content-center align-items-center mb-1 mt-3">
            <div className="col-12 col-md-8 d-flex align-items-center justify-content-between">
              <CFormTextarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Enter notes here..."
                rows={2}
                className="mb-0 me-3"
                style={{ maxWidth: '100%' }}
              />
              <CButton
                color="primary"
                style={{ minWidth: '120px', height: '48px' }}
                onClick={() => {
                  alert('Button clicked! ')
                }}
              >
                Submit
              </CButton>
            </div>
          </div>
          <div className="mt-4">
            <h5 className="mb-3">Add Notes</h5>
            <CFormTextarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Enter notes here..."
              rows={4}
              className="mb-3"
            />
            {/* Button Row: Back on left, Approve/Reject on right */}
            <div className="row mt-2 align-items-center">
              <div className="col-6 d-flex">
                <CButton
                  color="secondary"
                  onClick={() =>
                    navigate(
                      location?.state?.from === 'verification'
                        ? '/verification'
                        : location?.state?.from === 'allLawyer'
                          ? '/lawyers-list'
                          : '/registration',
                      {
                        state: {
                          tab: location?.state?.fromTab || 'pending',
                          page: location?.state?.fromPage || 1,
                          from: location?.state?.from || 'registrations',
                        },
                      },
                    )
                  }
                >
                  ← Back
                </CButton>
              </div>
              <div className="col-6 d-flex justify-content-end gap-2">
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
                    if (lawyer_details?.status !== 'approved') {
                      if (!approvalProofImage || !approvalProofImage.url) {
                        setToastMessage('Proof image is required to approve lawyer')
                        setToastColor('danger')
                        setShowToast(true)
                        return
                      }
                      openModal('approve')
                    }
                  }}
                  disabled={isLoading || lawyer_details?.status === 'approved'}
                  style={
                    lawyer_details?.status === 'approved'
                      ? { opacity: 0.6, pointerEvents: 'none', cursor: 'not-allowed' }
                      : {}
                  }
                >
                  Approve
                </CButton>
              </div>
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
    </>
  )
}

export default LawyerView
