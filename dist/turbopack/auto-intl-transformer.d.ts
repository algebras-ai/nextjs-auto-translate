/**
 * Turbopack loader function
 * Turbopack loaders receive (source, context) and return transformed source
 */
export default function loader(source: string, context: {
    resourcePath: string;
    rootContext?: string;
}): string;
