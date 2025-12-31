import * as t from '@babel/types';

// Type for variable scope map: variable name -> string literal value
type VariableScope = Map<string, string>;

// Type for function scope map: function name -> string literal return value
type FunctionScope = Map<string, string>;

/**
 * Checks if an expression node can produce a string output
 * that should be translated.
 */
function isTranslatableExpression(
  expression: t.Expression | t.JSXEmptyExpression
): boolean {
  if (t.isJSXEmptyExpression(expression)) {
    return false;
  }

  // Direct string literals
  if (t.isStringLiteral(expression)) {
    return true;
  }

  // Template literals (e.g., `Hello ${name}`)
  if (t.isTemplateLiteral(expression)) {
    return true;
  }

  // Conditional expressions (e.g., condition ? 'Yes' : 'No')
  if (t.isConditionalExpression(expression)) {
    return (
      isTranslatableExpression(expression.consequent) ||
      isTranslatableExpression(expression.alternate)
    );
  }

  // Logical expressions (e.g., show && 'Text')
  if (t.isLogicalExpression(expression)) {
    return (
      isTranslatableExpression(expression.left) ||
      isTranslatableExpression(expression.right)
    );
  }

  // Binary expressions - string concatenation (e.g., 'Hello ' + name)
  if (t.isBinaryExpression(expression) && expression.operator === '+') {
    const leftIsValid =
      t.isExpression(expression.left) &&
      isTranslatableExpression(expression.left);
    const rightIsValid =
      t.isExpression(expression.right) &&
      isTranslatableExpression(expression.right);
    return leftIsValid || rightIsValid;
  }

  // String method calls (e.g., text.toUpperCase())
  if (
    t.isMemberExpression(expression) &&
    !t.isPrivateName(expression.property)
  ) {
    return true;
  }

  // Function calls that might return strings
  // But skip array methods like map(), filter(), forEach() - they return JSX elements
  if (t.isCallExpression(expression)) {
    // Check if it's an array method call
    if (t.isMemberExpression(expression.callee)) {
      const memberExpr = expression.callee;
      if (t.isIdentifier(memberExpr.property)) {
        const methodName = memberExpr.property.name;
        const arrayMethods = [
          'map',
          'filter',
          'forEach',
          'reduce',
          'find',
          'some',
          'every',
        ];
        if (arrayMethods.includes(methodName)) {
          // Skip array methods - they don't return translatable strings
          return false;
        }
      }
    }
    return true;
  }

  // Variables that might contain strings
  // But skip React prop identifiers like 'children' which are not translatable strings
  if (t.isIdentifier(expression)) {
    // Skip common React prop names that should never be translated
    const reactPropNames = ['children', 'className', 'id', 'key', 'ref'];
    if (reactPropNames.includes(expression.name)) {
      return false;
    }
    return true;
  }

  return false;
}

/**
 * Resolves an identifier to its string literal value if available in scope
 */
function resolveIdentifierValue(
  identifier: t.Identifier,
  variableScope: VariableScope
): string | null {
  const varName = identifier.name;
  if (variableScope.has(varName)) {
    return variableScope.get(varName)!;
  }
  return null;
}

/**
 * Resolves a function call to its string literal return value if available in scope
 */
function resolveFunctionCall(
  callExpression: t.CallExpression,
  functionScope: FunctionScope
): string | null {
  if (t.isIdentifier(callExpression.callee)) {
    const funcName = callExpression.callee.name;
    if (functionScope.has(funcName)) {
      return functionScope.get(funcName)!;
    }
  }
  return null;
}

/**
 * Extracts a readable representation of an expression
 * for translation purposes.
 */
