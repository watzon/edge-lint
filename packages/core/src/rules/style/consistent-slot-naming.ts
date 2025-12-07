/**
 * Rule: consistent-slot-naming
 *
 * Enforces consistent naming convention for slots.
 * Default is camelCase to match JavaScript conventions.
 */

import type { Rule, TagToken, MustacheToken, TokenVisitor, RuleContext } from '../../types/index.js';

type NamingStyle = 'camelCase' | 'snake_case' | 'PascalCase';

// Check if string matches camelCase: starts lowercase, no underscores/hyphens
function isCamelCase(str: string): boolean {
  return /^[a-z][a-zA-Z0-9]*$/.test(str);
}

// Check if string matches snake_case
function isSnakeCase(str: string): boolean {
  return /^[a-z][a-z0-9_]*$/.test(str);
}

// Check if string matches PascalCase
function isPascalCase(str: string): boolean {
  return /^[A-Z][a-zA-Z0-9]*$/.test(str);
}

// Convert to expected style (for suggestions)
function toStyle(str: string, style: NamingStyle): string {
  // Normalize to words
  const words = str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .toLowerCase()
    .split(/\s+/);

  switch (style) {
    case 'camelCase':
      return words.map((w, i) => i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)).join('');
    case 'snake_case':
      return words.join('_');
    case 'PascalCase':
      return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  }
}

function matchesStyle(str: string, style: NamingStyle): boolean {
  // 'main' is always valid (single word)
  if (!/[A-Z_-]/.test(str) && str === str.toLowerCase()) return true;

  switch (style) {
    case 'camelCase': return isCamelCase(str);
    case 'snake_case': return isSnakeCase(str);
    case 'PascalCase': return isPascalCase(str);
  }
}

// Pattern to extract slot name from @slot('name') or $slots.name
const SLOT_TAG_PATTERN = /^['"]([^'"]+)['"]/;
const SLOTS_ACCESS_PATTERN = /\$slots\.(\w+)/g;

export const consistentSlotNaming: Rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce consistent slot naming convention',
      category: 'Style',
      recommended: false,
    },
    schema: [
      {
        type: 'object',
        properties: {
          style: {
            enum: ['camelCase', 'snake_case', 'PascalCase'],
            default: 'camelCase',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      wrongStyle: 'Slot name "{{ name }}" should be in {{ style }}. Consider "{{ suggested }}".',
    },
  },

  create(context: RuleContext): TokenVisitor {
    const options = context.options[0] as { style?: NamingStyle } | undefined;
    const style = options?.style ?? 'camelCase';
    const checkedNames = new Set<string>(); // Avoid duplicate reports

    function checkSlotName(name: string, node: TagToken | MustacheToken): void {
      // Skip 'main' - it's always valid
      if (name === 'main') return;

      // Skip already checked
      if (checkedNames.has(name)) return;
      checkedNames.add(name);

      if (!matchesStyle(name, style)) {
        context.report({
          node,
          messageId: 'wrongStyle',
          data: {
            name,
            style,
            suggested: toStyle(name, style),
          },
        });
      }
    }

    return {
      Tag(token: TagToken) {
        if (token.properties.name === 'slot') {
          const match = token.properties.jsArg.match(SLOT_TAG_PATTERN);
          if (match) {
            checkSlotName(match[1], token);
          }
        }
      },
      Mustache(token: MustacheToken) {
        const expr = token.properties.jsArg;
        SLOTS_ACCESS_PATTERN.lastIndex = 0;
        let match;
        while ((match = SLOTS_ACCESS_PATTERN.exec(expr)) !== null) {
          checkSlotName(match[1], token);
        }
      },
      SafeMustache(token: MustacheToken) {
        const expr = token.properties.jsArg;
        SLOTS_ACCESS_PATTERN.lastIndex = 0;
        let match;
        while ((match = SLOTS_ACCESS_PATTERN.exec(expr)) !== null) {
          checkSlotName(match[1], token);
        }
      },
    };
  },
};
