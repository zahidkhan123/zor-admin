import React, { useEffect, useState } from 'react'
import {
  CRow,
  CCol,
  CCard,
  CCardBody,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CAvatar,
  CPagination,
  CPaginationItem,
  CDropdown,
  CButton,
  CSpinner,
  CToaster,
  CToast,
  CToastBody,
  CToastClose,
  CNav,
  CNavItem,
  CNavLink,
  CWidgetStatsC,
  CFormInput,
  CBadge,
} from '@coreui/react'
import { useNavigate, useLocation } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import { cilPeople, cilUserFollow, cilPlus, cilSearch, cilCalendar } from '@coreui/icons'
import { useGetBookingsQuery } from '../../services/api'
import { FaCheckCircle } from 'react-icons/fa'

const tabs = [
  { key: 'confirmed', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'all', label: 'All Bookings' },
]

const PAGE_SIZE = 10 // Changed to match backend default

const Bookings = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { modified } = location.state || {}
  const [activeTab, setActiveTab] = useState('confirmed')
  const [currentPage, setCurrentPage] = useState(1)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [citySearchTerm, setCitySearchTerm] = useState('')
  const [debouncedCitySearchTerm, setDebouncedCitySearchTerm] = useState('')
  const handleCitySearchChange = (e) => {
    setCitySearchTerm(e.target.value)
  }

  // Debounce search term to avoid too many API calls
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => {
      clearTimeout(timerId)
    }
  }, [searchTerm])

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedCitySearchTerm(citySearchTerm)
    }, 500)

    return () => {
      clearTimeout(timerId)
    }
  }, [citySearchTerm])

  // Replace with bookings API call
  // For demonstration, using the same hook, but you should replace with the correct bookings API hook
  const { data, error, isLoading, isFetching, refetch } = useGetBookingsQuery({
    page: currentPage,
    limit: PAGE_SIZE,
    status: activeTab,
    search: debouncedSearchTerm,
    city: debouncedCitySearchTerm || undefined,
  })

  // Map bookings data from API response
  const bookings = data?.data?.bookings || []
  const summary = data?.data?.summary || {}
  const pagination = data?.data?.pagination || {}

  const totalPages =
    pagination?.totalPages !== undefined ? pagination.totalPages : bookings.length > 0 ? 1 : 0

  useEffect(() => {
    if (location?.state?.tab) {
      setActiveTab(location.state.tab)
      window.history.replaceState({}, document.title)
    }
  }, [location?.state?.tab])

  useEffect(() => {
    if (location?.state?.lawyerAdded) {
      setToastMessage('Lawyer registered successfully!')
      setToastVisible(true)
      window.history.replaceState({}, document.title)
    }
  }, [location])

  useEffect(() => {
    if (modified || location?.state?.tab) {
      refetch()
      setToastMessage('Lawyer updated successfully!')
      setToastVisible(true)
      window.history.replaceState({}, document.title)
    }
  }, [modified, location?.state?.tab, refetch])

  // Reset to page 1 when tab or search term changes
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, debouncedSearchTerm])

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page)
    }
  }

  // Improved pagination rendering for all edge cases
  const renderPaginationItems = () => {
    const items = []
    if (totalPages <= 1) return items

    // Always show first page
    items.push(
      <CPaginationItem key={1} active={currentPage === 1} onClick={() => handlePageChange(1)}>
        1
      </CPaginationItem>,
    )

    // Show ellipsis if needed
    if (currentPage > 3) {
      items.push(
        <CPaginationItem key="ellipsis1" disabled>
          ...
        </CPaginationItem>,
      )
    }

    // Show pages around current page
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      items.push(
        <CPaginationItem key={i} active={currentPage === i} onClick={() => handlePageChange(i)}>
          {i}
        </CPaginationItem>,
      )
    }

    // Show ellipsis if needed
    if (currentPage < totalPages - 2) {
      items.push(
        <CPaginationItem key="ellipsis2" disabled>
          ...
        </CPaginationItem>,
      )
    }

    // Always show last page if more than 1
    if (totalPages > 1) {
      items.push(
        <CPaginationItem
          key={totalPages}
          active={currentPage === totalPages}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </CPaginationItem>,
      )
    }

    return items
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <CSpinner color="warning" style={{ width: '4rem', height: '4rem' }} variant="grow" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-danger">
          <CIcon icon={cilPeople} height={36} className="mb-2" />
          <h4>Error fetching bookings</h4>
        </div>
      </div>
    )
  }

  return (
    <>
      <CToaster placement="top-end" className="mt-4">
        {toastVisible && (
          <CToast
            autohide={true}
            color="success"
            className="border-0 shadow-lg"
            visible={true}
            style={{
              background: 'linear-gradient(135deg, #4CAF50, #45a049)',
              color: '#fff',
              borderRadius: '0.75rem',
              minWidth: '320px',
            }}
          >
            <div className="d-flex align-items-center">
              <FaCheckCircle size={24} className="me-3" />
              <CToastBody className="fw-semibold flex-grow-1">{toastMessage}</CToastBody>
              <CToastClose className="ms-3 m-auto" style={{ color: '#fff', opacity: 0.8 }} />
            </div>
          </CToast>
        )}
      </CToaster>

      <CCard className="mb-4 p-3">
        <CRow className="justify-content-center">
          <CCol xs={12} sm={4} lg={4} xxl={4} className="mb-4">
            <CWidgetStatsC
              icon={<CIcon icon={cilCalendar} height={36} />}
              value={summary?.totalCompletedBookings?.toString() || '0'}
              title={`Completed Bookings`}
              progress={{ color: 'success', value: 75 }}
            />
          </CCol>
          <CCol xs={12} sm={4} lg={4} xxl={4} className="mb-4">
            <CWidgetStatsC
              icon={<CIcon icon={cilCalendar} height={36} />}
              value={summary?.totalCancelledBookings?.toString() || '0'}
              title={`Cancelled Bookings`}
              progress={{ color: 'warning', value: 75 }}
            />
          </CCol>
          <CCol xs={12} sm={4} lg={4} xxl={4} className="mb-4">
            <CWidgetStatsC
              icon={<CIcon icon={cilCalendar} height={36} />}
              value={summary?.totalUpcomingBookings?.toString() || '0'}
              title={`Upcoming Bookings`}
              progress={{ color: 'warning', value: 75 }}
            />
          </CCol>
        </CRow>
      </CCard>
      <CCardBody>
        <CRow className="align-items-center mb-3">
          <CCol xs={12} md={4} className="mb-2 d-flex align-items-center justify-content-start">
            <div
              className="fw-bold"
              style={{
                fontSize: '1.5rem',
                color: 'var(--cui-body-color, #212529)',
                background: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                boxShadow: 'none',
                letterSpacing: '0.5px',
                transition: 'color 0.2s',
              }}
            >
              Booking &amp; Appointments
            </div>
          </CCol>
          <CCol xs={12} md={4} className="mb-2">
            {/* <div className="position-relative" style={{ maxWidth: '600px' }}>
              <CIcon
                icon={cilSearch}
                className="position-absolute"
                style={{ top: '17px', left: '15px', zIndex: 10 }}
              />
              <CFormInput
                type="text"
                placeholder="Search by city..."
                value={citySearchTerm}
                onChange={handleCitySearchChange}
                className="ps-5"
                style={{ minWidth: '400px', fontSize: '1.1rem', height: '48px' }}
              />
            </div> */}
          </CCol>
          <CCol xs={12} md={4} className="mb-2">
            <div className="position-relative" style={{ maxWidth: '600px', float: 'right' }}>
              <CIcon
                icon={cilSearch}
                className="position-absolute"
                style={{ top: '17px', left: '15px', zIndex: 10 }}
              />
              <CFormInput
                type="text"
                placeholder="Search by name, phone or email..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="ps-5"
                style={{ minWidth: '400px', fontSize: '1.1rem', height: '48px' }}
              />
            </div>
          </CCol>
        </CRow>
      </CCardBody>

      <CCard className="mb-4">
        <CNav variant="tabs" className="mb-4">
          {tabs.map((tab, idx) => (
            <CNavItem key={idx}>
              <CNavLink active={activeTab === tab.key} onClick={() => setActiveTab(tab.key)}>
                {tab.label}
              </CNavLink>
            </CNavItem>
          ))}
        </CNav>

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
          <CTableBody>
            {isFetching ? (
              <CTableRow>
                <CTableDataCell colSpan={8} className="text-center py-4">
                  <CSpinner
                    color="warning"
                    style={{ width: '3rem', height: '3rem' }}
                    variant="grow"
                  />
                </CTableDataCell>
              </CTableRow>
            ) : bookings.length > 0 ? (
              bookings.map((booking) => (
                <CTableRow
                  key={booking._id}
                  onClick={() =>
                    navigate(`/bookings/detail/${booking._id}`, { state: { booking } })
                  }
                  style={{ cursor: 'pointer' }}
                >
                  <CTableDataCell className="text-center">
                    {booking?._id?.slice(-5)?.toUpperCase()}
                  </CTableDataCell>
                  <CTableDataCell className="text-center">
                    <div className="d-flex align-items-center justify-content-center">
                      <CAvatar size="md" src={booking?.lawyer?.image} />
                      <div className="ms-2 text-start" style={{ minWidth: '120px' }}>
                        {booking?.lawyer?.name}
                      </div>
                    </div>
                  </CTableDataCell>
                  <CTableDataCell className="text-center">
                    <div className="d-flex align-items-center justify-content-center">
                      <CAvatar size="md" src={booking?.user?.image} />
                      <div className="ms-2 text-start" style={{ minWidth: '120px' }}>
                        {booking?.user?.name}
                      </div>
                    </div>
                  </CTableDataCell>
                  <CTableDataCell className="text-center">
                    {booking?.date
                      ? new Date(booking.date).toLocaleDateString() + ' ' + (booking?.slot || '')
                      : ''}
                  </CTableDataCell>
                  <CTableDataCell className="text-center">{booking?.location}</CTableDataCell>
                  <CTableDataCell className="text-center">
                    <CBadge
                      color={
                        booking?.payments?.status === 'paid'
                          ? 'success'
                          : booking?.payments?.status === 'unpaid'
                            ? 'warning'
                            : 'secondary'
                      }
                    >
                      {booking?.payments?.status}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell className="text-center">
                    {booking?.payments?.payable_amount
                      ? `Rs. ${booking.payments.payable_amount}`
                      : '-'}
                  </CTableDataCell>
                  <CTableDataCell className="text-center">
                    <CDropdown alignment="end">
                      <span style={{ fontSize: '24px', cursor: 'pointer' }}>⋮</span>
                    </CDropdown>
                  </CTableDataCell>
                </CTableRow>
              ))
            ) : (
              !isFetching && (
                <CTableRow>
                  <CTableDataCell colSpan={8} className="text-center py-4">
                    {debouncedSearchTerm ? 'No matching bookings found.' : 'No bookings found.'}
                  </CTableDataCell>
                </CTableRow>
              )
            )}
          </CTableBody>
        </CTable>

        {/* Pagination: Only show if there are bookings and more than 1 page */}
        {bookings.length > 0 && totalPages > 1 && (
          <div className="d-flex justify-content-end mt-3 me-3">
            <CPagination>
              <CPaginationItem
                aria-label="Previous"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                &laquo;
              </CPaginationItem>
              {renderPaginationItems()}
              <CPaginationItem
                aria-label="Next"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                &raquo;
              </CPaginationItem>
            </CPagination>
          </div>
        )}
      </CCard>
    </>
  )
}

export default Bookings
