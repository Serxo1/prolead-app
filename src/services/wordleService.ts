import { CacheService } from './cacheService';

export class WordleService {
  private static readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas
  private static readonly CACHE_KEY_PREFIX = 'wordle_word';

  /**
   * Obtém a palavra do Wordle do dia usando nossa API route local
   */
  static async getWordleWordOfTheDay(): Promise<string> {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    const cacheKey = `${this.CACHE_KEY_PREFIX}:${dateString}`;

    // Verificar cache primeiro
    const cached = CacheService.get<string>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Usar nossa API route local
      const response = await fetch(`/api/wordle?date=${dateString}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.solution || typeof data.solution !== 'string') {
        throw new Error('Formato de resposta inesperado');
      }

      const word = data.solution.toLowerCase();
      
      // Cachear o resultado
      CacheService.set(cacheKey, word, this.CACHE_TTL);
      
      return word;
    } catch (error) {
      console.error('Erro ao obter palavra do Wordle:', error);
      // Fallback: usar uma palavra fixa baseada na data
      const fallbackWord = this.getFallbackWord(dateString);
      CacheService.set(cacheKey, fallbackWord, this.CACHE_TTL);
      return fallbackWord;
    }
  }

  /**
   * Gera uma palavra fallback baseada na data
   */
  private static getFallbackWord(dateString: string): string {
    const words = [
      'prolead', 'system', 'access', 'login', 'secure', 'portal', 'manage', 'control',
      'dashboard', 'monitor', 'track', 'analyze', 'report', 'export', 'import', 'sync',
      'backup', 'restore', 'config', 'setup', 'install', 'update', 'patch', 'fix',
      'debug', 'test', 'build', 'deploy', 'release', 'version', 'branch', 'merge'
    ];
    
    // Usar a data como seed para gerar uma palavra consistente
    const date = new Date(dateString);
    const seed = date.getTime() % words.length;
    return words[seed] || 'prolead';
  }

  /**
   * Limpa o cache do Wordle
   */
  static clearCache(): void {
    const keysToDelete: string[] = [];
    
    for (const key of CacheService['cache'].keys()) {
      if (key.startsWith(this.CACHE_KEY_PREFIX)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => CacheService.delete(key));
  }

  /**
   * Obtém estatísticas do cache do Wordle
   */
  static getCacheStats() {
    const stats = CacheService.getStats();
    const wordleKeys = Array.from(CacheService['cache'].keys()).filter(key =>
      key.startsWith(this.CACHE_KEY_PREFIX)
    );
    
    return {
      ...stats,
      wordleKeys: wordleKeys.length,
    };
  }
} 