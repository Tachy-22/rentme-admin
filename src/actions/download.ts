"use server";

export async function downloadSermon(audioUrl: string): Promise<string | null> {
  try {
    const response = await fetch(audioUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    console.log("Content type:", contentType);
    if (
      !contentType?.includes("audio/") &&
      !contentType?.includes("application/octet-stream")
    ) {
      console.warn("Warning: Unexpected content type:", contentType);
    }
    console.log("Response headers:", response.headers);
    // Add size check
    const contentLength = response.headers.get("content-length");
    console.log("Content length:", contentLength);

    if (!response.body) {
      throw new Error("Response body is null");
    }

    let buffer: ArrayBuffer;
   // console.log(buffer)
    try {
      buffer = await response.arrayBuffer();
      console.log("Buffer size:", buffer.byteLength);
    } catch (bufferError) {
      console.error("ArrayBuffer conversion failed:", bufferError);
      throw new Error("Failed to convert response to ArrayBuffer");
    }

    if (!buffer || buffer.byteLength === 0) {
      throw new Error("Received empty response");
    }
    console.log("Buffer size:", buffer.byteLength);
    const base64 = Buffer.from(buffer).toString("base64");
    console.log("Base64 ", base64);
    return base64;
  } catch (error) {
    console.error(
      "Download failed:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return null;
  }
}
