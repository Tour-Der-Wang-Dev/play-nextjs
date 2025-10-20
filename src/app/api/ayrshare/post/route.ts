import { NextResponse } from "next/server";
import { getAyrshareClient, hasAyrshareConfig } from "@/src/utils/ayrshare";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/utils/auth";

type Body = {
  profileKey?: string;
  post: string;
  platforms: string[];
  mediaUrls?: string[];
  scheduleDate?: string;
  shortenLinks?: boolean;
};

export async function POST(req: Request) {
  try {
    if (!hasAyrshareConfig()) return new NextResponse("Ayrshare not configured", { status: 501 });
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const body = (await req.json()) as Body;
    if (!body?.post || !Array.isArray(body?.platforms)) return new NextResponse("Invalid body", { status: 400 });

    const social = getAyrshareClient({ profileKey: body.profileKey });
    const res = await social.post({
      post: body.post,
      platforms: body.platforms,
      mediaUrls: body.mediaUrls,
      scheduleDate: body.scheduleDate,
      shortenLinks: body.shortenLinks,
    });
    return NextResponse.json(res);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 });
  }
}
