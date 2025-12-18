import type { GameRecording } from "@clockwork-engine/core"
import brotli from "brotli"
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
  isCompressedRecording,
  isGameRecording,
  uint8ArrayToBase64,
} from "./utils"

export async function compressRecording(
  recording: GameRecording,
  options: CompressionOptions = {},
): Promise<CompressionResult> {
  const { quality = DEFAULT_COMPRESSION_QUALITY } = options

  if (!isGameRecording(recording)) {
    throw new RecordingCompressionError(
      "Invalid recording: missing required fields",
    )
  }

  const startTime = performance.now()

  try {
    const jsonString = JSON.stringify(recording)
    const originalSize = new TextEncoder().encode(jsonString).length
    const inputData = Buffer.from(jsonString, "utf-8")
    const paddedInput =
      inputData.length < 75
        ? Buffer.concat([inputData, Buffer.alloc(75 - inputData.length)])
        : inputData
    const compressedResult = brotli.compress(paddedInput, {
      mode: 1,
      quality: quality as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11,
    })
    if (!compressedResult) {
      throw new Error("Compression returned null")
    }
    const sizeHeader = Buffer.alloc(4)
    sizeHeader.writeUInt32BE(originalSize, 0)
    const compressedData = new Uint8Array(
      Buffer.concat([sizeHeader, Buffer.from(compressedResult)]),
    )
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
    const fullData = base64ToUint8Array(recording.data)
    const compressedSize = recording.data.length
    const originalSize = Buffer.from(fullData.slice(0, 4)).readUInt32BE(0)
    const compressedData = fullData.slice(4)
    const decompressedResult = brotli.decompress(Buffer.from(compressedData))
    if (!decompressedResult) {
      throw new Error("Decompression returned null")
    }
    const decompressedData = new Uint8Array(decompressedResult).slice(
      0,
      originalSize,
    )
    const jsonString = new TextDecoder().decode(decompressedData)
    const decompressedSize = decompressedData.length
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
