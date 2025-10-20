import { NextResponse } from "next/server";
import { getAyrshareClient, hasAyrshareConfig } from "@/src/utils/ayrshare";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/utils/auth";

export async function POST(req: Request) {
  try {
    if (!hasAyrshareConfig()) return new NextResponse("Ayrshare not configured", { status: 501 });
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const { profileKey, id, platforms, comment } = await req.json();
    if (!id || !comment) return new NextResponse("Missing id or comment", { status: 400 });

    const social = getAyrshareClient({ profileKey });
    const data = await social.postComment({ id, platforms, comment });
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    if (!hasAyrshareConfig()) return new NextResponse("Ayrshare not configured", { status: 501 });
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const profileKey = searchParams.get("profileKey") || undefined;
    if (!id) return new NextResponse("Missing id", { status: 400 });

    const social = getAyrshareClient({ profileKey });
    const data = await social.getComments({ id });
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 });
  }
}
