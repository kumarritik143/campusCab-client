"use client";

import React, { useState, useContext, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { UserDataContext } from "@/context/UserContext";
import axios from "axios";
import Link from "next/link";

const UserLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const context = useContext(UserDataContext);
  if (!context) throw new Error("UserContext is undefined");

  const { setUser } = context;

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/users/login`,
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        const data = response.data;
        setUser(data.user);
        localStorage.setItem("token", data.token);
        router.push("/users/home");
      }
    } catch (err) {
      console.error("Login failed", err);
    }

    setEmail("");
    setPassword("");
  };

  return (
    <div className="bg-cover bg-center bg-[url('https://img.freepik.com/free-photo/green-traffic-light-rain-cars-drive-by_181624-45198.jpg?ga=GA1.1.1679696074.1749474067&semt=ais_hybrid&w=740')] min-h-[100svh] flex flex-col justify-end">
      <div className="bg-white rounded-t-3xl px-6 py-8 sm:px-10 sm:py-10 shadow-2xl w-full">
        <form onSubmit={submitHandler} className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-center mb-6">
            Login to CampusCab
          </h2>

          <label className="block mb-2 text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mb-5 w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />

          <label className="block mb-2 text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="mb-6 w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />

          <button
            type="submit"
            className="w-full py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-900 transition"
          >
            Login
          </button>

          <p className="text-center text-sm mt-4">
            New here?{" "}
            <Link href="/signup" className="text-blue-600 hover:underline">
              Create new Account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default UserLogin;
