import { useEffect, useState } from "react";
import LandingPage from "./components/LandingPage";
import BreakfastItemsSection from "./components/BreakfastItemsSection";
import ProteinSnacksSection from "./components/ProteinSnacksSection";
import MainMealsSection from "./components/MainMealsSection";
import SaladsSection from "./components/SaladsSection";

const WEEKDAYS = [
  "Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"
];

/** Returns the next occurrence of `weekdayName` on or after `from` (at midnight). */
function getNextWeekday(weekdayName, from = new Date()) {
  const idx = WEEKDAYS.indexOf(weekdayName);
  const d = new Date(from);
  d.setHours(0,0,0,0);
  const shift = (idx - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + shift);
  return d;
}

/** Returns the last occurrence of `weekdayName` on or before `from` (at midnight). */
function getPrevWeekday(weekdayName, from = new Date()) {
  const idx = WEEKDAYS.indexOf(weekdayName);
  const d = new Date(from);
  d.setHours(0,0,0,0);
  const back = (d.getDay() - idx + 7) % 7;
  d.setDate(d.getDate() - back);
  return d;
}

/** Given deliveryDays = [A,B] and cutoffDays = [C,D], picks the correct next date. */
function calculateNextDelivery(deliveryDays, cutoffDays) {
  const now = new Date();
  const [dayA, dayB] = deliveryDays;
  const [dayC, dayD] = cutoffDays;

  // 1) Try A
  const nextA = getNextWeekday(dayA, now);
  const cutoffC = getPrevWeekday(dayC, nextA);
  cutoffC.setHours(23,59,59,999);
  if (now <= cutoffC) return nextA;

  // 2) Try B
  const nextB = getNextWeekday(dayB, now);
  const cutoffD = getPrevWeekday(dayD, nextB);
  cutoffD.setHours(23,59,59,999);
  if (now <= cutoffD) return nextB;

  // 3) Fallback → A + 1 week
  const fallback = new Date(nextA);
  fallback.setDate(fallback.getDate() + 7);
  return fallback;
}

