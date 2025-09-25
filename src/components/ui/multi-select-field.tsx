"use client"
import React, { useEffect, useState, useCallback, useContext } from "react";
import { MultiSelect } from "@/components/ui/multi-select";
import useApi from "@/hooks/use-api";
import debounce from "@/utils/debounce";

interface OptionItem {
    [key: string]: any;
    id: number | string;
    name: string;
}

interface MultiSelectFieldProps {
    value?: (string | number)[];
    onValueChange?: (value: (string | number)[]) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    className?: string;
    context?: React.Context<any> | null;
    name?: string;
    apiRoute?: string | null;
    labelKey?: string;
    valueKey?: string;
    fallbackData?: OptionItem[];
    [key: string]: any;
}

/**
 * General Multi-Select Field Component
 * 
 * Usage Examples:
 * 
 * 1. With API endpoint:
 * <MultiSelectField
 *   value={selectedTags}
 *   onValueChange={setSelectedTags}
 *   apiRoute="/api/tags"
 *   placeholder="Select tags..."
 *   labelKey="name"
 *   valueKey="id"
 * />
 * 
 * 2. With React Hook Form context:
 * <MultiSelectField
 *   context={FormContext}
 *   name="tags"
 *   apiRoute="/api/categories"
 *   placeholder="Select categories..."
 * />
 * 
 * 3. With fallback data (no API):
 * <MultiSelectField
 *   value={selected}
 *   onValueChange={setSelected}
 *   fallbackData={[{id: 1, name: "Option 1"}, {id: 2, name: "Option 2"}]}
 *   placeholder="Select options..."
 * />
 */

const MultiSelectField: React.FC<MultiSelectFieldProps> = ({
    value,
    onValueChange,
    placeholder = "Select options...",
    searchPlaceholder = "Search...",
    emptyMessage = "No options found.",
    className = "",
    context = null,
    name = "items",
    apiRoute = null,
    labelKey = "name",
    valueKey = "id",
    fallbackData = [
        { id: 1, name: "Sample Option 1" },
        { id: 2, name: "Sample Option 2" },
        { id: 3, name: "Sample Option 3" }
    ],
    ...props
}) => {
    const { trigger } = useApi();
    const [options, setOptions] = useState<OptionItem[]>(fallbackData);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    let formValue: (string | number)[] = value || [];
    let setFormValue: (value: (string | number)[]) => void = onValueChange || (() => { });

    if (context) {
        const ctx = useContext(context);
        formValue = ctx?.watch?.(name) || [];
        setFormValue = (selectedIds: (string | number)[]) => {
            ctx.setValue(name, selectedIds || []);
        };
    }

    const fetchOptions = useCallback(
        async (): Promise<void> => {
            if (!apiRoute) {
                // Use fallback data when no API route provided
                setOptions(fallbackData);
                return;
            }

            setIsLoading(true);
            try {
                const { data } = await trigger(apiRoute);
                setOptions(data?.data || fallbackData);
            } catch (e) {
                console.warn("API failed, using fallback data:", e);
                setOptions(fallbackData);
            } finally {
                setIsLoading(false);
            }
        },
        [apiRoute, fallbackData, trigger]
    );

    useEffect(() => {
        fetchOptions();
    }, [fetchOptions]);

    const debouncedSearch = debounce(() => {
        fetchOptions();
    }, 300);

    return (
        <MultiSelect
            options={options}
            value={formValue}
            onValueChange={setFormValue}
            placeholder={isLoading ? "Loading..." : placeholder}
            searchPlaceholder={searchPlaceholder}
            emptyMessage={isLoading ? "Loading..." : emptyMessage}
            getLabel={(item: OptionItem) => item[labelKey]}
            getValue={(item: OptionItem) => item[valueKey]}
            className={className}
            {...props}
        />
    );
};

export default MultiSelectField;
