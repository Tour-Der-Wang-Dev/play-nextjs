import { NextResponse } from "next/server";
import { getAyrshareClient, hasAyrshareConfig } from "@/src/utils/ayrshare";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/utils/auth";

export async function GET() {
  try {
    if (!hasAyrshareConfig()) return new NextResponse("Ayrshare not configured", { status: 501 });
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const social = getAyrshareClient();
    const data = await social.getProfiles();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!hasAyrshareConfig()) return new NextResponse("Ayrshare not configured", { status: 501 });
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const { title } = await req.json();
    if (!title || typeof title !== "string") return new NextResponse("Missing title", { status: 400 });
    const social = getAyrshareClient();
    const data = await social.createProfile({ title });
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 });
  }
}
