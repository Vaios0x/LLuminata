const fs = require('fs');
const path = require('path');

// Claves requeridas para la navegación
const requiredKeys = [
  'common.app.name',
  'common.app.tagline',
  'common.navigation.home',
  'common.navigation.about',
  'common.navigation.contact',
  'common.navigation.features',
  'common.navigation.populations',
  'common.navigation.technology',
  'common.navigation.pricing',
  'common.auth.login',
  'common.auth.register'
];

// Función para obtener el valor de una clave anidada
function getNestedValue(obj, key) {
  return key.split('.').reduce((current, k) => current && current[k], obj);
}

// Función para verificar un archivo de traducción
function checkTranslationFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const translations = JSON.parse(content);
    
    const missingKeys = [];
    const language = path.basename(path.dirname(filePath));
    
    requiredKeys.forEach(key => {
      const value = getNestedValue(translations, key);
      if (!value) {
        missingKeys.push(key);
      }
    });
    
    if (missingKeys.length > 0) {
      console.log(`❌ ${language}: Faltan claves:`, missingKeys);
      return false;
    } else {
      console.log(`✅ ${language}: Todas las claves presentes`);
      return true;
    }
  } catch (error) {
    console.log(`❌ Error en ${filePath}:`, error.message);
    return false;
  }
}

// Función principal
function main() {
  const localesDir = path.join(__dirname, '..', 'locales');
  
  if (!fs.existsSync(localesDir)) {
    console.log('❌ No se encontró el directorio locales');
    return;
  }
  
  const languages = fs.readdirSync(localesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  console.log('🔍 Verificando archivos de traducción...\n');
  
  let allValid = true;
  
  languages.forEach(lang => {
    const filePath = path.join(localesDir, lang, 'common.json');
    if (fs.existsSync(filePath)) {
      const isValid = checkTranslationFile(filePath);
      if (!isValid) allValid = false;
    } else {
      console.log(`❌ ${lang}: No se encontró common.json`);
      allValid = false;
    }
  });
  
  console.log('\n' + '='.repeat(50));
  if (allValid) {
    console.log('🎉 ¡Todos los archivos de traducción están completos!');
  } else {
    console.log('⚠️  Algunos archivos necesitan ser actualizados');
  }
}

main();
