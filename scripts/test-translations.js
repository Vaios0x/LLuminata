const fs = require('fs');
const path = require('path');

// Función para probar la carga de traducciones
async function testTranslationLoading() {
  const localesDir = path.join(__dirname, '..', 'locales');
  
  console.log('🧪 Probando carga de traducciones...\n');
  
  // Probar con nahuatl específicamente
  const nahuatlPath = path.join(localesDir, 'nahuatl', 'common.json');
  
  if (fs.existsSync(nahuatlPath)) {
    try {
      const content = fs.readFileSync(nahuatlPath, 'utf8');
      const translations = JSON.parse(content);
      
      console.log('✅ Archivo nahuatl encontrado y parseado correctamente');
      console.log('📊 Estructura de traducciones:');
      console.log('- common.app:', !!translations.common?.app);
      console.log('- common.navigation:', !!translations.common?.navigation);
      console.log('- common.auth:', !!translations.common?.auth);
      
      // Probar claves específicas
      const testKeys = [
        'common.navigation.features',
        'common.navigation.populations', 
        'common.navigation.technology',
        'common.navigation.pricing',
        'common.app.name',
        'common.app.tagline'
      ];
      
      console.log('\n🔍 Probando claves específicas:');
      testKeys.forEach(key => {
        const keys = key.split('.');
        let value = translations;
        
        for (const k of keys) {
          if (value && typeof value === 'object' && k in value) {
            value = value[k];
          } else {
            value = null;
            break;
          }
        }
        
        if (value) {
          console.log(`✅ ${key}: "${value}"`);
        } else {
          console.log(`❌ ${key}: NO ENCONTRADA`);
        }
      });
      
    } catch (error) {
      console.log('❌ Error al leer/parsear archivo nahuatl:', error.message);
    }
  } else {
    console.log('❌ Archivo nahuatl no encontrado en:', nahuatlPath);
  }
  
  // Probar estructura de directorios
  console.log('\n📁 Estructura de directorios:');
  if (fs.existsSync(localesDir)) {
    const languages = fs.readdirSync(localesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    console.log('Idiomas disponibles:', languages);
    
    // Verificar que nahuatl esté en la lista
    if (languages.includes('nahuatl')) {
      console.log('✅ nahuatl está en la lista de idiomas');
    } else {
      console.log('❌ nahuatl NO está en la lista de idiomas');
    }
  } else {
    console.log('❌ Directorio locales no encontrado');
  }
}

testTranslationLoading();
