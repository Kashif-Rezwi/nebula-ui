import type { UIMessage, Message } from '../types';

/**
 * Converts a backend database message to a UI-ready message format.
 * This ensures all metadata and tool calls are correctly structured for the frontend.
 * 
 * @param msg - The backend message object
 * @returns A UI-compatible message object with properly formatted parts and metadata
 */
export function toUIMessage(msg: Message): UIMessage {
    let parts: any[] = [];

    // 1. Use parts if available (multi-modal), otherwise fallback to content (legacy/text-only)
    if (msg.parts && Array.isArray(msg.parts) && msg.parts.length > 0) {
        parts = [...msg.parts];
    } else {
        // Wrap legacy content-only messages in a text part
        parts = [{ type: 'text', text: msg.content || '' }];
    }

    // 2. Strict checks on toolCalls existence
    //
    // NOTE: For modern messages the same tool calls are ALREADY stored as tool
    // parts inside `msg.parts` (e.g. `tool-tavily_web_search`). `metadata.toolCalls`
    // is a legacy/secondary index that also holds them. If we blindly append them
    // here we duplicate the tool part, which made the web-search summary render
    // twice inside a single assistant bubble. So we only add a metadata tool call
    // when an equivalent tool part is NOT already present.
    // Minimal shape needed to identify/dedupe tool parts without resorting to `any`
    interface ToolPartLike {
        type?: string;
        args?: unknown;
        input?: unknown;
    }

    const isToolPart = (p: ToolPartLike) => p && (p.type === 'dynamic-tool' || (typeof p.type === 'string' && p.type.startsWith('tool')));

    // Stable signature so identical tool calls (parts vs metadata) collapse.
    const toolKey = (part: ToolPartLike) => {
        const type = part?.type || '';
        const args = part?.args ?? part?.input;
        let serialized = '';
        if (args != null) {
            try { serialized = JSON.stringify(args, Object.keys(args as Record<string, unknown>).sort()); } catch { serialized = ''; }
        }
        return `${type}:${serialized}`;
    };

    const existingToolKeys = new Set(parts.filter(isToolPart).map(toolKey));

    if (msg.metadata?.toolCalls && Array.isArray(msg.metadata.toolCalls)) {
        msg.metadata.toolCalls.forEach((toolCall) => {
            // Skip metadata tool calls that are already present as parts
            if (existingToolKeys.has(toolKey(toolCall))) {
                return;
            }

            // 3. Construct tool part cleanly
            const toolPart: Record<string, unknown> = {
                type: toolCall.type,
                state: toolCall.state,
            };

            // Ensure toolName is carried over if present
            if (toolCall.toolName) {
                toolPart.toolName = toolCall.toolName;
            }

            // Add output or error based on state
            if (toolCall.state === 'output-available' && toolCall.output) {
                toolPart.output = toolCall.output;
            } else if (toolCall.state === 'output-error' && toolCall.errorText) {
                toolPart.errorText = toolCall.errorText;
            }

            // If there are other args, ensure they are passed
            if (toolCall.args) {
                toolPart.args = toolCall.args;
            }

            parts.push(toolPart);
            existingToolKeys.add(toolKey(toolCall));
        });
    }

    // AI SDK v5 UIMessage only uses 'parts', no 'content' field
    return {
        id: msg.id,
        role: msg.role,
        parts,
        metadata: {
            createdAt: msg.createdAt,
            ...msg.metadata, // Spreads all metadata fields including mode info, toolCalls, sources
        },
    } as UIMessage;
}

/**
 * Converts an array of backend messages to UI messages.
 * Handles null or undefined inputs gracefully by returning an empty array.
 * 
 * @param messages - Array of backend messages
 * @returns Array of UI messages
 */
export function toUIMessages(messages?: Message[] | null): UIMessage[] {
    if (!messages) return [];
    return messages.map(toUIMessage);
}
