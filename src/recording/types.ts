import type { GameRecording } from "@clockwork-engine/core"

export const COMPRESSED_RECORDING = {
  DATA_TYPE: "recording",
  COMPRESSION: "brotli",
  VERSION: 1,
} as const

export interface CompressedRecording {
  dataType: typeof COMPRESSED_RECORDING.DATA_TYPE
  compression: typeof COMPRESSED_RECORDING.COMPRESSION
  version: number
  data: string
}

export type AnyRecording = CompressedRecording | GameRecording

export interface CompressionOptions {
  quality?: number
}

export interface CompressionMetrics {
  originalSize: number
  compressedSize: number
  compressionRatio: number
  compressionTimeMs: number
}

export interface CompressionResult {
  compressed: CompressedRecording
  metrics: CompressionMetrics
}

export interface DecompressionMetrics {
  compressedSize: number
  decompressedSize: number
  decompressionTimeMs: number
  wasCompressed: boolean
}

export interface DecompressionResult {
  recording: GameRecording
  metrics: DecompressionMetrics
}

export class RecordingCompressionError extends Error {
  constructor(
    message: string,
    public override readonly cause?: unknown,
  ) {
    super(message)
    this.name = "RecordingCompressionError"
  }
}

export class RecordingDecompressionError extends Error {
  constructor(
    message: string,
    public override readonly cause?: unknown,
  ) {
    super(message)
    this.name = "RecordingDecompressionError"
  }
}
