/**
 * Regression tests for Telegram outbound button helpers
 * Exercises assistant-authored button markup extraction, action storage, callback handling, and prompt-turn construction
 */

import assert from "node:assert/strict";
import test from "node:test";

import {
  createTelegramButtonActionStore,
  createTelegramButtonPromptTurn,
  handleTelegramButtonCallbackQuery,
  planTelegramButtonReply,
} from "../lib/outbound-buttons.ts";

test("Button reply planner strips telegram_button markup and registers actions", () => {
  const actions: unknown[] = [];
  const plan = planTelegramButtonReply(
    [
      "Visible answer.",
      "",
      '<!-- telegram_button {"label":"Run","prompt":"Run the workflow."} -->',
      "",
      "Tail.",
    ].join("\n"),
    {
      registerAction: (action) => {
        actions.push(action);
        return `btn:${actions.length}`;
      },
    },
  );

  assert.equal(plan.markdown, "Visible answer.\n\nTail.");
  assert.deepEqual(actions, [{ text: "Run", prompt: "Run the workflow." }]);
  assert.deepEqual(plan.replyMarkup, {
    inline_keyboard: [[{ text: "Run", callback_data: "btn:1" }]],
  });
});

test("Button reply planner accepts JSON and attributes with one action marker", () => {
  const actions: unknown[] = [];
  const plan = planTelegramButtonReply(
    [
      '<!-- telegram_button {"label":"JSON","prompt":"Run JSON."} -->',
      '<!-- telegram_button {"label":"Styled JSON","prompt":"Run styled JSON.","selected_style":"success"} -->',
      '<!-- telegram_button label="Attributes" prompt="Run attributes." -->',
      '<!-- telegram_button {"value":"JSON value"} -->',
      '<!-- telegram_button value="Attribute value" -->',
      '<!-- telegram_button {"value":"Fallback prompt","label":"Explicit label"} -->',
    ].join("\n"),
    {
      registerAction: (action) => {
        actions.push(action);
        return `btn:${actions.length}`;
      },
    },
  );

  assert.deepEqual(actions, [
    { text: "JSON", prompt: "Run JSON." },
    {
      text: "Styled JSON",
      prompt: "Run styled JSON.",
      selectedStyle: "success",
    },
    { text: "Attributes", prompt: "Run attributes." },
    { text: "JSON value", prompt: "JSON value" },
    { text: "Attribute value", prompt: "Attribute value" },
    { text: "Explicit label", prompt: "Fallback prompt" },
  ]);
  assert.deepEqual(plan.replyMarkup, {
    inline_keyboard: [
      [{ text: "JSON", callback_data: "btn:1" }],
      [{ text: "Styled JSON", callback_data: "btn:2" }],
      [{ text: "Attributes", callback_data: "btn:3" }],
      [{ text: "JSON value", callback_data: "btn:4" }],
      [{ text: "Attribute value", callback_data: "btn:5" }],
      [{ text: "Explicit label", callback_data: "btn:6" }],
    ],
  });
});

