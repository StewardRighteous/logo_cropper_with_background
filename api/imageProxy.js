/**
 * Vercel Serverless Function to act as a CORS proxy.
 *
 * It fetches an image from an external URL and returns it to the client
 * with the necessary 'Access-Control-Allow-Origin: *' header,
 * allowing the client-side canvas to use the image without security errors.
 */
export default async function handler(req, res) {
  const imageUrl = req.query.url;

  if (!imageUrl) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'Missing "url" query parameter.' }));
    return;
  }

  try {
    // 1. Fetch the image from the external source
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    // 2. Get the content type for the response header
    const contentType = response.headers.get("content-type");

    // 3. Set necessary CORS headers for the client-side application
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader("Content-Type", contentType || "application/octet-stream");

    // 4. Stream the image data back to the client
    response.body.pipe(res);
  } catch (error) {
    console.error("Proxy error:", error.message);
    res.statusCode = 500;
    res.end(
      JSON.stringify({ error: `Proxy failed to fetch image: ${error.message}` })
    );
  }
}
