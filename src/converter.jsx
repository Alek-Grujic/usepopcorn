import { useEffect, useState } from "react";

export default function App() {
  const [error, setError] = useState("");
  const [amount, setAmount] = useState(0);
  const [from, setFrom] = useState("EUR");
  const [to, setTo] = useState("USD");
  const [convert, setConvert] = useState(1);

  useEffect(
    function () {
      const controller = new AbortController();

      async function converter() {
        try {
          if (!amount) {
            setConvert(0);
            return;
          }

          if (from === to) {
            setConvert(amount);
            return;
          }

          const res = await fetch(
            `https://api.frankfurter.dev/v1/latest?base=${from}&symbols=${to}&amount=${amount}`,
            {
              signal: controller.signal,
            },
          );

          if (!res.ok)
            throw new Error(
              "Something went wrong - Failed to fetch exchange rate.",
            );

          const data = await res.json();
          console.log(data);

          // if (data.Response === "False") throw new Error("Movie not found");

          setConvert(data.rates[to]);
          setError("");
        } catch (err) {
          if (err.name !== "AbortError") {
            setError(err.message);
          }
        }
      }

      converter();

      return function () {
        controller.abort();
      };
    },
    [amount, from, to],
  );

  return (
    <div className="conv">
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />
      <select value={from} onChange={(e) => setFrom(e.target.value)}>
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
        <option value="CAD">CAD</option>
        <option value="INR">INR</option>
      </select>
      <select value={to} onChange={(e) => setTo(e.target.value)}>
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
        <option value="CAD">CAD</option>
        <option value="INR">INR</option>
      </select>
      {error ? (
        <p>{error}</p>
      ) : (
        <p>
          {convert.toFixed(2)} {to}
        </p>
      )}
    </div>
  );
}
