const fs = require('fs');
const path = require('path');

// Traducciones base para agregar
const missingTranslations = {
  navigation: {
    about: {
      'es-MX': 'Nosotros',
      'en': 'About',
      'de': 'Über uns',
      'fr': 'À propos',
      'pt': 'Sobre',
      'maya': 'Ti\' le',
      'nahuatl': 'Toconeh',
      'kiche': 'Ri qawuj',
      'kaqchikel': 'Ri qawuj',
      'mam': 'Ri qawuj',
      'qeqchi': 'Ri qawuj',
      'tzotzil': 'Ri qawuj',
      'tseltal': 'Ri qawuj',
      'mixteco': 'Ri qawuj',
      'zapoteco': 'Ri qawuj',
      'otomi': 'Ri qawuj',
      'totonaco': 'Ri qawuj',
      'mazateco': 'Ri qawuj',
      'chol': 'Ri qawuj',
      'mazahua': 'Ri qawuj',
      'huasteco': 'Ri qawuj',
      'chinanteco': 'Ri qawuj',
      'purepecha': 'Ri qawuj',
      'mixe': 'Ri qawuj',
      'tlapaneco': 'Ri qawuj',
      'tarahumara': 'Ri qawuj'
    },
    contact: {
      'es-MX': 'Contacto',
      'en': 'Contact',
      'de': 'Kontakt',
      'fr': 'Contact',
      'pt': 'Contato',
      'maya': 'T\'aan',
      'nahuatl': 'Tlahtlaniliztli',
      'kiche': 'Q\'ab\'aj',
      'kaqchikel': 'Q\'ab\'aj',
      'mam': 'Q\'ab\'aj',
      'qeqchi': 'Q\'ab\'aj',
      'tzotzil': 'Q\'ab\'aj',
      'tseltal': 'Q\'ab\'aj',
      'mixteco': 'Q\'ab\'aj',
      'zapoteco': 'Q\'ab\'aj',
      'otomi': 'Q\'ab\'aj',
      'totonaco': 'Q\'ab\'aj',
      'mazateco': 'Q\'ab\'aj',
      'chol': 'Q\'ab\'aj',
      'mazahua': 'Q\'ab\'aj',
      'huasteco': 'Q\'ab\'aj',
      'chinanteco': 'Q\'ab\'aj',
      'purepecha': 'Q\'ab\'aj',
      'mixe': 'Q\'ab\'aj',
      'tlapaneco': 'Q\'ab\'aj',
      'tarahumara': 'Q\'ab\'aj'
    },
    features: {
      'es-MX': 'Características',
      'en': 'Features',
      'de': 'Funktionen',
      'fr': 'Fonctionnalités',
      'pt': 'Recursos',
      'maya': 'U ba\'ax ku meyaj',
      'nahuatl': 'Tlahtolli',
      'kiche': 'Ri taq b\'anoj',
      'kaqchikel': 'Ri taq b\'anoj',
      'mam': 'Ri taq b\'anoj',
      'qeqchi': 'Ri taq b\'anoj',
      'tzotzil': 'Ri taq b\'anoj',
      'tseltal': 'Ri taq b\'anoj',
      'mixteco': 'Ri taq b\'anoj',
      'zapoteco': 'Ri taq b\'anoj',
      'otomi': 'Ri taq b\'anoj',
      'totonaco': 'Ri taq b\'anoj',
      'mazateco': 'Ri taq b\'anoj',
      'chol': 'Ri taq b\'anoj',
      'mazahua': 'Ri taq b\'anoj',
      'huasteco': 'Ri taq b\'anoj',
      'chinanteco': 'Ri taq b\'anoj',
      'purepecha': 'Ri taq b\'anoj',
      'mixe': 'Ri taq b\'anoj',
      'tlapaneco': 'Ri taq b\'anoj',
      'tarahumara': 'Ri taq b\'anoj'
    },
    populations: {
      'es-MX': 'Poblaciones',
      'en': 'Populations',
      'de': 'Bevölkerungen',
      'fr': 'Populations',
      'pt': 'Populações',
      'maya': 'U winaq',
      'nahuatl': 'Tlacameh',
      'kiche': 'Ri taq winaq',
      'kaqchikel': 'Ri taq winaq',
      'mam': 'Ri taq winaq',
      'qeqchi': 'Ri taq winaq',
      'tzotzil': 'Ri taq winaq',
      'tseltal': 'Ri taq winaq',
      'mixteco': 'Ri taq winaq',
      'zapoteco': 'Ri taq winaq',
      'otomi': 'Ri taq winaq',
      'totonaco': 'Ri taq winaq',
      'mazateco': 'Ri taq winaq',
      'chol': 'Ri taq winaq',
      'mazahua': 'Ri taq winaq',
      'huasteco': 'Ri taq winaq',
      'chinanteco': 'Ri taq winaq',
      'purepecha': 'Ri taq winaq',
      'mixe': 'Ri taq winaq',
      'tlapaneco': 'Ri taq winaq',
      'tarahumara': 'Ri taq winaq'
    },
    technology: {
      'es-MX': 'Tecnología',
      'en': 'Technology',
      'de': 'Technologie',
      'fr': 'Technologie',
      'pt': 'Tecnologia',
      'maya': 'U k\'ayb\'al',
      'nahuatl': 'Tlahtolli',
      'kiche': 'Ri taq k\'ayb\'al',
      'kaqchikel': 'Ri taq k\'ayb\'al',
      'mam': 'Ri taq k\'ayb\'al',
      'qeqchi': 'Ri taq k\'ayb\'al',
      'tzotzil': 'Ri taq k\'ayb\'al',
      'tseltal': 'Ri taq k\'ayb\'al',
      'mixteco': 'Ri taq k\'ayb\'al',
      'zapoteco': 'Ri taq k\'ayb\'al',
      'otomi': 'Ri taq k\'ayb\'al',
      'totonaco': 'Ri taq k\'ayb\'al',
      'mazateco': 'Ri taq k\'ayb\'al',
      'chol': 'Ri taq k\'ayb\'al',
      'mazahua': 'Ri taq k\'ayb\'al',
      'huasteco': 'Ri taq k\'ayb\'al',
      'chinanteco': 'Ri taq k\'ayb\'al',
      'purepecha': 'Ri taq k\'ayb\'al',
      'mixe': 'Ri taq k\'ayb\'al',
      'tlapaneco': 'Ri taq k\'ayb\'al',
      'tarahumara': 'Ri taq k\'ayb\'al'
    },
    pricing: {
      'es-MX': 'Precios',
      'en': 'Pricing',
      'de': 'Preise',
      'fr': 'Tarifs',
      'pt': 'Preços',
      'maya': 'U k\'ayb\'al',
      'nahuatl': 'Tlahtolli',
      'kiche': 'Ri taq k\'ayb\'al',
      'kaqchikel': 'Ri taq k\'ayb\'al',
      'mam': 'Ri taq k\'ayb\'al',
      'qeqchi': 'Ri taq k\'ayb\'al',
      'tzotzil': 'Ri taq k\'ayb\'al',
      'tseltal': 'Ri taq k\'ayb\'al',
      'mixteco': 'Ri taq k\'ayb\'al',
      'zapoteco': 'Ri taq k\'ayb\'al',
      'otomi': 'Ri taq k\'ayb\'al',
      'totonaco': 'Ri taq k\'ayb\'al',
      'mazateco': 'Ri taq k\'ayb\'al',
      'chol': 'Ri taq k\'ayb\'al',
      'mazahua': 'Ri taq k\'ayb\'al',
      'huasteco': 'Ri taq k\'ayb\'al',
      'chinanteco': 'Ri taq k\'ayb\'al',
      'purepecha': 'Ri taq k\'ayb\'al',
      'mixe': 'Ri taq k\'ayb\'al',
      'tlapaneco': 'Ri taq k\'ayb\'al',
      'tarahumara': 'Ri taq k\'ayb\'al'
    }
  },
  auth: {
    login: {
      'es-MX': 'Iniciar Sesión',
      'en': 'Login',
      'de': 'Anmelden',
      'fr': 'Connexion',
      'pt': 'Entrar',
      'maya': 'Ok pa',
      'nahuatl': 'Tlahtlaniliztli',
      'kiche': 'Ok pa',
      'kaqchikel': 'Ok pa',
      'mam': 'Ok pa',
      'qeqchi': 'Ok pa',
      'tzotzil': 'Ok pa',
      'tseltal': 'Ok pa',
      'mixteco': 'Ok pa',
      'zapoteco': 'Ok pa',
      'otomi': 'Ok pa',
      'totonaco': 'Ok pa',
      'mazateco': 'Ok pa',
      'chol': 'Ok pa',
      'mazahua': 'Ok pa',
      'huasteco': 'Ok pa',
      'chinanteco': 'Ok pa',
      'purepecha': 'Ok pa',
      'mixe': 'Ok pa',
      'tlapaneco': 'Ok pa',
      'tarahumara': 'Ok pa'
    },
    register: {
      'es-MX': 'Registrarse',
      'en': 'Register',
      'de': 'Registrieren',
      'fr': 'S\'inscrire',
      'pt': 'Registrar',
      'maya': 'Tz\'aqatisaj',
      'nahuatl': 'Tlahtlaniliztli',
      'kiche': 'Tz\'aqatisaj',
      'kaqchikel': 'Tz\'aqatisaj',
      'mam': 'Tz\'aqatisaj',
      'qeqchi': 'Tz\'aqatisaj',
      'tzotzil': 'Tz\'aqatisaj',
      'tseltal': 'Tz\'aqatisaj',
      'mixteco': 'Tz\'aqatisaj',
      'zapoteco': 'Tz\'aqatisaj',
      'otomi': 'Tz\'aqatisaj',
      'totonaco': 'Tz\'aqatisaj',
      'mazateco': 'Tz\'aqatisaj',
      'chol': 'Tz\'aqatisaj',
      'mazahua': 'Tz\'aqatisaj',
      'huasteco': 'Tz\'aqatisaj',
      'chinanteco': 'Tz\'aqatisaj',
      'purepecha': 'Tz\'aqatisaj',
      'mixe': 'Tz\'aqatisaj',
      'tlapaneco': 'Tz\'aqatisaj',
      'tarahumara': 'Tz\'aqatisaj'
    }
  }
};

