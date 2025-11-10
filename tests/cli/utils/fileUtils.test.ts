import { describe, expect, test } from "bun:test"
import { join } from "node:path"
import {
  findFiles,
  formatFileSize,
  formatSavings,
  groupFilesByType,
} from "../../../src/cli/utils/fileUtils"

describe("fileUtils", () => {
  describe("groupFilesByType", () => {
    test("should categorize PNG files as images", () => {
      const files = ["/path/to/image1.png", "/path/to/image2.PNG"]
      const result = groupFilesByType(files)

      expect(result.images).toEqual([
        "/path/to/image1.png",
        "/path/to/image2.PNG",
      ])
      expect(result.audio).toEqual([])
    })

    test("should categorize JPG and JPEG files as images", () => {
      const files = [
        "/path/to/photo.jpg",
        "/path/to/photo2.JPG",
        "/path/to/photo3.jpeg",
        "/path/to/photo4.JPEG",
      ]
      const result = groupFilesByType(files)

      expect(result.images).toHaveLength(4)
      expect(result.audio).toEqual([])
    })

    test("should categorize WAV files as audio", () => {
      const files = ["/path/to/sound1.wav", "/path/to/sound2.WAV"]
      const result = groupFilesByType(files)

      expect(result.images).toEqual([])
      expect(result.audio).toEqual([
        "/path/to/sound1.wav",
        "/path/to/sound2.WAV",
      ])
    })

    test("should handle mixed file types", () => {
      const files = [
        "/path/to/image.png",
        "/path/to/photo.jpg",
        "/path/to/sound.wav",
        "/path/to/another.jpeg",
      ]
      const result = groupFilesByType(files)

      expect(result.images).toHaveLength(3)
      expect(result.audio).toHaveLength(1)
    })

    test("should ignore unsupported file types", () => {
      const files = [
        "/path/to/image.png",
        "/path/to/document.pdf",
        "/path/to/video.mp4",
        "/path/to/sound.wav",
        "/path/to/text.txt",
      ]
      const result = groupFilesByType(files)

      expect(result.images).toEqual(["/path/to/image.png"])
      expect(result.audio).toEqual(["/path/to/sound.wav"])
    })

    test("should handle empty array", () => {
      const files: string[] = []
      const result = groupFilesByType(files)

      expect(result.images).toEqual([])
      expect(result.audio).toEqual([])
    })
  })

  describe("findFiles", () => {
    test("should find PNG files in test assets", async () => {
      const pattern = "tests/assets/*.png"
      const files = await findFiles(pattern)

      expect(files.length).toBeGreaterThan(0)
      expect(files.every((f) => f.endsWith(".png"))).toBe(true)
    })

    test("should find JPG files in test assets", async () => {
      const pattern = "tests/assets/*.jpg"
      const files = await findFiles(pattern)

      expect(files.length).toBeGreaterThan(0)
      expect(files.every((f) => f.endsWith(".jpg"))).toBe(true)
    })

    test("should find WAV files in test assets", async () => {
      const pattern = "tests/assets/*.wav"
      const files = await findFiles(pattern)

      expect(files.length).toBeGreaterThan(0)
      expect(files.every((f) => f.endsWith(".wav"))).toBe(true)
    })

    test("should find multiple file types with pattern", async () => {
      const pattern = "tests/assets/*.{png,jpg,wav}"
      const files = await findFiles(pattern)

      expect(files.length).toBeGreaterThan(0)
      const hasPng = files.some((f) => f.endsWith(".png"))
      const hasJpg = files.some((f) => f.endsWith(".jpg"))
      const hasWav = files.some((f) => f.endsWith(".wav"))

      expect(hasPng || hasJpg || hasWav).toBe(true)
    })

    test("should return absolute paths", async () => {
      const pattern = "tests/assets/*.png"
      const files = await findFiles(pattern)

      expect(files.length).toBeGreaterThan(0)
      expect(files.every((f) => join(f) === f)).toBe(true)
    })

    test("should return empty array for non-matching pattern", async () => {
      const pattern = "tests/assets/*.nonexistent"
      const files = await findFiles(pattern)

      expect(files).toEqual([])
    })
  })

  describe("formatFileSize", () => {
    test("should format bytes", () => {
      expect(formatFileSize(0)).toBe("0 B")
      expect(formatFileSize(500)).toBe("500 B")
      expect(formatFileSize(1023)).toBe("1023 B")
    })

    test("should format kilobytes", () => {
      expect(formatFileSize(1024)).toBe("1.0 KB")
      expect(formatFileSize(2048)).toBe("2.0 KB")
      expect(formatFileSize(1536)).toBe("1.5 KB")
      expect(formatFileSize(10240)).toBe("10.0 KB")
    })

    test("should format megabytes", () => {
      expect(formatFileSize(1024 * 1024)).toBe("1.00 MB")
      expect(formatFileSize(2 * 1024 * 1024)).toBe("2.00 MB")
      expect(formatFileSize(1.5 * 1024 * 1024)).toBe("1.50 MB")
      expect(formatFileSize(10.25 * 1024 * 1024)).toBe("10.25 MB")
    })
  })

  describe("formatSavings", () => {
    test("should format savings with percentage", () => {
      const sizeInfo = {
        inputSize: 1024,
        outputSize: 512,
        savings: 512,
        savingsPercent: 50,
      }
      expect(formatSavings(sizeInfo)).toBe("1.0 KB → 512 B (50.0% saved)")
    })

    test("should handle large files", () => {
      const sizeInfo = {
        inputSize: 10 * 1024 * 1024,
        outputSize: 2 * 1024 * 1024,
        savings: 8 * 1024 * 1024,
        savingsPercent: 80,
      }
      expect(formatSavings(sizeInfo)).toBe("10.00 MB → 2.00 MB (80.0% saved)")
    })

    test("should handle small savings", () => {
      const sizeInfo = {
        inputSize: 1000,
        outputSize: 950,
        savings: 50,
        savingsPercent: 5,
      }
      expect(formatSavings(sizeInfo)).toBe("1000 B → 950 B (5.0% saved)")
    })

    test("should handle high compression ratios", () => {
      const sizeInfo = {
        inputSize: 1024 * 1024,
        outputSize: 102400,
        savings: 1024 * 1024 - 102400,
        savingsPercent: 90.234375,
      }
      expect(formatSavings(sizeInfo)).toBe("1.00 MB → 100.0 KB (90.2% saved)")
    })

    test("should show 'keeping original' with attempted size when kept original", () => {
      const sizeInfo = {
        inputSize: 1024,
        outputSize: 1024,
        savings: 0,
        savingsPercent: 0,
        keptOriginal: true,
        attemptedOutputSize: 1100,
      }
      expect(formatSavings(sizeInfo)).toBe(
        "1.0 KB → 1.1 KB (-7.4% saved, keeping original)",
      )
    })

    test("should handle large file kept original", () => {
      const sizeInfo = {
        inputSize: 10 * 1024,
        outputSize: 10 * 1024,
        savings: 0,
        savingsPercent: 0,
        keptOriginal: true,
        attemptedOutputSize: 12 * 1024,
      }
      expect(formatSavings(sizeInfo)).toBe(
        "10.0 KB → 12.0 KB (-20.0% saved, keeping original)",
      )
    })
  })
})
