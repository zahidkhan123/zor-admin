import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CAvatar,
  CPagination,
  CPaginationItem,
  CBadge,
  CSpinner,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import { FaEye } from 'react-icons/fa'
import { useGetPendingSubmissionsQuery, useGetVerificationQuery } from 'src/services/api'

const Tabs = ({ path }) => {
  const navigate = useNavigate()
  const [activeKey, setActiveKey] = useState(1)
  const [queryParams, setQueryParams] = useState({ page: 1, limit: 10 })

  const { data: pendingData, isLoading: loadingPending } = useGetPendingSubmissionsQuery(
    queryParams,
    { skip: activeKey !== 1 },
  )
  const { data: pendingVerification, isLoading: loadingVerification } = useGetVerificationQuery(
    { ...queryParams, status: 'Pending' },
    { skip: activeKey !== 3 },
  )
  const { data: rejectedVerification, isLoading: loadingRejected } = useGetVerificationQuery(
    { ...queryParams, status: 'Rejected' },
    { skip: activeKey !== 4 },
  )
  const { data: verifiedVerification, isLoading: loadingVerified } = useGetVerificationQuery(
    { ...queryParams, status: 'Verified' },
    { skip: activeKey !== 2 },
  )

  const isLoading =
    (activeKey === 1 && loadingPending) ||
    (activeKey === 2 && loadingVerified) ||
    (activeKey === 3 && loadingVerification) ||
    (activeKey === 4 && loadingRejected)

  const tableData =
    activeKey === 1
      ? pendingData?.data?.results || []
      : activeKey === 2
        ? verifiedVerification?.data?.results || []
        : activeKey === 3
          ? pendingVerification?.data?.results || []
          : rejectedVerification?.data?.results || []

  useEffect(() => {
    setQueryParams((prev) => ({ ...prev, page: 1 }))
  }, [activeKey])

  console.log(tableData)

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <CSpinner color="warning" style={{ width: '4rem', height: '4rem' }} variant="grow" />
      </div>
    )
  }

  const renderNoData = () => (
    <CTableRow>
      <CTableDataCell colSpan="7" className="text-center py-4">
        <div className="d-flex flex-column align-items-center">
          <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
          <h5 className="text-muted">No Data Found</h5>
          <p className="text-muted mb-0">There are no records to display in this section.</p>
        </div>
      </CTableDataCell>
    </CTableRow>
  )

  return (
    <>
      <CNav variant="tabs" className="mb-4">
        <CNavItem>
          <CNavLink active={activeKey === 1} onClick={() => setActiveKey(1)}>
            New Verifications
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink active={activeKey === 2} onClick={() => setActiveKey(2)}>
            Verified
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink active={activeKey === 3} onClick={() => setActiveKey(3)}>
            Pending
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink active={activeKey === 4} onClick={() => setActiveKey(4)}>
            Rejected
          </CNavLink>
        </CNavItem>
      </CNav>

      <CTabContent>
        <CTabPane visible={true}>
          <CCard className="mb-4">
            <CTable align="middle" className="mb-0 border" hover responsive>
              <CTableHead className="text-nowrap">
                <CTableRow>
                  <CTableHeaderCell className="text-center">ID</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Lawyer</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Phone</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Email</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Gender/Age</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Status</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Action</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {tableData.length > 0
                  ? tableData.map((item, index) => (
                      <CTableRow key={index}>
                        <CTableDataCell className="text-center">{index + 1}</CTableDataCell>
                        <CTableDataCell className="text-center">
                          <div className="d-flex align-items-center justify-content-center">
                            <CAvatar size="md" src={item.image || ''} />
                            <div className="ms-2 text-start">{item.name || item.full_name}</div>
                          </div>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">{item.phone}</CTableDataCell>
                        <CTableDataCell className="text-center">{item.email}</CTableDataCell>
                        <CTableDataCell className="text-center">
                          {item?.gender} / {item.age}
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CBadge
                            color={
                              item.verification_status === 'Verified'
                                ? 'success'
                                : item.verification_status === 'Pending'
                                  ? 'warning'
                                  : item.verification_status === 'Rejected'
                                    ? 'danger'
                                    : 'secondary'
                            }
                          >
                            {item.verification_status || 'Not Started'}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <div onClick={() => navigate(`${path}/${item.lawyer_id}`)}>
                            <FaEye className="me-2" />
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  : renderNoData()}
              </CTableBody>
            </CTable>

            {tableData.length > 0 && (
              <CPagination align="end" className="mt-3 me-3">
                <CPaginationItem
                  aria-label="Previous"
                  disabled={queryParams.page === 1}
                  onClick={() => setQueryParams((prev) => ({ ...prev, page: prev.page - 1 }))}
                >
                  <span aria-hidden="true">&laquo;</span>
                </CPaginationItem>

                {Array.from({
                  length:
                    (activeKey === 1
                      ? pendingData?.data?.totalPages
                      : activeKey === 2
                        ? verifiedVerification?.data?.totalPages
                        : activeKey === 3
                          ? pendingVerification?.data?.totalPages
                          : rejectedVerification?.data?.totalPages) || 0,
                }).map((_, i) => (
                  <CPaginationItem
                    key={i}
                    active={queryParams.page === i + 1}
                    onClick={() => setQueryParams((prev) => ({ ...prev, page: i + 1 }))}
                  >
                    {i + 1}
                  </CPaginationItem>
                ))}

                <CPaginationItem
                  aria-label="Next"
                  disabled={
                    queryParams.page ===
                    (activeKey === 1
                      ? pendingData?.data?.totalPages
                      : activeKey === 2
                        ? verifiedVerification?.data?.totalPages
                        : activeKey === 3
                          ? pendingVerification?.data?.totalPages
                          : rejectedVerification?.data?.totalPages)
                  }
                  onClick={() => setQueryParams((prev) => ({ ...prev, page: prev.page + 1 }))}
                >
                  <span aria-hidden="true">&raquo;</span>
                </CPaginationItem>
              </CPagination>
            )}
          </CCard>
        </CTabPane>
      </CTabContent>
    </>
  )
}

export default Tabs
