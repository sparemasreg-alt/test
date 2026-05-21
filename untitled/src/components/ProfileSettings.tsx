import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMarketStore } from '../store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Upload, Globe, ShieldCheck, Sparkles, Check, Loader2, Landmark } from 'lucide-react';
import { toast } from 'sonner';

const PRESET_AVATARS = [
  { name: 'Neon Grass', value: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=150&auto=format&fit=crop&q=80' },
  { name: 'Ocean Mist', value: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { name: 'Cyber Gold', value: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80' },
  { name: 'Royal Orchid', value: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { name: 'Deep Slate', value: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' }
];

export const ProfileSettings = () => {
  const { profile } = useAuth();
  const { updateProfile } = useMarketStore();
  
  const [club, setClub] = useState('');
  const [bio, setBio] = useState('');
  const [nationality, setNationality] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  
  const [dragActive, setDragActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setClub(profile.club || '');
      setBio(profile.bio || '');
      setNationality(profile.nationality || '');
      setPhotoURL(profile.photoURL || '');
    }
  }, [profile]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size too large. Under 5MB is best!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas to downscale the image to a solid dimension
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 250;
        const MAX_HEIGHT = 250;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setPhotoURL(dataUrl);
          toast.success('Image loaded and optimized successfully.');
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        club: club.trim(),
        bio: bio.trim(),
        nationality: nationality.trim(),
        photoURL: photoURL
      });
    } catch (err: any) {
      toast.error('Failed to update profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="bg-white/5 border-white/10 rounded-xl shadow-none">
      <CardHeader>
        <CardTitle className="text-lg font-black text-[#e0e0e0] uppercase tracking-tighter flex items-center gap-2">
          <User className="w-5 h-5 text-[#48A111]" />
          My Profile Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Left side: Avatar picker */}
            <div className="flex flex-col items-center gap-3 w-full md:w-auto">
              <div className="relative group">
                {photoURL ? (
                  <img 
                    src={photoURL} 
                    alt="Profile Avatar" 
                    className="w-24 h-24 rounded-full border-2 border-[#48A111] object-cover bg-black shadow-lg"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-white/20 bg-white/5 flex items-center justify-center text-white/40">
                    <User className="w-10 h-10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-bold text-white uppercase tracking-wider" onClick={triggerFileInput}>
                  Change
                </div>
              </div>
              <button 
                type="button"
                onClick={triggerFileInput} 
                className="text-xs font-bold uppercase tracking-widest text-[#48A111] hover:underline"
              >
                Upload Photo
              </button>
            </div>

            {/* Drag & Drop area */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileInput}
              className={`flex-1 w-full border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                dragActive 
                  ? 'border-[#48A111] bg-[#48A111]/5' 
                  : 'border-white/10 hover:border-white/20 bg-white/5'
              }`}
            >
              <Upload className={`w-6 h-6 ${dragActive ? 'text-[#48A111]' : 'text-white/40'}`} />
              <p className="text-xs text-center text-[#e0e0e0] font-sans">
                Drag & drop profile photo here, or <span className="text-[#48A111] underline">browse files</span>
              </p>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono">PNG, JPG, or WEBP up to 5MB</p>
              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="hidden" 
              />
            </div>
          </div>

          {/* Quick preset selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#48A111]" /> Quick Preset Avatars
            </label>
            <div className="flex flex-wrap gap-3">
              {PRESET_AVATARS.map((avatar, idx) => {
                const isSelected = photoURL === avatar.value;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPhotoURL(avatar.value);
                      toast.success(`Selected '${avatar.name}' preset.`);
                    }}
                    className={`relative w-10 h-10 rounded-full overflow-hidden border transition-all ${
                      isSelected ? 'border-2 border-[#48A111] ring-2 ring-[#48A111]/30 scale-105' : 'border-white/20 hover:scale-105'
                    }`}
                  >
                    <img 
                      src={avatar.value} 
                      alt={avatar.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#48A111]/40 flex items-center justify-center">
                        <Check className="w-4 h-4 text-black stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preferred Club */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#e0e0e0] opacity-50 flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5" /> Preferred Football Club
            </label>
            <input 
              type="text"
              value={club}
              onChange={e => setClub(e.target.value)}
              placeholder="e.g. Manchester United, Real Madrid, Al Ahly, FC Barcelona"
              className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3.5 text-sm text-[#e0e0e0] focus:outline-none focus:border-[#48A111] transition-colors placeholder:text-white/20"
            />
          </div>

          {/* Preferred Nationality */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#e0e0e0] opacity-50 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> Preferred Nationality / Country
            </label>
            <input 
              type="text"
              value={nationality}
              onChange={e => setNationality(e.target.value)}
              placeholder="e.g. Egypt, England, Brazil, Argentina, France, Germany"
              className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3.5 text-sm text-[#e0e0e0] focus:outline-none focus:border-[#48A111] transition-colors placeholder:text-white/20"
            />
          </div>

          {/* Bio Description */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#e0e0e0] opacity-50 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Football Manager Bio
              </label>
              <span className="text-[9px] font-mono text-white/40">{bio.length}/300</span>
            </div>
            <textarea 
              value={bio}
              onChange={e => setBio(e.target.value.slice(0, 300))}
              placeholder="Tell the community about your management style, favorite players, tactical setup, or goals..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3.5 text-sm text-[#e0e0e0] focus:outline-none focus:border-[#48A111] transition-colors placeholder:text-white/20 resize-none"
            />
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-[#48A111] hover:bg-[#48A111]/95 text-black font-extrabold uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 text-xs transition-transform transform active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                Updating Profile...
              </>
            ) : (
              'Save Profile Settings'
            )}
          </button>
        </form>
      </CardContent>
    </Card>
  );
};
