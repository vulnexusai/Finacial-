export default async function handler(req, res) {
  try {
    const { serie } = req.query;

    if (!serie) {
      return res.status(400).json({ error: "Parâmetro serie obrigatório" });
    }

    const r = await fetch(
      `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${serie}/dados/ultimos/1?formato=json`
    );

    if (!r.ok) {
      return res.status(502).json({ error: "Falha ao buscar dados BCB" });
    }

    const data = await r.json();
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=300");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(data);
  } catch (e) {
    console.error("Erro bcb:", e);
    res.status(500).json({ error: "Erro interno" });
  }
}
