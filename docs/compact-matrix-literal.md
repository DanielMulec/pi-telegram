# Adaptive Button Literal

> Status: Portable CML v3 standard implemented by the unreleased `pi-telegram` control-surface parser.

Adaptive Button Literal is one bounded-depth matrix grammar over a shared button AST. It accepts strict JSON button objects, positional Compact Matrix Literal (CML) cells, or both in the same matrix and row. Commas between completed matrix or row elements are optional, so producers can progressively compress representation without changing runtime meaning.

```text
full named JSON → comma-optional adjacency → mixed named/positional cells → compact CML
```

The compact form is not JSON: `{label|prompt|variant}` assigns meaning by position. The formats share semantics and topology, not syntax.

## Goals

- Preserve one ordered button matrix across multiple representation densities.
- Let producers compress individual cells without converting the whole surface.
- Preserve valid strict JSON behavior unchanged.
- Admit deterministic linear-time parsing without evaluation or partial recovery.
- Keep rendering, callback ownership, and application state outside the notation.

## Data Model

Every accepted payload normalizes to a non-empty ordered list of non-empty rows:

```text
Cell = { label?: string, prompt?: string, value?: string, selected_style?: string }
Rows = Cell[][]
```

A top-level cell becomes a singleton row. A nested row preserves horizontal grouping.

These representations are semantically equivalent:

```text
[[{"label":"Pause","prompt":"music::pause"},{"value":"Next"}],{"value":"Status"}]
[[{"label":"Pause","prompt":"music::pause"}{"value":"Next"}]{"value":"Status"}]
[[{"label":"Pause","prompt":"music::pause"},{Next}],{Status}]
[[{Pause|music::pause}{Next}]{Status}]
```

Named JSON objects and positional cells may coexist within the same horizontal row:

```text
[[{"label":"Open","prompt":"/tmp"}{Back|/}]]
```

## Positional Cells

A one-atom cell copies its value into label and prompt through the existing button contract:

```text
{Next}
```

A two-atom cell separates label and prompt:

```text
{Pause|music::pause}
```

A three-atom cell adds the selected style:

```text
{Stop|music::stop|danger}
```

The style atom is accepted only as `primary`, `success`, or `danger`.

## Adaptive Grammar

The structural grammar is:

```text
payload         := json-object | matrix | positional-cell
matrix          := "[" ws element (boundary element)* ws "]"
element         := cell | row
row             := "[" ws cell (boundary cell)* ws "]"
cell            := json-object | positional-cell
boundary        := ws [","] ws
positional-cell := "{" atom "}"
                 | "{" atom "|" atom "}"
                 | "{" atom "|" atom "|" atom "}"
atom            := atom-unit+
atom-unit       := ordinary | "\|" | "\}" | "\\"
ws              := *(SP | HTAB | CR | LF)
```

`boundary` occurs only after one complete element and before another. It may contain one comma or no comma. Element delimiters make empty adjacency unambiguous. Leading, repeated, and trailing commas are invalid.

A `json-object` is one complete strict JSON object. Its property commas, strings, escaping, nested values, and other internals remain ordinary strict JSON; comma optionality applies only between matrix or row elements.

Rows cannot contain rows. The grammar never recurses beyond one row inside the top-level matrix.

## Atoms, Whitespace, And Escapes

Leading and trailing whitespace in positional atoms is trimmed. Internal ordinary spaces are preserved. CR, LF, HTAB, C0 controls, DEL, and C1 controls remaining inside an atom after trimming are invalid.

Only three positional-cell escapes exist:

```text
\|  → literal |
\}  → literal }
\\  → literal \
```

Every other printable character is literal inside a positional cell, including commas, colons, quotes, square brackets, emoji, and ordinary spaces. A comma inside `{label|prompt}` is data; a comma after the closing `}` is an optional element separator.

## Deterministic Parsing

A conforming parser:

1. Attempts strict JSON first for sources beginning with `{` or `[`. Successful JSON is validated only against the existing button matrix schema and never reinterpreted.
2. If strict JSON parsing fails, parses the original source with the adaptive grammar.
3. Tries one complete strict JSON object at each cell boundary before positional interpretation.
4. Accepts at most one optional comma between completed matrix or row elements.
5. Rejects leading, repeated, trailing, or property-level omitted commas.
6. Rejects empty atoms, matrices, rows, and nesting deeper than one row.
7. Decodes only `\|`, `\}`, and `\\` in positional cells.
8. Consumes exactly one complete payload and rejects trailing content.
9. Returns no partial rows or cells after any failure.
10. Runs in linear time over a host-bounded payload with fixed grammar depth.

Malformed JSON-looking input receives no generic recovery. It is accepted only if it independently forms a complete valid adaptive literal.

## Telegram Profile

For `telegram_button` and the exact `telegram_buttons` alias:

- JSON `value` keeps its existing label/prompt fallback semantics.
- Positional `{value}` is equivalent to JSON `{"value":"value"}`.
- Positional `{label|prompt}` is equivalent to JSON `{"label":"label","prompt":"prompt"}`.
- Positional `{label|prompt|selected_style}` is equivalent to the corresponding three-field JSON object.
- Top-level cells become full-width rows.
- Nested rows become horizontal keyboard rows.
- Invalid payloads are stripped with their recognized action comment and register no callbacks.

Example:

```html
<!-- telegram_button [{⬆️ Up|/},[{⬅️|page-1}{➡️|page-3}],{"label":"📁 etc","prompt":"/etc"}] -->
```

The enclosing HTML-comment transport owns its own delimiter boundary. Content containing the comment terminator must use another supported representation.

## Width Policy

The grammar imposes no visual row-width maximum. Renderer and interaction policy own width. The bundled Generated Control Surface Skill defaults to at most five short position-bearing controls per row, permits six to eight only when labels remain compact, and treats eight as the phone-width UX maximum.

## Conformance

Accepted classes include:

- Strict JSON objects and matrices.
- Positional singleton, two-atom, and styled cells.
- Matrices and rows with commas, without commas, or a mixture of boundaries.
- Named JSON and positional cells mixed in one matrix or row.
- Literal commas inside positional atoms and strict JSON strings.
- Unicode, defined escapes, structural whitespace, and rows at supported renderer widths.
- Semantic equivalence across every progressive-compression step.

Rejected classes include:

- Empty payloads, matrices, rows, labels, prompts, or style atoms.
- Leading, repeated, or trailing element commas.
- Missing commas between properties inside a JSON object.
- Deeper row nesting.
- Missing, crossed, or mismatched delimiters.
- A third positional separator, unknown style, unknown escape, or trailing backslash.
- Internal control characters and trailing garbage.
- Valid JSON that fails the existing JSON action schema.

Every rejected case proves zero callback registration.

## Versioning

This document defines CML v3. V3 extends the v2 positional grammar with strict JSON object cells, mixed representation, and optional element-boundary commas. It does not make JSON object internals permissive and does not add deeper structures. Future versions must preserve strict-JSON-first routing, bounded depth, atomic rejection, and an explicit discriminator for any new meaning at a security or ownership boundary.
