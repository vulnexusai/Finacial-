export default async function handler(req, res) {
  const coins = "USD-BRL,EUR-BRL,BTC-BRL,ETH-BRL";
  const r = await fetch(`https://economia.awesomeapi.com.br/json/last/${coins}`);
  const data = await r.json();
  res.setHeader("Cache-Control", "s-maxage=60");
  res.json(data);
}
