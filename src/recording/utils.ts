import type { GameRecording } from "@clockwork-engine/core"
import {
  type AnyRecording,
  COMPRESSED_RECORDING,
  type CompressedRecording,
} from "./types"

export function isCompressedRecording(
  recording: AnyRecording,
): recording is CompressedRecording {
  return (
    typeof recording === "object" &&
    recording !== null &&
    "dataType" in recording &&
    recording.dataType === COMPRESSED_RECORDING.DATA_TYPE &&
    "compression" in recording &&
    recording.compression === COMPRESSED_RECORDING.COMPRESSION &&
    "version" in recording &&
    typeof recording.version === "number" &&
    "data" in recording &&
    typeof recording.data === "string"
  )
}

export function isGameRecording(
  recording: unknown,
): recording is GameRecording {
  return (
    typeof recording === "object" &&
    recording !== null &&
    "gameConfig" in recording &&
    "events" in recording &&
    Array.isArray((recording as GameRecording).events) &&
    "deltaTicks" in recording &&
    Array.isArray((recording as GameRecording).deltaTicks) &&
    "totalTicks" in recording &&
    typeof (recording as GameRecording).totalTicks === "number"
  )
}

export function uint8ArrayToBase64(data: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(data).toString("base64")
  }
  const binaryString = Array.from(data, (byte) =>
    String.fromCharCode(byte),
  ).join("")
  return btoa(binaryString)
}

export function base64ToUint8Array(base64: string): Uint8Array {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(base64, "base64"))
  }
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}

export function isValidBase64(str: string): boolean {
  if (str.length === 0 || str.length % 4 !== 0) return false
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
  return base64Regex.test(str)
}

export function hasValidLzmaHeader(data: Uint8Array): boolean {
  if (data.length < 13) return false
  const props = data[0]
  return props <= 224
}
