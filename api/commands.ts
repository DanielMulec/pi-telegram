/**
 * Public Telegram commands API
 * Zones: package boundary, extension interop
 * Exposes the stable Telegram slash-command registration surface while keeping registry internals package-private
 */

export {
  listAllSessions,
  registerTelegramCommand,
  type ExtensionCommandContextActions,
  type TelegramExtensionCommandContext,
  type TelegramExtensionCommandRegistration,
  type TelegramExtensionCommandContextView,
  type TelegramSessionInfo,
  type TelegramSessionManager,
} from "../lib/commands.ts";
