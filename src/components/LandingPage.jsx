import React from "react";
import { Instagram } from "lucide-react";

// Use the same Imgur banner URL as in App.jsx
const bannerUrl = "https://i.imgur.com/rpnAoAp.png";

export default function LandingPage({ onStart }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-green-100 via-green-200 to-green-300 p-6 text-gray-800">
      {/* Banner from Imgur */}
      <img
        src={bannerUrl}
        alt="Power Plates Banner"
        className="w-full max-w-4xl rounded-2xl shadow-lg mb-8"
      />

      <h1 className="text-5xl font-bold mb-2">Welcome to Power Plates</h1>
      <p className="text-2xl font-semibold mb-4">Healthy Meals, Delivered to Your Door</p>
      <p className="max-w-xl text-center mb-8">
        At Power Plates, we make clean eating simple, affordable, and delicious with our ready-to-enjoy meals. Tailormade to fit your lifestyle and fuel your week
      </p>

      <section className="max-w-2xl text-left mb-8">
        <h2 className="text-3xl font-semibold mb-2">🌿 Our Mission</h2>
        <p className="mb-4">
          We deliver macro-balanced meals that empower you to meet your health and fitness goals—without the stress of cooking or shopping.
        </p>

        <h2 className="text-3xl font-semibold mb-2">📦 How It Works</h2>
        <p className="mb-4">
          Choose from our rotating weekly menu. We deliver chilled, ready-to-eat meals twice weekly to most locations within Trinidad. Once you've placed your order, one of our firendly team members will get in touch with you to confirm delivery details.
        </p>
        <p className="mb-4">
          Whether you're planning ahead for the week or just need a break from the kitchen, PowerPlates has you covered.
        </p>
        <h2 className="text-3xl font-semibold mb-2">👨‍👩‍👧 Join the Power Plates Fam!</h2>
        <p className="mb-0 font-semibold">Real meals. Real results.</p>
        <p className="mb-4">Follow us on Instagram for menu highlights, detailed nutritional information on meals, tips, and stories from our amazing customers.</p>
      </section>
        <a
        href="https://instagram.com/powerplatestt"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center space-x-2 text-pink-500 hover:text-pink-600 mt-0 mb-10"
      >
        <Instagram size={24} />
        <span>@PowerPlatesTT</span>
      </a>
      <button
        onClick={onStart}
        className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-lg text-xl mb-6 shadow-md"
      >
        Start Your Order
      </button>

      
    </div>
  );
}
