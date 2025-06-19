#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando ProLead Capture...\n');

// Verificar se o arquivo .env.local já existe
const envPath = path.join(__dirname, '..', '.env.local');

if (fs.existsSync(envPath)) {
  console.log('✅ Arquivo .env.local já existe');
} else {
  console.log('📝 Criando arquivo .env.local...');
  
  const envContent = `# Google Maps API Key
# Obtenha sua chave em: https://console.cloud.google.com/
# APIs necessárias: Maps JavaScript API, Places API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Arquivo .env.local criado com sucesso!');
}

console.log('\n📋 Próximos passos:');
console.log('1. Edite o arquivo .env.local e adicione sua API key do Google Maps');
console.log('2. Execute: npm run dev');
console.log('3. Acesse: http://localhost:3000');
console.log('\n📖 Para mais informações, consulte o arquivo SETUP.md');

console.log('\n🎉 Setup concluído!'); 