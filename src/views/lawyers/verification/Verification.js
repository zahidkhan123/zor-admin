import React from 'react'
import { CCard, CCol, CRow, CWidgetStatsC } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPeople, cilUserFollow } from '@coreui/icons'
import UserTabs from './tabs'

const Verification = () => {
  return (
    <>
      <CCard className="mb-4 p-3">
        <CRow className="justify-content-center">
          <CCol xs={12} sm={6} lg={6} xxl={6}>
            <CWidgetStatsC
              icon={<CIcon icon={cilPeople} height={36} />}
              value={'-'}
              title="Total Lawyers"
              progress={{ color: 'warning', value: 75 }}
            />
          </CCol>
          <CCol xs={12} sm={6} lg={6} xxl={6}>
            <CWidgetStatsC
              icon={<CIcon icon={cilUserFollow} height={36} />}
              value={'-'}
              title="New Lawyers (This Month)"
              progress={{ color: 'warning', value: 75 }}
            />
          </CCol>
        </CRow>
      </CCard>

      <CCard className="mb-4">
        <UserTabs path="/verification/detail" />
      </CCard>
    </>
  )
}

export default Verification
