# Configuração do ProLead Capture

## 🔑 Configuração da API do Google Maps

Para que a aplicação funcione corretamente, você precisa configurar a API do Google Maps:

### 1. Obter a Chave da API

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative as seguintes APIs:
   - **Maps JavaScript API**
   - **Places API**
4. Vá para "Credenciais" e crie uma nova API Key
5. Configure as restrições de domínio se necessário (recomendado para produção)

### 2. Configurar a Variável de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com o seguinte conteúdo:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=sua_chave_api_aqui
```

### 3. Testar a Configuração

Após configurar a API key, execute:

```bash
npm run dev
```

Acesse `http://localhost:3000` e verifique se o mapa carrega corretamente.

## 🚀 Primeira Execução

Na primeira execução, a aplicação irá:

1. Carregar automaticamente dados de exemplo (5 leads de São Paulo)
2. Exibir o mapa centralizado em São Paulo
3. Mostrar estatísticas dos leads carregados

## 📝 Notas Importantes

- **Desenvolvimento**: Para desenvolvimento local, você pode usar a API key sem restrições
- **Produção**: Para produção, configure restrições de domínio na Google Cloud Console
- **Custos**: O Google Maps tem um limite gratuito generoso para desenvolvimento
- **Dados**: Todos os dados são salvos no localStorage do navegador

## 🔧 Solução de Problemas

### Mapa não carrega
- Verifique se a API key está configurada corretamente
- Confirme se as APIs estão ativadas no Google Cloud Console
- Verifique o console do navegador para erros

### Erro de CORS
- Configure as restrições de domínio na Google Cloud Console
- Adicione `localhost:3000` para desenvolvimento

### Limite de API excedido
- Verifique o uso no Google Cloud Console
- Considere implementar cache para reduzir chamadas 