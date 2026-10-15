import { revalidatePath, revalidateTag } from "next/cache";
import { RELEASES_TAG } from "@/lib/releases";
import { GITHUB_TAG } from "@/lib/github";
import { eventRepository, signatureValid } from "@/lib/releaseWebhook";
import { site } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** A release event is a few tens of kilobytes; nothing near this is one. */
const MAX_BODY = 1024 * 1024;

/**
 * GitHub's release webhook (RELEASES.md): a release published, edited or
 * deleted on the public repository refreshes the changelog and the home
 * page's pill and count now, rather than within the hour the read of the
 * releases is kept for, and the open-source cards' newest release with them
 * (lib/github.ts).
 *
 * Off until RELEASES_WEBHOOK_SECRET is set (it answers 404 until then). A
 * delivery is acted on only with GitHub's signature over its body under that
 * secret, and only for the server's repository; it can do nothing but
 * revalidate pages, so the worst a stolen secret allows is an early refresh.
 */
export async function POST(req: Request): Promise<Response> {
  const secret = process.env.RELEASES_WEBHOOK_SECRET;
  if (!secret) return new Response("Not found", { status: 404 });
  if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY) return new Response("Too large", { status: 413 });
  const body = await req.text();
  if (body.length > MAX_BODY) return new Response("Too large", { status: 413 });
  if (!signatureValid(secret, body, req.headers.get("x-hub-signature-256"))) return new Response("Signature does not match", { status: 401 });

  const event = req.headers.get("x-github-event");
  if (event === "ping") return Response.json({ ok: true });
  if (event !== "release") return Response.json({ ok: true, ignored: event ?? "no event" });
  const repo = site.serverGithubUrl.replace("https://github.com/", "");
  if (eventRepository(body).toLowerCase() !== repo.toLowerCase()) return Response.json({ ok: true, ignored: "another repository" });

  revalidateTag(RELEASES_TAG);
  revalidateTag(GITHUB_TAG);
  revalidatePath("/");
  revalidatePath("/changelog");
  revalidatePath("/changelog/[slug]", "page");
  revalidatePath("/open-source");
  return Response.json({ ok: true, revalidated: true });
}
