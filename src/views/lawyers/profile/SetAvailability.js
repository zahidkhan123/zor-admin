import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CFormSelect,
  CButton,
  CFormCheck,
  CRow,
  CCol,
  CBadge,
} from '@coreui/react'
import { useGetDaysQuery, useGetLocationsQuery, useGetSlotsQuery } from '../../../services/api'

const colorMap = {
  Online: 'success', // green
  Home: 'secondary', // gray
  Personal: 'danger', // red
  Chamber: 'warning', // yellow
}

const SetAvailability = () => {
  const [slots, setSlots] = useState([])
  const [days, setDays] = useState([])
  const [locations, setLocations] = useState([])
  const [selectedDay, setSelectedDay] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedSlots, setSelectedSlots] = useState({})
  const [applyAllDays, setApplyAllDays] = useState(false)

  const { data: daysData, isLoading: daysLoading } = useGetDaysQuery()
  const { data: locationsData, isLoading: locationsLoading } = useGetLocationsQuery()
  const { data: slotsData, isLoading: slotsLoading } = useGetSlotsQuery()

  useEffect(() => {
    if (daysData) {
      setDays(daysData?.data)
    }
  }, [daysData])

  useEffect(() => {
    if (locationsData) {
      setLocations(locationsData.data)
    }
  }, [locationsData])

  useEffect(() => {
    if (slotsData) {
      const sortedSlots = [...slotsData.data].sort(
        (a, b) => new Date(`1970/01/01 ${a.name}`) - new Date(`1970/01/01 ${b.name}`),
      )
      setSlots(sortedSlots)
    }
  }, [slotsData])

  const handleLocationToggle = (location) => {
    setSelectedLocation((prev) => (prev === location ? '' : location))
  }

  const handleSlotToggle = (slotName) => {
    if (!selectedDay || !selectedLocation) return

    const key = `${selectedDay}-${slotName}`
    setSelectedSlots((prev) => {
      const updated = { ...prev }

      if (updated[key] === selectedLocation) {
        delete updated[key] // deselect
      } else {
        updated[key] = selectedLocation // override previous selection for this slot
      }

      return updated
    })
  }
  ß
  const renderSlots = () => {
    return slots.map((slot) => {
      const slotKey = `${selectedDay}-${slot.name}`
      const assignedLocation = selectedSlots[slotKey]
      const isSelected = assignedLocation === selectedLocation
      const isTakenByOther = assignedLocation && !isSelected

      const btnColor = assignedLocation ? colorMap[assignedLocation] : 'secondary'
      const variant = isSelected ? 'solid' : 'outline'

      return (
        <CButton
          key={slotKey}
          color={btnColor}
          variant={variant}
          size="sm"
          className="m-1"
          onClick={() => handleSlotToggle(slot.name)}
          disabled={isTakenByOther}
        >
          {slot.name}
        </CButton>
      )
    })
  }

  const renderSelected = () => {
    if (!selectedDay) return null

    const grouped = {}
    Object.entries(selectedSlots).forEach(([key, location]) => {
      const [day, slot] = key.split('-')
      if (day !== selectedDay) return
      if (!grouped[location]) grouped[location] = []
      grouped[location].push(slot)
    })

    return (
      <CRow className="mt-4">
        {Object.entries(grouped).map(([location, slotList]) => (
          <CCol md={3} key={location} className="mb-3">
            <h6>{location}</h6>
            <div className="d-flex flex-wrap">
              {slotList.map((slot, index) => (
                <CBadge key={index} color={colorMap[location]} className="me-1 mb-1">
                  {slot}
                </CBadge>
              ))}
            </div>
          </CCol>
        ))}
      </CRow>
    )
  }

  if (daysLoading || locationsLoading || slotsLoading) {
    return <div>Loading...</div>
  }

  return (
    <CCard>
      <CCardHeader>Set Availability</CCardHeader>
      <CCardBody>
        <CRow className="mb-3">
          <CCol md={6}>
            <CFormSelect
              label="Select Day"
              options={[
                { label: 'Select a day', value: '' },
                ...days.map((d) => ({ label: d.name, value: d.name })),
              ]}
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
            />
          </CCol>
          <CCol md={6}>
            <div className="mb-3">
              <label className="form-label">Select Location</label>
              <div className="d-flex flex-wrap">
                {locations.map((location) => {
                  const locName = location.name === 'Office' ? 'Personal' : location.name
                  return (
                    <CFormCheck
                      key={location._id}
                      id={`location-${location._id}`}
                      label={locName}
                      checked={selectedLocation === locName}
                      onChange={() => handleLocationToggle(locName)}
                      className="me-3 mb-2"
                    />
                  )
                })}
              </div>
            </div>
          </CCol>
        </CRow>

        {selectedDay && selectedLocation && (
          <>
            <div className="mb-3">
              <label className="form-label">Select Time Slots</label>
              <div className="d-flex flex-wrap">{renderSlots()}</div>
            </div>

            <CFormCheck
              id="applyAllDays"
              label="Make these slots available for all days"
              checked={applyAllDays}
              onChange={() => setApplyAllDays(!applyAllDays)}
            />
            <p className="text-danger small mt-1">Note: Slots will be updated in 24 hours.</p>

            {renderSelected()}
          </>
        )}

        <div className="d-flex justify-content-end mt-3">
          <CButton color="secondary" className="me-2">
            Cancel
          </CButton>
          <CButton color="dark">Save</CButton>
        </div>
      </CCardBody>
    </CCard>
  )
}

export default SetAvailability
