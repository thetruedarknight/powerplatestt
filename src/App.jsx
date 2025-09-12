import { useEffect, useState } from "react";
import LandingPage from "./components/LandingPage";
import BreakfastItemsSection from "./components/BreakfastItemsSection";
import ProteinSnacksSection from "./components/ProteinSnacksSection";
import MainMealsSection from "./components/MainMealsSection";
import SaladsSection from "./components/SaladsSection";
import ProteinSection from "./components/ProteinSection";
// Global debug styles to squash overflow anywhere
const debugStyles = `
  html, body, #root {
    max-width: 100vw !important;
    overflow-x: hidden !important;
    background: #fff;
  }
`;

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [menuData, setMenuData] = useState([]);
  const [doubleMeatPrice, setDoubleMeatPrice] = useState(20);
  const [deliveryDays, setDeliveryDays] = useState(["Tuesday", "Friday"]);
  const [cutoffDays, setCutoffDays] = useState(["Friday", "Wednesday"]);
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [orderNumber, setOrderNumber] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [breakfastQty, setBreakfastQty] = useState([]);
  const [snackQty, setSnackQty] = useState([]);
  const [mealQty, setMealQty] = useState([]);
  const [saladQty, setSaladQty] =useState([]);
  const [proteinQty, setProteinQty] =useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [fullOrder, setFullOrder] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    instructions: "",
  });

  const WEEKDAYS = [
    "Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"
  ];

  function getNextWeekday(weekdayName, from = new Date()) {
    const idx = WEEKDAYS.indexOf(weekdayName);
    const d = new Date(from);
    d.setHours(0,0,0,0);
    const shift = (idx - d.getDay() + 7) % 7;
    d.setDate(d.getDate() + shift);
    return d;
  }

  function getPrevWeekday(weekdayName, from = new Date()) {
    const idx = WEEKDAYS.indexOf(weekdayName);
    const d = new Date(from);
    d.setHours(0,0,0,0);
    const back = (d.getDay() - idx + 7) % 7;
    d.setDate(d.getDate() - back);
    return d;
  }

  function calculateNextDelivery() {
    const now = new Date();
    const [dayA, dayB] = deliveryDays;
    const [dayC, dayD] = cutoffDays;
    const nextA   = getNextWeekday(dayA, now);
    const cutoffC = getPrevWeekday(dayC, nextA);
    cutoffC.setHours(23,59,59,999);
    if (now <= cutoffC) {
      return nextA;
    }
    const nextB   = getNextWeekday(dayB, now);
    const cutoffD = getPrevWeekday(dayD, nextB);
    cutoffD.setHours(23,59,59,999);
    if (now <= cutoffD) {
      return nextB;
    }
    const fallback = new Date(nextA);
    fallback.setDate(fallback.getDate() + 7);
    return fallback;
  }

  useEffect(() => {
    fetch("/api/sheets")
      .then(res => res.json())
      .then(({ menu, config }) => {
        const parsed = (menu || [])
         .filter(item => String(item.display).toUpperCase() === "TRUE")
         .map(item => ({
          ...item,
          price: parseFloat(item.price),
          allowDoubleMeat: String(item.allowDoubleMeat).toUpperCase() === "TRUE",
          imageURL: item.imageURL,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fats: item.fats,
          extraProtein: item.extraProtein,
        }));
        setMenuData(parsed);

        setBreakfastQty(parsed.filter(i => i.category === "Breakfast Items").map(() => 0));
        setSnackQty(parsed.filter(i => i.category === "Protein Snacks").map(() => 0));
        setMealQty(parsed.filter(i => i.category === "Main Meals").map(() => ({ regular: 0, double: 0 })));
        setSaladQty(parsed.filter(i => i.category === "Salads").map(() => ({ regular: 0, double: 0 })));
        setProteinQty(parsed.filter(i => i.category === "Protein Portions").map(() => 0));

        if (config.doubleMeatPrice) setDoubleMeatPrice(parseFloat(config.doubleMeatPrice));
        if (config.deliveryDays)   setDeliveryDays(config.deliveryDays.split(","));
        if (config.cutoffDays)     setCutoffDays(config.cutoffDays.split(","));
      })
      .catch(console.error);
  }, []);

  const buildOrder = () => {
    const byCat = cat => menuData.filter(i => i.category === cat);
    const simple = (items, qtys) =>
      items.map((it, i) => ({ ...it, quantity: qtys[i] })).filter(x => x.quantity > 0);
    const dual = (items, qtys) =>
      items.flatMap((it, i) => {
        const { regular, double } = qtys[i];
        const rows = [];
        if (regular > 0) rows.push({ ...it, quantity: regular, doubleMeat: false });
        if (it.allowDoubleMeat && double > 0) rows.push({ ...it, quantity: double, doubleMeat: true });
        return rows;
      });
    return [
      ...simple(byCat("Breakfast Items"), breakfastQty),
      ...simple(byCat("Protein Snacks"), snackQty),
      ...dual(byCat("Main Meals"), mealQty),
      ...dual(byCat("Salads"), saladQty),
      ...simple(byCat("Protein Portions"), proteinQty),
    ];
  };

  const calculateTotal = () =>
    fullOrder.reduce((sum, it) => sum + (it.price + (it.doubleMeat ? doubleMeatPrice : 0)) * it.quantity, 0);

  const handleSubmit = () => {
    const ord = buildOrder();
    const totalItems = ord.reduce((acc, i) => acc + i.quantity, 0);
    if (totalItems < 5) {
      alert("Please select at least 5 items to place an order.");
      return;
    }
    setFullOrder(ord);
    setShowConfirmation(true);
  };

  const confirmOrder = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const { name, email, phone, address, instructions } = formData;
    if (!name || !email || !phone || !address) {
      alert("Please fill out all required customer info.");
      setIsSubmitting(false);
      return;
    }

    const timestamp = new Date().toLocaleString("en-US", {
      timeZone: "America/Port_of_Spain",
      month: "2-digit", day: "2-digit", year: "numeric",
    });
    const itemList = fullOrder
      .map(i => `${i.name}${i.doubleMeat ? " + Double Meat" : ""} x${i.quantity}`)
      .join("; ");

    const payload = {
      timestamp,
      name, email, phone, address, instructions,
      items: itemList,
      total: calculateTotal().toFixed(2),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Order submission failed");
      }

      const { success, ordernumber } = await res.json();
      if (!success) {
        throw new Error("Server rejected the order");
      }

      setOrderNumber(ordernumber);
      setExpectedDelivery(
        calculateNextDelivery().toLocaleDateString("en-US", {
          weekday: "long", month: "long", day: "numeric",
        })
      );

      setShowConfirmation(false);
      setShowSuccess(true);
    } catch (err) {
      console.error("Submit error:", err);
      alert("There was an error submitting your order.");
      setIsSubmitting(false);
    }
  };

  const cancelConfirmation = () => setShowConfirmation(false);
  const getByCategory = cat => menuData.filter(i => i.category === cat);

  if (showLanding) {
    return <LandingPage onStart={() => setShowLanding(false)} />;
  }

  return (
    <>
      
      <div className="min-h-screen w-full overflow-x-hidden bg-yellow-50 text-gray-800" style={{margin: 0, padding: 0, boxSizing: "border-box", maxWidth: "100vw", overflowX: "hidden"}}>
        <header className="h-72 bg-cover bg-center" style={{ backgroundImage: "url('https://i.imgur.com/alZ1n3Z.png')" }} />
        <main>
          {showSuccess ? (
            <div className="max-w-2xl mx-auto text-center py-20 px-6 bg-white rounded-xl shadow-lg">
              <h2 className="text-4xl font-bold text-green-700 mb-4">✅ Order Confirmed!</h2>
              <p className="text-lg mb-2">Thank you for placing your order with <strong>PowerPlates</strong>.</p>
              <p className="text-lg text-gray-700 mb-2">Your order number is: <span className="font-semibold">#{orderNumber}</span></p>
              <p className="text-lg font-semibold text-gray-800">Your tentative delivery date is: <span className="text-green-700">{expectedDelivery}</span></p>
              <p className="text-lg font-semibold text-gray-800">We've emailed you a copy of this order and a member of our team will be in touch with you 😊</p>
              <button onClick={() => window.location.reload()} className="mt-6 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded">Place Another Order</button>
            </div>
          ) : (
            <div className="text-center py-10">
              {!showConfirmation ? (
                <>
                  <BreakfastItemsSection items={getByCategory("Breakfast Items")} quantities={breakfastQty} setQuantities={setBreakfastQty} />
                  <ProteinSnacksSection items={getByCategory("Protein Snacks")} quantities={snackQty} setQuantities={setSnackQty} />
                  <MainMealsSection items={getByCategory("Main Meals")} quantities={mealQty} setQuantities={setMealQty} doubleMeatPrice={doubleMeatPrice} />
                  <SaladsSection items={getByCategory("Salads")} quantities={saladQty} setQuantities={setSaladQty} doubleMeatPrice={doubleMeatPrice} />
                  <ProteinSection items={getByCategory("Protein Portions")} quantities={proteinQty} setQuantities={setProteinQty} />
                  <button onClick={handleSubmit} className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded text-lg mt-10 hover:underline">Submit Full Order</button>
                  <button onClick={() => setShowLanding(true)} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded text-lg mt-10 hover:underline"> ← Back to Home </button>
                </>
              ) : (
                <div className="w-full text-center py-10 px-4 sm:px-6 bg-white rounded-xl shadow-lg">
  <h2 className="text-3xl font-bold mb-6">🧾 Confirm Your Order</h2>
  <ul className="space-y-3 mb-4 text-left break-words w-full">
    {fullOrder.map((item, idx) => {
      const lineTotal = (item.price + (item.doubleMeat ? doubleMeatPrice : 0)) * item.quantity;
      return (
        <li key={idx} className="flex justify-between border-b pb-2 w-full break-all">
          <span className="break-words">{item.name}{item.doubleMeat ? " + Double Meat" : ""} × {item.quantity}</span>
          <span>${lineTotal.toFixed(2)}</span>
        </li>
      );
    })}
  </ul>
  <div className="w-full text-right text-xl font-bold mb-6">
    Total: ${calculateTotal().toFixed(2)}
  </div>
  <div className="w-full">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 w-full">
      <input
        type="text"
        placeholder="Full Name"
        className="w-full p-3 border rounded
                   border-gray-300 bg-white text-gray-900 placeholder-gray-500
                   focus:outline-none focus:ring-2 focus:ring-yellow-500
                   dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400
                   dark:focus:ring-yellow-400"
        value={formData.name}
        onChange={e => setFormData({ ...formData, name: e.target.value })}
        required
      />
      <input
        type="email"
        placeholder="Email Address"
        className="w-full p-3 border rounded
                   border-gray-300 bg-white text-gray-900 placeholder-gray-500
                   focus:outline-none focus:ring-2 focus:ring-yellow-500
                   dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400
                   dark:focus:ring-yellow-400"
        value={formData.email}
        onChange={e => setFormData({ ...formData, email: e.target.value })}
        required
      />
      <input
        type="tel"
        placeholder="Phone Number"
        className="w-full p-3 border rounded
                   border-gray-300 bg-white text-gray-900 placeholder-gray-500
                   focus:outline-none focus:ring-2 focus:ring-yellow-500
                   dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400
                   dark:focus:ring-yellow-400"
        value={formData.phone}
        onChange={e => setFormData({ ...formData, phone: e.target.value })}
        required
      />
      <input
        type="text"
        placeholder="Delivery Address"
        className="w-full p-3 border rounded
                   border-gray-300 bg-white text-gray-900 placeholder-gray-500
                   focus:outline-none focus:ring-2 focus:ring-yellow-500
                   dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400
                   dark:focus:ring-yellow-400"
        value={formData.address}
        onChange={e => setFormData({ ...formData, address: e.target.value })}
        required
      />
    </div>
  </div>
  <textarea
    placeholder="Special Instructions — Allergies, Dietary Restrictions, Additional Requests. Leave blank if none"
    rows={3}
    className="w-full p-3 border rounded mb-6
               border-gray-300 bg-white text-gray-900 placeholder-gray-500
               focus:outline-none focus:ring-2 focus:ring-yellow-500
               dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400
               dark:focus:ring-yellow-400"
    value={formData.instructions}
    onChange={e => setFormData({ ...formData, instructions: e.target.value })}
  />
  <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mt-10">
    <button onClick={cancelConfirmation} className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded mb-2 sm:mb-0">
      Edit Order
    </button>
    <button
      onClick={confirmOrder}
      disabled={isSubmitting}
      className={`${
        isSubmitting ? "opacity-50 cursor-not-allowed " : ""
      }bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded`}
    >
      {isSubmitting ? "Submitting…" : "Confirm Order"}
    </button>
  </div>
</div>

              )}
            </div>
          )}
        </main>
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
    </>
  );
}

export default App;
