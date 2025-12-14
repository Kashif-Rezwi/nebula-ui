import type { UIMessage, Message } from '../types';

/**
 * Converts a backend database message to a UI-ready message format.
 * This ensures all metadata and tool calls are correctly structured for the frontend.
 * 
 * @param msg - The backend message object
 * @returns A UI-compatible message object with properly formatted parts and metadata
 */
export function toUIMessage(msg: Message): UIMessage {
    // 1. Handle potential null content safely
    const parts: any[] = [
        { type: 'text', text: msg.content || '' }
    ];

    // 2. Strict checks on toolCalls existence
    if (msg.metadata?.toolCalls && Array.isArray(msg.metadata.toolCalls)) {
        msg.metadata.toolCalls.forEach((toolCall) => {
            // 3. Construct tool part cleanly
            const toolPart: Record<string, any> = {
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
        });
    }

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