test("Button reply planner expands JSON arrays, compact rows, and the telegram_buttons alias", () => {
  const actions: unknown[] = [];
  const plan = planTelegramButtonReply(
    [
      '<!-- telegram_button [{"label":"⬆️ Up","prompt":"/"},[{"value":"⬅️ Previous"},{"value":"➡️ Next"}],{"label":"📁 etc","prompt":"/etc"},{"label":"📁 home","prompt":"/home","selected_style":"success"}] -->',
      '<!-- telegram_buttons [{"value":"Next"},{"label":"Refresh","prompt":"/"}] -->',
      '<!-- telegram_buttons {"label":"Single alias","prompt":"One more."} -->',
    ].join("\n"),
    {
      registerAction: (action) => {
        actions.push(action);
        return `btn:${actions.length}`;
      },
    },
  );

  assert.deepEqual(actions, [
    { text: "⬆️ Up", prompt: "/" },
    { text: "⬅️ Previous", prompt: "⬅️ Previous" },
    { text: "➡️ Next", prompt: "➡️ Next" },
    { text: "📁 etc", prompt: "/etc" },
    { text: "📁 home", prompt: "/home", selectedStyle: "success" },
    { text: "Next", prompt: "Next" },
    { text: "Refresh", prompt: "/" },
    { text: "Single alias", prompt: "One more." },
  ]);
  assert.deepEqual(plan.replyMarkup, {
    inline_keyboard: [
      [{ text: "⬆️ Up", callback_data: "btn:1" }],
      [
        { text: "⬅️ Previous", callback_data: "btn:2" },
        { text: "➡️ Next", callback_data: "btn:3" },
      ],
      [{ text: "📁 etc", callback_data: "btn:4" }],
      [{ text: "📁 home", callback_data: "btn:5" }],
      [{ text: "Next", callback_data: "btn:6" }],
      [{ text: "Refresh", callback_data: "btn:7" }],
      [{ text: "Single alias", callback_data: "btn:8" }],
    ],
  });
});

test("Button reply planner leaves compact-row width to the renderer profile", () => {
  let nextId = 0;
  const plan = planTelegramButtonReply(
    '<!-- telegram_button [[{"value":"1"},{"value":"2"},{"value":"3"},{"value":"4"},{"value":"5"},{"value":"6"},{"value":"7"},{"value":"8"}]] -->',
    { registerAction: () => `btn:${++nextId}` },
  );

  assert.deepEqual(plan.replyMarkup?.inline_keyboard, [
    [
      { text: "1", callback_data: "btn:1" },
      { text: "2", callback_data: "btn:2" },
      { text: "3", callback_data: "btn:3" },
      { text: "4", callback_data: "btn:4" },
      { text: "5", callback_data: "btn:5" },
      { text: "6", callback_data: "btn:6" },
      { text: "7", callback_data: "btn:7" },
      { text: "8", callback_data: "btn:8" },
    ],
  ]);
});

test("Button reply planner decodes compact matrix literals", () => {
  const actions: unknown[] = [];
  const plan = planTelegramButtonReply(
    String.raw`<!-- telegram_button [{  Up  | / }[{1}{2}{3}{4}{5}{6}{7}{8}]{Stop|music-player::stop|danger}{A {["x"], v1: \| B|C:\\Games\}}] -->`,
    {
      registerAction: (action) => {
        actions.push(action);
        return `btn:${actions.length}`;
      },
    },
  );

  assert.deepEqual(actions, [
    { text: "Up", prompt: "/" },
    { text: "1", prompt: "1" },
    { text: "2", prompt: "2" },
    { text: "3", prompt: "3" },
    { text: "4", prompt: "4" },
    { text: "5", prompt: "5" },
    { text: "6", prompt: "6" },
    { text: "7", prompt: "7" },
    { text: "8", prompt: "8" },
    {
      text: "Stop",
      prompt: "music-player::stop",
      selectedStyle: "danger",
    },
    { text: 'A {["x"], v1: | B', prompt: "C:\\Games}" },
  ]);
  assert.deepEqual(
    plan.replyMarkup?.inline_keyboard.map((row) =>
      row.map((button) => button.text),
    ),
    [
      ["Up"],
      ["1", "2", "3", "4", "5", "6", "7", "8"],
      ["Stop"],
      ['A {["x"], v1: | B'],
    ],
  );
});

