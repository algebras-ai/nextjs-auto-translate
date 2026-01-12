/**
 * Hook that returns a translation function for use in attributes and expressions
 * Usage: const { t } = useTranslation(); title={t('file::key')}
 */
export declare function useTranslation(): {
    t: (key: string) => string;
};
