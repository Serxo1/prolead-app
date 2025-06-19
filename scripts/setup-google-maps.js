#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Configuração do Google Maps API');
console.log('=====================================\n');

const envPath = path.join(process.cwd(), '.env.local');

// Check if .env.local already exists
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  if (content.includes('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY')) {
    console.log('✅ Arquivo .env.local já existe com a configuração do Google Maps');
    console.log('📁 Localização:', envPath);
    return;
  }
}

console.log('📋 Instruções para obter sua API Key:');
console.log('');
console.log('1. 🌐 Acesse: https://console.cloud.google.com/');
console.log('2. 📁 Crie um novo projeto ou selecione um existente');
console.log('3. 🔧 Ative a "Maps JavaScript API":');
console.log('   - Vá para "APIs & Services" > "Library"');
console.log('   - Procure por "Maps JavaScript API"');
console.log('   - Clique em "Enable"');
console.log('4. 🔑 Crie as credenciais:');
console.log('   - Vá para "APIs & Services" > "Credentials"');
console.log('   - Clique em "Create Credentials" > "API Key"');
console.log('   - Copie a chave gerada');
console.log('');

// Create .env.local file
const envContent = `# Google Maps API Configuration
# Obtenha sua chave em: https://console.cloud.google.com/apis/credentials
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Instruções:
# 1. Substitua 'your_google_maps_api_key_here' pela sua chave real
# 2. Reinicie o servidor de desenvolvimento: npm run dev
# 3. Para maior segurança, configure restrições na API key
`;

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Arquivo .env.local criado com sucesso!');
  console.log('📁 Localização:', envPath);
  console.log('');
  console.log('🔧 Próximos passos:');
  console.log('1. Abra o arquivo .env.local');
  console.log('2. Substitua "your_google_maps_api_key_here" pela sua chave real');
  console.log('3. Salve o arquivo');
  console.log('4. Reinicie o servidor: npm run dev');
  console.log('');
  console.log('🔒 Dica de segurança: Configure restrições na sua API key no Google Cloud Console');
} catch (error) {
  console.error('❌ Erro ao criar arquivo .env.local:', error.message);
  console.log('');
  console.log('📝 Crie manualmente o arquivo .env.local na raiz do projeto com:');
  console.log('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=sua_chave_aqui');
} 