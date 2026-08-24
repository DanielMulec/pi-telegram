/**
 * Telegram outbound markup parsing helpers
 * Zones: telegram outbound, assistant markup
 * Owns top-level assistant action comment extraction, attribute parsing, and markup stripping shared by voice and outbound delivery
 */

export interface TelegramTopLevelHtmlComment {
  raw: string;
  content: string;
  start: number;
  end: number;
}

interface TelegramTopLevelFenceState {
  marker: "`" | "~";
  length: number;
}

function getMarkdownLineEnd(markdown: string, offset: number): number {
  const newlineIndex = markdown.indexOf("\n", offset);
  return newlineIndex === -1 ? markdown.length : newlineIndex + 1;
}

function getMarkdownLineText(
  markdown: string,
  offset: number,
  end: number,
): string {
  return markdown.slice(offset, end).replace(/\r?\n$/, "");
}

function getTopLevelOpeningFence(
  line: string,
): TelegramTopLevelFenceState | undefined {
  const match = line.match(/^(?: {0,3})(`{3,}|~{3,})/);
  const sequence = match?.[1];
  if (!sequence) return undefined;
  return {
    marker: sequence[0] as "`" | "~",
    length: sequence.length,
  };
}

function isTopLevelClosingFence(
  line: string,
  fence: TelegramTopLevelFenceState,
): boolean {
  const match = line.match(/^(?: {0,3})(`{3,}|~{3,})([ \t]*)$/);
  const sequence = match?.[1];
  return (
    !!sequence &&
    sequence[0] === fence.marker &&
    sequence.length >= fence.length
  );
}

export function collectTopLevelHtmlComments(markdown: string): {
  comments: TelegramTopLevelHtmlComment[];
  openCommentStart?: number;
} {
  const comments: TelegramTopLevelHtmlComment[] = [];
  let offset = 0;
  let fence: TelegramTopLevelFenceState | undefined;
  while (offset < markdown.length) {
    const lineEnd = getMarkdownLineEnd(markdown, offset);
    const line = getMarkdownLineText(markdown, offset, lineEnd);
    if (fence) {
      if (isTopLevelClosingFence(line, fence)) fence = undefined;
      offset = lineEnd;
      continue;
    }
    const nextFence = getTopLevelOpeningFence(line);
    if (nextFence) {
      fence = nextFence;
      offset = lineEnd;
      continue;
    }
    if (line.startsWith("<!--")) {
      const closeIndex = markdown.indexOf("-->", offset + 4);
      if (closeIndex === -1) return { comments, openCommentStart: offset };
      const end = closeIndex + 3;
      const raw = markdown.slice(offset, end);
      const content = raw.slice(4, -3);
      comments.push({ raw, content, start: offset, end });
      offset = getMarkdownLineEnd(markdown, end);
      continue;
    }
    offset = lineEnd;
  }
  return { comments };
}

export function replaceTopLevelHtmlComments(
  markdown: string,
  replacer: (comment: TelegramTopLevelHtmlComment) => string,
): string {
  const { comments } = collectTopLevelHtmlComments(markdown);
  if (comments.length === 0) return markdown;
  let result = "";
  let offset = 0;
  for (const comment of comments) {
    result += markdown.slice(offset, comment.start);
    result += replacer(comment);
    offset = comment.end;
  }
  return result + markdown.slice(offset);
}

export function findTopLevelOpenOrPartialHtmlCommentIndex(
  markdown: string,
): number {
  const { openCommentStart } = collectTopLevelHtmlComments(markdown);
  if (openCommentStart !== undefined) return openCommentStart;
  let offset = 0;
  let fence: TelegramTopLevelFenceState | undefined;
  while (offset < markdown.length) {
    const lineEnd = getMarkdownLineEnd(markdown, offset);
    const line = getMarkdownLineText(markdown, offset, lineEnd);
    const isLastLine = lineEnd >= markdown.length;
    if (fence) {
      if (isTopLevelClosingFence(line, fence)) fence = undefined;
      offset = lineEnd;
      continue;
    }
    const nextFence = getTopLevelOpeningFence(line);
    if (nextFence) {
      fence = nextFence;
      offset = lineEnd;
      continue;
    }
    if (isLastLine && (line === "<" || line === "<!" || line === "<!-")) {
      return offset;
    }
    offset = lineEnd;
  }
  return -1;
}

export function parseTopLevelTelegramComment(
  comment: TelegramTopLevelHtmlComment,
  command: string,
): { head: string; body?: string } | undefined {
  let normalizedContent = comment.content.replace(/^\s+/, "");
  normalizedContent = normalizedContent.replace(/^!/, "");
  const [rawHead = "", ...bodyLines] = normalizedContent.split(/\r?\n/);
  let head = rawHead.trimStart();
  if (!head.startsWith(command)) return undefined;
  const nextChar = head[command.length];
  if (nextChar !== undefined && !/\s|:/.test(nextChar)) return undefined;
  return {
    head: head.slice(command.length),
    ...(bodyLines.length > 0 ? { body: bodyLines.join("\n") } : {}),
  };
}

function parseCanonicalTelegramActionAttributes(
  source: string,
): Record<string, string> | undefined {
  const attributes: Record<string, string> = {};
  const pattern = /\s*([A-Za-z_][A-Za-z0-9_-]*)="([^"]*)"/y;
  let offset = 0;
  while (offset < source.length) {
    pattern.lastIndex = offset;
    const match = pattern.exec(source);
    if (!match) return undefined;
    const value = match[2].trim();
    if (value) attributes[match[1]] = value;
    offset = pattern.lastIndex;
  }
  return Object.keys(attributes).length > 0 ? attributes : undefined;
}

function getTelegramActionPayloadSource(
  comment: TelegramTopLevelHtmlComment,
  command: string,
): { source: string; hasBody: boolean } | undefined {
  const parsed = parseTopLevelTelegramComment(comment, command);
  if (!parsed || parsed.head.trimStart().startsWith(":")) return undefined;
  const source = [parsed.head, parsed.body]
    .filter((part): part is string => part !== undefined)
    .join("\n")
    .trim();
  return source ? { source, hasBody: parsed.body !== undefined } : undefined;
}

function isTelegramActionPayload(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function parseTelegramActionPayload(
  comment: TelegramTopLevelHtmlComment,
  command: string,
): Record<string, unknown> | undefined {
  const payload = getTelegramActionPayloadSource(comment, command);
  if (!payload) return undefined;
  if (payload.source.startsWith("{")) {
    try {
      const value: unknown = JSON.parse(payload.source);
      return isTelegramActionPayload(value) ? value : undefined;
    } catch {
      return undefined;
    }
  }
  if (payload.hasBody) return undefined;
  return parseCanonicalTelegramActionAttributes(payload.source);
}

const TELEGRAM_COMPACT_ACTION_CONTROL_PATTERN = /[\u0000-\u001f\u007f-\u009f]/u;

function parseTelegramAdaptiveActionPayloadRows(
  source: string,
): Record<string, unknown>[][] | undefined {
  let offset = 0;
  const isStructuralWhitespace = (character: string | undefined): boolean =>
    character === " " ||
    character === "\t" ||
    character === "\r" ||
    character === "\n";
  const skipWhitespace = (): void => {
    while (isStructuralWhitespace(source[offset])) offset += 1;
  };
  const consumeOptionalSeparator = (): boolean => {
    skipWhitespace();
    if (source[offset] !== ",") return true;
    offset += 1;
    skipWhitespace();
    return source[offset] !== "," && source[offset] !== "]";
  };
  const normalizeAtom = (value: string): string | undefined => {
    const normalized = value.trim();
    return normalized && !TELEGRAM_COMPACT_ACTION_CONTROL_PATTERN.test(normalized)
      ? normalized
      : undefined;
  };
  const parseCompactCell = (): Record<string, unknown> | undefined => {
    if (source[offset] !== "{") return undefined;
    offset += 1;
    const atomSources: string[][] = [[]];
    while (offset < source.length) {
      const character = source[offset]!;
      if (character === "\\") {
        const escaped = source[offset + 1];
        if (escaped !== "|" && escaped !== "}" && escaped !== "\\") {
          return undefined;
        }
        atomSources.at(-1)!.push(escaped);
        offset += 2;
        continue;
      }
      if (character === "|") {
        if (atomSources.length >= 3) return undefined;
        atomSources.push([]);
        offset += 1;
        continue;
      }
      if (character === "}") {
        offset += 1;
        const atoms = atomSources.map((atom) =>
          normalizeAtom(atom.join("")),
        );
        if (atoms.some((atom) => atom === undefined)) return undefined;
        const [label, prompt, selectedStyle] = atoms as string[];
        if (atoms.length === 1) return { value: label };
        if (atoms.length === 2) return { label, prompt };
        if (
          selectedStyle !== "primary" &&
          selectedStyle !== "success" &&
          selectedStyle !== "danger"
        ) return undefined;
        return { label, prompt, selected_style: selectedStyle };
      }
      atomSources.at(-1)!.push(character);
      offset += 1;
    }
    return undefined;
  };
  const parseJsonObjectCell = (): Record<string, unknown> | undefined => {
    if (source[offset] !== "{") return undefined;
    const start = offset;
    const stack: string[] = [];
    let inString = false;
    let escaped = false;
    for (let index = start; index < source.length; index += 1) {
      const character = source[index]!;
      if (inString) {
        if (escaped) escaped = false;
        else if (character === "\\") escaped = true;
        else if (character === '"') inString = false;
        continue;
      }
      if (character === '"') {
        inString = true;
        continue;
      }
      if (character === "{" || character === "[") {
        stack.push(character);
        continue;
      }
      if (character !== "}" && character !== "]") continue;
      const opening = stack.pop();
      if (
        (character === "}" && opening !== "{") ||
        (character === "]" && opening !== "[")
      ) return undefined;
      if (stack.length > 0) continue;
      const candidate = source.slice(start, index + 1);
      try {
        const value: unknown = JSON.parse(candidate);
        if (!isTelegramActionPayload(value)) return undefined;
        offset = index + 1;
        return value;
      } catch {
        return undefined;
      }
    }
    return undefined;
  };
  const parseCell = (): Record<string, unknown> | undefined => {
    const start = offset;
    const jsonCell = parseJsonObjectCell();
    if (jsonCell) return jsonCell;
    offset = start;
    return parseCompactCell();
  };
  const parseRow = (): Record<string, unknown>[] | undefined => {
    if (source[offset] !== "[") return undefined;
    offset += 1;
    const row: Record<string, unknown>[] = [];
    while (offset < source.length) {
      skipWhitespace();
      if (source[offset] === "]") {
        offset += 1;
        return row.length > 0 ? row : undefined;
      }
      if (source[offset] !== "{") return undefined;
      const cell = parseCell();
      if (!cell) return undefined;
      row.push(cell);
      if (!consumeOptionalSeparator()) return undefined;
    }
    return undefined;
  };
  const parseMatrix = (): Record<string, unknown>[][] | undefined => {
    if (source[offset] !== "[") return undefined;
    offset += 1;
    const rows: Record<string, unknown>[][] = [];
    while (offset < source.length) {
      skipWhitespace();
      const character = source[offset];
      if (character === "]") {
        offset += 1;
        return rows.length > 0 ? rows : undefined;
      }
      if (character === "{") {
        const cell = parseCell();
        if (!cell) return undefined;
        rows.push([cell]);
      } else if (character === "[") {
        const row = parseRow();
        if (!row) return undefined;
        rows.push(row);
      } else {
        return undefined;
      }
      if (!consumeOptionalSeparator()) return undefined;
    }
    return undefined;
  };

  skipWhitespace();
  let rows: Record<string, unknown>[][] | undefined;
  if (source[offset] === "{") {
    const cell = parseCell();
    rows = cell ? [[cell]] : undefined;
  } else {
    rows = parseMatrix();
  }
  if (!rows) return undefined;
  skipWhitespace();
  return offset === source.length ? rows : undefined;
}

export function parseTelegramActionPayloadRows(
  comment: TelegramTopLevelHtmlComment,
  command: string,
): Record<string, unknown>[][] | undefined {
  const payload = getTelegramActionPayloadSource(comment, command);
  if (!payload) return undefined;
  if (payload.source.startsWith("[") || payload.source.startsWith("{")) {
    try {
      const value: unknown = JSON.parse(payload.source);
      if (isTelegramActionPayload(value)) return [[value]];
      if (!Array.isArray(value)) return undefined;
      const rows: Record<string, unknown>[][] = [];
      for (const entry of value) {
        if (isTelegramActionPayload(entry)) {
          rows.push([entry]);
          continue;
        }
        if (
          !Array.isArray(entry) ||
          entry.length === 0 ||
          !entry.every(isTelegramActionPayload)
        ) {
          return undefined;
        }
        rows.push(entry);
      }
      return rows;
    } catch {
      return parseTelegramAdaptiveActionPayloadRows(payload.source);
    }
  }
  if (payload.hasBody) return undefined;
  const attributes = parseCanonicalTelegramActionAttributes(payload.source);
  return attributes ? [[attributes]] : undefined;
}

export function normalizeMarkdownAfterVoiceExtraction(
  markdown: string,
): string {
  return markdown.replace(/\n{3,}/g, "\n\n").trim();
}

export function stripTelegramCommentMarkupForPreview(markdown: string): string {
  const withoutClosedBlocks = replaceTopLevelHtmlComments(markdown, () => "");
  const openBlockIndex =
    findTopLevelOpenOrPartialHtmlCommentIndex(withoutClosedBlocks);
  const previewMarkdown =
    openBlockIndex >= 0
      ? withoutClosedBlocks.slice(0, openBlockIndex)
      : withoutClosedBlocks;
  return normalizeMarkdownAfterVoiceExtraction(previewMarkdown);
}

export function stripTelegramCommentMarkupForDelivery(
  markdown: string,
): string {
  const withoutClosedBlocks = replaceTopLevelHtmlComments(markdown, () => "");
  const openBlockIndex =
    findTopLevelOpenOrPartialHtmlCommentIndex(withoutClosedBlocks);
  const deliveryMarkdown =
    openBlockIndex >= 0
      ? withoutClosedBlocks.slice(0, openBlockIndex)
      : withoutClosedBlocks;
  return normalizeMarkdownAfterVoiceExtraction(deliveryMarkdown);
}

export function stripTelegramVoiceMarkupForPreview(markdown: string): string {
  return stripTelegramCommentMarkupForPreview(markdown);
}

export interface TelegramVoiceReplyItem {
  text: string;
  lang?: string;
  rate?: string;
}

export interface TelegramVoiceReplyPlan {
  markdown: string;
  voiceText?: string;
  voiceReplies?: TelegramVoiceReplyItem[];
  lang?: string;
  rate?: string;
}

function getTelegramActionString(
  payload: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = payload[key];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

export function planTelegramVoiceReply(
  markdown: string,
): TelegramVoiceReplyPlan {
  const voiceReplies: TelegramVoiceReplyItem[] = [];
  let lang: string | undefined;
  let rate: string | undefined;
  const stripped = replaceTopLevelHtmlComments(markdown, (comment) => {
    const command = parseTopLevelTelegramComment(comment, "telegram_voice");
    if (!command) return comment.raw;
    const payload = parseTelegramActionPayload(comment, "telegram_voice");
    if (!payload) return "";
    const text =
      getTelegramActionString(payload, "text") ??
      getTelegramActionString(payload, "value");
    const itemLang = getTelegramActionString(payload, "lang");
    const itemRate = getTelegramActionString(payload, "rate");
    if (text) {
      voiceReplies.push({
        text,
        ...(itemLang ? { lang: itemLang } : {}),
        ...(itemRate ? { rate: itemRate } : {}),
      });
    }
    if (itemLang) lang = itemLang;
    if (itemRate) rate = itemRate;
    return "";
  });
  const voiceText = voiceReplies
    .map((reply) => reply.text)
    .join("\n\n")
    .trim();
  return {
    markdown: stripTelegramCommentMarkupForDelivery(stripped),
    ...(voiceText ? { voiceText } : {}),
    ...(voiceReplies.length > 0 ? { voiceReplies } : {}),
    ...(lang ? { lang } : {}),
    ...(rate ? { rate } : {}),
  };
}
