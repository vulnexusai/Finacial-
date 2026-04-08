// api/groq.js — VERSÃO 2 (ESTABILIDADE: Modelo estável e Verificação de Chave)
export default async function handler(req, res) {
  // Configurações de CORS para permitir chamadas do frontend
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  // 1. Verificar se a chave da API está configurada no Backend (Vercel)
  // Nota: A variável deve se chamar GROQ_API_KEY (sem o prefixo VITE_)
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.error("ERRO: GROQ_API_KEY não encontrada nas variáveis de ambiente.");
    return res.status(500).json({ 
      error: "Chave da API não configurada", 
      message: "Por favor, adicione a variável GROQ_API_KEY nas configurações da Vercel." 
    });
  }

  try {
    // 2. Preparar o corpo da requisição
    // Garantir que estamos usando um modelo estável e gratuito
    const body = {
      ...req.body,
      model: "llama3-8b-8192", // Modelo rápido e estável para o plano gratuito
    };

    const upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      console.error("Erro na API do Groq:", data);
      return res.status(upstream.status).json(data);
    }

    res.status(200).json(data);
  } catch (e) {
    console.error("Erro crítico no handler do Groq:", e.message);
    res.status(500).json({ error: "Erro interno no servidor", detail: e.message });
  }
}
