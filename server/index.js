import express from 'express';

const app = express();
const router = express.Router();

// Cache en memoria de 10 minutos
const cache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutos

export async function searchJumboCatalog(q) {
  const query = (q || '').trim() || 'leche';
  const cacheKey = query.toLowerCase();
  const cached = cache.get(cacheKey);

  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return {
      ...cached.data,
      cached: true,
    };
  }

  // Timeout explícito de 8 segundos
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch('https://www.jumbo.cl/api/catalog', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'AhorroPtoMontt/0.1 (+contacto: ibanezbenjamin6@gmail.com)',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        fullText: query,
        from: 0,
        to: 20,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Respuesta de jumbo.cl con status ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const fetchedAt = new Date().toISOString();

    const payload = {
      products: data.products || [],
      fetchedAt,
      query,
    };

    // Guardar en cache por 10 minutos
    cache.set(cacheKey, {
      data: payload,
      timestamp: Date.now(),
    });

    return payload;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      const err = new Error('Timeout al conectar con jumbo.cl (límite de 8s excedido)');
      err.status = 504;
      throw err;
    }
    throw error;
  }
}

router.get('/api/search', async (req, res) => {
  const q = req.query.q || '';
  try {
    const result = await searchJumboCatalog(q);
    res.json(result);
  } catch (error) {
    const status = error.status || 502;
    res.status(status).json({
      error: error.message || 'Error al obtener datos de jumbo.cl',
      products: [],
      fetchedAt: new Date().toISOString(),
    });
  }
});

app.use(express.json());
app.use(router);

export { router as apiRouter };
export default app;

// Si se ejecuta directamente con Node
if (process.argv[1] && process.argv[1].endsWith('server/index.js')) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend de AhorroPtoMontt escuchando en el puerto ${PORT}`);
  });
}
