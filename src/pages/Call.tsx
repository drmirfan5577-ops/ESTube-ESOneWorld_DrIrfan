import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

export default function Call() {
  const { user } = useAuth();
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const [callId, setCallId] = useState('');
  const [inCall, setInCall] = useState(false);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  async function startCall() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (localRef.current) localRef.current.srcObject = stream;
    const id = crypto.randomUUID().slice(0,8);
    setCallId(id);
    setInCall(true);
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    pcRef.current = pc;
    stream.getTracks().forEach(t => pc.addTrack(t, stream));
    pc.onicecandidate = e => {
      if (e.candidate) supabase.channel(`call:${id}`).send({ type:'broadcast', event:'ice', payload: e.candidate });
    };
    pc.ontrack = e => { if (remoteRef.current) remoteRef.current.srcObject = e.streams[0]; };
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    supabase.channel(`call:${id}`).send({ type:'broadcast', event:'offer', payload: offer });
    supabase.channel(`call:${id}`).on('broadcast', { event:'answer' }, async ({ payload }) => {
      await pc.setRemoteDescription(payload);
    }).on('broadcast', { event:'ice' }, async ({ payload }) => {
      await pc.addIceCandidate(payload);
    }).subscribe();
  }

  async function joinCall() {
    if (!callId) return;
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (localRef.current) localRef.current.srcObject = stream;
    setInCall(true);
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    pcRef.current = pc;
    stream.getTracks().forEach(t => pc.addTrack(t, stream));
    pc.onicecandidate = e => {
      if (e.candidate) supabase.channel(`call:${callId}`).send({ type:'broadcast', event:'ice', payload: e.candidate });
    };
    pc.ontrack = e => { if (remoteRef.current) remoteRef.current.srcObject = e.streams[0]; };
    supabase.channel(`call:${callId}`).on('broadcast', { event:'offer' }, async ({ payload }) => {
      await pc.setRemoteDescription(payload);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      supabase.channel(`call:${callId}`).send({ type:'broadcast', event:'answer', payload: answer });
    }).on('broadcast', { event:'ice' }, async ({ payload }) => {
      await pc.addIceCandidate(payload);
    }).subscribe();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📹 Video Call (WebRTC)</h2>
      {!inCall ? (
        <div className="space-y-3">
          <button onClick={startCall} className="w-full bg-green-600 text-white py-3 rounded font-bold">🎥 Start New Call</button>
          {callId && <p className="text-center">Share Call ID: <b className="text-blue-600">{callId}</b></p>}
          <div className="flex gap-2">
            <input value={callId} onChange={e=>setCallId(e.target.value)} placeholder="Enter Call ID" className="flex-1 p-2 border rounded dark:bg-gray-700"/>
            <button onClick={joinCall} className="px-6 bg-blue-600 text-white rounded">Join</button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm mb-1">You</p>
            <video ref={localRef} autoPlay muted className="w-full aspect-video bg-black rounded"/>
          </div>
          <div>
            <p className="text-sm mb-1">Remote</p>
            <video ref={remoteRef} autoPlay className="w-full aspect-video bg-black rounded"/>
          </div>
        </div>
      )}
      <p className="mt-4 text-center text-sm text-gray-500">Call ID: {callId || 'Not started'}</p>
    </div>
  );
}