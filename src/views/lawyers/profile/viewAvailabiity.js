import React from 'react'
import { CContainer } from '@coreui/react'
import DaySchedule from './DaySchedule'
import LawyerProfileHeader from './ProfileHeader'

const LawyerAvailability = ({ lawyer }) => {
  // Dummy data structure
  const scheduleData = [
    {
      day: 'Monday',
      locations: [
        {
          name: 'Online',
          slots: [
            '12:00 AM',
            '1:00 AM',
            '2:00 AM',
            '3:00 AM',
            '4:00 AM',
            '5:00 AM',
            '6:00 AM',
            '7:00 AM',
            '8:00 AM',
          ],
        },
        {
          name: 'Home',
          slots: ['12:00 AM', '12:30 AM', '02:00 PM'],
        },
        {
          name: 'Personal',
          slots: ['12:00 AM', '12:30 AM', '02:00 PM'],
        },
        {
          name: 'Chamber',
          slots: ['12:00 AM', '12:30 AM', '02:00 PM'],
        },
      ],
    },
    {
      day: 'Tuesday',
      locations: [
        {
          name: 'Online',
          slots: ['12:00 AM', '1:00 AM', '2:00 AM', '3:00 AM', '4:00 AM', '5:00 AM'],
        },
        {
          name: 'Home',
          slots: ['12:00 AM', '12:30 AM', '02:00 PM'],
        },
        {
          name: 'Personal',
          slots: ['12:00 AM', '12:30 AM', '02:00 PM'],
        },
        {
          name: 'Chamber',
          slots: ['12:00 AM', '12:30 AM', '02:00 PM'],
        },
      ],
    },
    // Add rest of the days similarly...
  ]

  return (
    <CContainer fluid className="py-3">
      <LawyerProfileHeader lawyer={lawyer} />
      {scheduleData.map((dayItem, index) => (
        <DaySchedule key={index} day={dayItem.day} locations={dayItem.locations} />
      ))}
    </CContainer>
  )
}

export default LawyerAvailability
