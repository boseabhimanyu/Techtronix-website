package sanitizer

import (
	"regexp"

	"github.com/microcosm-cc/bluemonday"
)

var policy = bluemonday.NewPolicy()

// Regular expression that strictly validates safe hex color codes
var hexColorRegex = regexp.MustCompile(`(?i)^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$`)

// Safe class name regex (e.g., allows custom styling classes like "highlight", "text-muted", "badge-primary")
// Restricts to standard alphanumeric characters, hyphens, and underscores.
var safeClassRegex = regexp.MustCompile(`^[a-zA-Z0-9-_]+(\s+[a-zA-Z0-9-_]+)*$`)

func init() {
	policy.AllowElements(
		"p",
		"br",
		"strong",
		"em",
		"span",
		"h1",
		"h2",
		"h3",
		"ul",
		"ol",
		"li",
		"blockquote",
		"a",
		"img",

		// Add formatting already permitted by TinyMCE & DOMPurify:
		"code",
		"pre",
		"hr",
		"s",
		"del",

		// --- TABLES (Added) ---
		"table",
		"thead",
		"tbody",
		"tfoot",
		"tr",
		"th",
		"td",
	)

	// ==========================================
	// TABLE ATTRIBUTES (Semantic & Safe)
	// ==========================================
	// Allow standard spanning attributes for complex headers/cells
	policy.AllowAttrs("colspan", "rowspan").OnElements("th", "td")
	policy.AllowAttrs("scope").OnElements("th")

	// Allow safe classes on tables and cells
	policy.AllowAttrs("class").
		Matching(safeClassRegex).
		OnElements("p", "span", "h1", "h2", "h3", "blockquote", "table", "thead", "tbody", "tr", "th", "td")

	// Links
	policy.RequireParseableURLs(true) // Crucial! Enforces URL validation
	policy.AllowAttrs("href").OnElements("a")
	//policy.AllowStandardURLs()

	// Allow email (mailto) and phone (tel) schemes along with https
	policy.AllowURLSchemes("https", "mailto", "tel")

	policy.RequireNoFollowOnLinks(true) // Optional: Prevents SEO spam abuse

	//policy.RequireNoReferrerOnLinks(true) // Optional: Protects user privacy

	// Allow target="_blank" if you want external links to open in a new tab
	// policy.AllowAttrs("target").Matching(regexp.MustCompile(`^(_blank|_self)$`)).OnElements("a")

	// Images
	policy.AllowAttrs(
		"src",
		"alt",
		"width",
		"height",
	).OnElements("img")

	// Inline styles
	policy.AllowAttrs("style").OnElements(
		"p",
		"h1",
		"h2",
		"h3",
		"img",
		"span",
		"th",
		"td",
	)

	// Text alignment (include table headers and cells)
	policy.AllowStyles("text-align").
		MatchingEnum("left", "right", "center", "justify").
		OnElements("p", "h1", "h2", "h3", "span", "th", "td")

	// Image positioning
	policy.AllowStyles("float").
		MatchingEnum("left", "right", "none").
		OnElements("img")

		// Text Color & Background Color (NEW)
	policy.AllowStyles("color").
		Matching(hexColorRegex).
		OnElements("p", "h1", "h2", "h3", "span", "th", "td")

	policy.AllowStyles("background-color").
		Matching(hexColorRegex).
		OnElements("p", "h1", "h2", "h3", "span", "th", "td")

}

func Sanitize(input string) string {
	return policy.Sanitize(input)
}
