/**
 * Rule: no-deprecated-props-api
 *
 * Disallows deprecated $props methods that were changed in Edge.js v6:
 * - $props.serialize() -> $props.toAttrs()
 * - $props.serializeExcept(['x']) -> $props.except(['x']).toAttrs()
 * - $props.serializeOnly(['x']) -> $props.only(['x']).toAttrs()
 */

import type { Rule, MustacheToken, TokenVisitor, RuleContext } from '../../types/index.js';

// Deprecated props methods and their replacements
const DEPRECATED_METHODS: Record<string, { replacement: string; message: string }> = {
  serialize: {
    replacement: '$props.toAttrs()',
    message:
      '"$props.serialize()" was removed in Edge.js v6. Use "$props.toAttrs()" instead.',
  },
  serializeExcept: {
    replacement: '$props.except([...]).toAttrs()',
    message:
      '"$props.serializeExcept([...])" was removed in Edge.js v6. Use "$props.except([...]).toAttrs()" instead.',
  },
  serializeOnly: {
    replacement: '$props.only([...]).toAttrs()',
    message:
      '"$props.serializeOnly([...])" was removed in Edge.js v6. Use "$props.only([...]).toAttrs()" instead.',
  },
};

// Regex to match $props.serialize, $props.serializeExcept, $props.serializeOnly
const PROPS_METHOD_REGEX = /\$props\.(serialize|serializeExcept|serializeOnly)\s*\(/g;

export const noDeprecatedPropsApi: Rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow deprecated $props methods removed in Edge.js v6',
      category: 'Syntax',
      recommended: true,
      url: 'https://edgejs.dev/docs/changelog/upgrading-to-v6',
    },
    messages: {
      deprecated: '{{ message }}',
    },
  },

  create(context: RuleContext): TokenVisitor {
    function checkMustache(token: MustacheToken): void {
      const expression = token.properties.jsArg;

      // Find all deprecated $props method usages
      let match: RegExpExecArray | null;
      PROPS_METHOD_REGEX.lastIndex = 0; // Reset regex state

      while ((match = PROPS_METHOD_REGEX.exec(expression)) !== null) {
        const methodName = match[1];
        const methodInfo = DEPRECATED_METHODS[methodName];

        if (methodInfo) {
          context.report({
            node: token,
            messageId: 'deprecated',
            data: { message: methodInfo.message },
          });
        }
      }
    }

    return {
      Mustache: checkMustache,
      SafeMustache: checkMustache,
    };
  },
};
