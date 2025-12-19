import type { GameRecording } from "@clockwork-engine/core"
import { compressString, decompressString } from "lzma1"
import { DEFAULT_COMPRESSION_QUALITY } from "./constants"
import {
  type AnyRecording,
  COMPRESSED_RECORDING,
  type CompressedRecording,
  type CompressionOptions,
  type CompressionResult,
  type DecompressionResult,
  RecordingCompressionError,
  RecordingDecompressionError,
} from "./types"
import {
  base64ToUint8Array,
  hasValidLzmaHeader,
  isCompressedRecording,
  isGameRecording,
  isValidBase64,
  uint8ArrayToBase64,
} from "./utils"

export async function compressRecording(
  recording: GameRecording,
  options: CompressionOptions = {},
): Promise<CompressionResult> {
  const { quality = DEFAULT_COMPRESSION_QUALITY } = options
  const clampedQuality = Math.max(1, Math.min(9, quality)) as
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9

  if (!isGameRecording(recording)) {
    throw new RecordingCompressionError(
      "Invalid recording: missing required fields",
    )
  }

  const startTime = performance.now()

  try {
    const jsonString = JSON.stringify(recording)
    const originalSize = new TextEncoder().encode(jsonString).length
    const compressedData = compressString(jsonString, clampedQuality)
    const base64Data = uint8ArrayToBase64(compressedData)

    const compressed: CompressedRecording = {
      dataType: COMPRESSED_RECORDING.DATA_TYPE,
      compression: COMPRESSED_RECORDING.COMPRESSION,
      version: COMPRESSED_RECORDING.VERSION,
      data: base64Data,
    }

    const compressionTimeMs = performance.now() - startTime
    const compressedSize = base64Data.length

    return {
      compressed,
      metrics: {
        originalSize,
        compressedSize,
        compressionRatio: originalSize / compressedSize,
        compressionTimeMs,
      },
    }
  } catch (error) {
    throw new RecordingCompressionError("Failed to compress recording", error)
  }
}

export async function decompressRecording(
  recording: AnyRecording,
): Promise<DecompressionResult> {
  const startTime = performance.now()

  if (!isCompressedRecording(recording)) {
    if (!isGameRecording(recording)) {
      throw new RecordingDecompressionError("Invalid recording format")
    }

    const jsonString = JSON.stringify(recording)
    const size = new TextEncoder().encode(jsonString).length

    return {
      recording,
      metrics: {
        compressedSize: size,
        decompressedSize: size,
        decompressionTimeMs: performance.now() - startTime,
        wasCompressed: false,
      },
    }
  }

  try {
    if (!isValidBase64(recording.data)) {
      throw new RecordingDecompressionError("Invalid base64 encoding")
    }
    const compressedData = base64ToUint8Array(recording.data)
    if (!hasValidLzmaHeader(compressedData)) {
      throw new RecordingDecompressionError("Invalid LZMA header")
    }
    const compressedSize = recording.data.length
    const jsonString = decompressString(compressedData)
    const decompressedSize = new TextEncoder().encode(jsonString).length
    const parsed = JSON.parse(jsonString)

    if (!isGameRecording(parsed)) {
      throw new RecordingDecompressionError(
        "Decompressed data is not a valid recording",
      )
    }

    return {
      recording: parsed,
      metrics: {
        compressedSize,
        decompressedSize,
        decompressionTimeMs: performance.now() - startTime,
        wasCompressed: true,
      },
    }
  } catch (error) {
    if (error instanceof RecordingDecompressionError) {
      throw error
    }
    throw new RecordingDecompressionError(
      "Failed to decompress recording",
      error,
    )
  }
}

export function isCompressed(recording: AnyRecording): boolean {
  return isCompressedRecording(recording)
}

export async function compress(
  recording: GameRecording,
  options?: CompressionOptions,
): Promise<CompressedRecording> {
  const result = await compressRecording(recording, options)
  return result.compressed
}

export async function decompress(
  recording: AnyRecording,
): Promise<GameRecording> {
  const result = await decompressRecording(recording)
  return result.recording
}
