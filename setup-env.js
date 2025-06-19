const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const envContent = `# Google Maps API Configuration
# Obtenha sua chave em: https://console.cloud.google.com/apis/credentials
# Habilite as APIs: Maps JavaScript API e Places API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Outras configurações (opcional)
NEXT_PUBLIC_APP_NAME=ProLead Capture
NEXT_PUBLIC_APP_VERSION=1.0.0
`;

console.log('🔧 Configurando arquivo .env.local...');

if (fs.existsSync(envPath)) {
  console.log('⚠️  Arquivo .env.local já existe!');
  console.log('📝 Verifique se NEXT_PUBLIC_GOOGLE_MAPS_API_KEY está configurado corretamente.');
} else {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Arquivo .env.local criado com sucesso!');
  console.log('');
  console.log('📋 Próximos passos:');
  console.log('1. Abra o arquivo .env.local');
  console.log('2. Substitua "your_google_maps_api_key_here" pela sua chave real');
  console.log('3. Obtenha sua chave em: https://console.cloud.google.com/apis/credentials');
  console.log('4. Habilite as APIs: Maps JavaScript API e Places API');
  console.log('5. Reinicie o servidor: npm run dev');
}

console.log('');
console.log('🔑 Para obter sua chave da API:');
console.log('1. Acesse: https://console.cloud.google.com/');
console.log('2. Crie um projeto ou selecione um existente');
console.log('3. Vá em "APIs & Services" > "Credentials"');
console.log('4. Clique em "Create Credentials" > "API Key"');
console.log('5. Copie a chave e cole no arquivo .env.local');
console.log('6. Habilite as APIs necessárias no painel'); 