export function extractExpressionContent(
  expression: t.Expression | t.JSXEmptyExpression,
  variableScope: VariableScope = new Map(),
  functionScope: FunctionScope = new Map()
): string {
  if (t.isJSXEmptyExpression(expression)) {
    return '';
  }

  // String literal - return the value
  if (t.isStringLiteral(expression)) {
    return expression.value;
  }

  // Template literal - build representation
  // Use placeholders for variables so variable values can be translated separately
  // This allows "John" to be translated to "Juan" independently
  if (t.isTemplateLiteral(expression)) {
    let content = '';
    for (let i = 0; i < expression.quasis.length; i++) {
      content += expression.quasis[i].value.raw;
      if (i < expression.expressions.length) {
        // Always use placeholder for variables - don't resolve their values here
        // Variable values should be extracted separately and translated independently
        const expr = expression.expressions[i];
        if (t.isIdentifier(expr)) {
          // Use placeholder format: {variableName}
          // The variable value will be extracted separately and translated
          content += `{${expr.name}}`;
        } else {
          content += `{expr}`;
        }
      }
    }
    return content;
  }

  // Conditional expression - extract both branches
  // Extract both string values so they can be translated
  // Format preserves both values with a clear separator
  if (t.isConditionalExpression(expression)) {
    const consequent = extractExpressionContent(
      expression.consequent,
      variableScope,
      functionScope
    );
    const alternate = extractExpressionContent(
      expression.alternate,
      variableScope,
      functionScope
    );
    if (consequent && alternate) {
      // Return both strings with a clear conditional format
      // This format makes it clear these are two separate translatable strings
      // that belong to a conditional expression
      return `{? "${consequent}" : "${alternate}"}`;
    } else if (consequent) {
      return consequent;
    } else if (alternate) {
      return alternate;
    }
  }

  // Logical expression - extract the string part
  if (t.isLogicalExpression(expression)) {
    const left = extractExpressionContent(
      expression.left,
      variableScope,
      functionScope
    );
    const right = extractExpressionContent(
      expression.right,
      variableScope,
      functionScope
    );
    if (expression.operator === '&&' && right) {
      // For logical AND, the right side is the string that gets rendered
      // Return just the string value - the condition (left) doesn't need translation
      return right;
    }
    if (expression.operator === '||') {
      // For logical OR, return whichever side has a string value
      return left || right;
    }
  }

  // Binary expression - string concatenation
  if (t.isBinaryExpression(expression) && expression.operator === '+') {
    const left = t.isExpression(expression.left)
      ? extractExpressionContent(expression.left, variableScope, functionScope)
      : '';
    const right = t.isExpression(expression.right)
      ? extractExpressionContent(expression.right, variableScope, functionScope)
      : '';
    return left + right;
  }

  // Member expression - method calls
  if (
    t.isMemberExpression(expression) &&
    !t.isPrivateName(expression.property)
  ) {
    if (t.isIdentifier(expression.property)) {
      return `{variable.${expression.property.name}()}`;
    }
  }

  // Call expression - function calls
  if (t.isCallExpression(expression)) {
    // Handle method calls like text.toUpperCase()
    if (t.isMemberExpression(expression.callee)) {
      const memberExpr = expression.callee;
      // Check if object is an identifier (variable)
      if (t.isIdentifier(memberExpr.object)) {
        const varName = memberExpr.object.name;
        // Try to resolve the variable value
        const resolvedValue = resolveIdentifierValue(
          memberExpr.object,
          variableScope
        );

        if (resolvedValue !== null && t.isIdentifier(memberExpr.property)) {
          const methodName = memberExpr.property.name;
          // Try to call common string methods on the resolved value
          try {
            let result: string | null = null;
            switch (methodName) {
              case 'toUpperCase':
                result = resolvedValue.toUpperCase();
                break;
              case 'toLowerCase':
                result = resolvedValue.toLowerCase();
                break;
              case 'trim':
                result = resolvedValue.trim();
                break;
              case 'trimStart':
              case 'trimLeft':
                result = resolvedValue.trimStart();
                break;
              case 'trimEnd':
              case 'trimRight':
                result = resolvedValue.trimEnd();
                break;
              default:
                // For other methods, return the resolved value
                result = resolvedValue;
            }
            if (result !== null) {
              return result;
            }
          } catch {
            // If method call fails, fall through to default handling
          }
        }
      }
      // Fallback: return method call format
      if (t.isIdentifier(memberExpr.property)) {
        if (t.isIdentifier(memberExpr.object)) {
          return `{${memberExpr.object.name}.${memberExpr.property.name}()}`;
        }
        return `{variable.${memberExpr.property.name}()}`;
      }
    }
    // Handle regular function calls
    // Skip array methods like map(), filter(), forEach() - they return JSX elements, not strings
    if (t.isMemberExpression(expression.callee)) {
      const memberExpr = expression.callee;
      if (t.isIdentifier(memberExpr.property)) {
        const methodName = memberExpr.property.name;
        const arrayMethods = [
          'map',
          'filter',
          'forEach',
          'reduce',
          'find',
          'some',
          'every',
        ];
        if (arrayMethods.includes(methodName)) {
          // Skip array methods - they don't return translatable strings
          return '';
        }
      }
    }

    // Try to resolve function call to its return value
    if (t.isIdentifier(expression.callee)) {
      const resolvedValue = resolveFunctionCall(expression, functionScope);
      if (resolvedValue !== null) {
        // Return the actual string value instead of function call
        return resolvedValue;
      }
      // If we can't resolve the return value at build time, do NOT emit a placeholder
      // like "{fn()}" because the injector would replace runtime output and break UI.
      return '';
    }
  }

  // Identifier - variable reference
  // Try to resolve to string literal value
  if (t.isIdentifier(expression)) {
    // Skip React prop identifiers - these are not translatable strings
    // They are props passed to components, not user-facing text
    const reactPropNames = ['children', 'className', 'id', 'key', 'ref'];
    if (reactPropNames.includes(expression.name)) {
      return ''; // Don't extract React props as translatable strings
    }

    const resolvedValue = resolveIdentifierValue(expression, variableScope);
    if (resolvedValue !== null) {
      // Return the actual string value instead of variable name
      return resolvedValue;
    }
    // Fallback to variable name if can't resolve
    return `{${expression.name}}`;
  }

  return '';
}