// Función para obtener traducción o fallback
function getTranslation(category, key, language) {
  const translations = missingTranslations[category][key];
  return translations[language] || translations['es-MX'] || key;
}

// Función para actualizar un archivo de traducción
function updateTranslationFile(filePath, language) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const translations = JSON.parse(content);
    
    let updated = false;
    
    // Agregar claves de navegación faltantes
    if (!translations.common.navigation.about) {
      translations.common.navigation.about = getTranslation('navigation', 'about', language);
      updated = true;
    }
    if (!translations.common.navigation.contact) {
      translations.common.navigation.contact = getTranslation('navigation', 'contact', language);
      updated = true;
    }
    if (!translations.common.navigation.features) {
      translations.common.navigation.features = getTranslation('navigation', 'features', language);
      updated = true;
    }
    if (!translations.common.navigation.populations) {
      translations.common.navigation.populations = getTranslation('navigation', 'populations', language);
      updated = true;
    }
    if (!translations.common.navigation.technology) {
      translations.common.navigation.technology = getTranslation('navigation', 'technology', language);
      updated = true;
    }
    if (!translations.common.navigation.pricing) {
      translations.common.navigation.pricing = getTranslation('navigation', 'pricing', language);
      updated = true;
    }
    
    // Agregar claves de auth faltantes
    if (!translations.common.auth) {
      translations.common.auth = {};
    }
    if (!translations.common.auth.login) {
      translations.common.auth.login = getTranslation('auth', 'login', language);
      updated = true;
    }
    if (!translations.common.auth.register) {
      translations.common.auth.register = getTranslation('auth', 'register', language);
      updated = true;
    }
    
    if (updated) {
      fs.writeFileSync(filePath, JSON.stringify(translations, null, 2), 'utf8');
      console.log(`✅ ${language}: Archivo actualizado`);
      return true;
    } else {
      console.log(`✅ ${language}: Ya está completo`);
      return true;
    }
  } catch (error) {
    console.log(`❌ Error en ${language}:`, error.message);
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
  
  console.log('🔧 Actualizando archivos de traducción...\n');
  
  let allUpdated = true;
  
  languages.forEach(lang => {
    const filePath = path.join(localesDir, lang, 'common.json');
    if (fs.existsSync(filePath)) {
      const updated = updateTranslationFile(filePath, lang);
      if (!updated) allUpdated = false;
    } else {
      console.log(`❌ ${lang}: No se encontró common.json`);
      allUpdated = false;
    }
  });
  
  console.log('\n' + '='.repeat(50));
  if (allUpdated) {
    console.log('🎉 ¡Todos los archivos han sido actualizados!');
  } else {
    console.log('⚠️  Algunos archivos no pudieron ser actualizados');
  }
}

main();
