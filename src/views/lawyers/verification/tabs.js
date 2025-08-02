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
  CFormInput,
  CButton,
} from '@coreui/react'
import { useNavigate, useLocation } from 'react-router-dom'
import { FaEye } from 'react-icons/fa'
import { cilSearch } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  useGetPendingSubmissionsQuery,
  useGetVerificationQuery,
  useGetFlaggedLawyersQuery,
} from '../../../services/api'

const Tabs = ({ path }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeKey, setActiveKey] = useState(1)
  const [queryParams, setQueryParams] = useState({ page: 1, limit: 10, search: '' })
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setQueryParams((prev) => ({
        ...prev,
        search: searchTerm.trim(),
        page: 1,
      }))
    }, 400)
    return () => clearTimeout(handler)
  }, [searchTerm])

  const {
    data: pendingData,
    isLoading: loadingPending,
    refetch: refetchPending,
  } = useGetPendingSubmissionsQuery({ ...queryParams, refreshTrigger }, { skip: activeKey !== 1 })

  const {
    data: pendingVerification,
    isLoading: loadingVerification,
    refetch: refetchVerification,
  } = useGetVerificationQuery(
    { ...queryParams, status: 'Pending', refreshTrigger },
    { skip: activeKey !== 2 },
  )

  const {
    data: rejectedVerification,
    isLoading: loadingRejected,
    refetch: refetchRejected,
  } = useGetVerificationQuery(
    { ...queryParams, status: 'Rejected', refreshTrigger },
    { skip: activeKey !== 3 },
  )

  const {
    data: verifiedVerification,
    isLoading: loadingVerifiedVerification,
    refetch: refetchVerifiedVerification,
  } = useGetVerificationQuery(
    { ...queryParams, status: 'Verified', refreshTrigger },
    { skip: activeKey !== 4 },
  )

  const {
    data: oldVerification,
    isLoading: loadingOldVerification,
    refetch: refetchOldVerification,
  } = useGetVerificationQuery(
    { ...queryParams, status: 'Re-Submitted', refreshTrigger },
    { skip: activeKey !== 5 },
  )

  const {
    data: spamVerification,
    isLoading: loadingSpamVerification,
    refetch: refetchSpamVerification,
  } = useGetFlaggedLawyersQuery({ ...queryParams, refreshTrigger }, { skip: activeKey !== 6 })

  useEffect(() => {
    if (location.state?.refresh) {
      setRefreshTrigger((prev) => prev + 1)
      navigate(location.pathname, { replace: true, state: {} })

      const refetchFunctions = {
        1: refetchPending,
        2: refetchVerification,
        3: refetchRejected,
        4: refetchVerifiedVerification,
        5: refetchOldVerification,
        6: refetchSpamVerification,
      }
      refetchFunctions[activeKey]?.()
    }
  }, [location.state, activeKey, navigate, location.pathname])

  const isLoading =
    (activeKey === 1 && loadingPending) ||
    (activeKey === 2 && loadingVerification) ||
    (activeKey === 3 && loadingRejected) ||
    (activeKey === 4 && loadingVerifiedVerification) ||
    (activeKey === 5 && loadingOldVerification) ||
    (activeKey === 6 && loadingSpamVerification)

  const tableData =
    activeKey === 1
      ? pendingData?.data?.results || []
      : activeKey === 2
        ? pendingVerification?.data?.results || []
        : activeKey === 3
          ? rejectedVerification?.data?.results || []
          : activeKey === 4
            ? verifiedVerification?.data?.results || []
            : activeKey === 5
              ? oldVerification?.data?.results || []
              : spamVerification?.data?.results || []

  useEffect(() => {
    setQueryParams((prev) => ({ ...prev, page: 1 }))
  }, [activeKey])

  const getTotalPages = () => {
    switch (activeKey) {
      case 1:
        return pendingData?.data?.totalPages || 0
      case 2:
        return pendingVerification?.data?.totalPages || 0
      case 3:
        return rejectedVerification?.data?.totalPages || 0
      case 4:
        return verifiedVerification?.data?.totalPages || 0
      case 5:
        return oldVerification?.data?.totalPages || 0
      case 6:
        return spamVerification?.data?.totalPages || 0
      default:
        return 0
    }
  }

  const renderPaginationItems = () => {
    const totalPages = getTotalPages()
    const currentPage = queryParams.page
    const items = []

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <CPaginationItem
            key={i}
            active={currentPage === i}
            onClick={() => setQueryParams((prev) => ({ ...prev, page: i }))}
          >
            {i}
          </CPaginationItem>,
        )
      }
    } else {
      items.push(
        <CPaginationItem
          key={1}
          active={currentPage === 1}
          onClick={() => setQueryParams((prev) => ({ ...prev, page: 1 }))}
        >
          1
        </CPaginationItem>,
      )

      if (currentPage <= 4) {
        for (let i = 2; i <= 5; i++) {
          items.push(
            <CPaginationItem
              key={i}
              active={currentPage === i}
              onClick={() => setQueryParams((prev) => ({ ...prev, page: i }))}
            >
              {i}
            </CPaginationItem>,
          )
        }
        items.push(
          <CPaginationItem key="ellipsis1" disabled>
            ...
          </CPaginationItem>,
        )
        items.push(
          <CPaginationItem
            key={totalPages}
            active={currentPage === totalPages}
            onClick={() => setQueryParams((prev) => ({ ...prev, page: totalPages }))}
          >
            {totalPages}
          </CPaginationItem>,
        )
      } else if (currentPage >= totalPages - 3) {
        items.push(
          <CPaginationItem key="ellipsis1" disabled>
            ...
          </CPaginationItem>,
        )
        for (let i = totalPages - 4; i <= totalPages; i++) {
          items.push(
            <CPaginationItem
              key={i}
              active={currentPage === i}
              onClick={() => setQueryParams((prev) => ({ ...prev, page: i }))}
            >
              {i}
            </CPaginationItem>,
          )
        }
      } else {
        items.push(
          <CPaginationItem key="ellipsis1" disabled>
            ...
          </CPaginationItem>,
        )
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          items.push(
            <CPaginationItem
              key={i}
              active={currentPage === i}
              onClick={() => setQueryParams((prev) => ({ ...prev, page: i }))}
            >
              {i}
            </CPaginationItem>,
          )
        }
        items.push(
          <CPaginationItem key="ellipsis2" disabled>
            ...
          </CPaginationItem>,
        )
        items.push(
          <CPaginationItem
            key={totalPages}
            active={currentPage === totalPages}
            onClick={() => setQueryParams((prev) => ({ ...prev, page: totalPages }))}
          >
            {totalPages}
          </CPaginationItem>,
        )
      }
    }

    return items
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

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <CSpinner color="warning" style={{ width: '4rem', height: '4rem' }} variant="grow" />
      </div>
    )
  }

  return (
    <>
      {/* Tabs and Search Row */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3 mt-3">
        <CNav variant="tabs" className="flex-wrap">
          {[
            'New Verifications',
            'Pending',
            'Rejected',
            'Verified',
            'Old Verifications',
            'Spam',
          ].map((label, idx) => (
            <CNavItem key={idx}>
              <CNavLink
                active={activeKey === idx + 1}
                onClick={() => setActiveKey(idx + 1)}
                style={{ cursor: 'pointer', fontSize: '1rem', padding: '0.6rem 1rem' }}
              >
                {label}
              </CNavLink>
            </CNavItem>
          ))}
        </CNav>

        <div
          className="position-relative"
          style={{
            width: '100%',
            maxWidth: '350px',
            marginLeft: 'auto',
          }}
        >
          <CIcon
            icon={cilSearch}
            className="position-absolute"
            style={{ top: '14px', left: '15px', zIndex: 10 }}
          />
          <CFormInput
            type="text"
            placeholder="Search by name, phone or email..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="ps-5"
            style={{
              fontSize: '1rem',
              height: '44px',
              borderRadius: '6px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
            }}
          />
        </div>
      </div>

      {/* <CTabContent>
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

                {renderPaginationItems()}

                <CPaginationItem
                  aria-label="Next"
                  disabled={queryParams.page === getTotalPages()}
                  onClick={() => setQueryParams((prev) => ({ ...prev, page: prev.page + 1 }))}
                >
                  <span aria-hidden="true">&raquo;</span>
                </CPaginationItem>
              </CPagination>
            )}
          </CCard>
        </CTabPane>
      </CTabContent> */}
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

                {renderPaginationItems()}

                <CPaginationItem
                  aria-label="Next"
                  disabled={queryParams.page === getTotalPages()}
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
