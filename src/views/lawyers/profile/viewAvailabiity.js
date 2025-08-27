import React from 'react'
import { CContainer, CSpinner, CRow, CCol } from '@coreui/react'
import DaySchedule from './DaySchedule'
import LawyerProfileHeader from './ProfileHeader'
import { useLocation } from 'react-router-dom'
import { useGetLawyerAvailabilityQuery } from '../../../services/api'

const transformAvailabilityData = (apiData) => {
  return apiData.map((day) => {
    // For each location, filter slots that are available at that location
    const locationsWithSlots = day.locations.map((location) => {
      // Get the location name in lowercase to match the slot properties
      const locationKey = location.name.toLowerCase()

      // Filter slots that have this location set to true
      const availableSlots = day.slots
        ? day.slots.filter((slot) => slot[locationKey] === true).map((slot) => slot.name)
        : []

      return {
        name: location.name,
        slots: availableSlots,
        is_active: location.is_active,
      }
    })

    return {
      day: day.name,
      locations: locationsWithSlots,
      is_active: day.is_active,
    }
  })
}

const LawyerAvailability = () => {
  const { state } = useLocation()
  const { id } = state
  // Get loading state from the query
  const { data: availabilityData, isLoading } = useGetLawyerAvailabilityQuery(id)

  // Use the transformed data or fallback to empty array if no data
  const scheduleData =
    availabilityData && availabilityData.data
      ? transformAvailabilityData(availabilityData.data)
      : []

  return (
    <CContainer fluid className="py-3">
      {/* Loader */}
      {isLoading ? (
        <CRow className="justify-content-center align-items-center" style={{ minHeight: '200px' }}>
          <CCol xs="auto">
            <CSpinner color="warning" style={{ width: '3rem', height: '3rem' }} variant="grow" />
          </CCol>
        </CRow>
      ) : (
        scheduleData.map((dayItem, index) => (
          <DaySchedule
            key={index}
            day={dayItem.day}
            locations={dayItem.locations}
            isActive={dayItem.is_active}
          />
        ))
      )}
    </CContainer>
  )
}

export default LawyerAvailability
