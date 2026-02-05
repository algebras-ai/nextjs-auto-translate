export type ElementPropDescriptor = {
    tag: string;
    props: Record<string, unknown>;
};
interface TranslatedProps {
    tKey: string;
    params?: Record<string, unknown>;
    children?: React.ReactNode;
    /** Build-time injected: tag + props for each <element:...> in content (same order). */
    elementProps?: ElementPropDescriptor[];
    /** Build-time injected: map of PascalCase tag name -> React component for <element:Component>. */
    components?: Record<string, React.ComponentType<unknown>>;
}
declare const Translated: (props: TranslatedProps) => import("react/jsx-runtime").JSX.Element;
export default Translated;
