import { describe, expect, it } from "vitest";
import { sourceUrlSchema } from "@/lib/schemas";

function messages(value: string): string[] {
  const parsed = sourceUrlSchema.safeParse(value);
  if (parsed.success) return [];
  return parsed.error.issues.map((issue) => issue.message);
}

describe("sourceUrlSchema", () => {
  it("accepts http(s) URLs that include a file path", () => {
    expect(sourceUrlSchema.parse("https://cdn.example.com/videos/clip.mp4")).toBe(
      "https://cdn.example.com/videos/clip.mp4",
    );
    expect(sourceUrlSchema.parse("http://media.example.com/a/b/movie.mov")).toBe(
      "http://media.example.com/a/b/movie.mov",
    );
  });

  it("rejects an empty string as required", () => {
    expect(messages("")).toContain("Source URL is required");
  });

  it("rejects a string that is not a URL", () => {
    const found = messages("not a url");
    expect(found.length).toBeGreaterThan(0);
    expect(found[0]?.toLowerCase()).toMatch(/url/);
  });

  it("rejects a non-http protocol", () => {
    const found = messages("ftp://cdn.example.com/clip.mp4");
    expect(found.length).toBeGreaterThan(0);
    expect(found[0]?.toLowerCase()).toMatch(/http/);
  });

  it("rejects a URL with no file path", () => {
    const found = messages("https://cdn.example.com");
    expect(found.length).toBeGreaterThan(0);
    expect(found[0]?.toLowerCase()).toMatch(/path/);
  });
});
