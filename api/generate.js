// Vercel serverless function: keeps OPENAI_API_KEY on the server.
// Configure OPENAI_API_KEY in Vercel Project Settings > Environment Variables.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "AI image generation is not configured. Add OPENAI_API_KEY to your Vercel environment variables."
      });
    }

    const { prompt, size = "1024x1024", quality = "high" } = req.body || {};
    if (typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({ error: "Please provide an image description." });
    }
    if (prompt.length > 4000) {
      return res.status(400).json({ error: "Please keep the image description under 4,000 characters." });
    }

    const allowedSizes = new Set(["1024x1024", "1024x1536", "1536x1024"]);
    const safeSize = allowedSizes.has(size) ? size : "1024x1024";
    const safeQuality = quality === "medium" ? "medium" : "high";

    const imagePrompt = [
      "Create a polished, premium social-media poster BACKGROUND image.",
      "Visual brief: " + prompt.trim(),
      "Important: do not render any words, letters, numbers, logos, watermarks, signatures, or typography.",
      "Keep the main central area visually calm and readable so editable greeting text can be overlaid later.",
      "Use professional composition, balanced lighting, rich details, and edge-to-edge artwork."
    ].join("\n");

    const upstream = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-image-2.5-flare",
        prompt: imagePrompt,
        size: safeSize,
        quality: safeQuality,
        output_format: "png",
        n: 1
      })
    });

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      const message = data?.error?.message || "The image provider could not complete the request.";
      return res.status(upstream.status >= 400 && upstream.status < 600 ? upstream.status : 502)
        .json({ error: message });
    }

    const base64 = data?.data?.[0]?.b64_json;
    if (!base64) {
      return res.status(502).json({ error: "The image provider returned an empty image." });
    }

    return res.status(200).json({ image: `data:image/png;base64,${base64}` });
  } catch (error) {
    console.error("Poster image generation error:", error);
    return res.status(500).json({ error: "Unexpected server error while generating the image." });
  }
}
