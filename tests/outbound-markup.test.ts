/**
 * Regression tests for Telegram outbound markup helpers
 * Exercises top-level assistant action comment parsing, stripping, and voice reply planning
 */

import assert from "node:assert/strict";
import test from "node:test";

import {
  collectTopLevelHtmlComments,
  planTelegramVoiceReply,
  stripTelegramCommentMarkupForDelivery,
  stripTelegramCommentMarkupForPreview,
} from "../lib/outbound-markup.ts";

test("Markup collector ignores comments inside fenced code", () => {
  const markdown = [
    "```",
    "<!-- telegram_voice: literal -->",
    "```",
    "",
    "<!-- telegram_voice: real -->",
  ].join("\n");

  const { comments } = collectTopLevelHtmlComments(markdown);

  assert.equal(comments.length, 1);
  assert.equal(comments[0]?.content.trim(), "telegram_voice: real");
});

test("Markup stripping removes closed and partial top-level comments", () => {
  assert.equal(
    stripTelegramCommentMarkupForDelivery(
      "Visible\n\n<!-- hidden transport action -->\n\nTail",
    ),
    "Visible\n\nTail",
  );
  assert.equal(
    stripTelegramCommentMarkupForPreview("Visible\n\n<!-- telegram_voice"),
    "Visible",
  );
});

test("Voice reply planner accepts JSON and attributes with one action marker", () => {
  const plan = planTelegramVoiceReply(
    [
      "Visible answer.",
      "",
      '<!-- telegram_voice {"text":"JSON voice.","lang":"ru"} -->',
      '<!-- telegram_voice {"text":"Rated JSON voice.","rate":"+10%"} -->',
      '<!-- telegram_voice text="Attribute voice." lang="en" -->',
      '<!-- telegram_voice {"value":"JSON value voice."} -->',
      '<!-- telegram_voice value="Attribute value voice." -->',
      '<!-- telegram_voice {"value":"Fallback voice.","text":"Explicit voice."} -->',
    ].join("\n"),
  );

  assert.equal(plan.markdown, "Visible answer.");
  assert.deepEqual(plan.voiceReplies, [
    { text: "JSON voice.", lang: "ru" },
    { text: "Rated JSON voice.", rate: "+10%" },
    { text: "Attribute voice.", lang: "en" },
    { text: "JSON value voice." },
    { text: "Attribute value voice." },
    { text: "Explicit voice." },
  ]);
});

test("Voice reply planner ignores payloads outside the canonical action shape", () => {
  const plan = planTelegramVoiceReply(
    [
      '<!-- telegram_voice [{"text":"Array is unsupported."}] -->',
      '<!-- telegram_voice {"lang":"ru"} -->',
      '<!-- telegram_voice {"text": -->',
      '<!-- telegram_voice text="Speak this." lang=ru -->',
      '<!-- telegram_voice lang="ru"\nSpeak this.\n-->',
    ].join("\n"),
  );

  assert.equal(plan.voiceText, undefined);
  assert.equal(plan.voiceReplies, undefined);
  assert.equal(plan.markdown, "");
});

test("Voice reply planner extracts multiple voice replies and cleans markdown", () => {
  const plan = planTelegramVoiceReply(
    [
      "Visible answer.",
      "",
      '<!-- telegram_voice {"text":"Первый ответ.","lang":"ru","rate":"+20%"} -->',
      "",
      '<!-- telegram_voice lang="en" text="Second answer." -->',
      "",
      "Tail.",
    ].join("\n"),
  );

  assert.equal(plan.markdown, "Visible answer.\n\nTail.");
  assert.equal(plan.voiceText, "Первый ответ.\n\nSecond answer.");
  assert.deepEqual(plan.voiceReplies, [
    { text: "Первый ответ.", lang: "ru", rate: "+20%" },
    { text: "Second answer.", lang: "en" },
  ]);
  assert.equal(plan.lang, "en");
  assert.equal(plan.rate, "+20%");
});
