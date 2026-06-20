"use client";

import { useState, useMemo } from "react";

interface LineItem {
  id: string;
  description: string;
  category: "bar" | "rental" | "service" | "other";
  quantity: number;
  unit_price: number;
}

const TAX_RATES = {
  rental: 0.07,  // 7% rental tax
  bar: 0.08,     // 8% bar tax
  service: 0,
  other: 0,
};

const BAR_GRATUITY_RATE = 0.15; // 15% bar gratuity
const CARD_FEE_RATE = 0.04;    // 4% card-fee passthrough (optional toggle)

export default function InvoicingHelperPage() {
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: "1", description: "", category: "service", quantity: 1, unit_price: 0 },
  ]);
  const [includeCardFee, setIncludeCardFee] = useState(false);
  const [includeBarGratuity, setIncludeBarGratuity] = useState(true);
  const [depositPercent, setDepositPercent] = useState(50);
  const [isFinalCount, setIsFinalCount] = useState(false);

  function addLineItem() {
    setLineItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        description: "",
        category: "service" as const,
        quantity: 1,
        unit_price: 0,
      },
    ]);
  }

  function updateLineItem(id: string, field: keyof LineItem, value: string | number) {
    setLineItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  }

  function removeLineItem(id: string) {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  }

  const calculations = useMemo(() => {
    let subtotal = 0;
    let rentalTax = 0;
    let barTax = 0;
    let barGratuity = 0;

    for (const item of lineItems) {
      const lineTotal = item.quantity * item.unit_price;
      subtotal += lineTotal;

      const taxRate = TAX_RATES[item.category] || 0;
      if (item.category === "rental") rentalTax += lineTotal * taxRate;
      if (item.category === "bar") {
        barTax += lineTotal * taxRate;
        if (includeBarGratuity) barGratuity += lineTotal * BAR_GRATUITY_RATE;
      }
    }

    const totalTax = rentalTax + barTax;
    const preCardTotal = subtotal + totalTax + barGratuity;
    const cardFee = includeCardFee ? preCardTotal * CARD_FEE_RATE : 0;
    const grandTotal = preCardTotal + cardFee;
    const depositAmount = grandTotal * (depositPercent / 100);
    const balanceDue = isFinalCount ? grandTotal : grandTotal - depositAmount;

    return {
      subtotal,
      rentalTax,
      barTax,
      barGratuity,
      totalTax,
      cardFee,
      grandTotal,
      depositAmount,
      balanceDue,
    };
  }, [lineItems, includeCardFee, includeBarGratuity, depositPercent, isFinalCount]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#D4AF37]">Invoicing Helper</h1>
        <p className="text-sm text-gray-400 mt-1">
          Build invoices with automatic tax + gratuity. 7% rental tax, 8% bar
          tax, 15% bar gratuity, optional 4% card-fee passthrough.
        </p>
      </div>

      {/* Line items */}
      <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-5">
        <h3 className="text-white font-semibold mb-3">Line Items</h3>
        <div className="space-y-3">
          {lineItems.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-12 gap-2 items-center"
            >
              <input
                className="col-span-4 px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded text-white text-sm"
                placeholder="Description"
                value={item.description}
                onChange={(e) =>
                  updateLineItem(item.id, "description", e.target.value)
                }
              />
              <select
                className="col-span-2 px-2 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded text-white text-sm"
                value={item.category}
                onChange={(e) =>
                  updateLineItem(item.id, "category", e.target.value)
                }
              >
                <option value="service">Service</option>
                <option value="bar">Bar</option>
                <option value="rental">Rental</option>
                <option value="other">Other</option>
              </select>
              <input
                type="number"
                className="col-span-2 px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded text-white text-sm text-right"
                placeholder="Qty"
                value={item.quantity}
                onChange={(e) =>
                  updateLineItem(item.id, "quantity", Number(e.target.value))
                }
              />
              <input
                type="number"
                className="col-span-2 px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded text-white text-sm text-right"
                placeholder="Price"
                step="0.01"
                value={item.unit_price}
                onChange={(e) =>
                  updateLineItem(item.id, "unit_price", Number(e.target.value))
                }
              />
              <div className="col-span-1 text-right text-gray-300 text-sm">
                ${(item.quantity * item.unit_price).toFixed(2)}
              </div>
              <button
                onClick={() => removeLineItem(item.id)}
                className="col-span-1 text-red-400 hover:text-red-300 text-sm"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addLineItem}
          className="mt-3 px-3 py-1.5 bg-[#3A3A3A] text-white rounded text-sm hover:bg-[#4A4A4A]"
        >
          + Add Line
        </button>
      </div>

      {/* Toggles */}
      <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-5 flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
          <input
            type="checkbox"
            checked={includeBarGratuity}
            onChange={() => setIncludeBarGratuity(!includeBarGratuity)}
            className="accent-[#D4AF37]"
          />
          Bar gratuity (15%)
        </label>
        <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
          <input
            type="checkbox"
            checked={includeCardFee}
            onChange={() => setIncludeCardFee(!includeCardFee)}
            className="accent-[#D4AF37]"
          />
          Card-fee passthrough (4%)
        </label>
        <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
          <input
            type="checkbox"
            checked={isFinalCount}
            onChange={() => setIsFinalCount(!isFinalCount)}
            className="accent-[#D4AF37]"
          />
          Final count invoice (full balance)
        </label>
        {!isFinalCount && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Deposit:</span>
            <input
              type="number"
              className="w-16 px-2 py-1 bg-[#1E1E1E] border border-[#3A3A3A] rounded text-white text-sm text-right"
              value={depositPercent}
              onChange={(e) => setDepositPercent(Number(e.target.value))}
              min={0}
              max={100}
            />
            <span className="text-sm text-gray-400">%</span>
          </div>
        )}
      </div>

      {/* Totals */}
      <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-5">
        <h3 className="text-white font-semibold mb-3">Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-300">
            <span>Subtotal</span>
            <span>${calculations.subtotal.toFixed(2)}</span>
          </div>
          {calculations.rentalTax > 0 && (
            <div className="flex justify-between text-gray-300">
              <span>Rental tax (7%)</span>
              <span>${calculations.rentalTax.toFixed(2)}</span>
            </div>
          )}
          {calculations.barTax > 0 && (
            <div className="flex justify-between text-gray-300">
              <span>Bar tax (8%)</span>
              <span>${calculations.barTax.toFixed(2)}</span>
            </div>
          )}
          {calculations.barGratuity > 0 && (
            <div className="flex justify-between text-gray-300">
              <span>Bar gratuity (15%)</span>
              <span>${calculations.barGratuity.toFixed(2)}</span>
            </div>
          )}
          {calculations.cardFee > 0 && (
            <div className="flex justify-between text-gray-300">
              <span>Card-fee passthrough (4%)</span>
              <span>${calculations.cardFee.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-white font-semibold border-t border-[#3A3A3A] pt-2">
            <span>Grand Total</span>
            <span className="text-[#D4AF37]">
              ${calculations.grandTotal.toFixed(2)}
            </span>
          </div>
          {!isFinalCount && (
            <>
              <div className="flex justify-between text-gray-300">
                <span>Deposit ({depositPercent}%)</span>
                <span>${calculations.depositAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-white font-semibold">
                <span>Balance Due</span>
                <span>${calculations.balanceDue.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
        <div className="mt-4 pt-4 border-t border-[#3A3A3A] flex gap-3">
          <button className="px-4 py-2 bg-[#D4AF37] text-black rounded-lg font-medium hover:bg-[#C4A030] text-sm">
            Create Invoice
          </button>
          <button className="px-4 py-2 bg-[#3A3A3A] text-white rounded-lg text-sm hover:bg-[#4A4A4A]">
            Save as Draft
          </button>
        </div>
      </div>
    </div>
  );
}
