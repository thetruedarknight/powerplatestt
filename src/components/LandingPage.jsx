import React from "react";
import { Instagram } from "lucide-react";

export default function LandingPage({ onStart }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-gray-800">
      <h1 className="text-5xl font-bold mb-4">Welcome to PowerPlates</h1>
      <p className="max-w-xl text-center mb-8">
        At PowerPlates we deliver healthy, delicious meals straight to your door.
        Our mission is to make clean eating convenient and affordable for busy
        people everywhere!
      </p>
      <button
        onClick={onStart}
        className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-xl hover:underline"
      >
        Browse Our Meal Selection
      </button>
      <section className="mt-16 max-w-2xl text-left">
        <h2 className="text-3xl font-semibold mb-2">About Us</h2>
        <p className="mb-2">
          Founded in 2024, PowerPlates was born out of a passion for health and
          convenience. We craft each meal with premium ingredients and
          chef-inspired flavors.
        </p>
        <p>
          Whether you’re looking to fuel a tough workout, manage weight, or just
          eat smarter, we’ve got you covered. Browse our menu and customize your
          perfect meal plan today!
        </p>
      </section>
      <section className="mt-8 max-w-2xl text-left">
        <h2 className="text-2xl font-semibold mb-2">Follow us on Instagram</h2>
        <a
          href="https://instagram.com/PowerPlatesTT"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-pink-500 hover:text-pink-600"
        >
          <Instagram className="w-6 h-6 mr-2" />
          @PowerPlatesTT
        </a>
      </section>
    </div>
  );
}
