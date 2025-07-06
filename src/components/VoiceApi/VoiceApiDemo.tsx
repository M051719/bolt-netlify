import React, { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Play, Pause, Volume2, RefreshCw, Save, Trash, Settings } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface VoiceOptions {
  model: string;
  voice: string;
  speed?: number;
}

export const VoiceApiDemo: React.FC = () => {
  const [text, setText] = useState<string>('Hello! This is a demonstration of the text-to-speech API integration with OpenAI.');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [voiceOptions, setVoiceOptions] = useState<VoiceOptions>({
    model: 'tts-1',
    voice: 'alloy',
    speed: 1.0
  });
  const [usageStats, setUsageStats] = useState<any>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const { user, isAuthenticated } = useAuthStore();

  const voices = [
    { id: 'alloy', name: 'Alloy', description: 'Versatile, balanced voice' },
    { id: 'echo', name: 'Echo', description: 'Soft, warm voice' },
    { id: 'fable', name: 'Fable', description: 'Narrative, storytelling voice' },
    { id: 'onyx', name: 'Onyx', description: 'Deep, authoritative voice' },
    { id: 'nova', name: 'Nova', description: 'Energetic, professional voice' },
    { id: 'shimmer', name: 'Shimmer', description: 'Clear, gentle voice' }
  ];

  const models = [
    { id: 'tts-1', name: 'TTS-1', description: 'Standard quality' },
    { id: 'tts-1-hd', name: 'TTS-1-HD', description: 'High quality' }
  ];

  const handleTextToSpeech = async () => {
    if (!text.trim()) {
      setError('Please enter some text to convert to speech');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // First, log the usage
      const { data: usageData, error: usageError } = await supabase.functions.invoke('voice-usage', {
        body: {
          text_length: text.length,
          voice: voiceOptions.voice,
          model: voiceOptions.model,
          tier: user?.membershipTier || 'free'
        }
      });

      if (usageError) throw usageError;
      setUsageStats(usageData.usage);

      // Then, generate the speech
      const response = await supabase.functions.invoke('ai-voice-function', {
        body: {
          text,
          voice: voiceOptions.voice,
          model: voiceOptions.model,
          responseFormat: 'mp3'
        },
        responseType: 'arraybuffer'
      });

      if (response.error) throw response.error;

      // Create a blob from the audio data
      const blob = new Blob([response.data], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      
      // Clean up previous audio URL if it exists
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      
      setAudioUrl(url);
      
      // Play the audio
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.playbackRate = voiceOptions.speed || 1.0;
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Error generating speech:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while generating speech');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleClearAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  };

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setVoiceOptions({ ...voiceOptions, voice: e.target.value });
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setVoiceOptions({ ...voiceOptions, model: e.target.value });
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const speed = parseFloat(e.target.value);
    setVoiceOptions({ ...voiceOptions, speed });
    
    if (audioRef.current && !isNaN(speed)) {
      audioRef.current.playbackRate = speed;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center py-8">
          <Volume2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Text-to-Speech API</h2>
          <p className="text-gray-600 mb-6">Please sign in to use the voice API features.</p>
          <a 
            href="/auth" 
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center mb-6">
        <Volume2 className="w-8 h-8 text-blue-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-800">Text-to-Speech API</h2>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Text to Convert
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter text to convert to speech..."
        />
        <div className="text-right text-sm text-gray-500 mt-1">
          {text.length} characters
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Voice
          </label>
          <select
            value={voiceOptions.voice}
            onChange={handleVoiceChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {voices.map((voice) => (
              <option key={voice.id} value={voice.id}>
                {voice.name} - {voice.description}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Model
          </label>
          <select
            value={voiceOptions.model}
            onChange={handleModelChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name} - {model.description}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Playback Speed: {voiceOptions.speed?.toFixed(1)}x
          </label>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={voiceOptions.speed}
            onChange={handleSpeedChange}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={handleTextToSpeech}
          disabled={isLoading || !text.trim()}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Generate Speech
            </>
          )}
        </button>

        {audioUrl && (
          <>
            <button
              onClick={handlePlayPause}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Play
                </>
              )}
            </button>

            <button
              onClick={handleClearAudio}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Trash className="w-5 h-5 mr-2" />
              Clear
            </button>

            <a
              href={audioUrl}
              download={`speech-${new Date().getTime()}.mp3`}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Save className="w-5 h-5 mr-2" />
              Download
            </a>
          </>
        )}
      </div>

      {audioUrl && (
        <div className="mb-8">
          <audio 
            ref={audioRef} 
            controls 
            className="w-full" 
            onEnded={handleAudioEnded}
          >
            <source src={audioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      {usageStats && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Settings className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-blue-800">Usage Statistics</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white p-3 rounded border border-blue-100">
              <div className="text-gray-600">Current Request</div>
              <div className="text-xl font-semibold">{usageStats.current} chars</div>
            </div>
            <div className="bg-white p-3 rounded border border-blue-100">
              <div className="text-gray-600">30-Day Usage</div>
              <div className="text-xl font-semibold">{usageStats.total_30_days} chars</div>
            </div>
            <div className="bg-white p-3 rounded border border-blue-100">
              <div className="text-gray-600">Current Tier</div>
              <div className="text-xl font-semibold capitalize">{usageStats.tier}</div>
            </div>
          </div>
          <div className="mt-3 text-xs text-blue-600">
            Usage is tracked for billing and quota management purposes.
          </div>
        </div>
      )}
    </div>
  );
};