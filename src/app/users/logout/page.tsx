'use client'

import React, { useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import UserProtectWrapper from '@/components/UserProtectedWrapper'

const UserLogout: React.FC = () => {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      router.push('/login')
      return
    }

    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/users/logout`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.status === 200) {
          localStorage.removeItem('token')
          router.push('/login')
        }
      })
      .catch((error) => {
        console.error('Logout error:', error)
        localStorage.removeItem('token')
        router.push('/login')
      })
  }, [router])

  return (
    <UserProtectWrapper>
      <div>Logging out...</div>
    </UserProtectWrapper>
  )
}

export default UserLogout
