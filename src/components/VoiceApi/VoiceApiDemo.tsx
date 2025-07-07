import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Settings, Mic, RefreshCw, Check, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';

interface VoiceOptions {
  id: string;
  name: string;
  gender: 'male' | 'female';
  accent?: string;
  tier: 'free' | 'pro' | 'enterprise';
}

const voices: VoiceOptions[] = [
  { id: 'alloy', name: 'Alloy', gender: 'female', tier: 'free' },
  { id: 'echo', name: 'Echo', gender: 'male', tier: 'free' },
  { id: 'fable', name: 'Fable', gender: 'female', tier: 'free' },
  { id: 'onyx', name: 'Onyx', gender: 'male', tier: 'free' },
  { id: 'nova', name: 'Nova', gender: 'female', tier: 'free' },
  { id: 'shimmer', name: 'Shimmer', gender: 'female', tier: 'free' },
  { id: 'emily', name: 'Emily', gender: 'female', accent: 'British', tier: 'pro' },
  { id: 'dave', name: 'Dave', gender: 'male', accent: 'British', tier: 'pro' },
  { id: 'madison', name: 'Madison', gender: 'female', accent: 'American', tier: 'pro' },
  { id: 'jackson', name: 'Jackson', gender: 'male', accent: 'American', tier: 'pro' },
  { id: 'aria', name: 'Aria', gender: 'female', accent: 'Australian', tier: 'enterprise' },
  { id: 'thomas', name: 'Thomas', gender: 'male', accent: 'Australian', tier: 'enterprise' },
];

