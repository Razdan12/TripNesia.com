declare const process: {
  env: Record<string, string | undefined>;
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.FAL_API_KEY || process.env.VITE_FAL_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'FAL_API_KEY not configured on server' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const payload = await req.json();
    const res = await fetch('https://fal.run/fal-ai/any-llm', {
      method: 'POST',
      headers: {
        Authorization: `Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.text();
    return new Response(data, {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export const config = {
  runtime: 'edge',
};
