// api/groq.js — VERSÃO 3 (DEBUG: Captura de erro detalhada e Fallback Robusto)
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ 
      error: "Chave da API não configurada", 
      message: "Por favor, adicione a variável GROQ_API_KEY nas configurações da Vercel (sem o prefixo VITE_)." 
    });
  }

  try {
    // Tentar com o modelo mais estável e gratuito do Groq no momento
    const model = "llama-3.1-8b-instant"; 
    
    const body = {
      ...req.body,
      model: model,
    };

    console.log("Iniciando chamada ao Groq com modelo:", model);

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
      // Logar o erro exato retornado pelo Groq para depuração na Vercel
      console.error("Erro retornado pela API do Groq:", JSON.stringify(data));
      
      // Se for erro de modelo inexistente ou limite de quota, informar o usuário
      const errorMsg = data.error?.message || "Erro na API do Groq";
      return res.status(upstream.status).json({ 
        error: "Falha na IA", 
        message: `O Groq respondeu: ${errorMsg}` 
      });
    }

    res.status(200).json(data);
  } catch (e) {
    console.error("Erro crítico no handler do Groq:", e.message);
    res.status(500).json({ 
      error: "Erro interno no servidor", 
      message: "Não foi possível conectar ao servidor da IA. Verifique sua conexão." 
    });
  }
}