test("Button reply planner preserves semantics across adaptive JSON and CML compression", () => {
  const sources = [
    '[[{"label":"Pause","prompt":"music::pause"},{"value":"Next"}],{"value":"Status"}]',
    '[[{"label":"Pause","prompt":"music::pause"}{"value":"Next"}]{"value":"Status"}]',
    '[[{"label":"Pause","prompt":"music::pause"},{Next}],{Status}]',
    '[[{Pause|music::pause}{Next}]{Status}]',
  ];
  for (const source of sources) {
    const actions: unknown[] = [];
    const plan = planTelegramButtonReply(
      `<!-- telegram_button ${source} -->`,
      {
        registerAction: (action) => {
          actions.push(action);
          return `btn:${actions.length}`;
        },
      },
    );
    assert.deepEqual(actions, [
      { text: "Pause", prompt: "music::pause" },
      { text: "Next", prompt: "Next" },
      { text: "Status", prompt: "Status" },
    ]);
    assert.deepEqual(
      plan.replyMarkup?.inline_keyboard.map((row) =>
        row.map((button) => button.text),
      ),
      [["Pause", "Next"], ["Status"]],
    );
  }
});

test("Compact button style accepts exactly the selected-style enum", () => {
  for (const selectedStyle of ["primary", "success", "danger"] as const) {
    const actions: unknown[] = [];
    planTelegramButtonReply(
      `<!-- telegram_button {Run|run-now|${selectedStyle}} -->`,
      {
        registerAction: (action) => {
          actions.push(action);
          return "tgbtn:styled";
        },
      },
    );
    assert.deepEqual(actions, [
      { text: "Run", prompt: "run-now", selectedStyle },
    ]);
  }
});

test("Button reply planner ignores payloads outside the canonical action shape", () => {
  const actions: unknown[] = [];
  const plan = planTelegramButtonReply(
    [
      '<!-- telegram_button [{"value":"Valid"},null] -->',
      '<!-- telegram_button [1,2] -->',
      '<!-- telegram_button [[]] -->',
      '<!-- telegram_button [[[{"value":"Nested too deeply"}]]] -->',
      '<!-- telegram_button {"label":"Missing prompt"} -->',
      '<!-- telegram_button [{"value":"Valid"}{"label":"Missing prompt"}] -->',
      '<!-- telegram_button label=Continue prompt="Continue." -->',
      '<!-- telegram_button label="Continue"\nContinue.\n-->',
    ].join("\n"),
    {
      registerAction: (action) => {
        actions.push(action);
        return `btn:${actions.length}`;
      },
    },
  );

  assert.equal(plan.markdown, "");
  assert.deepEqual(plan.replyMarkup, undefined);
  assert.deepEqual(actions, []);
});

test("Button reply planner rejects malformed compact matrix literals atomically", () => {
  for (const payload of [
    "{}",
    "{   }",
    "{x|}",
    "{x|   }",
    "{|x}",
    "{x|y|unknown}",
    "{x|y|}",
    "{x||danger}",
    "{x|y|danger|extra}",
    String.raw`{x\q}`,
    "{x\\",
    "[]",
    "[[]]",
    "{x",
    "[{x}",
    "[{x}}]",
    "[[[{deep}]]]",
    "[,{a}]",
    "[{a},,{b}]",
    "[{a},]",
    "{x|line\nbreak}",
    "[{x}] trailing",
  ]) {
    const actions: unknown[] = [];
    const plan = planTelegramButtonReply(
      `<!-- telegram_button ${payload} -->`,
      {
        registerAction: (action) => {
          actions.push(action);
          return `btn:${actions.length}`;
        },
      },
    );
    assert.equal(plan.markdown, "");
    assert.deepEqual(plan.replyMarkup, undefined);
    assert.deepEqual(actions, []);
  }
});

test("Button reply planner supplies visible text and stores selected style for a button-only reply", () => {
  const actions: unknown[] = [];
  const plan = planTelegramButtonReply(
    '<!-- telegram_button label="Continue" prompt="Continue now." selected_style="danger" -->',
    {
      registerAction: (action) => {
        actions.push(action);
        return "tgbtn:continue";
      },
    },
  );

  assert.equal(plan.markdown, "☑️ **Choose an option:**");
  assert.deepEqual(actions, [
    { text: "Continue", prompt: "Continue now.", selectedStyle: "danger" },
  ]);
  assert.deepEqual(plan.replyMarkup, {
    inline_keyboard: [
      [{ text: "Continue", callback_data: "tgbtn:continue" }],
    ],
  });
});

