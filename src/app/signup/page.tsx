"use client";

import { UserDataContext } from "@/context/UserContext";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useContext, useState } from "react";

const UserSignup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const router = useRouter();
  const context = useContext(UserDataContext);
  if (!context) throw new Error("UserContext is undefined");
  const { setUser } = context;

  const sendOtp = async () => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/users/send-otp`,
        { phone }
      );
      if (res.status === 200) {
        alert("OTP sent successfully!");
        setOtpSent(true);
      }
    } catch (err) {
      console.error("Error sending OTP:", err);
      alert("Failed to send OTP. Try again.");
    }
  };

  const verifyOtp = async () => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/users/verify-otp`,
        { phone, otp }
      );
      if (res.status === 200 && res.data.verified) {
        setOtpVerified(true);
        alert("OTP verified successfully!");
      } else {
        alert("Invalid OTP.");
      }
    } catch (err) {
      console.error("OTP Verification failed:", err);
      alert("OTP verification failed.");
    }
  };

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!otpVerified) {
      return alert("Please verify your OTP before signing up.");
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/users/register`,
        {
          fullname: { firstname: firstName, lastname: lastName },
          email,
          phone,
          password,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.status === 201) {
        const data = response.data;
        setUser(data.user);
        localStorage.setItem("token", data.token);
        if (data.user?._id) {
          localStorage.setItem("userId", data.user._id);
        }
        router.push("/users/home");
      }
    } catch (err) {
      console.error("Signup failed:", err);
    }

    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setOtp("");
    setOtpSent(false);
    setOtpVerified(false);
  };

  return (
    <div className="bg-cover bg-center bg-[url('https://img.freepik.com/free-photo/green-traffic-light-rain-cars-drive-by_181624-45198.jpg')] min-h-screen flex flex-col justify-end">
      <div className="bg-white rounded-t-3xl px-6 py-8 sm:px-10 sm:py-10 shadow-2xl w-full">
        <form onSubmit={submitHandler} className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-center mb-6">
            Create your CampusCab Account
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 mb-5">
            <input
              required
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg"
            />
            <input
              required
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg"
            />
          </div>

          <input
            required
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-5 w-full px-4 py-3 border rounded-lg"
          />

          <div className="flex gap-2 mb-5">
            <input
              required
              type="text"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg"
            />
            <button
              type="button"
              onClick={sendOtp}
              className="px-4 bg-black text-white rounded-lg"
            >
              Send OTP
            </button>
          </div>

          {otpSent && (
            <div className="flex gap-2 mb-5">
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
              />
              <button
                type="button"
                onClick={verifyOtp}
                className="px-4 bg-green-600 text-white rounded-lg"
              >
                Verify OTP
              </button>
            </div>
          )}

          <input
            required
            type="password"
            placeholder="Create password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-6 w-full px-4 py-3 border rounded-lg"
          />

          <button
            type="submit"
            className="w-full py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-900 transition"
          >
            Sign Up
          </button>

          <p className="text-center text-sm mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default UserSignup;
