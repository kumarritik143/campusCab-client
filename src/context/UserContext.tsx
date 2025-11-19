'use client'
import React, { createContext, ReactNode, useState } from 'react'

type FullName = {
  firstName: string
  lastName: string
}

type User = {
  _id: string |  null
  email: string
  fullName: FullName
}

type UserContextType = {
  user: User
  setUser: React.Dispatch<React.SetStateAction<User>>
}

export const UserDataContext = createContext<UserContextType | undefined>(undefined)

const UserContext = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>({
    _id: null, // ✅ You missed this
    email: '',
    fullName: {
      firstName: '',
      lastName: '',
    },
  })

  return (
    <UserDataContext.Provider value={{ user, setUser }}>
      {children}
    </UserDataContext.Provider>
  )
}

export default UserContext
