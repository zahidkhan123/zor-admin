import React from 'react'
import { CModal, CModalBody, CModalFooter, CButton } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilWarning, cilCheckCircle, cilXCircle, cilInfo } from '@coreui/icons'

const iconMap = {
  warning: cilWarning,
  success: cilCheckCircle,
  danger: cilXCircle,
  info: cilInfo,
}

const DynamicModal = ({
  visible = false,
  iconType = 'warning', // warning, success, danger, info
  message = 'Are you sure?',
  confirmLabel = 'Yes',
  cancelLabel = 'No',
  onCancel,
  onConfirm,
  confirmColor = 'warning',
  cancelColor = 'warning',
}) => {
  return (
    <CModal
      visible={visible}
      onClose={onCancel}
      centered
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: '100vh' }}
    >
      <div className="w-100 d-flex flex-column align-items-center justify-content-center">
        <CModalBody className="text-center w-100">
          <div className="d-flex justify-content-center mb-3">
            <CIcon icon={iconMap[iconType]} size="xxl" className={`text-${confirmColor}`} />
          </div>
          <h5 className="fw-bold">{message}</h5>
        </CModalBody>
        <CModalFooter className="justify-content-center border-0 w-100">
          <CButton
            color={cancelColor}
            variant="outline"
            onClick={onCancel}
            style={{ minWidth: '120px' }}
          >
            {cancelLabel}
          </CButton>
          <CButton
            color={confirmColor}
            variant="outline"
            onClick={onConfirm}
            style={{ minWidth: '120px' }}
          >
            {confirmLabel}
          </CButton>
        </CModalFooter>
      </div>
    </CModal>
  )
}

export default DynamicModal
