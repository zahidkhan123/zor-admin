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
import { useNavigate } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import { cilSearch, cilCalendar } from '@coreui/icons'
import { FaCheckCircle } from 'react-icons/fa'

// ✅ Import your local JSON file
import bookingsData from '../../services/bookingsGrouped.json'

const tabs = [
  { key: 'confirmed', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'all', label: 'All Bookings' },
]

const PAGE_SIZE = 10

const Bookings = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('confirmed')
  const [currentPage, setCurrentPage] = useState(1)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  // Map tab keys to JSON structure
  const mapTabToData = {
    confirmed: bookingsData.upcoming,
    completed: bookingsData.completed,
    cancelled: bookingsData.cancelled,
    all: bookingsData.all,
  }

  // Filter bookings
  const filteredBookings = (mapTabToData[activeTab] || []).filter((booking) => {
    const term = debouncedSearchTerm.toLowerCase()
    return (
      booking.lawyer.name.toLowerCase().includes(term) ||
      booking.user.name.toLowerCase().includes(term) ||
      booking._id.toLowerCase().includes(term)
    )
  })

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / PAGE_SIZE)
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )
  console.log('bookingsData.completed', bookingsData.completed.length)
  // Summary
  const summary = {
    totalUpcomingBookings: bookingsData.upcoming.length,
    totalCompletedBookings: bookingsData.completed.length,
    totalCancelledBookings: bookingsData.cancelled.length,
  }

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page)
  }

  const renderPaginationItems = () => {
    const items = []
    if (totalPages <= 1) return items
    for (let i = 1; i <= totalPages; i++) {
      items.push(
        <CPaginationItem key={i} active={currentPage === i} onClick={() => handlePageChange(i)}>
          {i}
        </CPaginationItem>,
      )
    }
    return items
  }

  return (
    <>
      <CToaster placement="top-end" className="mt-4">
        {toastVisible && (
          <CToast autohide color="success" visible className="border-0 shadow-lg">
            <div className="d-flex align-items-center">
              <FaCheckCircle size={24} className="me-3" />
              <CToastBody className="fw-semibold flex-grow-1">{toastMessage}</CToastBody>
              <CToastClose className="ms-3 m-auto" />
            </div>
          </CToast>
        )}
      </CToaster>

      {/* Summary Stats */}
      <CCard className="mb-4 p-3">
        <CRow className="justify-content-center">
          <CCol xs={12} sm={4}>
            <CWidgetStatsC
              icon={<CIcon icon={cilCalendar} height={36} />}
              value={summary.totalCompletedBookings.toString()}
              title="Completed Bookings"
              progress={{ color: 'success', value: 75 }}
            />
          </CCol>
          <CCol xs={12} sm={4}>
            <CWidgetStatsC
              icon={<CIcon icon={cilCalendar} height={36} />}
              value={summary.totalCancelledBookings.toString()}
              title="Cancelled Bookings"
              progress={{ color: 'warning', value: 75 }}
            />
          </CCol>
          <CCol xs={12} sm={4}>
            <CWidgetStatsC
              icon={<CIcon icon={cilCalendar} height={36} />}
              value={summary.totalUpcomingBookings.toString()}
              title="Upcoming Bookings"
              progress={{ color: 'info', value: 75 }}
            />
          </CCol>
        </CRow>
      </CCard>

      {/* Search */}
      <CCardBody>
        <CRow className="align-items-center mb-3">
          <CCol xs={12} md={6}>
            <div className="fw-bold" style={{ fontSize: '1.5rem' }}>
              Booking &amp; Appointments
            </div>
          </CCol>
          <CCol xs={12} md={6}>
            <div className="position-relative" style={{ maxWidth: '400px', float: 'right' }}>
              <CIcon
                icon={cilSearch}
                className="position-absolute"
                style={{ top: '12px', left: '15px' }}
              />
              <CFormInput
                type="text"
                placeholder="Search by name, ID..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="ps-5"
              />
            </div>
          </CCol>
        </CRow>
      </CCardBody>

      {/* Tabs & Table */}
      <CCard className="mb-4">
        <CNav variant="tabs" className="mb-4">
          {tabs.map((tab) => (
            <CNavItem key={tab.key}>
              <CNavLink
                active={activeTab === tab.key}
                onClick={() => {
                  setActiveTab(tab.key)
                  setCurrentPage(1)
                }}
              >
                {tab.label}
              </CNavLink>
            </CNavItem>
          ))}
        </CNav>

        <CTable align="middle" className="mb-0 border" hover responsive>
          <CTableHead>
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
            {paginatedBookings.length > 0 ? (
              paginatedBookings.map((booking) => (
                <CTableRow
                  key={booking._id}
                  onClick={() =>
                    navigate(`/bookings/detail/${booking._id}`, { state: { booking } })
                  }
                  style={{ cursor: 'pointer' }}
                >
                  <CTableDataCell className="text-center">{booking._id}</CTableDataCell>
                  <CTableDataCell className="text-center">
                    <div className="d-flex align-items-center justify-content-center">
                      <CAvatar size="md" src={booking.lawyer.image} />
                      <div className="ms-2">{booking.lawyer.name}</div>
                    </div>
                  </CTableDataCell>
                  <CTableDataCell className="text-center">
                    <div className="d-flex align-items-center justify-content-center">
                      <CAvatar size="md" src={booking.user.image} />
                      <div className="ms-2">{booking.user.name}</div>
                    </div>
                  </CTableDataCell>
                  <CTableDataCell className="text-center">
                    {new Date(booking.date).toLocaleDateString()} {booking.slot}
                  </CTableDataCell>
                  <CTableDataCell className="text-center">{booking.location}</CTableDataCell>
                  <CTableDataCell className="text-center">
                    <CBadge color={booking.payments.status === 'paid' ? 'success' : 'warning'}>
                      {booking.payments.status}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell className="text-center">
                    Rs. {booking.payments.payable_amount}
                  </CTableDataCell>
                  <CTableDataCell className="text-center">
                    <CDropdown alignment="end">
                      <span style={{ fontSize: '24px' }}>⋮</span>
                    </CDropdown>
                  </CTableDataCell>
                </CTableRow>
              ))
            ) : (
              <CTableRow>
                <CTableDataCell colSpan={8} className="text-center py-4">
                  No bookings found.
                </CTableDataCell>
              </CTableRow>
            )}
          </CTableBody>
        </CTable>

        {totalPages > 1 && (
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
