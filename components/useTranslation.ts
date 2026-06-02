'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { TranslationState, TranslationStateChange, SourceLanguage } from '@/lib/types';

interface UseTranslationOptions {
  targetLanguage: string;
  sourceLanguage: SourceLanguage;
  onStateChange?: TranslationStateChange;
}

export function useTranslation({ targetLanguage, sourceLanguage, onStateChange }: UseTranslationOptions) {
  const [state, setState] = useState<TranslationState>({
    status: 'idle',
    errorMessage: null,
    sourceTranscript: '',
    targetTranscript: '',
  });

  const [isActive, setIsActive] = useState(false);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const translatedAudioRef = useRef<HTMLAudioElement | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const sourceStreamRef = useRef<MediaStream | null>(null);
  const sessionClosingRef = useRef(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateState = useCallback((newState: Partial<TranslationState>) => {
    setState(prev => {
      const updated = { ...prev, ...newState };
      onStateChange?.(updated);
      return updated;
    });
  }, [onStateChange]);

  const clearCloseTimeout = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const cleanup = useCallback(() => {
    clearCloseTimeout();
    if (dataChannelRef.current) {
      try {
        dataChannelRef.current.close();
      } catch {}
      dataChannelRef.current = null;
    }
    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close();
      } catch {}
      peerConnectionRef.current = null;
    }
    if (sourceStreamRef.current) {
      sourceStreamRef.current.getTracks().forEach(track => track.stop());
      sourceStreamRef.current = null;
    }
    if (translatedAudioRef.current) {
      translatedAudioRef.current.srcObject = null;
    }
    sessionClosingRef.current = false;
  }, [clearCloseTimeout]);

  const finalizeStop = useCallback(() => {
    clearCloseTimeout();
    setIsActive(false);
    sessionClosingRef.current = false;
    updateState({
      status: 'idle',
      errorMessage: null,
      sourceTranscript: '',
      targetTranscript: '',
    });
  }, [updateState, clearCloseTimeout]);

  const stop = useCallback(() => {
    if (sessionClosingRef.current) return;

    if (!dataChannelRef.current || !peerConnectionRef.current) {
      cleanup();
      finalizeStop();
      return;
    }

    sessionClosingRef.current = true;

    try {
      dataChannelRef.current.send(JSON.stringify({ type: 'session.close' }));
    } catch {
      cleanup();
      finalizeStop();
      return;
    }

    closeTimeoutRef.current = setTimeout(() => {
      cleanup();
      finalizeStop();
    }, 2000);
  }, [cleanup, finalizeStop, clearCloseTimeout]);

  const start = useCallback(async () => {
    try {
      cleanup();
      updateState({
        status: 'connecting',
        errorMessage: null,
        sourceTranscript: '',
        targetTranscript: '',
      });
      setIsActive(true);

      const sessionResponse = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetLanguage }),
      });

      const sessionData = await sessionResponse.json();

      if (!sessionResponse.ok) {
        setIsActive(false);
        throw new Error(sessionData.error || 'Failed to create session');
      }

      const { clientSecret } = sessionData;

      if (!clientSecret) {
        setIsActive(false);
        throw new Error('No client secret returned from server');
      }

      const sourceStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      sourceStreamRef.current = sourceStream;

      const pc = new RTCPeerConnection();
      peerConnectionRef.current = pc;

      const audioTrack = sourceStream.getAudioTracks()[0];
      pc.addTrack(audioTrack, sourceStream);

      const translatedAudio = new Audio();
      translatedAudio.autoplay = true;
      translatedAudioRef.current = translatedAudio;

      pc.ontrack = (event) => {
        translatedAudio.srcObject = event.streams[0];
      };

      const dataChannel = pc.createDataChannel('oai-events');
      dataChannelRef.current = dataChannel;

      dataChannel.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === 'session.output_transcript.delta') {
            setState(prev => ({
              ...prev,
              targetTranscript: prev.targetTranscript + (msg.delta || ''),
            }));
          }

          if (msg.type === 'session.input_transcript.delta') {
            setState(prev => ({
              ...prev,
              sourceTranscript: prev.sourceTranscript + (msg.delta || ''),
            }));
          }

          if (msg.type === 'session.started') {
            updateState({ status: 'translating' });
          }

          if (msg.type === 'session.closed' || msg.type === 'session.ended') {
            clearCloseTimeout();
            cleanup();
            finalizeStop();
          }

          if (msg.type === 'error') {
            clearCloseTimeout();
            cleanup();
            setIsActive(false);
            updateState({ status: 'error', errorMessage: msg.error?.message || 'Translation error' });
          }
        } catch {}
      };

      dataChannel.onerror = () => {
        clearCloseTimeout();
        cleanup();
        setIsActive(false);
        updateState({ status: 'error', errorMessage: 'Data channel error' });
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpResponse = await fetch(
        'https://api.openai.com/v1/realtime/translations/calls',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${clientSecret}`,
            'Content-Type': 'application/sdp',
          },
          body: offer.sdp,
        }
      );

      if (!sdpResponse.ok) {
        const errorText = await sdpResponse.text();
        clearCloseTimeout();
        cleanup();
        setIsActive(false);
        throw new Error(`SDP exchange failed: ${errorText}`);
      }

      const answerSdp = await sdpResponse.text();
      await pc.setRemoteDescription({
        type: 'answer',
        sdp: answerSdp,
      });

    } catch (error) {
      clearCloseTimeout();
      cleanup();
      setIsActive(false);
      updateState({
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Failed to start translation',
      });
    }
  }, [targetLanguage, sourceLanguage, updateState, cleanup, finalizeStop, clearCloseTimeout, onStateChange]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    state,
    start,
    stop,
    isActive,
    isStopping: sessionClosingRef.current,
  };
}