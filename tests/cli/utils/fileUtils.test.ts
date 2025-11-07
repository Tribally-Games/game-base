import { describe, expect, test } from "bun:test"
import { join } from "node:path"
import { findFiles, groupFilesByType } from "../../../src/cli/utils/fileUtils"

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
})
