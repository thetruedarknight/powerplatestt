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
        <p className="mb-4">Follow us on Instagram for special offers, menu highlights, detailed nutritional information on meals, tips, and stories from our amazing customers.</p>
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
     <a
  href="https://wa.me/18683692226?text=Hi%20I'm%20interested%20in%20PowerPlates!"
  target="_blank"
  rel="noopener noreferrer"
  className="fixed bottom-4 right-4 z-50 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
>
  <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" className="w-5 h-5">
    <path d="M.057 24l1.687-6.163C.6 15.9.041 13.932.041 12 .041 5.373 5.373.041 12 .041c3.181 0 6.155 1.24 8.409 3.492A11.84 11.84 0 0124 12c0 6.627-5.373 12-12 12a11.937 11.937 0 01-5.208-1.2L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.344 1.591 5.456 0 9.901-4.445 9.901-9.9 0-2.642-1.03-5.127-2.899-6.994C16.132 3.03 13.646 2 11.004 2 5.548 2 1.104 6.445 1.104 12c0 1.77.469 3.462 1.357 4.945l-.896 3.278 3.089-.86zm11.387-5.542c-.2-.1-1.177-.58-1.36-.646-.183-.065-.316-.1-.449.1-.132.2-.515.646-.63.777-.115.132-.232.148-.432.05-.2-.1-.84-.31-1.6-.99-.591-.526-.99-1.175-1.104-1.375-.115-.2-.012-.308.087-.407.09-.09.2-.232.3-.348.1-.116.132-.2.2-.332.066-.132.033-.25-.017-.348-.05-.1-.449-1.075-.615-1.475-.162-.388-.326-.336-.449-.343l-.382-.007c-.116 0-.3.033-.457.25-.157.217-.603.59-.603 1.442s.617 1.675.703 1.79c.083.116 1.21 1.846 2.94 2.588 1.73.743 1.73.495 2.04.464.307-.03 1.004-.408 1.146-.803.14-.396.14-.736.1-.803-.033-.065-.132-.1-.333-.2z" />
  </svg>
  Chat with us
</a>
      
    </div>
    
  );
}
