# String Rendering Patterns in React and Next.js

This document describes all possible scenarios and patterns of how a string can appear in the final DOM in React and Next.js applications and be visible to users on screen (without using devtools).

**Important:** This document describes only strings that users see on screen. Technical attributes (id, className, data-\*, htmlFor, etc.) are excluded.

## Table of Contents

1. ✅ [Direct Strings in JSX (JSXText)](#1-direct-strings-in-jsx-jsxtext)
2. ✅ [Strings via Expressions (JSXExpressionContainer)](#2-strings-via-expressions-jsxexpressioncontainer)
3. [Strings in Element Attributes (visible to users)](#3-strings-in-element-attributes-visible-to-users)
4. [Strings via Variables](#4-strings-via-variables)
5. [Strings via Functions and Methods](#5-strings-via-functions-and-methods)
6. [Conditional String Rendering](#6-conditional-string-rendering)
7. [Strings in Loops and Arrays](#7-strings-in-loops-and-arrays)
8. [Strings in Components](#8-strings-in-components)
9. [Next.js Specific Patterns](#9-nextjs-specific-patterns)
10. [Strings in Forms and Inputs (visible to users)](#10-strings-in-forms-and-inputs-visible-to-users)
11. [Additional HTML Elements with Visible Text](#11-additional-html-elements-with-visible-text)
12. [Strings via Libraries and Utilities](#12-strings-via-libraries-and-utilities)
13. [Complex Combinations](#13-complex-combinations)

---

## 1. Direct Strings in JSX (JSXText)

### 1.1 Simple text between tags

```tsx
<div>Simple text</div>
```

**AST Type:** `JSXText`  
**Description:** The simplest way - a string directly between opening and closing tags.

### 1.2 Text with spaces

```tsx
<div>Text with spaces and line breaks</div>
```

**AST Type:** `JSXText`  
**Description:** Spaces and line breaks are preserved in JSXText, but React normalizes them during rendering.

### 1.3 Text with spaces between elements

```tsx
<div>
  Text <span>between</span> elements
</div>
```

**AST Type:** Multiple `JSXText` nodes  
**Description:** Each text fragment between elements becomes a separate JSXText node.

### 1.4 Text with explicit spaces via expression

```tsx
<div>
  Text <span>with space</span> between elements
</div>
```

**AST Type:** `JSXText` + `JSXExpressionContainer` + `JSXElement`  
**Description:** Uses `{" "}` to explicitly preserve spaces between elements.

---

## 2. Strings via Expressions (JSXExpressionContainer)

### 2.1 String literal in expression

```tsx
<div>{'String in expression'}</div>
```

**AST Type:** `JSXExpressionContainer` with `StringLiteral`  
**Description:** String wrapped in curly braces, but it's still a string.

### 2.2 Variable with string

```tsx
const text = 'Text from variable';
<div>{text}</div>;
```

**AST Type:** `JSXExpressionContainer` with `Identifier`  
**Description:** Variable containing a string is rendered as text.

### 2.3 String concatenation

```tsx
<div>{'Hello' + ' ' + 'World'}</div>
```

**AST Type:** `JSXExpressionContainer` with `BinaryExpression`  
**Description:** Result of string concatenation is rendered as text.

### 2.4 Template literals (template strings)

```tsx
const name = 'John';
<div>{`Hello, ${name}!`}</div>;
```

**AST Type:** `JSXExpressionContainer` with `TemplateLiteral`  
**Description:** Template literal is evaluated and rendered as a string.

### 2.5 Conditional expression (ternary)

```tsx
<div>{isLoggedIn ? 'Logout' : 'Login'}</div>
```

**AST Type:** `JSXExpressionContainer` with `ConditionalExpression`  
**Description:** Conditional expression returns a string that is rendered.

### 2.6 Logical AND (&&)

```tsx
<div>{isVisible && 'Visible text'}</div>
```

**AST Type:** `JSXExpressionContainer` with `LogicalExpression`  
**Description:** If the left part is true, the right part (string) is rendered.

### 2.7 Function call returning string

```tsx
<div>{getGreeting()}</div>
```

**AST Type:** `JSXExpressionContainer` with `CallExpression`  
**Description:** Function is called and returns a string that is rendered.

### 2.8 String method

```tsx
<div>{text.toUpperCase()}</div>
```

**AST Type:** `JSXExpressionContainer` with `CallExpression` (MemberExpression)  
**Description:** String method returns a new string that is rendered.

---

## 3. Strings in Element Attributes (visible to users)

### 3.1 title attribute (tooltip)

```tsx
<div title="Tooltip on hover">Content</div>
<button title="Click to send">Submit</button>
```

**AST Type:** `JSXAttribute` with `StringLiteral`  
**Description:** String in the `title` attribute is displayed in a tooltip when hovering. Visible to users.

### 3.2 Expression in title attribute

```tsx
<div title={tooltipText}>Content</div>
```

**AST Type:** `JSXAttribute` with `JSXExpressionContainer`  
**Description:** Variable or expression in the `title` attribute.

### 3.3 Template literal in title attribute

```tsx
<div title={`Hello, ${userName}!`}>Content</div>
```

**AST Type:** `JSXAttribute` with `JSXExpressionContainer` (TemplateLiteral)  
**Description:** Dynamic formation of the `title` attribute value.

### 3.4 alt attribute (alternative image text)

```tsx
<img src="/image.jpg" alt="Image description" />
<img src="/logo.png" alt={imageDescription} />
```

**AST Type:** `JSXAttribute` with `StringLiteral` or `JSXExpressionContainer`  
**Description:** String in the `alt` attribute is displayed if the image fails to load and is used by screen readers. Visible to users.

### 3.5 Accessibility attributes (ARIA)

```tsx
<button aria-label="Close dialog">×</button>
<div aria-describedby="help-text">Input field</div>
<span id="help-text">Enter your email</span>

<input
  aria-label="Search site"
  aria-placeholder="Enter query"
/>
```

**AST Type:** `JSXAttribute` with `StringLiteral` or `JSXExpressionContainer`  
**Description:** Attributes `aria-label`, `aria-describedby`, `aria-placeholder` and other ARIA attributes are used by screen readers and visible to users with disabilities. Subject to localization.

---

## 4. Strings via Variables

### 4.1 Constant

```tsx
const MESSAGE = 'Message';
<div>{MESSAGE}</div>;
```

**AST Type:** `JSXExpressionContainer` with `Identifier`  
**Description:** Constant containing a string.

### 4.2 State (useState)

```tsx
const [message, setMessage] = useState('Initial message');
<div>{message}</div>;
```

**AST Type:** `JSXExpressionContainer` with `Identifier`  
**Description:** Component state containing a string.

### 4.3 Props

```tsx
function Component({ title }: { title: string }) {
  return <div>{title}</div>;
}
```

**AST Type:** `JSXExpressionContainer` with `Identifier`  
**Description:** String passed through props.

### 4.4 Context

```tsx
const { locale } = useContext(LocaleContext);
<div>{locale}</div>;
```

**AST Type:** `JSXExpressionContainer` with `Identifier`  
**Description:** String from React Context.

### 4.5 Local variable

```tsx
function Component() {
  const localVar = 'Local variable';
  return <div>{localVar}</div>;
}
```

**AST Type:** `JSXExpressionContainer` with `Identifier`  
**Description:** Local variable in the component.

---

## 5. Strings via Functions and Methods

### 5.1 Component function

```tsx
function getText() {
  return 'Text from function';
}
<div>{getText()}</div>;
```

**AST Type:** `JSXExpressionContainer` with `CallExpression`  
**Description:** Function call returning a string.

### 5.2 Arrow function

```tsx
const getText = () => 'Text';
<div>{getText()}</div>;
```

**AST Type:** `JSXExpressionContainer` with `CallExpression`  
**Description:** Arrow function returning a string.

### 5.3 Object method

```tsx
const obj = { getText: () => 'Text' };
<div>{obj.getText()}</div>;
```

**AST Type:** `JSXExpressionContainer` with `CallExpression` (MemberExpression)  
**Description:** Object method returning a string.

### 5.4 String method

```tsx
<div>{text.trim()}</div>
<div>{text.substring(0, 10)}</div>
<div>{text.replace(/old/g, "new")}</div>
```

**AST Type:** `JSXExpressionContainer` with `CallExpression`  
**Description:** Built-in JavaScript string methods.

### 5.5 Utility function

```tsx
import { formatDate } from './utils';
<div>{formatDate(date)}</div>;
```

**AST Type:** `JSXExpressionContainer` with `CallExpression`  
**Description:** Imported function returning a string.

---

## 6. Conditional String Rendering

### 6.1 Ternary operator

```tsx
<div>{isLoading ? 'Loading...' : 'Ready'}</div>
```

**AST Type:** `JSXExpressionContainer` with `ConditionalExpression`  
**Description:** Conditional choice of string for rendering.

### 6.2 Logical AND

```tsx
<div>{error && `Error: ${error}`}</div>
```

**AST Type:** `JSXExpressionContainer` with `LogicalExpression`  
**Description:** String is rendered only if the condition is true.

### 6.3 Logical OR

```tsx
<div>{message || 'Default message'}</div>
```

**AST Type:** `JSXExpressionContainer` with `LogicalExpression`  
**Description:** Default string is rendered if the main one is missing.

### 6.4 If-else via function

```tsx
function getMessage(status: string) {
  if (status === 'loading') return 'Loading...';
  if (status === 'error') return 'Error';
  return 'Ready';
}
<div>{getMessage(status)}</div>;
```

**AST Type:** `JSXExpressionContainer` with `CallExpression`  
**Description:** Conditional logic is extracted into a function.

### 6.5 Switch-case via function

```tsx
function getStatusText(status: string) {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'success':
      return 'Success';
    default:
      return 'Unknown';
  }
}
<div>{getStatusText(status)}</div>;
```

**AST Type:** `JSXExpressionContainer` with `CallExpression`  
**Description:** Switch-case logic in a function.

---

## 7. Strings in Loops and Arrays

### 7.1 map() with strings

```tsx
const items = ['First', 'Second', 'Third'];
<div>
  {items.map((item, index) => (
    <div key={index}>{item}</div>
  ))}
</div>;
```

**AST Type:** `JSXExpressionContainer` with `CallExpression` (map)  
**Description:** Array of strings is rendered through map.

### 7.2 map() with formatting

```tsx
const numbers = [1, 2, 3];
<div>{numbers.map((n) => `Number: ${n}`)}</div>;
```

**AST Type:** `JSXExpressionContainer` with `CallExpression`  
**Description:** Strings are formed dynamically in map.

### 7.3 forEach (not recommended)

```tsx
const items: string[] = [];
data.forEach((item) => items.push(item.name));
<div>{items.join(', ')}</div>;
```

**AST Type:** `JSXExpressionContainer` with `CallExpression` (join)  
**Description:** Array of strings is combined into one string.

### 7.4 filter + map

```tsx
<div>
  {items
    .filter((item) => item.length > 5)
    .map((item) => (
      <div key={item}>{item}</div>
    ))}
</div>
```

**AST Type:** `JSXExpressionContainer` with chain of `CallExpression`  
**Description:** Chain of methods for filtering and rendering strings.

### 7.5 reduce for combining

```tsx
<div>{items.reduce((acc, item) => `${acc}, ${item}`, '')}</div>
```

**AST Type:** `JSXExpressionContainer` with `CallExpression` (reduce)  
**Description:** Reduce for combining strings into one.

---

## 8. Strings in Components

### 8.1 Child element as string

```tsx
<Component>Child element text</Component>
```

**AST Type:** `JSXElement` with `JSXText` in children  
**Description:** String is passed as children of the component.

### 8.2 Props as string (visible to users)

```tsx
// If prop is used to display visible text
<Component title="Title" />
<Button label="Click me" />
<ErrorMessage message="An error occurred" />
```

**AST Type:** `JSXAttribute` with `StringLiteral`  
**Description:** String is passed through a prop and rendered as visible text. Important: technical props (id, className, data-\*, etc.) are not subject to localization.

### 8.3 Children prop

```tsx
function Component({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
<Component>Text</Component>;
```

**AST Type:** `JSXElement` with children  
**Description:** String is passed through the children prop.

### 8.4 Rendering via component

```tsx
function TextComponent({ text }: { text: string }) {
  return <span>{text}</span>;
}
<TextComponent text="Text" />;
```

**AST Type:** `JSXElement` (component)  
**Description:** Component receives a string and renders it.

### 8.5 Wrapper component

```tsx
function Bold({ children }: { children: string }) {
  return <strong>{children}</strong>;
}
<Bold>Bold text</Bold>;
```

**AST Type:** `JSXElement` with nested `JSXText`  
**Description:** Component wraps a string in additional tags.

---

## 9. Next.js Specific Patterns

### 9.1 Metadata

```tsx
export const metadata: Metadata = {
  title: 'Page title',
  description: 'Page description',
};
```

**AST Type:** `ExportNamedDeclaration` with `ObjectExpression`  
**Description:** Strings in Next.js App Router metadata.

### 9.2 generateMetadata function

```tsx
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Dynamic title',
    description: 'Dynamic description',
  };
}
```

**AST Type:** `FunctionDeclaration` with `ReturnStatement`  
**Description:** Dynamic metadata via function.

### 9.3 Head component (Pages Router)

```tsx
import Head from 'next/head';

<Head>
  <title>Title</title>
  <meta name="description" content="Description" />
</Head>;
```

**AST Type:** `JSXElement` (Head) with nested elements  
**Description:** Metadata via Head component in Pages Router.

### 9.4 Strings in getStaticProps / getServerSideProps

```tsx
export async function getStaticProps() {
  return {
    props: {
      title: 'Static title',
    },
  };
}
```

**AST Type:** `FunctionDeclaration` with `ReturnStatement`  
**Description:** Strings are passed through props in Pages Router.

### 9.5 Strings in Server Components

```tsx
// Server Component
async function ServerComponent() {
  const data = await fetchData();
  return <div>{data.title}</div>;
}
```

**AST Type:** `JSXExpressionContainer` with `Identifier`  
**Description:** Strings are rendered on the server in App Router.

### 9.6 Strings in Client Components

```tsx
'use client';
function ClientComponent() {
  const [text, setText] = useState('Client text');
  return <div>{text}</div>;
}
```

**AST Type:** `JSXExpressionContainer` with `Identifier`  
**Description:** Strings are rendered on the client.

### 9.7 Strings in Route Handlers (if returned in UI)

```tsx
// If Route Handler is used for Server Components
export async function GET() {
  return Response.json({ message: 'Message' });
}

// In component:
const response = await fetch('/api/data');
const { message } = await response.json();
return <div>{message}</div>; // Visible to user
```

**AST Type:** `ObjectExpression` in `ReturnStatement`  
**Description:** Strings in API route responses that are then displayed in UI are subject to localization. Pure API responses without UI are not localized.

**Note:** Route Handlers and middleware usually do not contain strings visible to users directly. If they return data that is then rendered in components, those strings need to be localized in the components themselves.

---

## 10. Strings in Forms and Inputs (visible to users)

All strings in forms that users see on screen are subject to localization.

### 10.1 Placeholder (input field hint)

```tsx
<input placeholder="Enter text" />
<input placeholder={placeholderText} />
<input type="email" placeholder="example@email.com" />
```

**AST Type:** `JSXAttribute` with `StringLiteral` or `JSXExpressionContainer`  
**Description:** Hint string in input field is visible to users before entering text.

### 10.2 Value (field value)

```tsx
<input value={inputValue} />
<input defaultValue="Default value" />
```

**AST Type:** `JSXAttribute` with `JSXExpressionContainer` or `StringLiteral`  
**Description:** Input field value is visible to users in the field. Used for pre-filled fields or controlled components.

### 10.3 Label (label text)

```tsx
<label htmlFor="input">Field label</label>
<label>
  Email address
  <input type="email" />
</label>
```

**AST Type:** `JSXText` in `JSXElement`  
**Description:** Label text for input field is visible to users. The `htmlFor` attribute (technical) is not localized, but text inside `<label>` is subject to localization.

### 10.4 Button text

```tsx
<button>Submit</button>
<button type="submit">{buttonText}</button>
<input type="submit" value="Submit form" />
```

**AST Type:** `JSXText` in `JSXElement` or `JSXAttribute` (value for input type="submit")  
**Description:** Button text is visible to users. For `<input type="submit">` text is set via the `value` attribute.

### 10.5 Textarea

```tsx
<textarea placeholder="Enter your comment" />
<textarea defaultValue="Initial text" />
<textarea value={textAreaValue} />
```

**AST Type:** `JSXAttribute` with `StringLiteral` or `JSXExpressionContainer`  
**Description:** Placeholder and value in textarea are visible to users.

### 10.6 Select options

```tsx
<select>
  <option value="1">First option</option>
  <option value="2">Second option</option>
</select>
```

**AST Type:** `JSXText` in `JSXElement` (option)  
**Description:** Option text in select is visible to users when opening the list. The `value` attribute (technical) is not localized.

### 10.7 Fieldset and Legend

```tsx
<fieldset>
  <legend>Field group</legend>
  <input type="text" />
</fieldset>
```

**AST Type:** `JSXText` in `JSXElement` (legend)  
**Description:** Text in `<legend>` is visible to users as a heading for a group of fields.

### 10.8 Details and Summary

```tsx
<details>
  <summary>Click to expand</summary>
  <p>Hidden content</p>
</details>
```

**AST Type:** `JSXText` in `JSXElement` (summary)  
**Description:** Text in `<summary>` is visible to users as a clickable heading for an expandable block.

---

## 11. Additional HTML Elements with Visible Text

### 11.1 Headings (h1-h6)

```tsx
<h1>Main heading</h1>
<h2>{pageTitle}</h2>
<h3>{`Heading ${section}`}</h3>
```

**AST Type:** `JSXText` in `JSXElement` or `JSXExpressionContainer`  
**Description:** Text in headings is visible to users and subject to localization.

### 11.2 Paragraphs and text

```tsx
<p>Paragraph text</p>
<span>Text in span</span>
<em>Emphasized text</em>
<strong>Bold text</strong>
```

**AST Type:** `JSXText` in `JSXElement`  
**Description:** All visible text in text elements is subject to localization.

### 11.3 Tables

```tsx
<table>
  <caption>Table description</caption>
  <thead>
    <tr>
      <th>Column header 1</th>
      <th>Column header 2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Cell data</td>
      <td>{cellData}</td>
    </tr>
  </tbody>
</table>
```

**AST Type:** `JSXText` in `JSXElement` (caption, th, td)  
**Description:** Text in `<caption>`, `<th>` and `<td>` is visible to users and subject to localization.

### 11.4 Lists

```tsx
<ul>
  <li>First item</li>
  <li>Second item</li>
</ul>

<ol>
  <li>{listItem}</li>
</ol>

<dl>
  <dt>Term</dt>
  <dd>Definition</dd>
</dl>
```

**AST Type:** `JSXText` in `JSXElement` (li, dt, dd)  
**Description:** Text in list elements is visible to users.

### 11.5 Quotes

```tsx
<blockquote>Quote</blockquote>
<cite>Quote source</cite>
```

**AST Type:** `JSXText` in `JSXElement`  
**Description:** Text in quotes is visible to users.

### 11.6 Code and preformatted text

```tsx
<code>Code example</code>
<pre>Preformatted text</pre>
```

**AST Type:** `JSXText` in `JSXElement`  
**Description:** If code or preformatted text contains user messages (not technical code), it is subject to localization.

---

## 12. Strings via Libraries and Utilities

### 12.1 Formatting libraries (date-fns, moment)

```tsx
import { format } from 'date-fns';
<div>{format(new Date(), 'dd.MM.yyyy')}</div>;
```

**AST Type:** `JSXExpressionContainer` with `CallExpression`  
**Description:** String is formed by a formatting library.

### 12.2 Internationalization libraries (i18next, react-intl)

```tsx
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
<div>{t('common.welcome')}</div>;
```

**AST Type:** `JSXExpressionContainer` with `CallExpression`  
**Description:** String is obtained through a translation function.

### 12.3 Validation utilities

```tsx
import { getErrorMessage } from './validation';
<div>{getErrorMessage(error)}</div>;
```

**AST Type:** `JSXExpressionContainer` with `CallExpression`  
**Description:** Error message string from utility.

### 12.4 Number formatting utilities

```tsx
import { formatCurrency } from './utils';
<div>{formatCurrency(1000)}</div>;
```

**AST Type:** `JSXExpressionContainer` with `CallExpression`  
**Description:** Formatted number string.

### 12.5 String utilities

```tsx
import { truncate } from './string-utils';
<div>{truncate(longText, 50)}</div>;
```

**AST Type:** `JSXExpressionContainer` with `CallExpression`  
**Description:** Processed string from utility.

---

## 13. Complex Combinations

### 13.1 Nested components with strings

```tsx
<Container>
  <Header title="Title" />
  <Body>
    <Paragraph>Paragraph text</Paragraph>
    <Button>Button</Button>
  </Body>
</Container>
```

**AST Type:** Multiple `JSXElement` with nested `JSXText`  
**Description:** Strings at different nesting levels.

### 13.2 Conditional rendering with components

```tsx
{
  isLoading ? <Loading message="Loading..." /> : <Content title={data.title} />;
}
```

**AST Type:** `JSXExpressionContainer` with `ConditionalExpression`  
**Description:** Conditional choice of components containing strings.

### 13.3 Combination of map and conditional rendering

```tsx
{
  items.map((item) => (
    <div key={item.id}>
      {item.isActive ? <strong>{item.name}</strong> : <span>{item.name}</span>}
    </div>
  ));
}
```

**AST Type:** `JSXExpressionContainer` with `CallExpression` (map)  
**Description:** Strings are rendered conditionally in a loop.

### 13.4 Fragments with strings

```tsx
<>
  <div>First</div>
  <div>Second</div>
  Third without wrapper
</>
```

**AST Type:** `JSXFragment` with multiple `JSXElement` and `JSXText`  
**Description:** Strings in React Fragment.

### 13.5 Portal with strings

```tsx
import { createPortal } from 'react-dom';

{
  createPortal(<div>Content in portal</div>, document.body);
}
```

**AST Type:** `JSXExpressionContainer` with `CallExpression` (createPortal)  
**Description:** Strings are rendered through a portal to another DOM node.

### 13.6 Suspense with fallback

```tsx
<Suspense fallback={<div>Loading...</div>}>
  <AsyncComponent />
</Suspense>
```

**AST Type:** `JSXElement` (Suspense) with `JSXAttribute` (fallback)  
**Description:** String in Suspense fallback component.

### 13.7 Error Boundary with message

```tsx
<ErrorBoundary fallback={<div>An error occurred</div>}>
  <Component />
</ErrorBoundary>
```

**AST Type:** `JSXElement` with `JSXAttribute` (fallback)  
**Description:** String in Error Boundary fallback component.

---

## Special Cases

### Empty strings

```tsx
<div>{""}</div>
<div>{" "}</div>
```

**AST Type:** `JSXExpressionContainer` with `StringLiteral`  
**Description:** Empty strings or spaces can be significant for formatting.

### Strings with escaping

```tsx
<div>{"String with \"quotes\""}</div>
<div>{'String with \'quotes\''}</div>
```

**AST Type:** `JSXExpressionContainer` with `StringLiteral`  
**Description:** Escaped characters in strings.

### Multiline strings

```tsx
<div>{`
  Multiline
  string
`}</div>
```

**AST Type:** `JSXExpressionContainer` with `TemplateLiteral`  
**Description:** Multiline strings via template literal.

### Strings with HTML entities

```tsx
<div>Text & more text</div>
```

**AST Type:** `JSXText`  
**Description:** HTML entities in strings (React automatically escapes).

### Strings in comments (not rendered)

```tsx
{
  /* Comment is not rendered */
}
```

**AST Type:** `JSXExpressionContainer` with `JSXEmptyExpression`  
**Description:** Comments do not enter the DOM.

---

## Summary

Strings visible to users on screen can enter the DOM through many paths:

1. **Direct rendering** - JSXText between tags (visible text)
2. **Expressions** - JSXExpressionContainer with various expression types returning strings
3. **Visible attributes** - JSXAttribute with `title`, `alt`, `aria-label`, `aria-describedby`, `aria-placeholder` and other accessibility attributes
4. **Components** - through props and children that render visible text
5. **Functions** - through function calls returning strings for display
6. **Conditional logic** - through ternary operators and logical expressions returning strings
7. **Loops** - through map, forEach and other array methods rendering strings
8. **Next.js specifics** - metadata (title, description), Server/Client Components
9. **Forms** - placeholder, value, label text, button text, option text
10. **Special cases** - portals, Suspense fallback, Error Boundary

### Exclusions (not localized):

- Technical attributes: `id`, `className`, `htmlFor`, `data-*`, `key`, `ref`
- Pure API responses without UI
- Code comments
- Technical identifiers and CSS classes

For parsing and extracting all translatable strings, it is necessary to consider all these patterns and process the corresponding AST nodes, excluding technical attributes.
