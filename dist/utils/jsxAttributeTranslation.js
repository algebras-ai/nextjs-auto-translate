"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldTranslateJsxAttribute = shouldTranslateJsxAttribute;
const t = __importStar(require("@babel/types"));
const VISIBLE_ATTRIBUTE_NAMES = new Set([
    'title',
    'alt',
    'placeholder',
    'defaultValue',
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
function isComponentJsxName(name) {
    if (!name)
        return false;
    if (t.isJSXIdentifier(name)) {
        // Custom components start with an uppercase letter
        return /^[A-Z]/.test(name.name);
    }
    // Member expressions like Foo.Bar are also components in practice
    if (t.isJSXMemberExpression(name))
        return true;
    if (t.isJSXNamespacedName(name))
        return true;
    return false;
}
function isTranslatablePropName(attrName) {
    if (!attrName)
        return false;
    // Never translate data-* technical attributes
    if (attrName.startsWith('data-'))
        return false;
    // Event handlers (onClick, onChange, etc.)
    if (/^on[A-Z]/.test(attrName))
        return false;
    // Styling helpers (fooClassName, fooClasses)
    if (attrName.endsWith('ClassName') || attrName.endsWith('Classes')) {
        return false;
    }
    if (TECHNICAL_PROP_NAMES.has(attrName))
        return false;
    return true;
}
function shouldTranslateJsxAttribute(attrName, openingElementName, attributes) {
    // Always translate known visible attributes on DOM elements and components
    if (VISIBLE_ATTRIBUTE_NAMES.has(attrName) || attrName.startsWith('aria-')) {
        return true;
    }
    // Special case: value attribute on input type="submit" or type="button"
    // These display the button text and should be translated
    if (attrName === 'value' &&
        openingElementName &&
        t.isJSXIdentifier(openingElementName) &&
        openingElementName.name === 'input' &&
        attributes) {
        const typeAttr = attributes.find((attr) => t.isJSXAttribute(attr) &&
            t.isJSXIdentifier(attr.name) &&
            attr.name.name === 'type');
        if (typeAttr && t.isJSXAttribute(typeAttr) && typeAttr.value) {
            if (t.isStringLiteral(typeAttr.value)) {
                const typeValue = typeAttr.value.value;
                if (typeValue === 'submit' || typeValue === 'button') {
                    return true;
                }
            }
        }
    }
    // For custom components, treat string props as user-visible unless explicitly technical.
    if (isComponentJsxName(openingElementName)) {
        return isTranslatablePropName(attrName);
    }
    return false;
}
