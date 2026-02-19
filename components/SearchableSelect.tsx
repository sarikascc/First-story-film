"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, Check, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  id: string;
  name: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  heightClass?: string;
  labelStyle?: "bold" | "normal"; // Add label style option
  inputStyle?: "bold" | "normal"; // Add input style option
  addNewLabel?: string; // Label for "Add New" button
  onAddNew?: () => void; // Callback when "Add New" is clicked
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Search...",
  label,
  required = false,
  disabled = false,
  heightClass = "h-11",
  labelStyle = "bold", // Default to bold style
  inputStyle = "bold", // Default to bold style
  addNewLabel,
  onAddNew,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.id === value);

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionId: string) => {
    onChange(optionId);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSearchTerm("");
    inputRef.current?.focus();
  };

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <label
          className={cn(
            "block mb-2",
            labelStyle === "bold"
              ? "text-[12px] uppercase font-black tracking-widest text-black ml-1"
              : "text-sm font-normal text-gray-900",
          )}
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative">
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10",
            inputStyle === "bold" ? "left-4" : "left-3",
          )}
        >
          <Search size={16} />
        </div>

        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          value={isOpen ? searchTerm : selectedOption?.name || ""}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onClick={handleInputClick}
          onFocus={handleInputClick}
          placeholder={placeholder}
          className={cn(
            "w-full bg-white focus:outline-none transition-all duration-300",
            heightClass,
            inputStyle === "bold"
              ? "border-2 border-slate-100 rounded-full pl-11 text-[12px] font-black uppercase text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-50 placeholder:text-slate-400 placeholder:font-normal placeholder:normal-case"
              : "border border-gray-300 rounded-lg pl-10 text-sm font-normal text-black focus:border-indigo-600 focus:ring-1 focus:ring-indigo-500 placeholder:text-gray-400",
            // Dynamic right padding based on what buttons are shown
            onAddNew && selectedOption && !isOpen
              ? "pr-20"
              : onAddNew
                ? "pr-12"
                : "pr-10",
            disabled && "opacity-50 cursor-not-allowed bg-slate-50",
          )}
        />

        {/* Right side buttons container */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1 z-10">
          {/* Add New Button - always show if onAddNew exists */}
          {onAddNew && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddNew();
                setIsOpen(false);
                setSearchTerm("");
              }}
              className={cn(
                "transition-colors hover:scale-110",
                inputStyle === "bold"
                  ? "text-indigo-600 hover:text-indigo-700 "
                  : "text-indigo-600 hover:text-indigo-700 bg-indigo-100 rounded-sm px-1 py-1",
              )}
              title={addNewLabel || "Add New"}
            >
              <Plus size={18} strokeWidth={2.5} />
            </button>
          )}

          {/* Clear Button - only show when option is selected and not open */}
          {selectedOption && !isOpen && (
            <button
              type="button"
              onClick={handleClear}
              className={cn(
                "transition-colors hover:scale-110",
                inputStyle === "bold"
                  ? "text-rose-600 hover:text-rose-700 "
                  : "text-rose-600 hover:text-rose-700 bg-rose-100 rounded-sm px-1 py-1",
              )}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown List */}
      {isOpen && (
        <div
          className={cn(
            "absolute top-[calc(100%+8px)] left-0 right-0 bg-white shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200",
            inputStyle === "bold"
              ? "border-2 border-slate-100 rounded-2xl shadow-slate-200/50"
              : "border border-gray-200 rounded-lg",
          )}
        >
          <div className="max-h-64 overflow-y-auto custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <p
                  className={cn(
                    "text-slate-400",
                    inputStyle === "bold"
                      ? "text-sm font-bold uppercase tracking-wider"
                      : "text-sm font-normal",
                  )}
                >
                  {searchTerm ? "No matches found" : "No options available"}
                </p>
              </div>
            ) : (
              <div className={inputStyle === "bold" ? "p-2" : "p-1.5"}>
                {filteredOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelect(option.id)}
                    className={cn(
                      "w-full text-left transition-all flex items-center justify-between group",
                      inputStyle === "bold"
                        ? "px-4 py-3 rounded-xl mb-1"
                        : "px-3 py-2 rounded-lg mb-1",
                      value === option.id
                        ? "bg-indigo-600 text-white"
                        : "text-slate-900 hover:bg-slate-50 hover:text-indigo-600",
                      inputStyle === "bold" &&
                        value === option.id &&
                        "font-black",
                      inputStyle === "bold" &&
                        value !== option.id &&
                        "font-bold",
                      inputStyle === "normal" &&
                        value === option.id &&
                        "font-medium",
                      inputStyle === "normal" &&
                        value !== option.id &&
                        "font-normal",
                    )}
                  >
                    <span
                      className={
                        inputStyle === "bold"
                          ? "text-sm uppercase tracking-wide"
                          : "text-sm"
                      }
                    >
                      {option.name}
                    </span>
                    {value === option.id && (
                      <Check
                        size={inputStyle === "bold" ? 16 : 12}
                        className="shrink-0 ml-2"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hidden input for form validation */}
      <input type="hidden" value={value} required={required} />
    </div>
  );
}
