/**
 * Serialise a value for embedding inside a `<script type="application/ld+json">` block.
 *
 * `JSON.stringify` alone is NOT safe here. It escapes quotes and backslashes but leaves
 * `<`, `>` and `&` untouched, so any string in the object that contains the literal
 * `</script>` closes the script element and everything after it is parsed as live HTML.
 * The JSON-LD is built from admin-authored fields (an article title, its SEO description,
 * the author name); a title as innocent as one about a `</script>` tag, or a hostile
 * editor, becomes a stored XSS on every reader page. Confirmed by test.
 *
 * The fix emits those characters as their \uXXXX escapes. Inside a JSON string
 * `<` still means `<`: JSON.parse (what Google and every consumer runs) decodes it right
 * back, so the structured data is identical in meaning. The HTML simply never contains a
 * sequence that can end the script early. U+2028 and U+2029 are escaped too: valid in a
 * JSON string but literal line terminators in a <script> body, which would break it.
 */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
