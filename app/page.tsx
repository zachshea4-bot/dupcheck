"use client"

export default function Home() {
  const plans = [
    { name: "Starter", price: "$99", priceId: "price_1UFxtYEt7GNHNMTXpVru32HF" },
    { name: "Professional", price: "$249", priceId: "price_1UFxx6Et7GNHNMTXHb0KZgO6" },
    { name: "Firm", price: "$499", priceId: "price_1UFxxpEt7GNHNMTXDXhf6NGL" },
  ]

  const handleUpgrade = async (priceId: string) => {
    const res = await fetch("/api/create-checkout", {
      method: "POST",
      body: JSON.stringify({ priceId }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold mb-12">DupCheck Pricing</h1>
      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div key={plan.name} className="border border-orange-500 p-8 rounded">
            <h2 className="text-2xl font-bold mb-4">{plan.name}</h2>
            <p className="text-3xl font-bold mb-6">{plan.price}/mo</p>
            <button
              onClick={() => handleUpgrade(plan.priceId)}
              className="w-full bg-orange-500 text-black font-bold py-2 rounded"
            >
              Upgrade
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
