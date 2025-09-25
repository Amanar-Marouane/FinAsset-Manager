'use client';

import { useState, useEffect, useRef } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command';

const Combobox = ({
    value,
    onValueChange,
    onSearchChange,
    options = [],
    placeholder = "Sélectionner une option",
    searchPlaceholder = "Rechercher...",
    emptyMessage = "Aucune option trouvée.",
    className = "",
    disabled = false,
    isLoading = false,
    getLabel = (option) => option.label || option.name || option,
    getValue = (option) => option.value || option.id || option,
    renderOption,
    open = false,
    onOpenChange = (_newOpen: boolean) => { },
    ...props
}) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const inputRef = useRef(null);

    // Use controlled open state if provided, otherwise use internal state
    const isOpen = open !== undefined ? open : internalOpen;
    const handleOpenChange = (newOpen) => {
        if (onOpenChange) {
            onOpenChange(newOpen);
        } else {
            setInternalOpen(newOpen);
        }

        // Focus input when opening
        if (newOpen) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 0);
        }
    };

    // Keep input focused when open
    useEffect(() => {
        if (isOpen && inputRef.current) {
            const interval = setInterval(() => {
                if (document.activeElement !== inputRef.current) {
                    inputRef.current?.focus();
                }
            }, 100);

            return () => clearInterval(interval);
        }
    }, [isOpen]);

    const selectedOption = options.find((option) => getValue(option) === value);

    const handleSearchValueChange = (newSearchValue) => {
        setSearchValue(newSearchValue);
        if (onSearchChange) {
            onSearchChange(newSearchValue);
        }
    };

    // Check if placeholder indicates loading state
    const isPlaceholderLoading = placeholder && (
        placeholder.includes('Chargement') ||
        placeholder.includes('Loading') ||
        placeholder.includes('...')
    );

    return (
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isOpen}
                    disabled={disabled}
                    className={cn(
                        "w-full justify-between",
                        !value && "text-muted-foreground",
                        className
                    )}
                    {...props}
                >
                    <span className="flex items-center gap-2">
                        {(isLoading || isPlaceholderLoading) && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        {selectedOption ? getLabel(selectedOption) : placeholder}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <Command key={`command-${options.length}`} shouldFilter={false}>
                    <CommandInput
                        ref={inputRef}
                        placeholder={searchPlaceholder}
                        value={searchValue}
                        onValueChange={handleSearchValueChange}
                        autoFocus={true}
                    />
                    <CommandList>
                        <CommandEmpty>
                            <div className="flex items-center justify-center gap-2 py-2">
                                {emptyMessage.includes('cours') || emptyMessage.includes('Recherche') && (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                )}
                                {emptyMessage}
                            </div>
                        </CommandEmpty>
                        <CommandGroup>
                            {options.map((option, index) => (
                                <CommandItem
                                    key={getValue(option) || index}
                                    onSelect={() => {
                                        onValueChange(getValue(option));
                                        handleOpenChange(false);
                                        setSearchValue(''); // Clear search after selection
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === getValue(option) ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {renderOption ? renderOption(option) : getLabel(option)}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

export { Combobox };