# Sistema de Tema - ProLead

## Visão Geral

O ProLead agora possui um sistema de tema completo que permite alternar entre:
- **Claro** (Light)
- **Escuro** (Dark) 
- **Sistema** (segue a preferência do sistema operacional)

## Componentes Implementados

### 1. ThemeContext (`src/contexts/ThemeContext.tsx`)
- Gerencia o estado global do tema
- Persiste a preferência no localStorage
- Detecta automaticamente mudanças no tema do sistema
- Fornece o hook `useTheme()` para componentes

### 2. ThemeToggle (`src/components/ThemeToggle.tsx`)
- Componente de toggle com dropdown
- Ícones intuitivos (Sol, Lua, Monitor)
- Mostra o tema atual selecionado
- Integrado no header da aplicação

### 3. Integração com Google Maps
- Estilos do mapa adaptam automaticamente ao tema
- Pins personalizados com cores baseadas no tema
- Popups nativos com cores adaptativas
- Dialog de detalhes com tema consistente

## Como Usar

### Em Componentes
```tsx
import { useTheme } from '@/contexts/ThemeContext';

function MeuComponente() {
  const { theme, setTheme, isDark } = useTheme();
  
  return (
    <div className={`${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <p>Tema atual: {theme}</p>
      <button onClick={() => setTheme('dark')}>
        Mudar para Escuro
      </button>
    </div>
  );
}
```

### Classes CSS Suportadas
O sistema usa as variáveis CSS do Tailwind para tema:

```css
/* Cores principais */
bg-background          /* Fundo principal */
text-foreground        /* Texto principal */
text-muted-foreground  /* Texto secundário */

/* Componentes */
bg-card               /* Fundo de cards */
border-border         /* Bordas */
bg-accent             /* Fundo de hover */
bg-primary            /* Cor primária */
```

### Classes Condicionais para Dark Mode
```tsx
// Exemplo de badge com tema adaptativo
<Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
  Status
</Badge>
```

## Funcionalidades

### ✅ Implementado
- [x] Toggle entre 3 temas (Claro/Escuro/Sistema)
- [x] Persistência no localStorage
- [x] Detecção automática do tema do sistema
- [x] Integração com Google Maps
- [x] Componentes UI adaptativos
- [x] Transições suaves
- [x] Ícones intuitivos

### 🎨 Estilo Visual
- **Claro**: Fundo branco, texto escuro, cores vibrantes
- **Escuro**: Fundo escuro, texto claro, cores suaves
- **Sistema**: Segue a preferência do usuário

### 🔧 Configuração
O tema é configurado automaticamente no `layout.tsx`:
```tsx
<ThemeProvider>
  {children}
</ThemeProvider>
```

## Arquivos Modificados

1. `src/contexts/ThemeContext.tsx` - Contexto de tema
2. `src/components/ThemeToggle.tsx` - Componente de toggle
3. `src/components/ui/dropdown-menu.tsx` - Componente UI necessário
4. `src/app/layout.tsx` - Integração do provider
5. `src/components/LeadCapture.tsx` - Integração do toggle
6. `src/components/Map.tsx` - Adaptação para tema
7. `src/app/globals.css` - Variáveis CSS (já configurado)

## Próximos Passos

Para adicionar suporte a tema em novos componentes:

1. Importe o hook: `import { useTheme } from '@/contexts/ThemeContext'`
2. Use `isDark` para lógica condicional
3. Use classes CSS com prefixo `dark:` para estilos específicos
4. Teste em ambos os temas

O sistema está pronto para uso e pode ser facilmente estendido para novos componentes! 