import type { UIMessage, Message, MessagePart, ToolCall } from '../types';

interface ToolPartLike {
  type?: string;
  args?: unknown;
  input?: unknown;
  toolName?: string;
  state?: string;
  output?: unknown;
  errorText?: string;
}

const isToolPart = (p: ToolPartLike): boolean =>
  Boolean(p && (p.type === 'dynamic-tool' || (typeof p.type === 'string' && p.type.startsWith('tool'))));

const toolKey = (part: ToolPartLike): string => {
  const type = part.type || '';
  const args = part.args ?? part.input;
  let serialized = '';
  if (args != null && typeof args === 'object') {
    try {
      serialized = JSON.stringify(args, Object.keys(args as Record<string, unknown>).sort());
    } catch {
      serialized = '';
    }
  }
  return `${type}:${serialized}`;
};

/**
 * Converts a backend database message to a UI-ready message format.
 */
export function toUIMessage(msg: Message): UIMessage {
  let parts: MessagePart[] = [];

  // 1. Use parts if available (multi-modal), otherwise fallback to content (legacy/text-only)
  if (msg.parts && Array.isArray(msg.parts) && msg.parts.length > 0) {
    parts = [...msg.parts];
  } else {
    parts = [{ type: 'text', text: msg.content || '' }];
  }

  // 2. Strict check and deduplication on toolCalls
  const existingToolKeys = new Set(
    parts.filter((p) => isToolPart(p as ToolPartLike)).map((p) => toolKey(p as ToolPartLike))
  );

  if (msg.metadata?.toolCalls && Array.isArray(msg.metadata.toolCalls)) {
    msg.metadata.toolCalls.forEach((toolCall: ToolCall) => {
      const toolPartLike: ToolPartLike = {
        type: toolCall.type,
        args: toolCall.args,
      };

      if (existingToolKeys.has(toolKey(toolPartLike))) {
        return;
      }

      const toolPart: Record<string, unknown> = {
        type: toolCall.type || 'dynamic-tool',
        state:
          toolCall.status === 'success'
            ? 'output-available'
            : toolCall.status === 'error'
            ? 'output-error'
            : 'pending',
      };

      if (toolCall.name) {
        toolPart.toolName = toolCall.name;
      }

      if (toolCall.status === 'success' && toolCall.result !== undefined) {
        toolPart.output = toolCall.result;
      } else if (toolCall.status === 'error' && toolCall.error) {
        toolPart.errorText = toolCall.error;
      }

      if (toolCall.args) {
        toolPart.args = toolCall.args;
      }

      parts.push(toolPart as MessagePart);
      existingToolKeys.add(toolKey(toolPartLike));
    });
  }

  return {
    id: msg.id,
    role: msg.role,
    parts,
    metadata: {
      createdAt: msg.createdAt,
      ...msg.metadata,
    },
  };
}

/**
 * Converts an array of backend messages to UI messages.
 */
export function toUIMessages(messages?: Message[] | null): UIMessage[] {
  if (!messages) return [];
  return messages.map(toUIMessage);
}

/**
 * Extracts plain text from a UIMessage
 */
export function getMessageText(msg: UIMessage): string {
  const parts = msg.parts || [];
  return parts
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map((part) => part.text)
    .join('');
}
