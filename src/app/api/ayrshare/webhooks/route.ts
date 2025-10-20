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
    const data = await social.listWebhooks();
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

    const { action, url } = await req.json();
    if (!action || !url) return new NextResponse("Missing action or url", { status: 400 });

    const social = getAyrshareClient();
    const data = await social.registerWebhook({ action, url });
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    if (!hasAyrshareConfig()) return new NextResponse("Ayrshare not configured", { status: 501 });
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const social = getAyrshareClient();
    const data = await social.unregisterWebhook({ action: "social" });
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 });
  }
}
