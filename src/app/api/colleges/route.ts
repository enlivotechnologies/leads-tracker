import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { parse } from "csv-parse/sync";

let cachedColleges: { name: string; location: string }[] | null = null;

async function loadColleges() {
  if (cachedColleges) return cachedColleges;

  const filePath = path.join(process.cwd(), "public", "data", "College.csv");
  const csvContent = await readFile(filePath, "utf-8");
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
  }) as Record<string, string>[];

  cachedColleges = records
    .map((row) => {
      const name = row["College Name"]?.trim();
      const district = row["District"]?.trim();
      const state = row["State"]?.trim();
      const location = [district, state].filter(Boolean).join(", ");
      return name ? { name, location } : null;
    })
    .filter(Boolean) as { name: string; location: string }[];

  return cachedColleges;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get("input")?.trim() || "";

  if (input.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const colleges = await loadColleges();
  const query = input.toLowerCase();

  const suggestions = colleges
    .filter((college) => college.name.toLowerCase().includes(query))
    .slice(0, 12)
    .map((college) => ({
      name: college.name,
      location: college.location,
      label: college.location
        ? `${college.name}, ${college.location}`
        : college.name,
    }));

  return NextResponse.json({ suggestions });
}
