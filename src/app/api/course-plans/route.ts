import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://golf-plat.com";

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  if (!checkRateLimit(`course-plans:${ip}`, { maxRequests: 30, windowMs: 60000 })) {
    return NextResponse.json({ plans: [] }, { status: 429 });
  }

  const courseId = request.nextUrl.searchParams.get("courseId") ?? "";
  const date = request.nextUrl.searchParams.get("date") ?? "";

  if (!courseId || !date) {
    return NextResponse.json({ plans: [] });
  }

  const appId = process.env.RAKUTEN_APP_ID;
  const accessKey = process.env.RAKUTEN_ACCESS_KEY;
  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID;

  if (!appId || !accessKey) {
    return NextResponse.json({ plans: [] });
  }

  try {
    const params = new URLSearchParams({
      format: "json",
      formatVersion: "2",
      applicationId: appId,
      accessKey: accessKey,
      playDate: date,
      hits: "30",
    });
    if (affiliateId) params.set("affiliateId", affiliateId);

    const url = `https://openapi.rakuten.co.jp/engine/api/Gora/GoraPlanSearch/20170623?${params}`;
    const res = await fetch(url, {
      headers: { Referer: SITE_URL + "/", Origin: SITE_URL },
      next: { revalidate: 900 },
    });

    if (!res.ok) return NextResponse.json({ plans: [] });

    const data = await res.json();

    // 該当コースを探す
    const courseItem = (data.Items ?? []).find(
      (item: Record<string, unknown>) => String(item.golfCourseId) === courseId
    );

    if (!courseItem) return NextResponse.json({ plans: [] });

    const planInfos = Array.isArray(courseItem.planInfo)
      ? courseItem.planInfo
      : courseItem.planInfo
      ? [courseItem.planInfo]
      : [];

    const plans = planInfos
      .filter((p: Record<string, unknown>) => p.price && (p.price as number) > 0)
      .sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
        (a.price as number) - (b.price as number)
      )
      .map((p: Record<string, unknown>) => ({
        name: (p.planName as string) ?? "",
        price: (p.price as number) ?? 0,
        round: (p.round as string) ?? "1R",
        cart: ((p.cart as number) ?? 0) > 0,
        lunch: (p.lunch as number) === 1,
        twosome: (p.assu2sum as number) === 1,
        twoBagFee: (p.addFee2bFlag as number) === 1 ? ((p.addFee2b as number) ?? 0) : 0,
        threeBagFee: (p.addFee3bFlag as number) === 1 ? ((p.addFee3b as number) ?? 0) : 0,
        reserveUrl: ((p.callInfo as Record<string, unknown>)?.reservePageUrlPC as string) ?? "",
      }));

    return NextResponse.json({ plans });
  } catch {
    return NextResponse.json({ plans: [] });
  }
}
