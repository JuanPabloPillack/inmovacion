// src/components/ui/combobox.tsx
'use client';
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

interface ComboboxOption {
  value: number;
  label: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  placeholder: string;
  label: string | React.ReactNode; // Cambiado de JSX.Element a React.ReactNode
  searchPlaceholder?: string;
}

export default function Combobox({
  options,
  value,
  onChange,
  placeholder,
  label,
  searchPlaceholder = 'Buscar...',
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<ComboboxOption[]>(options);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  // Filtrar opciones cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm) {
      const filtered = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
      setFocusedIndex(-1); // Resetear el índice al filtrar
    } else {
      setFilteredOptions(options);
    }
  }, [searchTerm, options]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Enfocar el input cuando se abre el dropdown
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Manejo de navegación con teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(true);
        return;
      }
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0) {
          const selected = filteredOptions[focusedIndex];
          onChange(selected.value);
          setIsOpen(false);
          setSearchTerm('');
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        break;
    }
  };

  const handleOptionClick = (option: ComboboxOption) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onChange(undefined);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (!isOpen && value) {
      setIsOpen(true);
    }
  };

  return (
    <div className="relative">
      <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: '#686363' }}>
        {label}
      </label>
      
      <div 
        className="relative" 
        ref={dropdownRef}
      >
        {/* Input principal */}
        <div
          className={`w-full px-4 py-3 rounded-lg border-2 flex items-center justify-between transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 focus-within:ring-opacity-50 ${
            isOpen ? 'rounded-b-none border-b-0' : 'rounded-lg'
          }`}
          style={{
            borderColor: value ? '#63bae9' : '#e5e7eb',
            backgroundColor: 'white',
          }}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
        >
          <input
            ref={inputRef}
            type="text"
            value={selectedOption ? selectedOption.label : searchTerm}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="w-full bg-transparent outline-none text-sm"
            style={{ color: '#686363' }}
            readOnly={!!selectedOption && !isOpen}
            autoComplete="off"
          />
          
          {selectedOption && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="absolute right-10 p-1 hover:bg-gray-100 rounded-full transition-colors"
              style={{ color: '#969696' }}
            >
              <X className="w-4 h-4" />
            </button>
          )}
          
          <div className="flex items-center gap-2 absolute right-3">
            {searchTerm && (
              <Search className="w-4 h-4" style={{ color: '#969696' }} />
            )}
            <ChevronDown 
              className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              style={{ color: '#969696' }}
            />
          </div>
        </div>

        {/* Dropdown de opciones */}
        {isOpen && filteredOptions.length > 0 && (
          <div 
            className="absolute z-50 w-full bg-white border-2 border-t-0 rounded-b-lg shadow-lg max-h-60 overflow-auto" 
            style={{
              borderColor: '#63bae9',
              top: '100%',
            }}
          >
            {filteredOptions.map((option, index) => (
              <div
                key={option.value}
                onClick={() => handleOptionClick(option)}
                className={`px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors flex items-center gap-3 ${
                  focusedIndex === index ? 'bg-blue-50' : ''
                }`}
                style={{ 
                  borderBottom: index < filteredOptions.length - 1 ? '1px solid #f3f4f6' : 'none',
                  color: option.value === value ? '#63bae9' : '#686363'
                }}
              >
                {option.value === value && (
                  <div className="w-1 h-4 bg-blue-500 rounded" style={{ backgroundColor: '#63bae9' }} />
                )}
                <span className="text-sm font-medium">{option.label}</span>
              </div>
            ))}
          </div>
        )}

        {isOpen && filteredOptions.length === 0 && (
          <div 
            className="absolute z-50 w-full bg-white border-2 border-t-0 rounded-b-lg shadow-lg p-4" 
            style={{
              borderColor: '#63bae9',
              top: '100%',
            }}
          >
            <p className="text-sm text-gray-500" style={{ color: '#969696' }}>
              No se encontraron resultados
            </p>
          </div>
        )}
      </div>

      {/* Contador de resultados */}
      {isOpen && filteredOptions.length > 0 && filteredOptions.length !== options.length && (
        <p className="mt-1 text-xs" style={{ color: '#969696' }}>
          {filteredOptions.length} de {options.length} resultados
        </p>
      )}
    </div>
  );
}