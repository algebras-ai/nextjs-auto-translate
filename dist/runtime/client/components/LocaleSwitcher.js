"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const languageMap_1 = require("../../../data/languageMap");
const Provider_1 = require("../Provider");
const DropdownTrigger = ({ currentLocale, isOpen, onClick, }) => ((0, jsx_runtime_1.jsxs)("button", { onClick: onClick, style: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 16px',
        backgroundColor: '#ffffff',
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        minWidth: '140px',
        justifyContent: 'space-between',
    }, onMouseEnter: (e) => {
        e.currentTarget.style.borderColor = '#3b82f6';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.15)';
    }, onMouseLeave: (e) => {
        e.currentTarget.style.borderColor = '#e5e7eb';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
    }, children: [(0, jsx_runtime_1.jsxs)("span", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: ["\uD83C\uDF10", languageMap_1.languageMap[currentLocale]] }), (0, jsx_runtime_1.jsx)("span", { style: {
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
                fontSize: '12px',
            }, children: "\u25BC" })] }));
const DropdownOption = ({ locale, isSelected, onClick, }) => ((0, jsx_runtime_1.jsxs)("button", { onClick: () => onClick(locale), disabled: isSelected, style: {
        width: '100%',
        padding: '12px 16px',
        backgroundColor: isSelected ? '#f3f4f6' : '#ffffff',
        border: 'none',
        fontSize: '14px',
        fontWeight: isSelected ? '600' : '500',
        color: isSelected ? '#6b7280' : '#374151',
        cursor: isSelected ? 'default' : 'pointer',
        transition: 'all 0.15s ease',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        borderBottom: '1px solid #f3f4f6',
    }, onMouseEnter: (e) => {
        if (!isSelected) {
            e.currentTarget.style.backgroundColor = '#f8fafc';
            e.currentTarget.style.color = '#1f2937';
        }
    }, onMouseLeave: (e) => {
        if (!isSelected) {
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.color = '#374151';
        }
    }, children: [isSelected && ((0, jsx_runtime_1.jsx)("span", { style: { color: '#10b981', fontSize: '12px' }, children: "\u2713" })), languageMap_1.languageMap[locale]] }));
const LocaleSwitcher = () => {
    const { locale: currentLocale, setLocale, getLocales } = (0, Provider_1.useAlgebrasIntl)();
    const router = (0, navigation_1.useRouter)();
    const [isOpen, setIsOpen] = (0, react_1.useState)(false);
    const availableLocales = getLocales();
    const toggleDropdown = () => setIsOpen(!isOpen);
    const handleLocaleChange = (locale) => {
        setLocale(locale);
        setIsOpen(false);
        // Refresh the page to update server components with new locale
        router.refresh();
    };
    return ((0, jsx_runtime_1.jsxs)("div", { style: { position: 'relative', display: 'inline-block' }, children: [(0, jsx_runtime_1.jsx)(DropdownTrigger, { currentLocale: currentLocale, isOpen: isOpen, onClick: toggleDropdown }), isOpen && ((0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    top: '100%',
                    left: '0',
                    right: '0',
                    marginTop: '4px',
                    backgroundColor: '#ffffff',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    zIndex: 1000,
                    overflow: 'hidden',
                    animation: 'fadeIn 0.15s ease-out',
                }, children: availableLocales.map((locale) => ((0, jsx_runtime_1.jsx)(DropdownOption, { locale: locale, isSelected: locale === currentLocale, onClick: handleLocaleChange }, locale))) })), isOpen && ((0, jsx_runtime_1.jsx)("div", { onClick: () => setIsOpen(false), style: {
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    right: '0',
                    bottom: '0',
                    zIndex: 999,
                } })), (0, jsx_runtime_1.jsx)("style", { children: `
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      ` })] }));
};
exports.default = LocaleSwitcher;
