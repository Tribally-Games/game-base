/**
 * Decode a base64 data URI to an ArrayBuffer.
 *
 * @param dataUri - Data URI string (e.g., "data:audio/opus;base64,...")
 * @returns ArrayBuffer containing the decoded binary data
 */
export function dataUriToArrayBuffer(dataUri: string): ArrayBuffer {
  // Extract the base64 portion after the comma
  const base64Data = dataUri.split(",")[1]
  if (!base64Data) {
    throw new Error("Invalid data URI format")
  }

  // Decode base64 to binary string
  const binaryString = atob(base64Data)

  // Convert binary string to ArrayBuffer
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  return bytes.buffer
}