test("Button reply planner retains hidden Generative App revision binding in stored actions", () => {
  const store = createTelegramButtonActionStore();
  const plan = planTelegramButtonReply(
    "<!-- telegram_button {Next|counter::increment} -->",
    {
      registerAction: store.register,
      binding: { generation: "generation-a", app: "counter", revision: 4 },
    },
  );
  const callbackData = plan.replyMarkup?.inline_keyboard[0]?.[0]?.callback_data;
  assert.deepEqual(store.resolve(callbackData), {
    binding: { generation: "generation-a", app: "counter", revision: 4 },
    prompt: "counter::increment",
    text: "Next",
  });
});

test("Button action store resolves registered actions once and expires old entries", () => {
  const store = createTelegramButtonActionStore();
  const callbackData = store.register({
    text: "Run",
    prompt: "Do it.",
    selectedStyle: "primary",
  });

  assert.deepEqual(store.resolve(callbackData), {
    text: "Run",
    prompt: "Do it.",
    selectedStyle: "primary",
  });
  assert.equal(store.resolve(callbackData), undefined);
  assert.equal(store.resolve("other:callback"), undefined);

  const expiringStore = createTelegramButtonActionStore({ ttlMs: -1 });
  const expiredCallbackData = expiringStore.register({
    text: "Expired",
    prompt: "Too late.",
  });
  assert.equal(expiringStore.resolve(expiredCallbackData), undefined);
});

test("Button prompt turn preserves prompt text and queue metadata", () => {
  const turn = createTelegramButtonPromptTurn({
    chatId: 10,
    replyToMessageId: 20,
    queueOrder: 30,
    action: { text: "Run", prompt: "Run this now." },
    target: { chatId: 10, threadId: 40 },
  });

  assert.equal(turn.kind, "prompt");
  assert.equal(turn.chatId, 10);
  assert.deepEqual(turn.target, { chatId: 10, threadId: 40 });
  assert.equal(turn.replyToMessageId, 20);
  assert.equal(turn.queueLane, "priority");
  assert.deepEqual(turn.sourceMessageIds, [20]);
  assert.deepEqual(turn.content, [
    { type: "text", text: "[telegram] Run this now." },
  ]);
  assert.equal(turn.historyText, "Run this now.");
  assert.equal(turn.statusSummary, "Run");
});

test("Button callback handler keeps successful bound actions successful when old styling fails", async () => {
  const answered: string[] = [];
  const invoked: string[] = [];
  const edited: unknown[] = [];
  const handled = await handleTelegramButtonCallbackQuery(
    {
      id: "q-bound",
      data: "tgbtn:bound",
      message: {
        message_id: 2,
        chat: { id: 1 },
        reply_markup: {
          inline_keyboard: [
            [{ text: "Next", callback_data: "tgbtn:bound" }],
          ],
        },
      },
    },
    "ctx",
    {
      resolveAction: () => ({ text: "Next", prompt: "music::next" }),
      answerCallbackQuery: async (_id, text) => {
        answered.push(text ?? "");
      },
      invokeBoundAction: async (_query, action) => {
        invoked.push(action.prompt);
        return "new";
      },
      enqueueButtonPrompt: () => {
        throw new Error("bound actions must not enter the model queue");
      },
      editMessageReplyMarkup: async (chatId, messageId, replyMarkup) => {
        edited.push({ chatId, messageId, replyMarkup });
        throw new Error("old message cannot be restyled");
      },
    },
  );
  assert.equal(handled, true);
  assert.deepEqual(invoked, ["music::next"]);
  assert.deepEqual(answered, ["Done."]);
  assert.equal(edited.length, 1);
});

