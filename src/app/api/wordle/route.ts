import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    // Lista de APIs públicas do Wordle para tentar
    const apis = [
      // API 1: Wordle API pública
      `https://wordle-api.vercel.app/api/wordle/${date}`,
      // API 2: Alternativa usando uma API de palavras
      `https://api.datamuse.com/words?sp=?????&max=1`,
      // API 3: Outra alternativa
      `https://random-word-api.herokuapp.com/word?length=5`,
    ];

    for (const apiUrl of apis) {
      try {
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          // Timeout de 5 segundos
          signal: AbortSignal.timeout(5000),
        });

        if (!response.ok) {
          continue;
        }

        const data = await response.json();
        
        // Extrair palavra baseado no formato da resposta
        let word: string | null = null;
        
        if (typeof data === 'string') {
          word = data;
        } else if (data.solution) {
          word = data.solution;
        } else if (data.word) {
          word = data.word;
        } else if (Array.isArray(data) && data.length > 0) {
          word = data[0].word || data[0];
        } else if (data.answer) {
          word = data.answer;
        }

        if (word && word.length === 5) {
          return NextResponse.json({ 
            solution: word.toLowerCase(),
            date: date,
            source: apiUrl 
          });
        }
      } catch (error) {
        console.warn(`API falhou: ${apiUrl}`, error);
        continue;
      }
    }

    // Se todas as APIs falharem, usar fallback
    const fallbackWords = [
      'prolead', 'system', 'access', 'login', 'secure', 'portal', 'manage', 'control',
      'dashboard', 'monitor', 'track', 'analyze', 'report', 'export', 'import', 'sync',
      'backup', 'restore', 'config', 'setup', 'install', 'update', 'patch', 'fix',
      'debug', 'test', 'build', 'deploy', 'release', 'version', 'branch', 'merge'
    ];
    
    // Usar a data como seed para gerar uma palavra consistente
    const dateObj = new Date(date);
    const seed = dateObj.getTime() % fallbackWords.length;
    const fallbackWord = fallbackWords[seed] || 'prolead';

    return NextResponse.json({ 
      solution: fallbackWord,
      date: date,
      source: 'fallback'
    });

  } catch (error) {
    console.error('Erro na API do Wordle:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 