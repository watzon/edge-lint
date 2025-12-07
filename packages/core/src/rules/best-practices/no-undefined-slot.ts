/**
 * Rule: no-undefined-slot
 *
 * Warns when calling slots without checking if they exist first.
 * The $slots.main slot is exempt as it's typically always defined.
 *
 * Good: @if ($slots.meta) {{{ await $slots.meta() }}} @end
 * Risky: {{{ await $slots.meta() }}}  (no existence check)
 */

import type { Rule, MustacheToken, TokenVisitor, RuleContext } from '../../types/index.js';

// Pattern to detect slot calls: $slots.slotName()
const SLOT_CALL_PATTERN = /\$slots\.(\w+)\s*\(/g;

// Slots that don't need existence checks (always defined)
const EXEMPT_SLOTS = new Set(['main']);

export const noUndefinedSlot: Rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Warn when calling slots without existence check',
      category: 'Best Practices',
      recommended: false, // This can be noisy, so off by default
      url: 'https://edgejs.dev/docs/components/slots',
    },
    schema: [
      {
        type: 'object',
        properties: {
          exemptSlots: {
            type: 'array',
            items: { type: 'string' },
            description: 'Additional slot names to exempt from the check',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      missingCheck: 'Slot "$slots.{{ name }}" should be checked for existence before calling. Use "@if ($slots.{{ name }})" pattern.',
    },
  },

  create(context: RuleContext): TokenVisitor {
    const options = context.options[0] as { exemptSlots?: string[] } | undefined;
    const exemptSlots = new Set([...EXEMPT_SLOTS, ...(options?.exemptSlots ?? [])]);

    // Track which slots have been checked in the current scope
    // A slot is "checked" if it appears in an @if condition before the call

    // This is a simplified implementation - check if the mustache is inside
    // an @if block that checks for the slot's existence

    return {
      // Check mustache tokens for slot calls
      Mustache(token: MustacheToken) {
        checkSlotCalls(token, context, exemptSlots);
      },
      SafeMustache(token: MustacheToken) {
        checkSlotCalls(token, context, exemptSlots);
      },
    };
  },
};

function checkSlotCalls(
  token: MustacheToken,
  context: RuleContext,
  exemptSlots: Set<string>
): void {
  const expr = token.properties.jsArg;

  // Find all slot calls in the expression
  SLOT_CALL_PATTERN.lastIndex = 0;
  let match;

  while ((match = SLOT_CALL_PATTERN.exec(expr)) !== null) {
    const slotName = match[1];

    // Skip exempt slots
    if (exemptSlots.has(slotName)) continue;

    // Check if there's an existence check in the expression itself
    // e.g., $slots.foo && await $slots.foo()
    // or $slots.foo ? await $slots.foo() : ''
    const hasInlineCheck = new RegExp(`\\$slots\\.${slotName}\\s*(&&|\\?|\\|\\|)`).test(expr);

    if (hasInlineCheck) continue;

    // Check if we're inside an @if that checks this slot
    // This requires looking at parent tokens
    const sourceCode = context.getSourceCode();
    const ancestors = sourceCode.getAncestors(token);

    const hasIfCheck = ancestors.some((ancestor) => {
      if (ancestor.properties?.name === 'if') {
        const condition = ancestor.properties.jsArg;
        return condition.includes(`$slots.${slotName}`);
      }
      return false;
    });

    if (!hasIfCheck) {
      context.report({
        node: token,
        messageId: 'missingCheck',
        data: { name: slotName },
      });
      return; // Only report once per mustache
    }
  }
}
