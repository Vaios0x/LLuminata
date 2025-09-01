"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { 
  Languages, 
  ChevronDown, 
  Globe, 
  Check,
  Search,
  Filter
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/contexts/LanguageContext"

interface Language {
  code: string
  name: string
  nativeName: string
  type: 'primary' | 'indigenous'
  region: string
  status: 'active' | 'beta' | 'planned'
}

interface LanguageSelectorProps {
  className?: string
  variant?: 'default' | 'compact'
}

export function LanguageSelector({ className, variant = 'default' }: LanguageSelectorProps) {
  const { currentLanguage, setLanguage, getCurrentLanguageInfo, getAllLanguages, getLanguagesByType } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<'all' | 'primary' | 'indigenous'>('all')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Cerrar dropdown con Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const handleLanguageSelect = (languageCode: string) => {
    setLanguage(languageCode)
    setIsOpen(false)
    setSearchTerm('')
  }

  const currentLangInfo = () => {
    return getCurrentLanguageInfo()
  }

  const filteredLanguages = () => {
    let languages: Language[] = []
    
    if (selectedGroup === 'all') {
      languages = getAllLanguages()
    } else if (selectedGroup === 'primary') {
      languages = getLanguagesByType('primary')
    } else {
      languages = getLanguagesByType('indigenous')
    }

    if (searchTerm) {
      languages = languages.filter(lang =>
        lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lang.nativeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lang.region.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return languages
  }

  const currentLang = currentLangInfo()

  if (variant === 'compact') {
    return (
      <div className={cn("relative", className)} ref={dropdownRef}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="h-8 px-2 text-xs"
          aria-label={`Idioma actual: ${currentLang.name}. Cambiar idioma`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <Globe className="w-3 h-3 mr-1" />
          {currentLang.code.toUpperCase()}
          <ChevronDown className={cn("w-3 h-3 ml-1 transition-transform", isOpen && "rotate-180")} />
        </Button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-80 overflow-y-auto">
            <div className="px-3 py-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar idioma..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Buscar idioma"
                />
              </div>
            </div>

            <div className="px-3 py-2 border-b border-gray-100">
              <div className="flex gap-1">
                {(['all', 'primary', 'indigenous'] as const).map((group) => (
                  <button
                    key={group}
                    onClick={() => setSelectedGroup(group)}
                    className={cn(
                      "px-2 py-1 text-xs rounded-md transition-colors",
                      selectedGroup === group
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                    aria-label={`Filtrar por ${group === 'all' ? 'todos' : group === 'primary' ? 'idiomas principales' : 'idiomas indígenas'}`}
                  >
                    {group === 'all' ? 'Todos' : group === 'primary' ? 'Principales' : 'Indígenas'}
                  </button>
                ))}
              </div>
            </div>

            <div role="listbox" aria-label="Lista de idiomas disponibles">
              {filteredLanguages().map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageSelect(language.code)}
                  className={cn(
                    "w-full px-3 py-2 text-left text-xs hover:bg-gray-50 transition-colors flex items-center justify-between",
                    currentLanguage === language.code && "bg-blue-50 text-blue-700"
                  )}
                  role="option"
                  aria-selected={currentLanguage === language.code}
                  aria-label={`${language.name} (${language.nativeName}) - ${language.region}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{language.name}</div>
                    <div className="text-gray-500 truncate">{language.nativeName} • {language.region}</div>
                  </div>
                  {currentLanguage === language.code && (
                    <Check className="w-3 h-3 text-blue-600 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2"
        aria-label={`Idioma actual: ${currentLang.name}. Cambiar idioma`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Languages className="w-4 h-4" />
        <span className="hidden sm:inline">{currentLang.name}</span>
        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar idioma..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Buscar idioma"
              />
            </div>
          </div>

          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex gap-2">
              {(['all', 'primary', 'indigenous'] as const).map((group) => (
                <button
                  key={group}
                  onClick={() => setSelectedGroup(group)}
                  className={cn(
                    "px-3 py-1 text-sm rounded-md transition-colors",
                    selectedGroup === group
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                  aria-label={`Filtrar por ${group === 'all' ? 'todos' : group === 'primary' ? 'idiomas principales' : 'idiomas indígenas'}`}
                >
                  {group === 'all' ? 'Todos' : group === 'primary' ? 'Principales' : 'Indígenas'}
                </button>
              ))}
            </div>
          </div>

          <div role="listbox" aria-label="Lista de idiomas disponibles">
            {filteredLanguages().map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language.code)}
                className={cn(
                  "w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between",
                  currentLanguage === language.code && "bg-blue-50 text-blue-700"
                )}
                role="option"
                aria-selected={currentLanguage === language.code}
                aria-label={`${language.name} (${language.nativeName}) - ${language.region}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{language.name}</div>
                  <div className="text-sm text-gray-500">{language.nativeName} • {language.region}</div>
                </div>
                {currentLanguage === language.code && (
                  <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
