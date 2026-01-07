import * as t from '@babel/types';

const VISIBLE_ATTRIBUTE_NAMES = new Set([
  'title',
  'alt',
  'aria-label',
  'aria-describedby',
  'aria-placeholder',
  'aria-valuetext',
  'aria-roledescription',
  'aria-live',
]);

const TECHNICAL_PROP_NAMES = new Set([
  'id',
  'className',
  'style',
  'key',
  'ref',
  'role',
  'tabIndex',
  'type',
  'name',
  'value',
  'checked',
  'disabled',
  'readOnly',
  'required',
  'multiple',
  'min',
  'max',
  'step',
  'pattern',
  'autoComplete',
  'inputMode',
  'form',
  'method',
  'action',
  'encType',
  'target',
  'rel',
  'download',
  'href',
  'src',
  // common styling/variant props (usually not user-visible text)
  'variant',
  'size',
  'color',
  'tone',
  'intent',
  'kind',
  'level',
  // common testing props
  'testId',
  'qa',
  'qaId',
]);

function isComponentJsxName(
  name: t.JSXOpeningElement['name'] | null | undefined
): boolean {
  if (!name) return false;
  if (t.isJSXIdentifier(name)) {
    // Custom components start with an uppercase letter
    return /^[A-Z]/.test(name.name);
  }
  // Member expressions like Foo.Bar are also components in practice
  if (t.isJSXMemberExpression(name)) return true;
  if (t.isJSXNamespacedName(name)) return true;
  return false;
}

function isTranslatablePropName(attrName: string): boolean {
  if (!attrName) return false;

  // Never translate data-* technical attributes
  if (attrName.startsWith('data-')) return false;

  // Event handlers (onClick, onChange, etc.)
  if (/^on[A-Z]/.test(attrName)) return false;

  // Styling helpers (fooClassName, fooClasses)
  if (attrName.endsWith('ClassName') || attrName.endsWith('Classes')) {
    return false;
  }

  if (TECHNICAL_PROP_NAMES.has(attrName)) return false;
  return true;
}

export function shouldTranslateJsxAttribute(
  attrName: string,
  openingElementName: t.JSXOpeningElement['name'] | null | undefined
): boolean {
  // Always translate known visible attributes on DOM elements and components
  if (VISIBLE_ATTRIBUTE_NAMES.has(attrName) || attrName.startsWith('aria-')) {
    return true;
  }

  // For custom components, treat string props as user-visible unless explicitly technical.
  if (isComponentJsxName(openingElementName)) {
    return isTranslatablePropName(attrName);
  }

  return false;
}
