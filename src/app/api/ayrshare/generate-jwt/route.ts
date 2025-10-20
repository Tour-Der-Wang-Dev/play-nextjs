import { NextResponse } from "next/server";
import { getAyrshareClient, getAyrsharePrivateKey, hasAyrshareConfig } from "@/src/utils/ayrshare";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/utils/auth";

export async function POST(req: Request) {
  try {
    if (!hasAyrshareConfig()) return new NextResponse("Ayrshare not configured", { status: 501 });
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const { domain, profileKey } = await req.json();
    if (!domain || !profileKey) return new NextResponse("Missing domain or profileKey", { status: 400 });

    const privateKey = getAyrsharePrivateKey();
    if (!privateKey) return new NextResponse("AYRSHARE_PRIVATE_KEY not set", { status: 400 });

    const social = getAyrshareClient();
    const data = await social.generateJWT({ domain, privateKey, profileKey });
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 });
  }
}
