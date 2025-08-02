import React, { useState, useEffect, useRef } from 'react'
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
  CInputGroup,
  CInputGroupText,
  CButton,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import { FaEye, FaSearch, FaPlus } from 'react-icons/fa'
import { useGetBookingsQuery } from '../../services/api'
import { debounce } from 'lodash'

const statusTabs = {
  1: 'Pending',
  2: 'Verified',
  3: 'Rejected',
}

const Tabs = ({ path }) => {
  const navigate = useNavigate()
  const [activeKey, setActiveKey] = useState(1)
  const [queryParams, setQueryParams] = useState({ page: 1, limit: 10, search: '' })
  const [searchTerm, setSearchTerm] = useState('')
  const inputRef = useRef(null)

  const { data, isLoading } = useGetBookingsQuery({
    ...queryParams,
    status: statusTabs[activeKey],
  })

  const tableData = data?.data?.results || []
  const totalPages = data?.data?.totalPages || 0

  useEffect(() => {
    setQueryParams((prev) => ({ ...prev, page: 1 }))
  }, [activeKey, searchTerm])

  // Debounced search function
  // Note: useRef to persist debounce function across renders
  const debouncedSearch = useRef(
    debounce((term) => {
      setQueryParams((prev) => ({ ...prev, search: term }))
    }, 500),
  ).current

  const onSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    debouncedSearch(value)
  }

  // Fix: Ensure input is always visible by not conditionally rendering it and not hiding it with CSS
  // Also, ensure CInputGroup.Text is imported and used correctly

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
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
        <CNav variant="tabs">
          <CNavItem>
            <CNavLink active={activeKey === 1} onClick={() => setActiveKey(1)}>
              Completed Bookings
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink active={activeKey === 2} onClick={() => setActiveKey(2)}>
              Cancelled Bookings
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink active={activeKey === 3} onClick={() => setActiveKey(3)}>
              Upcoming Bookings
            </CNavLink>
          </CNavItem>
        </CNav>

        {/* Add new Lawyer button and search input side by side */}
      </div>

      <CTabContent>
        <CTabPane visible={true}>
          <CCard className="mb-4">
            {isLoading ? (
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ height: '60vh' }}
              >
                <CSpinner
                  color="warning"
                  style={{ width: '4rem', height: '4rem' }}
                  variant="grow"
                />
              </div>
            ) : (
              <>
                <CTable align="middle" className="mb-0 border" hover responsive>
                  <CTableHead className="text-nowrap">
                    <CTableRow>
                      <CTableHeaderCell className="text-center">ID</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Lawyer</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">User</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Booking Schedule</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Booking Location</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Payment Status</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Price</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Action</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  {/* <CTableBody>
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
                            <CTableDataCell className="text-center">{item.user_name}</CTableDataCell>
                            <CTableDataCell className="text-center">{item.booking_schedule}</CTableDataCell>
                            <CTableDataCell className="text-center">{item.booking_type}</CTableDataCell>
                            <CTableDataCell className="text-center">
                              <CBadge
                                color={
                                  item.verification_status === 'Verified'
                                    ? 'success'
                                    : item.verification_status === 'Pending'
                                      ? 'warning'
                                      : 'danger'
                                }
                              >
                                {item.verification_status}
                              </CBadge>
                            </CTableDataCell>
                            <CTableDataCell className="text-center">
                              <div
                                onClick={() => navigate(`${path}/${item.lawyer_id}`)}
                                style={{ cursor: 'pointer' }}
                              >
                                <FaEye className="me-2" />
                              </div>
                            </CTableDataCell>
                          </CTableRow>
                        ))
                      : renderNoData()}
                    </CTableBody> */}
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

                    {Array.from({ length: totalPages }).map((_, i) => (
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
                      disabled={queryParams.page === totalPages}
                      onClick={() => setQueryParams((prev) => ({ ...prev, page: prev.page + 1 }))}
                    >
                      <span aria-hidden="true">&raquo;</span>
                    </CPaginationItem>
                  </CPagination>
                )}
              </>
            )}
          </CCard>
        </CTabPane>
      </CTabContent>
    </>
  )
}

export default Tabs
