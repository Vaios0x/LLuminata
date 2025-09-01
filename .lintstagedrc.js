module.exports = {
  // Lint y formatear archivos TypeScript/JavaScript
  '**/*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    'jest --bail --findRelatedTests --passWithNoTests',
  ],
  
  // Formatear archivos de configuración
  '**/*.{json,md,yml,yaml}': [
    'prettier --write',
  ],
  
  // Formatear archivos CSS/SCSS
  '**/*.{css,scss}': [
    'prettier --write',
  ],
  
  // Verificar tipos de TypeScript
  '**/*.{ts,tsx}': [
    () => 'tsc --noEmit',
  ],
  
  // Verificar seguridad
  '**/*.{js,jsx,ts,tsx}': [
    () => 'npm audit --audit-level moderate',
  ],
};
