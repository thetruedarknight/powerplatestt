export default function BreakfastItemsSection({ items, quantities, setQuantities }) {
  const fallbackImage = "https://via.placeholder.com/300x200.png?text=No+Image";

  const updateQuantity = (index, delta) => {
    const updated = [...quantities];
    updated[index] = Math.max(0, updated[index] + delta);
    setQuantities(updated);
  };

  return (
    <section className="py-10 px-4 sm:px-6 bg-white text-gray-800">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">🥣 Breakfast Items</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item, index) => (
            <div key={index} className="bg-yellow-100 p-5 rounded-xl shadow-sm flex flex-col justify-between">
              <img
                src={item.imageURL || fallbackImage}
                alt={item.name}
                className="w-full h-auto object-contain rounded mb-4"
              />
              <div>
                <h3 className="text-xl font-semibold mb-1">{item.name}</h3>
                <p className="text-lg font-bold mb-2">${item.price}</p>
                <div className="bg-white border border-black text-black text-sm p-3 mt-2">
  <p className="text-base font-bold border-b border-black pb-1 mb-1">Nutrition Facts</p>
  <div className="flex justify-between">
    <span>Calories</span>
    <span>{item.calories || "--"} kcal</span>
  </div>
  <div className="flex justify-between">
    <span>Protein</span>
    <span>{item.protein || "--"} g</span>
  </div>
  <div className="flex justify-between">
    <span>Carbs</span>
    <span>{item.carbs || "--"} g</span>
  </div>
  <div className="flex justify-between">
    <span>Fats</span>
    <span>{item.fats || "--"} g</span>
  </div>
</div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => updateQuantity(index, -1)}
                  className="w-8 h-8 bg-yellow-400 text-white rounded-full"
                >
                  −
                </button>
                <span className="text-lg font-semibold">{quantities[index]}</span>
                <button
                  onClick={() => updateQuantity(index, 1)}
                  className="w-8 h-8 bg-yellow-600 text-white rounded-full"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
