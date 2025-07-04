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
import { useNavigate, useLocation } from 'react-router-dom'
import { FaEye } from 'react-icons/fa'
import {
  useGetPendingSubmissionsQuery,
  useGetVerificationQuery,
  useGetFlaggedLawyersQuery,
} from 'src/services/api'

const Tabs = ({ path }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeKey, setActiveKey] = useState(1)
  const [queryParams, setQueryParams] = useState({ page: 1, limit: 10 })
  const [refreshTrigger, setRefreshTrigger] = useState(0) // Add this line

  // Add refreshTrigger to all query dependencies
  const {
    data: pendingData,
    isLoading: loadingPending,
    refetch: refetchPending,
  } = useGetPendingSubmissionsQuery(
    { ...queryParams, refreshTrigger }, // Include refreshTrigger here
    { skip: activeKey !== 1 },
  )

  const {
    data: pendingVerification,
    isLoading: loadingVerification,
    refetch: refetchVerification,
  } = useGetVerificationQuery(
    { ...queryParams, status: 'Pending', refreshTrigger }, // And here
    { skip: activeKey !== 2 },
  )

  const {
    data: rejectedVerification,
    isLoading: loadingRejected,
    refetch: refetchRejected,
  } = useGetVerificationQuery(
    { ...queryParams, status: 'Rejected', refreshTrigger }, // And here
    { skip: activeKey !== 3 },
  )

  const {
    data: oldVerification,
    isLoading: loadingOldVerification,
    refetch: refetchOldVerification,
  } = useGetVerificationQuery(
    { ...queryParams, status: 'Old', refreshTrigger }, // And here
    { skip: activeKey !== 4 },
  )

  const {
    data: spamVerification,
    isLoading: loadingSpamVerification,
    refetch: refetchSpamVerification,
  } = useGetFlaggedLawyersQuery(
    { ...queryParams, refreshTrigger }, // And here
    { skip: activeKey !== 5 },
  )

  // Add this useEffect for handling refresh
  useEffect(() => {
    if (location.state?.refresh) {
      // Force remount by changing key
      setRefreshTrigger((prev) => prev + 1)
      // Clear state
      navigate(location.pathname, { replace: true, state: {} })

      // Also trigger manual refetch for the current tab
      const refetchFunctions = {
        1: refetchPending,
        2: refetchVerification,
        3: refetchRejected,
        4: refetchOldVerification,
        5: refetchSpamVerification,
      }
      refetchFunctions[activeKey]?.()
    }
  }, [location.state, activeKey, navigate, location.pathname])

  const isLoading =
    (activeKey === 1 && loadingPending) ||
    (activeKey === 2 && loadingVerification) ||
    (activeKey === 3 && loadingRejected) ||
    (activeKey === 4 && loadingOldVerification) ||
    (activeKey === 5 && loadingSpamVerification)

  const tableData =
    activeKey === 1
      ? pendingData?.data?.results || []
      : activeKey === 2
        ? pendingVerification?.data?.results || []
        : activeKey === 3
          ? rejectedVerification?.data?.results || []
          : activeKey === 4
            ? oldVerification?.data?.results || []
            : spamVerification?.data?.results || []

  useEffect(() => {
    setQueryParams((prev) => ({ ...prev, page: 1 }))
  }, [activeKey])
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
            Pending
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink active={activeKey === 3} onClick={() => setActiveKey(3)}>
            Rejected
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink active={activeKey === 4} onClick={() => setActiveKey(4)}>
            Old Verifications
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink active={activeKey === 5} onClick={() => setActiveKey(5)}>
            Spam
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
                                    : item.status === 'rejected'
                                      ? 'danger'
                                      : 'secondary'
                            }
                          >
                            {item.verification_status ||
                              (item.status === 'rejected' ? 'Flagged' : 'Not Started')}
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
                        ? pendingVerification?.data?.totalPages
                        : activeKey === 3
                          ? rejectedVerification?.data?.totalPages
                          : oldVerification?.data?.totalPages) || 0,
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
                        ? pendingVerification?.data?.totalPages
                        : activeKey === 3
                          ? rejectedVerification?.data?.totalPages
                          : oldVerification?.data?.totalPages)
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
