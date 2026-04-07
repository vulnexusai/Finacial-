export default async function handler(req, res) {
  const { serie } = req.query;
  const r = await fetch(
    `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${serie}/dados/ultimos/1?formato=json`
  );
  const data = await r.json();
  res.setHeader("Cache-Control", "s-maxage=3600");
  res.json(data);
}
