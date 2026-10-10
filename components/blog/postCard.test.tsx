import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { PostCard } from "@/components/blog/PostCard"
import type { BlogPost } from "@/lib/blog"
import { formatDayMonth } from "@/lib/format"

/**
 * The blog index groups posts under their month ("October 2026"), so a row
 * that printed "09 Oct 2026" said the month and year again; in a busy month
 * the same date ran down the list a dozen times. A row says the day.
 */
const post: BlogPost = {
    id: "1",
    slug: "a-post",
    title: "A post",
    excerpt: "What shipped.",
    cover_image: "",
    content: "",
    author: "",
    tags: [],
    status: "published",
    seo_title: "",
    seo_desc: "",
    published_at: "2026-10-09T06:30:00Z",
    created_at: "2026-10-09T06:30:00Z",
    updated_at: "2026-10-09T06:30:00Z",
}

describe("a post in the blog index", () => {
    for (const compact of [true, false]) {
        it(`shows the day and month, not the year (${compact ? "one-line" : "featured"} row)`, () => {
            const html = renderToString(<PostCard post={post} compact={compact} />)
            expect(html).toContain(">9 Oct</time>")
            expect(html).not.toContain("2026</time>")
            // The machine-readable date keeps everything.
            expect(html).toContain('dateTime="2026-10-09T06:30:00Z"')
        })
    }

    it("takes the day in UTC, as the month headings do", () => {
        // 23:30 in New York on 30 September is 1 October in UTC, the month it is filed under.
        expect(formatDayMonth("2026-09-30T23:30:00-04:00")).toBe("1 Oct")
        expect(formatDayMonth(null)).toBe("-")
    })
})
