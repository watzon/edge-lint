/**
 * Rule: require-slot-await
 *
 * Ensures $slots calls are properly awaited.
 * Slots in Edge.js are async functions and must be awaited.
 *
 * Good: {{{ await $slots.main() }}}
 * Bad: {{{ $slots.main() }}}
 */

import type { Rule, MustacheToken, TokenVisitor, RuleContext } from '../../types/index.js';

// Pattern to detect $slots.xxx() calls (to extract slot name)
const SLOTS_CALL = /\$slots\.(\w+)\s*\(/g;

// Pattern to check if await is present before $slots
const HAS_AWAIT = /\bawait\s+\$slots\.(\w+)\s*\(/;

export const requireSlotAwait: Rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require await when calling $slots',
      category: 'Best Practices',
      recommended: true,
      url: 'https://edgejs.dev/docs/components/slots',
    },
    fixable: 'code',
    messages: {
      missingAwait:
        'Slot calls must be awaited. Use "await $slots.{{ name }}()" instead of "$slots.{{ name }}()".',
    },
  },

  create(context: RuleContext): TokenVisitor {
    function checkMustache(token: MustacheToken): void {
      const expr = token.properties.jsArg;

      // Reset regex state
      SLOTS_CALL.lastIndex = 0;

      // Find all $slots.xxx() calls
      const slotsMatches = Array.from(expr.matchAll(SLOTS_CALL));

      if (slotsMatches.length === 0) {
        return; // No slot calls found
      }

      // Check if the expression already has await before $slots
      if (HAS_AWAIT.test(expr)) {
        return; // Already has await, all good
      }

      // Report each slot call without await
      for (const match of slotsMatches) {
        const slotName = match[1];

        context.report({
          node: token,
          messageId: 'missingAwait',
          data: { name: slotName },
          fix(fixer) {
            const sourceCode = context.getSourceCode();
            const range = sourceCode.getRange(token);
            if (!range) return null;

            const text = sourceCode.getText(token);

            // Find the position to insert "await "
            // We need to find where $slots appears in the token text
            // Token text includes {{ or {{{ at the start

            // Determine the mustache opening ({{ or {{{)
            const openingMatch = text.match(/^(\{\{\{?)/);
            if (!openingMatch) return null;

            const opening = openingMatch[1];
            const closingLength = opening.length; // Same length for closing

            // Extract the inner expression (without mustache braces)
            const innerStart = opening.length;
            const innerEnd = text.length - closingLength;
            const innerExpr = text.slice(innerStart, innerEnd);

            // Find the position of this specific $slots call in the inner expression
            const slotsPosition = innerExpr.indexOf(`$slots.${slotName}(`);
            if (slotsPosition === -1) return null;

            // Check if there's already whitespace before $slots
            const beforeSlots = innerExpr.slice(0, slotsPosition);
            const needsSpace = beforeSlots.length > 0 && !beforeSlots.match(/\s$/);

            // Insert "await " (with space if needed) before $slots
            const newInnerExpr =
              innerExpr.slice(0, slotsPosition) +
              (needsSpace ? ' ' : '') +
              'await ' +
              innerExpr.slice(slotsPosition);

            const newText = opening + newInnerExpr + text.slice(-closingLength);

            return fixer.replaceTextRange(range, newText);
          },
        });

        // Only report once per mustache (even if multiple slot calls)
        break;
      }
    }

    return {
      Mustache: checkMustache,
      SafeMustache: checkMustache,
    };
  },
};