export const VoiceApiDemo: React.FC = () => {
  const [text, setText] = useState('Welcome to RepMotivatedSeller, your trusted foreclosure assistance partner. How can we help you today?');
  const [selectedVoice, setSelectedVoice] = useState<string>('alloy');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<'standard' | 'hd'>('standard');
  const [speed, setSpeed] = useState<number>(1.0);
  const [usageLogged, setUsageLogged] = useState(false);
  const [usageLimits, setUsageLimits] = useState<any>(null);
  const [isCheckingLimits, setIsCheckingLimits] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const { user } = useAuthStore();

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // Reset audio when text changes
    if (audioUrl) {
      setAudioUrl(null);
      setIsPlaying(false);
    }
  };

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVoice(e.target.value);
    // Reset audio when voice changes
    if (audioUrl) {
      setAudioUrl(null);
      setIsPlaying(false);
    }
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setModel(e.target.value as 'standard' | 'hd');
    // Reset audio when model changes
    if (audioUrl) {
      setAudioUrl(null);
      setIsPlaying(false);
    }
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSpeed(parseFloat(e.target.value));
    
    // Update playback rate if audio is loaded
    if (audioRef.current) {
      audioRef.current.playbackRate = parseFloat(e.target.value);
    }
  };

  const checkApiLimits = async () => {
    if (!text.trim()) return;
    
    setIsCheckingLimits(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-api-limits', {
        body: {
          apiType: 'voice',
          requestSize: text.length
        }
      });
      
      if (error) throw error;
      setUsageLimits(data);
      
      if (!data.allowed) {
        setError(data.message || 'Usage limit exceeded');
      }
      
      return data.allowed;
    } catch (err) {
      console.error('Error checking API limits:', err);
      return true; // Allow by default if check fails
    } finally {
      setIsCheckingLimits(false);
    }
  };

  const generateSpeech = async () => {
    if (!text.trim()) {
      setError('Please enter some text to convert to speech');
      return;
    }

    // Check API limits first
    const limitsOk = await checkApiLimits();
    if (!limitsOk) return;

    setIsLoading(true);
    setError(null);
    setUsageLogged(false);

    try {
      // Check if user can access the selected voice based on their tier
      const selectedVoiceObj = voices.find(v => v.id === selectedVoice);
      if (!selectedVoiceObj) {
        throw new Error('Invalid voice selected');
      }

      // Check if user's tier allows access to this voice
      const userTier = user?.membershipTier || 'free';
      const tierLevels = { 'free': 0, 'pro': 1, 'enterprise': 2 };
      const userTierLevel = tierLevels[userTier as keyof typeof tierLevels];
      const voiceTierLevel = tierLevels[selectedVoiceObj.tier];

      if (userTierLevel < voiceTierLevel) {
        throw new Error(`The "${selectedVoiceObj.name}" voice requires ${selectedVoiceObj.tier} tier or higher`);
      }

      // Check if HD model is allowed for user's tier
      if (model === 'hd' && userTier === 'free') {
        throw new Error('HD voice model requires Pro tier or higher');
      }

      // In a real implementation, you would call your TTS API here
      // For demo purposes, we'll simulate an API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate audio URL (in a real app, this would come from your TTS API)
      // For demo, we'll use the browser's built-in speech synthesis
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speed;
      
      // Log usage to Supabase
      await logVoiceUsage();

      // Create a blob URL for the audio (simulated)
      // In a real implementation, you would use the audio data from your API
      setAudioUrl('demo-audio-url');
      setUsageLogged(true);

      // Use browser's speech synthesis for demo
      if (window.speechSynthesis) {
        if (audioRef.current) {
          audioRef.current.onplay = () => {
            window.speechSynthesis.speak(utterance);
            setIsPlaying(true);
          };
          
          audioRef.current.onpause = () => {
            window.speechSynthesis.pause();
            setIsPlaying(false);
          };
          
          audioRef.current.onended = () => {
            setIsPlaying(false);
          };
        }
      }
    } catch (err) {
      console.error('Error generating speech:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate speech');
    } finally {
      setIsLoading(false);
    }
  };

  const logVoiceUsage = async () => {
    try {
      // Call the voice-usage function to log the usage
      const { data, error } = await supabase.functions.invoke('voice-usage', {
        body: {
          text,
          voice: selectedVoice,
          model,
          tier: user?.membershipTier || 'free'
        }
      });

      if (error) {
        console.error('Error logging voice usage:', error);
      } else {
        console.log('Voice usage logged successfully:', data);
      }
    } catch (err) {
      console.error('Failed to log voice usage:', err);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      window.speechSynthesis.pause();
    } else {
      if (audioUrl) {
        audioRef.current.play();
        window.speechSynthesis.resume();
      } else {
        generateSpeech();
      }
    }
    
    setIsPlaying(!isPlaying);
  };

  const stopAudio = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  // Filter voices based on user's tier
  const userTier = user?.membershipTier || 'free';
  const tierLevels = { 'free': 0, 'pro': 1, 'enterprise': 2 };
  const userTierLevel = tierLevels[userTier as keyof typeof tierLevels];
  
  const availableVoices = voices.filter(voice => {
    const voiceTierLevel = tierLevels[voice.tier];
    return userTierLevel >= voiceTierLevel;
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <Volume2 className="w-5 h-5 mr-2 text-blue-600" />
          Text-to-Speech API
        </h2>
        {user && (
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-2">Tier:</span>
            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
              user.membershipTier === 'free' 
                ? 'bg-gray-100 text-gray-800' 
                : user.membershipTier === 'pro'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-purple-100 text-purple-800'
            }`}>
              {user.membershipTier}
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
          <AlertTriangle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {usageLogged && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start">
          <Check className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>Voice usage logged successfully!</span>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
            Text to Convert
          </label>
          <textarea
            id="text"
            rows={4}
            value={text}
            onChange={handleTextChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
            placeholder="Enter text to convert to speech..."
          />
          <div className="mt-1 text-xs text-gray-500 flex justify-between">
            <span>{text.length} characters</span>
            {user?.membershipTier === 'free' && (
              <span>Free tier limit: 5,000 characters per day</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="voice" className="block text-sm font-medium text-gray-700 mb-2">
              Voice
            </label>
            <div className="relative">
              <Mic className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                id="voice"
                value={selectedVoice}
                onChange={handleVoiceChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none"
              >
                {availableVoices.map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name} ({voice.gender}
                    {voice.accent ? `, ${voice.accent}` : ''})
                    {voice.tier !== 'free' ? ` - ${voice.tier}` : ''}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
              Model Quality
            </label>
            <div className="relative">
              <Settings className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                id="model"
                value={model}
                onChange={handleModelChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none"
                disabled={user?.membershipTier === 'free'}
              >
                <option value="standard">Standard</option>
                <option value="hd">HD Quality {user?.membershipTier === 'free' ? '(Pro+ only)' : ''}</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="speed" className="block text-sm font-medium text-gray-700 mb-2">
              Playback Speed: {speed.toFixed(1)}x
            </label>
            <input
              id="speed"
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={speed}
              onChange={handleSpeedChange}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0.5x</span>
              <span>1.0x</span>
              <span>2.0x</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={generateSpeech}
            disabled={isLoading || !text.trim()}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Volume2 className="w-5 h-5 mr-2" />
                Generate Speech
              </>
            )}
          </button>

          {audioUrl && (
            <div className="flex items-center space-x-4">
              <button
                onClick={togglePlayPause}
                className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 text-gray-700" />
                ) : (
                  <Play className="w-6 h-6 text-gray-700" />
                )}
              </button>
              <button
                onClick={stopAudio}
                className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                <VolumeX className="w-6 h-6 text-gray-700" />
              </button>
            </div>
          )}
        </div>

        {/* Hidden audio element for playback */}
        <audio ref={audioRef} src={audioUrl || ''} />
      </div>

      {user?.membershipTier === 'free' && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Clock className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900">Upgrade for Premium Voices</h4>
              <p className="text-blue-800 text-sm mt-1">
                Upgrade to Pro or Enterprise tier to access premium voices, HD quality, and higher usage limits.
              </p>
              <a 
                href="/pricing" 
                className="inline-block mt-2 text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                View Pricing Plans →
              </a>
            </div>
          </div>
        </div>
      )}
      
      {usageLimits && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Usage Statistics</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-blue-700 font-medium">Daily Usage</div>
              <div className="flex justify-between mt-1">
                <span>Used:</span>
                <span>{usageLimits.currentUsage.daily.toLocaleString()} chars</span>
              </div>
              <div className="flex justify-between">
                <span>Limit:</span>
                <span>{usageLimits.limits.daily.toLocaleString()} chars</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(100, (usageLimits.currentUsage.daily / usageLimits.limits.daily) * 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="text-blue-700 font-medium">Monthly Usage</div>
              <div className="flex justify-between mt-1">
                <span>Used:</span>
                <span>{usageLimits.currentUsage.monthly.toLocaleString()} chars</span>
              </div>
              <div className="flex justify-between">
                <span>Limit:</span>
                <span>{usageLimits.limits.monthly.toLocaleString()} chars</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(100, (usageLimits.currentUsage.monthly / usageLimits.limits.monthly) * 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="text-blue-700 font-medium">Request Size</div>
              <div className="flex justify-between mt-1">
                <span>Current:</span>
                <span>{text.length.toLocaleString()} chars</span>
              </div>
              <div className="flex justify-between">
                <span>Max:</span>
                <span>{usageLimits.limits.maxRequestSize.toLocaleString()} chars</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className={`h-2 rounded-full ${text.length > usageLimits.limits.maxRequestSize ? 'bg-red-600' : 'bg-blue-600'}`}
                  style={{ width: `${Math.min(100, (text.length / usageLimits.limits.maxRequestSize) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};