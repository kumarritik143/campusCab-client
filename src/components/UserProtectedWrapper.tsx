'use client'

import React, { useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { UserDataContext } from '../context/UserContext'

interface UserProtectWrapperProps {
  children: ReactNode
}

const UserProtectWrapper: React.FC<UserProtectWrapperProps> = ({ children }) => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  const userContext = useContext(UserDataContext)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.status === 200 && userContext) {
          userContext.setUser(response.data)
          // Store userId in localStorage for socket connection
          if (response.data?._id) {
            localStorage.setItem("userId", response.data._id)
          }
          setIsLoading(false)
        }
      })
      .catch((err) => {
        console.error(err)
        localStorage.removeItem('token')
        localStorage.removeItem('userId')
        router.push('/login')
      })
  }, [router, userContext])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return <>{children}</>
}

export default UserProtectWrapper