function App() {
  const [showLanding, setShowLanding]           = useState(true);
  const [menuData, setMenuData]                 = useState([]);
  const [doubleMeatPrice, setDoubleMeatPrice]   = useState(20);
  const [deliveryDays, setDeliveryDays]         = useState(["Tuesday","Friday"]);
  const [cutoffDays, setCutoffDays]             = useState(["Friday","Wednesday"]);
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [orderNumber, setOrderNumber]           = useState(null);
  const [isSubmitting, setIsSubmitting]         = useState(false);

  const [breakfastQty, setBreakfastQty] = useState([]);
  const [snackQty, setSnackQty]         = useState([]);
  const [mealQty, setMealQty]           = useState([]);
  const [saladQty, setSaladQty]         = useState([]);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess]           = useState(false);
  const [fullOrder, setFullOrder]               = useState([]);

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", address: "", instructions: ""
  });

  // FETCH & PARSE
  useEffect(() => {
    fetch("/api/sheets")
      .then(r => r.json())
      .then(({ menu, config }) => {
        const parsed = (menu || [])
          .filter(i => String(i.display).toUpperCase() === "TRUE")
          .map(i => ({
            ...i,
            price:          parseFloat(i.price),
            allowDoubleMeat:String(i.allowDoubleMeat).toUpperCase()==="TRUE",
            imageURL:       i.imageURL,
            calories:       i.calories,
            protein:        i.protein,
            carbs:          i.carbs,
            fats:           i.fats,
            extraProtein:   i.extraProtein,
          }));

        setMenuData(parsed);
        setBreakfastQty(parsed.filter(x=>x.category==="Breakfast Items").map(()=>0));
        setSnackQty    (parsed.filter(x=>x.category==="Protein Snacks").map(()=>0));
        setMealQty     (parsed.filter(x=>x.category==="Main Meals").map(()=>({regular:0,double:0})));
        setSaladQty    (parsed.filter(x=>x.category==="Salads").map(()=>({regular:0,double:0})));

        if (config.doubleMeatPrice) setDoubleMeatPrice(parseFloat(config.doubleMeatPrice));
        if (config.deliveryDays)   setDeliveryDays(config.deliveryDays.split(","));
        if (config.cutoffDays)     setCutoffDays(config.cutoffDays.split(","));
      })
      .catch(console.error);
  }, []);

  // BUILD / TOTAL
  const buildOrder = () => {
    const by = c => menuData.filter(m=>m.category===c);
    const simple = (items,qty)=> items.map((it,i)=>({...it,quantity:qty[i]})).filter(x=>x.quantity>0);
    const dual   = (items,qty)=> items.flatMap((it,i)=>{
      const {regular,double} = qty[i], rows=[];
      if (regular>0) rows.push({...it,quantity:regular,doubleMeat:false});
      if (it.allowDoubleMeat && double>0) rows.push({...it,quantity:double,doubleMeat:true});
      return rows;
    });
    return [
      ...simple(by("Breakfast Items"), breakfastQty),
      ...simple(by("Protein Snacks"), snackQty),
      ...dual  (by("Main Meals"),     mealQty),
      ...dual  (by("Salads"),          saladQty),
    ];
  };
  const calculateTotal = () =>
    fullOrder.reduce((sum,it)=>
      sum + (it.price + (it.doubleMeat?doubleMeatPrice:0))*it.quantity
    ,0);

  // STEP 1: SELECT ITEMS
  const handleSubmit = () => {
    const ord = buildOrder();
    if (ord.reduce((a,i)=>a+i.quantity,0) < 5) {
      alert("Please select at least 5 items to place an order.");
      return;
    }
    setFullOrder(ord);
    setShowConfirmation(true);
  };

  // STEP 2: CONFIRM & POST
  const confirmOrder = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const { name,email,phone,address,instructions } = formData;
    if (!name||!email||!phone||!address) {
      alert("Please fill out all required customer info.");
      setIsSubmitting(false);
      return;
    }

    const timestamp = new Date().toLocaleString("en-US", {
      timeZone:"America/Port_of_Spain",
      hour:"2-digit",minute:"2-digit",hour12:true,
      month:"2-digit",day:"2-digit",year:"numeric"
    });
    const items = fullOrder
      .map(i=>`${i.name}${i.doubleMeat?" + Double Meat":""} x${i.quantity}`)
      .join("; ");

    try {
      const res = await fetch("/api/orders", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ timestamp,name,email,phone,address,instructions,items,total:calculateTotal().toFixed(2) })
      });
      const { success,ordernumber } = await res.json();
      if (!success) throw new Error("Server rejected the order");
      setOrderNumber(ordernumber);

      const deliveryDate = calculateNextDelivery(deliveryDays,cutoffDays);
      setExpectedDelivery(
        deliveryDate.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})
      );

      setShowConfirmation(false);
      setShowSuccess(true);
    } catch(err) {
      console.error(err);
      alert("There was an error submitting your order.");
      setIsSubmitting(false);
    }
  };

  // STEP 3: BACK / EDIT
  const cancelConfirmation = () => setShowConfirmation(false);
  const getByCategory    = cat => menuData.filter(x=>x.category===cat);

  // ==== RENDER ====

  // 0) Landing
  if (showLanding) {
    return <LandingPage onStart={()=>setShowLanding(false)} />;
  }

  // 1) Success
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-yellow-50 text-gray-800">
        <header className="h-72 bg-cover bg-center"
          style={{backgroundImage:"url('https://i.imgur.com/alZ1n3Z.png')"}}
        />
        <main className="py-10 px-4">
          <div className="max-w-2xl mx-auto text-center bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-4xl font-bold text-green-700 mb-4">✅ Order Confirmed!</h2>
            <p className="text-lg mb-2">Thanks for ordering <strong>PowerPlates</strong>.</p>
            <p className="text-lg mb-2">
              Order #<span className="font-semibold">{orderNumber}</span>
            </p>
            <p className="text-lg mb-2">
              Expected delivery: <span className="font-semibold">{expectedDelivery}</span>
            </p>
            <button
              onClick={()=>window.location.reload()}
              className="mt-6 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded"
            >
              Place Another Order
            </button>
          </div>
        </main>
      </div>
    );
  }

  // 2) Confirm
  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-yellow-50 text-gray-800">
        <header className="h-72 bg-cover bg-center"
          style={{backgroundImage:"url('https://i.imgur.com/alZ1n3Z.png')"}}
        />
        <main className="py-10 px-4">
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6 text-left">
            <h2 className="text-3xl font-bold mb-6 text-center">🧾 Confirm Your Order</h2>
            <ul className="space-y-3 mb-4">
              {fullOrder.map((it,idx)=>{
                const lineTotal = (it.price + (it.doubleMeat?doubleMeatPrice:0))*it.quantity;
                return (
                  <li key={idx}
                    className="flex justify-between items-center flex-wrap border-b pb-2"
                  >
                    <span className="flex-1 break-words">
                      {it.name}{it.doubleMeat?" + Double Meat":""} × {it.quantity}
                    </span>
                    <span className="whitespace-nowrap ml-4">
                      ${lineTotal.toFixed(2)}
                    </span>
                  </li>
                );
              })}
            </ul>

            <div className="text-right text-xl font-bold mb-6">
              Total: ${calculateTotal().toFixed(2)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* input fields unchanged, omitted for brevity */}
            </div>

            <div className="flex justify-center gap-6 mt-10">
              <button
                onClick={cancelConfirmation}
                className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded"
              >
                Edit Order
              </button>
              <button
                onClick={confirmOrder}
                disabled={isSubmitting}
                className={`${
                  isSubmitting?"opacity-50 cursor-not-allowed ":""
                }bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded`}
              >
                {isSubmitting?"Submitting…":"Confirm Order"}
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 3) Menu / Order Form
  return (
    <div className="min-h-screen bg-yellow-50 text-gray-800">
      <header className="h-72 bg-cover bg-center"
        style={{backgroundImage:"url('https://i.imgur.com/alZ1n3Z.png')"}}
      />
      <main className="text-center py-10">
        <BreakfastItemsSection 
          items={getByCategory("Breakfast Items")}
          quantities={breakfastQty} setQuantities={setBreakfastQty}
        />
        <ProteinSnacksSection 
          items={getByCategory("Protein Snacks")}
          quantities={snackQty} setQuantities={setSnackQty}
        />
        <MainMealsSection 
          items={getByCategory("Main Meals")}
          quantities={mealQty} setQuantities={setMealQty}
          doubleMeatPrice={doubleMeatPrice}
        />
        <SaladsSection 
          items={getByCategory("Salads")}
          quantities={saladQty} setQuantities={setSaladQty}
          doubleMeatPrice={doubleMeatPrice}
        />

        <button
          onClick={handleSubmit}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded text-lg mt-10"
        >
          Submit Full Order
        </button>

        <button
          onClick={()=>setShowLanding(true)}
          className="ml-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded text-lg mt-10"
        >
          ← Back to Home
        </button>
      </main>

      <a
        href="https://wa.me/18683692226?text=Hi%20I'm%20interested%20in%20PowerPlates!"
        target="_blank" rel="noopener noreferrer"
        className="fixed bottom-4 right-4 z-50 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
      >
        {/* WhatsApp icon SVG */}
        Chat with us
      </a>
    </div>
  );
}

export default App;
