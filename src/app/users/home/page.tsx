'use client'

import HomePage from '@/components/HomePage'
import UserProtectWrapper from '@/components/UserProtectedWrapper'
import React from 'react'

const Page = () => {
  return (
    <UserProtectWrapper>
      <HomePage />
    </UserProtectWrapper>
  )
}

export default Page
