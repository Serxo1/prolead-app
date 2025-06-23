'use client';

import { useState, useEffect } from 'react';
import { WordleService } from '@/services/wordleService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Calendar, Eye, EyeOff } from 'lucide-react';

export default function WordleSecretPage() {
  const [wordleWord, setWordleWord] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showWord, setShowWord] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchWordleWord = async () => {
    setLoading(true);
    setError('');
    try {
      const word = await WordleService.getWordleWordOfTheDay();
      setWordleWord(word);
    } catch (err) {
      setError('Erro ao obter palavra do Wordle');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWordleWord();
  }, []);

  const today = new Date().toLocaleDateString('pt-BR');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md mx-auto pt-20">
        <Card className="w-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              Palavra Secreta - {today}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <span className="ml-2">Carregando...</span>
              </div>
            ) : error ? (
              <div className="text-center py-4">
                <p className="text-red-500 mb-2">{error}</p>
                <Button onClick={fetchWordleWord} variant="outline" size="sm">
                  Tentar Novamente
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Senha de acesso para hoje:
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    {showWord ? (
                      <Badge variant="secondary" className="text-lg px-4 py-2 font-mono">
                        {wordleWord}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-lg px-4 py-2 font-mono">
                        •••••••
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowWord(!showWord)}
                      className="ml-2"
                    >
                      {showWord ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {showWord ? 'Clique no ícone para ocultar' : 'Clique no ícone para revelar'}
                  </p>
                </div>

                <div className="flex justify-center">
                  <Button
                    onClick={fetchWordleWord}
                    variant="outline"
                    size="sm"
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Atualizar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Página secreta - mantenha em sigilo
          </p>
        </div>
      </div>
    </div>
  );
} 