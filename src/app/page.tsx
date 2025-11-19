'use client'
import Link from 'next/link'
import React from 'react'

const Start = () => {
  return (
    <div className="bg-cover bg-center bg-no-repeat bg-[url(https://img.freepik.com/free-photo/green-traffic-light-rain-cars-drive-by_181624-45198.jpg?ga=GA1.1.1679696074.1749474067&semt=ais_hybrid&w=740)] min-h-[100svh] flex flex-col justify-end w-full">
      <div className="bg-white py-8 px-6 sm:px-10 md:px-16 rounded-t-3xl shadow-lg">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-4">
          Get Started with CampusCab
        </h2>
        <Link
          href="/login"
          className="flex items-center justify-center w-full bg-black text-white text-base sm:text-lg md:text-xl py-3 rounded-lg mt-3"
        >
          Continue
        </Link>
      </div>
    </div>
  )
}

export default Start
