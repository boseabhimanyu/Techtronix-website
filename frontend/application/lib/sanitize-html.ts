import DOMPurify from "dompurify";

const allowedTags = [
  "p",
  "br",
  "h1",
  "h2",
  "h3",
  "strong",
  "em",
  "s",
  "ul",
  "ol",
  "li",
  "blockquote",
  "hr",
  "a",
  "code",
  "pre",
  "span", 
  "img",
  // Table elements matching backend bluemonday whitelist
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "th",
  "td",
];

const allowedAttributes = [
  "href",
  "target",
  "rel",
  "src",   
  "alt",  
  "width",
  "height",
  "class", 
  "style",
  // Table-specific attributes
  "colspan",
  "rowspan",
  "scope",
];

export function sanitizeHtml(html: string) {
  if (!html) {
    return "";
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttributes,

    ALLOWED_URI_REGEXP:
      /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,

    FORBID_TAGS: [
      "script",
      "style",
      "iframe",
      "object",
      "embed",
      "form",
      "input",
      "button",
      "textarea",
      "select",
      "svg",
      "math",
    ],

    FORBID_ATTR: [
      "onerror",
      "onclick",
      "onload",
      "onmouseover",
      "onfocus",
      "onmouseenter",
      "onmouseleave",
    ],
  });
}