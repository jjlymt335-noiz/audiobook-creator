import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Square, Loader2, ChevronRight } from 'lucide-react';
import { VoiceLibraryModal } from '@/components/VoiceLibrary/VoiceLibraryModal';
import * as api from '@/lib/api';
import { useUIStore } from '@/store';

interface Voice {
  voiceId: string;
  voiceName: string;
}

interface VoiceSelectorProps {
  narratorVoice: Voice | null;
  onNarratorVoiceChange: (voiceId: string, voiceName: string) => void;
  language: string;
}

export function VoiceSelector({
  narratorVoice,
  onNarratorVoiceChange,
  language,
}: VoiceSelectorProps) {
  const [voiceLibraryOpen, setVoiceLibraryOpen] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [loadingVoiceId, setLoadingVoiceId] = useState<string | null>(null);
  const showToast = useUIStore((state) => state.showToast);

  const handleOpenVoiceLibrary = () => {
    setVoiceLibraryOpen(true);
  };

  const handleSelectVoice = (voiceId: string, voiceName: string) => {
    onNarratorVoiceChange(voiceId, voiceName);
  };

  const handlePreview = async (voiceId: string) => {
    if (playingVoiceId === voiceId) {
      setPlayingVoiceId(null);
      return;
    }

    setLoadingVoiceId(voiceId);

    try {
      const sampleText = language === 'zh'
        ? '你好，这是我的声音预览，听起来怎么样？'
        : 'Hello, this is a preview of my voice. How does it sound?';

      const audioBlob = await api.textToSpeech({
        text: sampleText,
        voice_id: voiceId,
        output_format: 'mp3',
      });

      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      setPlayingVoiceId(voiceId);

      audio.onended = () => {
        setPlayingVoiceId(null);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        showToast('Failed to play preview', 'error');
        setPlayingVoiceId(null);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error('Preview failed:', error);
      showToast('Preview failed', 'error');
    } finally {
      setLoadingVoiceId(null);
    }
  };

  return (
    <Card className="rounded-xl border-gray-200/80 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Voice Selection</CardTitle>
        <p className="text-sm text-gray-400">
          Choose a voice for the narrator
        </p>
      </CardHeader>
      <CardContent className="space-y-2.5 pt-0">
        {/* Narrator Voice */}
        <div
          className="group flex items-center justify-between p-4 border border-gray-100 rounded-lg cursor-pointer hover:border-orange-300 hover:bg-orange-50/50 transition-all"
          onClick={handleOpenVoiceLibrary}
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-400 flex-shrink-0" />
            <div>
              <div className="text-base font-medium text-gray-900">Narrator</div>
              <div className={`text-sm ${narratorVoice ? 'text-gray-600' : 'text-gray-400 italic'}`}>
                {narratorVoice?.voiceName || 'Click to select voice'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {narratorVoice && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreview(narratorVoice.voiceId);
                }}
              >
                {loadingVoiceId === narratorVoice.voiceId ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : playingVoiceId === narratorVoice.voiceId ? (
                  <Square className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            )}
            <ChevronRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Voice Library Modal */}
        <VoiceLibraryModal
          open={voiceLibraryOpen}
          onClose={() => setVoiceLibraryOpen(false)}
          onSelectVoice={handleSelectVoice}
          currentVoiceId={narratorVoice?.voiceId || null}
          language={language}
        />
      </CardContent>
    </Card>
  );
}