test("Button callback handler answers bound-action failures without queue fallback", async () => {
  const answered: string[] = [];
  await assert.rejects(
    handleTelegramButtonCallbackQuery(
      {
        id: "q-bound-failed",
        data: "tgbtn:bound-failed",
        message: { message_id: 2, chat: { id: 1 } },
      },
      "ctx",
      {
        resolveAction: () => ({ text: "Broken", prompt: "music::broken" }),
        answerCallbackQuery: async (_id, text) => {
          answered.push(text ?? "");
        },
        invokeBoundAction: async () => {
          throw new Error("app failed");
        },
        enqueueButtonPrompt: () => {
          throw new Error("failed bound actions must not enter the model queue");
        },
      },
    ),
    /app failed/,
  );
  assert.deepEqual(answered, ["Generative App action failed."]);
});

test("Button callback handler enqueues owned actions, marks the selected button, and consumes expired buttons", async () => {
  const answered: string[] = [];
  const enqueued: unknown[] = [];
  const edited: unknown[] = [];
  const handled = await handleTelegramButtonCallbackQuery(
    {
      id: "q1",
      data: "tgbtn:live",
      message: {
        message_id: 2,
        chat: { id: 1 },
        reply_markup: {
          inline_keyboard: [
            [
              { text: "🚀 Run", callback_data: "tgbtn:live" },
              { text: "Wait", callback_data: "tgbtn:wait" },
            ],
          ],
        },
      },
    },
    "ctx",
    {
      resolveAction: () => ({
        text: "Run",
        prompt: "Run it.",
        selectedStyle: "danger",
      }),
      answerCallbackQuery: async (_id, text) => {
        answered.push(text ?? "");
      },
      enqueueButtonPrompt: (query, action, ctx) => {
        enqueued.push({ query, action, ctx });
      },
      editMessageReplyMarkup: async (chatId, messageId, replyMarkup) => {
        edited.push({ chatId, messageId, replyMarkup });
      },
    },
  );

  assert.equal(handled, true);
  assert.deepEqual(answered, ["Queued."]);
  assert.equal(enqueued.length, 1);
  assert.deepEqual(edited, [
    {
      chatId: 1,
      messageId: 2,
      replyMarkup: {
        inline_keyboard: [
          [
            {
              text: "🚀 Run",
              callback_data: "tgbtn:live",
              style: "danger",
            },
            { text: "Wait", callback_data: "tgbtn:wait" },
          ],
        ],
      },
    },
  ]);

  const expired = await handleTelegramButtonCallbackQuery(
    { id: "q2", data: "tgbtn:expired" },
    "ctx",
    {
      resolveAction: () => undefined,
      answerCallbackQuery: async (_id, text) => {
        answered.push(text ?? "");
      },
      enqueueButtonPrompt: () => {
        throw new Error("must not enqueue expired buttons");
      },
    },
  );

  assert.equal(expired, true);
  assert.deepEqual(answered, ["Queued.", "Button action expired."]);

  const duplicate = await handleTelegramButtonCallbackQuery(
    {
      id: "q3",
      data: "tgbtn:duplicate",
      message: {
        message_id: 3,
        chat: { id: 1 },
        reply_markup: {
          inline_keyboard: [
            [{ text: "Run", callback_data: "tgbtn:duplicate" }],
          ],
        },
      },
    },
    "ctx",
    {
      resolveAction: () => ({ text: "Run", prompt: "Run it." }),
      answerCallbackQuery: async (_id, text) => {
        answered.push(text ?? "");
      },
      enqueueButtonPrompt: () => false,
      editMessageReplyMarkup: async () => {
        throw new Error("must not mark a prompt that was not queued");
      },
    },
  );
  assert.equal(duplicate, true);
  assert.deepEqual(answered, [
    "Queued.",
    "Button action expired.",
    "Already queued.",
  ]);
});
