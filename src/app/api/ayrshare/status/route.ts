import { NextResponse } from "next/server";
import { hasAyrshareConfig } from "@/src/utils/ayrshare";

export async function GET() {
  return NextResponse.json({ configured: hasAyrshareConfig() });
}