/**
 * Builds a readable content string from a JSXElement node,
 * using pseudo-tags for JSXElements and trimmed text for JSXText.
 */
export function buildContent(
  node: t.JSXElement,
  variableScope: VariableScope = new Map(),
  functionScope: FunctionScope = new Map()
): string {
  let out = '';
  const children = node.children;

  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const prevChild = i > 0 ? children[i - 1] : null;
    const nextChild = i < children.length - 1 ? children[i + 1] : null;

    if (t.isJSXText(child)) {
      const text = child.value;
      // Preserve leading space if this text comes after an element or expression
      const hasLeadingSpace = /^\s/.test(text);
      const shouldPreserveLeadingSpace =
        hasLeadingSpace &&
        prevChild &&
        (t.isJSXElement(prevChild) || t.isJSXExpressionContainer(prevChild));

      // Preserve trailing space if this text comes before an element or expression
      const hasTrailingSpace = /\s$/.test(text);
      const shouldPreserveTrailingSpace =
        hasTrailingSpace &&
        nextChild &&
        (t.isJSXElement(nextChild) || t.isJSXExpressionContainer(nextChild));

      let processedText = text;
      if (shouldPreserveLeadingSpace && shouldPreserveTrailingSpace) {
        // Keep as-is (has spaces on both sides that are meaningful)
        processedText = text;
      } else if (shouldPreserveLeadingSpace) {
        // Preserve leading space, trim trailing
        processedText = text.trimEnd();
      } else if (shouldPreserveTrailingSpace) {
        // Preserve trailing space, trim leading
        processedText = text.trimStart();
      } else {
        // No meaningful spaces, trim both sides
        processedText = text.trim();
      }

      if (processedText) out += processedText;
    } else if (t.isJSXExpressionContainer(child)) {
      // Handle JSXExpressionContainer nodes
      // This includes: string literals, template literals, ternaries, logical expressions, etc.
      const expression = child.expression;

      if (isTranslatableExpression(expression)) {
        const content = extractExpressionContent(
          expression,
          variableScope,
          functionScope
        );
        if (content) {
          out += content;
        }
      }
    } else if (t.isJSXElement(child)) {
      const nameNode = child.openingElement.name;
      let name = 'Unknown';
      if (t.isJSXIdentifier(nameNode)) {
        name = nameNode.name;
      } else if (t.isJSXMemberExpression(nameNode)) {
        name = nameNode.property.name;
      }
      // Skip <p> tags - just include their content directly without the element wrapper
      if (name === 'p') {
        const inner = buildContent(
          child as t.JSXElement,
          variableScope,
          functionScope
        );
        out += inner;
      } else {
        // Recursively build inner content if needed
        const inner = buildContent(
          child as t.JSXElement,
          variableScope,
          functionScope
        );
        out += `<element:${name}>${inner}</element:${name}>`;
      }
    }
  }
  return out;
}

/**
 * Convert full AST path to a relative scope path
 */
export function getRelativeScopePath(fullPath: string): string {
  // Extract the meaningful part of the path after "program.body"
  const parts = fullPath.split('.');
  const bodyIndex = parts.findIndex((part) => part === 'body');
  if (bodyIndex !== -1 && parts[bodyIndex - 1] === 'program') {
    // Take everything after "program.body"
    const relativeParts = parts.slice(bodyIndex + 1);
    return relativeParts.join('/').replace(/\[(\d+)\]/g, '$1');
  }
  // Fallback: use the full path but clean it up
  return fullPath.replace(/\[(\d+)\]/g, '$1').replace(/\./g, '/');
}
