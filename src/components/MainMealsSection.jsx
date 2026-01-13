import { useMemo, useState } from "react";

export default function MainMealsSection({
  items,
  quantities,
  setQuantities,
  doubleMeatPrice,
}) {
  const [openInfo, setOpenInfo] = useState(() => new Set());

  const updateQuantity = (index, type, delta) => {
    setQuantities((prev) => {
      const updated = [...prev];
      const current = updated[index][type];
      updated[index] = {
        ...updated[index],
        [type]: Math.max(0, current + delta),
      };
      return updated;
    });
  };

  const toggleInfo = (key) => {
    setOpenInfo((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const fallbackImage = "https://via.placeholder.com/300x200.png?text=No+Image";

  const parseMoreInfoLines = (text) => {
    const raw = String(text || "");
    return raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => l.replace(/^[-•\u2022]\s*/, "")); // strip bullet prefix if user typed it
  };

  const safeItems = useMemo(() => items || [], [items]);
  if (!safeItems.length) return null;

  return (
    <section className="py-10 px-4 sm:px-6 bg-white text-gray-800">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">🍛 Main Meals</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {safeItems.map((item, index) => {
            // Use a stable key if possible (name + index fallback)
            const infoKey = `${item.name || "item"}-${index}`;
            const isOpen = openInfo.has(infoKey);
            const moreInfoLines = parseMoreInfoLines(item.moreInfo);

            return (
              <div
                key={infoKey}
                className="bg-orange-100 p-5 rounded-xl shadow-sm flex flex-col justify-between"
              >
                <img
                  src={item.imageURL || fallbackImage}
                  alt={item.name}
                  className="w-full h-auto object-contain rounded mb-4"
                />

                <div>
                  <h3 className="text-xl font-semibold mb-1">{item.name}</h3>

                  {/* NEW: short description */}
                  {item.description ? (
                    <p className="text-sm text-gray-700 mb-2">{item.description}</p>
                  ) : null}

                  <p className="text-lg font-bold mb-2">${item.price}</p>

                  {item.allowDoubleMeat && (
                    <>
                      <p className="text-sm text-gray-700 mb-1">
                        Double Meat available (+${doubleMeatPrice})
                      </p>
                      {item.extraProtein ? (
                        <p className="text-sm text-gray-700 mb-2">
                          Adds {item.extraProtein}g of Protein
                        </p>
                      ) : null}
                    </>
                  )}

                  {/* Nutrition Label */}
                  <div className="bg-white border border-black text-black text-sm p-3 mt-2">
                    <p className="text-base font-bold border-b border-black pb-1 mb-1">
                      Nutrition Facts
                    </p>
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

                  {/* NEW: More Info toggle + expandable area (multi-open supported) */}
                  {moreInfoLines.length > 0 && (
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => toggleInfo(infoKey)}
                        className="text-sm font-semibold text-orange-700 underline underline-offset-4 hover:text-orange-800"
                      >
                        {isOpen ? "Hide Info" : "More Info"}
                      </button>

                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          isOpen ? "max-h-96 mt-2 opacity-100" : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="bg-white rounded-lg p-3 text-left shadow">
                          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-800">
                            {moreInfoLines.map((line, i) => (
                              <li key={i}>{line}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quantity controls */}
                <div className="space-y-4 mt-auto">
                  <div className="flex items-center justify-between mt-4">
                    <span className="font-medium">Regular</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(index, "regular", -1)}
                        className="w-8 h-8 bg-orange-400 text-white rounded-full"
                      >
                        −
                      </button>
                      <span className="text-lg font-semibold">
                        {quantities[index]?.regular || 0}
                      </span>
                      <button
                        onClick={() => updateQuantity(index, "regular", 1)}
                        className="w-8 h-8 bg-orange-600 text-white rounded-full"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {item.allowDoubleMeat && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Double Meat</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(index, "double", -1)}
                          className="w-8 h-8 bg-orange-400 text-white rounded-full"
                        >
                          −
                        </button>
                        <span className="text-lg font-semibold">
                          {quantities[index]?.double || 0}
                        </span>
                        <button
                          onClick={() => updateQuantity(index, "double", 1)}
                          className="w-8 h-8 bg-orange-600 text-white rounded-full"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}