"use client";
import { useState, useCallback, useEffect, useMemo } from 'react';
import { Controller } from 'react-hook-form';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Combobox } from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';
import debounce from '@/utils/debounce';
import { imageUrl } from "@/utils/image-url";

/**
 * Local Filter Combobox Component
 * 
 * Usage Examples:
 * 
 * 1. Basic usage with static options:
 * <FilterCombobox
 *   name="category"
 *   label="Category"
 *   options={categories}
 *   control={control}
 *   placeholder="Select category..."
 * />
 * 
 * 2. With avatar rendering:
 * <FilterCombobox
 *   name="user"
 *   label="User"
 *   options={users}
 *   control={control}
 *   renderAvatar={true}
 *   avatarImageKey="avatar"
 *   labelKey="full_name"
 *   valueKey="user_id"
 * />
 * 
 * 3. Without form control (standalone):
 * <FilterCombobox
 *   value={selectedValue}
 *   onValueChange={setSelectedValue}
 *   options={options}
 *   placeholder="Choose option..."
 * />
 */

const FilterCombobox = ({
    name,
    label,
    placeholder = "Select option...",
    searchPlaceholder = "Search...",
    emptyMessage = "No options found.",
    control,
    onValueChange,
    error,
    options = [
        { id: 1, name: "Sample Option 1", image: null },
        { id: 2, name: "Sample Option 2", image: null },
        { id: 3, name: "Sample Option 3", image: null }
    ],
    disabled = false,
    className = "",
    labelKey = "name",
    valueKey = "id",
    renderAvatar = false,
    avatarImageKey = "image",
    avatarFallbackBg = "bg-gray-500",
    value,
    showLabel = true
}) => {
    const [filteredOptions, setFilteredOptions] = useState(options);

    useEffect(() => {
        setFilteredOptions(options);
    }, [options]);

    // Debounced search function
    const debouncedSearch = useMemo(() =>
        debounce((query) => {
            if (!query || query.trim() === '') {
                setFilteredOptions(options);
                return;
            }

            const lowerQuery = query.toLowerCase();
            const filtered = options.filter(option =>
                option[labelKey]?.toLowerCase().includes(lowerQuery)
            );
            setFilteredOptions(filtered);
        }, 300),
        [options, labelKey]
    );

    const handleSearch = useCallback((query) => {
        debouncedSearch(query);
    }, [debouncedSearch]);

    const renderOption = useCallback((item) => (
        <div className="flex items-center gap-2">
            {renderAvatar && (
                <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage
                        src={imageUrl(item[avatarImageKey])}
                        alt={item[labelKey]}
                    />
                    <AvatarFallback className={`text-xs font-semibold ${avatarFallbackBg} text-white flex items-center justify-center w-full h-full`}>
                        {item[labelKey]?.charAt(0)?.toUpperCase() || "?"}
                    </AvatarFallback>
                </Avatar>
            )}
            <span>{item[labelKey]}</span>
        </div>
    ), [renderAvatar, avatarImageKey, labelKey, avatarFallbackBg]);

    const normalizeValue = useCallback((val) => val || '', []);
    const handleValueChange = useCallback((newValue) => {
        onValueChange?.(newValue);
        return newValue;
    }, [onValueChange]);

    // If used without form control
    if (!control) {
        return (
            <div className={className}>
                {showLabel && label && (
                    <Label className="text-sm font-medium mb-2 block">
                        {label}
                    </Label>
                )}
                <Combobox
                    value={normalizeValue(value)}
                    onValueChange={handleValueChange}
                    onSearchChange={handleSearch}
                    options={filteredOptions}
                    placeholder={placeholder}
                    searchPlaceholder={searchPlaceholder}
                    emptyMessage={emptyMessage}
                    getLabel={(item) => item[labelKey]}
                    getValue={(item) => item[valueKey]}
                    renderOption={renderOption}
                    disabled={disabled}
                />
                {error && (
                    <p className="text-destructive text-sm error-p mt-1">
                        {error}
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className={className}>
            {showLabel && (
                <Label htmlFor={name} className="text-sm font-medium mb-2 block">
                    {label}
                </Label>
            )}
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <Combobox
                        value={normalizeValue(field.value)}
                        onValueChange={(value) => {
                            const processedValue = handleValueChange(value);
                            field.onChange(processedValue);
                        }}
                        onSearchChange={handleSearch}
                        options={filteredOptions}
                        placeholder={placeholder}
                        searchPlaceholder={searchPlaceholder}
                        emptyMessage={emptyMessage}
                        getLabel={(item) => item[labelKey]}
                        getValue={(item) => item[valueKey]}
                        renderOption={renderOption}
                        disabled={disabled}
                    />
                )}
            />
            {error && (
                <p className="text-destructive text-sm error-p mt-1">
                    {error}
                </p>
            )}
        </div>
    );
};

export default FilterCombobox;
