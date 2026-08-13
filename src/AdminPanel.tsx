import { useState, useCallback, useRef } from 'react';
import { User, Settings, History, X, Download, LogOut, ChevronDown, Plus, Trash2, HelpCircle, Megaphone, RotateCcw, RotateCw, UploadCloud, Link as LinkIcon, Crop } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { db, storage } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { PollData } from './types';

export default function AdminPanel({ data, onSave, onLogout, onResetData }: { data: PollData, onSave: (d: PollData) => void, onLogout: () => void, onResetData: () => Promise<void> }) {
const getCroppedImg = async (imageSrc: string, pixelCrop: any, rotation = 0): Promise<string> => {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });

  const rotRad = (rotation * Math.PI) / 180;

  // Calculate bounding box of rotated image
  const bBoxWidth = Math.abs(Math.cos(rotRad) * image.width) + Math.abs(Math.sin(rotRad) * image.height);
  const bBoxHeight = Math.abs(Math.sin(rotRad) * image.width) + Math.abs(Math.cos(rotRad) * image.height);

  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) throw new Error('No temp 2d context');

  tempCanvas.width = bBoxWidth;
  tempCanvas.height = bBoxHeight;

  tempCtx.translate(bBoxWidth / 2, bBoxHeight / 2);
  tempCtx.rotate(rotRad);
  tempCtx.translate(-image.width / 2, -image.height / 2);
  tempCtx.drawImage(image, 0, 0);

  // High-DPI crisp output: 500 max dimension for square, proportional for rectangle
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No 2d context');

  const MAX_DIM = 500;
  const cropAspect = (pixelCrop.width || 1) / (pixelCrop.height || 1);
  let targetW = MAX_DIM;
  let targetH = Math.round(MAX_DIM / cropAspect);

  if (cropAspect < 1) {
    targetH = MAX_DIM;
    targetW = Math.round(MAX_DIM * cropAspect);
  }

  canvas.width = Math.max(targetW, 10);
  canvas.height = Math.max(targetH, 10);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    tempCanvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return canvas.toDataURL('image/jpeg', 0.85);
};

  const [form, setForm] = useState<PollData>(() => {
    if (data.questions) return data;
    return {
      ...data,
      questions: [{ id: 'q1', text: (data as any).question || 'Question', candidates: (data as any).candidates || [] }]
    } as PollData;
  });
  const [isSaving, setIsSaving] = useState(false);
  
  // Cropper state
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState<number>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [cropCallback, setCropCallback] = useState<((url: string) => void) | null>(null);

  // Direct URL state modal
  const [urlInputModal, setUrlInputModal] = useState<{ open: boolean; callback: ((url: string) => void) | null }>({ open: false, callback: null });
  const [urlInputValue, setUrlInputValue] = useState('');

  const handleImageUpload = (file: File, callback: (url: string) => void, defaultAspect = 1) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setCropImageSrc(e.target?.result as string);
      setCropCallback(() => callback);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setAspect(defaultAspect);
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropDone = async () => {
    try {
      if (!cropImageSrc || !croppedAreaPixels) return;
      setIsSaving(true);
      const croppedImage = await getCroppedImg(cropImageSrc, croppedAreaPixels, rotation);
      
      let finalImageUrl = croppedImage;

      try {
        if (storage && import.meta.env.VITE_FIREBASE_STORAGE_BUCKET) {
          const storageRef = ref(storage, `images/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.jpg`);
          await uploadString(storageRef, croppedImage, 'data_url');
          finalImageUrl = await getDownloadURL(storageRef);
        }
      } catch (storageErr) {
        console.warn('Firebase Storage upload failed or timed out, falling back to cropped data URL:', storageErr);
      }
      
      const newRecent = [finalImageUrl, ...(form.recentPhotos || []).filter(p => p !== finalImageUrl)].slice(0, 6);
      setForm(prev => ({...prev, recentPhotos: newRecent}));
      
      if (cropCallback) cropCallback(finalImageUrl);
      
      setCropImageSrc(null);
      setCropCallback(null);
    } catch (e) {
      console.error(e);
      alert('Error processing image');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCropCancel = () => {
    setCropImageSrc(null);
    setCropCallback(null);
  };

  const renderPhotoPicker = (currentUrl: string, callback: (url: string) => void, defaultAspect = 1) => (
    <div className="flex flex-col gap-2 w-full mt-2">
      <div 
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (e.dataTransfer.files?.[0]) {
            handleImageUpload(e.dataTransfer.files[0], callback, defaultAspect);
          }
        }}
        className="border-2 border-dashed border-zinc-300 hover:border-[#1877F2] p-3 rounded-xl bg-zinc-50/80 transition-colors flex flex-col items-center justify-center gap-1.5 cursor-pointer group"
      >
        <div className="flex items-center gap-2">
          <UploadCloud className="w-4 h-4 text-zinc-400 group-hover:text-[#1877F2] transition-colors" />
          <span className="text-[11px] font-bold text-zinc-600 group-hover:text-[#1877F2] transition-colors">
            Drop image or click to upload
          </span>
        </div>
        <input 
          type="file" 
          className="hidden" 
          accept="image/*" 
          id={`file-input-${Math.random()}`}
          onChange={(e) => {
            if(e.target.files?.[0]) {
              handleImageUpload(e.target.files[0], callback, defaultAspect);
            }
          }} 
        />
        <div className="flex items-center gap-2 mt-1">
          <label 
            onClick={(e) => {
              e.stopPropagation();
              const input = (e.currentTarget.parentElement?.previousElementSibling as HTMLInputElement);
              input?.click();
            }}
            className="text-[10px] font-bold uppercase tracking-wider bg-zinc-900 text-white px-2.5 py-1 rounded-md cursor-pointer hover:bg-zinc-800 transition"
          >
            Browse
          </label>
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setUrlInputValue(currentUrl || '');
              setUrlInputModal({ open: true, callback });
            }}
            className="text-[10px] font-bold uppercase tracking-wider bg-zinc-200 text-zinc-700 px-2.5 py-1 rounded-md hover:bg-zinc-300 transition flex items-center gap-1"
          >
            <LinkIcon className="w-3 h-3" /> Paste URL
          </button>
          {currentUrl && (
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); callback(''); }} 
              className="text-red-500 hover:text-red-600 hover:bg-red-50 text-[10px] font-bold py-1 px-2 rounded-md transition-colors uppercase tracking-wider"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {(form.recentPhotos && form.recentPhotos.length > 0) && (
        <div className="mt-1 bg-zinc-100/60 p-2 rounded-xl border border-zinc-200/80">
          <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Recent Photos</p>
          <div className="flex gap-2 overflow-x-auto pb-1 max-w-full" style={{ scrollbarWidth: 'none' }}>
            {form.recentPhotos.map((url, idx) => (
               <img 
                 key={idx} 
                 src={url} 
                 className={`w-10 h-10 min-w-[40px] object-cover rounded-lg cursor-pointer border-2 transition-all hover:scale-105 ${currentUrl === url ? 'border-[#1877F2] ring-2 ring-[#1877F2]/30' : 'border-transparent hover:border-zinc-300'}`}
                 onClick={() => callback(url)}
                 alt={`recent-${idx}`}
                 title="Click to select this image"
               />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const save = async () => {
    setIsSaving(true);
    try {
      const historyQuestions = JSON.parse(JSON.stringify(form.questions));
      historyQuestions.forEach((q: any) => {
        q.candidates.forEach((c: any) => {
          c.photoUrl = ''; // Clear heavy base64 images from history to prevent exceeding 1MB limit
        });
      });

      const historyEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        questions: historyQuestions
      };
      
      const newHistory = [historyEntry, ...(form.history || [])].slice(0, 5);
      const dataToSave = { ...form, history: newHistory };

      onSave(dataToSave); // Optimistically update local state

      try {
        // Save to local/Railway Express backend REST API
        const apiUrl = import.meta.env.VITE_API_URL || '';
        await fetch(`${apiUrl}/api/poll`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSave)
        }).catch(err => console.warn('REST API save error:', err));

        if (db) {
          const pollRef = doc(db, 'polls', 'main_poll');
          await setDoc(pollRef, dataToSave).catch(err => console.warn('Firestore setDoc failed:', err));
        }

        alert('Poll published successfully!');
      } catch (e: any) {
        console.error("Save failed:", e);
        alert(`Failed to save: ${e?.message || 'Unknown error'}. Please try again.`);
      }
    } catch (e: any) {
      console.error("History parse error", e);
      alert('Error formatting poll data for saving.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-3xl bg-white min-h-[100dvh] sm:min-h-[90vh] shadow-2xl p-6 md:p-10 overflow-y-auto sm:my-8 sm:rounded-[2.5rem] ring-1 ring-black/5 relative">
      {cropImageSrc && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-xl h-[55vh] bg-zinc-900 rounded-3xl overflow-hidden mb-4 shadow-2xl border border-zinc-800">
            <Cropper
              image={cropImageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspect}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
            />
          </div>

          {/* Cropper Controls Toolbar */}
          <div className="w-full max-w-xl bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl mb-4 flex flex-col gap-3 text-white">
            {/* Aspect Ratio & Rotation Row */}
            <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
              <div className="flex items-center gap-1">
                <span className="text-zinc-400 font-bold uppercase tracking-wider text-[10px] mr-1">Aspect:</span>
                <button 
                  type="button" 
                  onClick={() => setAspect(1)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${aspect === 1 ? 'bg-[#1877F2] text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
                >
                  1:1 Square
                </button>
                <button 
                  type="button" 
                  onClick={() => setAspect(16 / 9)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${aspect === 16 / 9 ? 'bg-[#1877F2] text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
                >
                  16:9 Banner
                </button>
                <button 
                  type="button" 
                  onClick={() => setAspect(4 / 3)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${aspect === 4 / 3 ? 'bg-[#1877F2] text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
                >
                  4:3 Standard
                </button>
              </div>

              <div className="flex items-center gap-1 ml-auto">
                <span className="text-zinc-400 font-bold uppercase tracking-wider text-[10px] mr-1">Rotate:</span>
                <button 
                  type="button" 
                  onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                  className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-colors flex items-center gap-1"
                  title="Rotate 90 degrees counter-clockwise"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button 
                  type="button" 
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-colors flex items-center gap-1"
                  title="Rotate 90 degrees clockwise"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Zoom Slider Row */}
            <div className="flex items-center gap-3">
              <span className="text-zinc-400 font-bold uppercase tracking-wider text-[10px] w-12">Zoom</span>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.05}
                aria-label="Zoom level"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-[#1877F2] h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
              <div className="flex gap-1 text-[10px]">
                {[1, 1.5, 2, 2.5].map((z) => (
                  <button
                    key={z}
                    type="button"
                    onClick={() => setZoom(z)}
                    className={`px-1.5 py-0.5 rounded font-mono font-bold ${zoom === z ? 'bg-[#1877F2] text-white' : 'bg-zinc-800 text-zinc-400'}`}
                  >
                    {z}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleCropCancel}
              className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCropDone}
              disabled={isSaving}
              className="px-8 py-3 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold rounded-xl transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Crop className="w-4 h-4" /> Apply Crop
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Direct URL Input Modal */}
      {urlInputModal.open && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-zinc-100 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-bold text-zinc-900 flex items-center gap-2 text-base">
                <LinkIcon className="w-4 h-4 text-[#1877F2]" /> Paste Image URL
              </h3>
              <button 
                type="button"
                onClick={() => setUrlInputModal({ open: false, callback: null })}
                className="p-1 hover:bg-zinc-100 rounded-full text-zinc-400 hover:text-zinc-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-zinc-500 font-medium">
              Enter a direct public web link to an image (e.g. https://example.com/photo.jpg).
            </p>
            <input 
              type="url"
              placeholder="https://..."
              value={urlInputValue}
              onChange={(e) => setUrlInputValue(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm focus:ring-2 focus:ring-[#1877F2] focus:border-transparent outline-none font-mono"
            />
            {urlInputValue && (
              <div className="w-full h-32 bg-zinc-100 rounded-xl overflow-hidden flex items-center justify-center border border-zinc-200">
                <img 
                  src={urlInputValue} 
                  alt="Preview" 
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="flex gap-2 justify-end pt-2">
              <button 
                type="button"
                onClick={() => setUrlInputModal({ open: false, callback: null })}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={() => {
                  if (urlInputModal.callback && urlInputValue.trim()) {
                    urlInputModal.callback(urlInputValue.trim());
                    // Add to recent
                    setForm(prev => ({
                      ...prev,
                      recentPhotos: [urlInputValue.trim(), ...(prev.recentPhotos || []).filter(p => p !== urlInputValue.trim())].slice(0, 6)
                    }));
                  }
                  setUrlInputModal({ open: false, callback: null });
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1877F2] hover:bg-[#166FE5] transition shadow-md"
              >
                Use Image URL
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8 border-b border-zinc-100 pb-6">
        <h2 className="text-3xl font-display font-bold flex items-center gap-3 text-[#1C1E21]">
          <Settings className="w-8 h-8 text-[#1C1E21]" /> Admin Dashboard
        </h2>
        <div className="flex gap-2 items-center">
          <button 
            onClick={async () => {
              if (confirm('Are you sure you want to reset all votes and data? This action cannot be undone.')) {
                await onResetData();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-bold uppercase tracking-wider text-sm transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Reset Data
          </button>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-bold uppercase tracking-wider text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>
      
      <div className="space-y-10">
        <div className="flex justify-between items-center">
          <h3 className="font-display font-bold text-2xl text-[#1C1E21]">Questions Configuration</h3>
          <button onClick={() => {
              setForm(prev => {
                const newQs = [...prev.questions, {
                  id: Date.now().toString(),
                  text: 'New Question',
                  candidates: [
                    { id: "c1", name: "Name 1", photoUrl: "", colorTheme: "blue" as const, votes: 0 },
                    { id: "c2", name: "Name 2", photoUrl: "", colorTheme: "green" as const, votes: 0 }
                  ]
                }];
                return { ...prev, questions: newQs };
              });
          }} className="flex items-center gap-1 text-sm bg-[#1877F2] text-white hover:bg-[#166FE5] px-4 py-2 rounded-xl font-bold transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Add Question
          </button>
        </div>

        {form.questions.map((q, qIndex) => (
          <div key={q.id} className="bg-white p-6 md:p-8 rounded-2xl border border-zinc-200/80 shadow-sm relative mb-8">
             <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-100">
               <h3 className="font-bold text-xl text-[#1C1E21] flex items-center gap-2">
                 Question {qIndex + 1}
               </h3>
               {form.questions.length > 1 && (
                 <button onClick={() => {
                   setForm(prev => ({ ...prev, questions: prev.questions.filter((_, i) => i !== qIndex) }));
                   
                 }} className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors" title="Remove Question">
                   <Trash2 className="w-5 h-5" />
                 </button>
               )}
             </div>
             
             <div className="mb-8">
               <label className="block text-sm font-bold text-zinc-700 mb-2">Question Text</label>
               <input 
                 type="text" 
                 value={q.text} 
                 onChange={e => {
                   setForm(prev => {
                     const newQs = [...prev.questions];
                     newQs[qIndex] = { ...newQs[qIndex], text: e.target.value };
                     return { ...prev, questions: newQs };
                   });
                 }}
                 className="w-full border border-zinc-300 p-4 rounded-xl focus:border-[#1877F2] focus:ring-1 focus:ring-[#1877F2] outline-none text-[#1C1E21] font-medium bg-zinc-50 focus:bg-white transition-all shadow-sm"
                 placeholder="Enter your question here..."
               />
             </div>

             <div className="flex justify-between items-center mb-4">
               <h4 className="font-bold text-lg text-zinc-800">Candidates / Options</h4>
               <button onClick={() => {
                 setForm(prev => {
                   const newQs = [...prev.questions];
                   newQs[qIndex] = {
                     ...newQs[qIndex],
                     candidates: [
                       ...newQs[qIndex].candidates,
                       {
                         id: Date.now().toString(),
                         name: `Option ${newQs[qIndex].candidates.length + 1}`,
                         photoUrl: "",
                         colorTheme: "blue" as const,
                         votes: 0
                       }
                     ]
                   };
                   return { ...prev, questions: newQs };
                 });
               }} className="text-sm font-bold text-[#1877F2] hover:text-[#166FE5] flex items-center gap-1 transition-colors">
                 <Plus className="w-4 h-4" /> Add Option
               </button>
             </div>
             
             <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
               {q.candidates.map((c, cIndex) => (
                 <div key={c.id} className="border border-zinc-200 p-4 rounded-xl bg-zinc-50/50 flex flex-col sm:flex-row gap-5 relative hover:border-[#1877F2]/50 transition-colors group">
                   {q.candidates.length > 2 && (
                      <button 
                        onClick={() => {
                          setForm(prev => {
                            const newQs = [...prev.questions];
                            newQs[qIndex] = { ...newQs[qIndex], candidates: newQs[qIndex].candidates.filter((_, i) => i !== cIndex) };
                            return { ...prev, questions: newQs };
                          });
                        }}
                        className="absolute top-2 right-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove Option"
                      >
                       <Trash2 className="w-4 h-4" />
                     </button>
                   )}
                   
                   <div className="shrink-0 flex flex-col items-center gap-3 w-full sm:w-28">
                      <div className="w-full flex justify-center">
                        {c.photoUrl?.trim() ? (
                          <img src={c.photoUrl} className="w-24 h-24 object-cover rounded-xl shadow-sm border border-zinc-200" alt={c.name} />
                        ) : (
                          <div className="w-24 h-24 bg-white border border-zinc-200 rounded-xl flex items-center justify-center text-zinc-300 shadow-sm">
                            <User className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <div className="w-full">
                        {renderPhotoPicker(c.photoUrl, (url) => {
                          setForm(prev => {
                            const newQs = [...prev.questions];
                            newQs[qIndex] = {
                              ...newQs[qIndex],
                              candidates: newQs[qIndex].candidates.map((cand, i) => i === cIndex ? { ...cand, photoUrl: url } : cand)
                            };
                            return { ...prev, questions: newQs };
                          });
                        })}
                      </div>
                   </div>
                   
                   <div className="flex-grow flex flex-col justify-center space-y-4">
                     <div>
                       <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">Display Name</label>
                       <input 
                         type="text" 
                         value={c.name}
                         onChange={e => {
                           setForm(prev => {
                             const newQs = [...prev.questions];
                             newQs[qIndex] = {
                               ...newQs[qIndex],
                               candidates: newQs[qIndex].candidates.map((cand, i) => i === cIndex ? { ...cand, name: e.target.value } : cand)
                             };
                             return { ...prev, questions: newQs };
                           });
                         }}
                         className="w-full border border-zinc-300 p-2.5 rounded-lg focus:border-[#1877F2] focus:ring-1 focus:ring-[#1877F2] outline-none text-sm font-medium bg-white transition-all shadow-sm"
                         placeholder="Candidate Name"
                       />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">Initial Votes</label>
                       <input 
                         type="number" 
                         value={c.votes}
                         onChange={e => {
                           setForm(prev => {
                             const newQs = [...prev.questions];
                             newQs[qIndex] = {
                               ...newQs[qIndex],
                               candidates: newQs[qIndex].candidates.map((cand, i) => i === cIndex ? { ...cand, votes: parseInt(e.target.value) || 0 } : cand)
                             };
                             return { ...prev, questions: newQs };
                           });
                         }}
                         className="w-full sm:w-24 border border-zinc-300 p-2.5 rounded-lg focus:border-[#1877F2] focus:ring-1 focus:ring-[#1877F2] outline-none text-sm bg-white transition-all shadow-sm"
                       />
                     </div>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        ))}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-zinc-200/80 shadow-sm relative">
            <h3 className="font-bold text-xl text-[#1C1E21] mb-6 flex items-center gap-2 pb-4 border-b border-zinc-100">
              <Megaphone className="w-5 h-5 text-[#1877F2]" /> Interstitial Ad (Page 2)
            </h3>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">Fallback Ad Text</label>
                <input 
                  type="text" 
                  value={form.interstitialAdText}
                  onChange={e => setForm({...form, interstitialAdText: e.target.value})}
                  className="w-full border border-zinc-300 p-3 rounded-xl focus:border-[#1877F2] focus:ring-1 focus:ring-[#1877F2] outline-none text-sm font-medium bg-zinc-50 focus:bg-white transition-all shadow-sm"
                  placeholder="Fallback Ad Text"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">Ad Image</label>
                <div className="flex flex-col gap-3">
                  {form.interstitialAdUrl && <img src={form.interstitialAdUrl} className="w-full h-32 object-cover rounded-xl shadow-sm border border-zinc-200" alt="Interstitial Ad" />}
                  {renderPhotoPicker(form.interstitialAdUrl, (url) => {
                    setForm({...form, interstitialAdUrl: url});
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-2xl border border-zinc-200/80 shadow-sm relative">
            <h3 className="font-bold text-xl text-[#1C1E21] mb-6 flex items-center gap-2 pb-4 border-b border-zinc-100">
              <Megaphone className="w-5 h-5 text-[#1877F2]" /> Banner Ad (Page 3)
            </h3>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">Fallback Banner Text</label>
                <input 
                  type="text" 
                  value={form.bannerAdText}
                  onChange={e => setForm({...form, bannerAdText: e.target.value})}
                  className="w-full border border-zinc-300 p-3 rounded-xl focus:border-[#1877F2] focus:ring-1 focus:ring-[#1877F2] outline-none text-sm font-medium bg-zinc-50 focus:bg-white transition-all shadow-sm"
                  placeholder="Fallback Banner Text"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">Banner Image</label>
                <div className="flex flex-col gap-3">
                  {form.bannerAdUrl && <img src={form.bannerAdUrl} className="w-full h-20 object-cover rounded-xl shadow-sm border border-zinc-200" alt="Banner Ad" />}
                  {renderPhotoPicker(form.bannerAdUrl, (url) => {
                    setForm({...form, bannerAdUrl: url});
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-2xl border border-zinc-200/80 shadow-sm relative">
          <label className="block text-sm font-bold text-zinc-700 mb-2">Footer Contact Phone</label>
          <input 
            type="text" 
            value={form.contactPhone} 
            onChange={e => setForm({...form, contactPhone: e.target.value})}
            className="w-full border border-zinc-300 p-4 rounded-xl focus:border-[#1877F2] focus:ring-1 focus:ring-[#1877F2] outline-none font-medium bg-zinc-50 focus:bg-white transition-all shadow-sm"
          />
        </div>

        <div className="bg-white p-6 md:p-8 rounded-2xl border border-zinc-200/80 shadow-sm relative">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-100">
            <h3 className="font-bold text-xl text-[#1C1E21] flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-[#1877F2]" /> FAQ Configuration
            </h3>
            <button 
              onClick={() => {
                const newFaqs = [...(form.faqs || []), { question: 'New Question', answer: 'New Answer' }];
                setForm({...form, faqs: newFaqs});
              }}
              className="flex items-center gap-1 text-sm bg-[#1877F2] text-white hover:bg-[#166FE5] px-4 py-2 rounded-xl font-bold transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add FAQ
            </button>
          </div>
          <div className="space-y-4">
            {(form.faqs || []).map((faq, index) => (
              <div key={index} className="bg-zinc-50/50 border border-zinc-200 p-4 rounded-xl flex gap-5 relative hover:border-[#1877F2]/50 transition-colors group">
                <div className="flex-grow space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">Question</label>
                    <input 
                      type="text" 
                      value={faq.question}
                      onChange={e => {
                        const newFaqs = [...(form.faqs || [])];
                        newFaqs[index].question = e.target.value;
                        setForm({...form, faqs: newFaqs});
                      }}
                      className="w-full border border-zinc-300 p-2.5 rounded-lg focus:border-[#1877F2] focus:ring-1 focus:ring-[#1877F2] outline-none text-sm font-medium bg-white transition-all shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">Answer</label>
                    <textarea 
                      value={faq.answer}
                      onChange={e => {
                        const newFaqs = [...(form.faqs || [])];
                        newFaqs[index].answer = e.target.value;
                        setForm({...form, faqs: newFaqs});
                      }}
                      className="w-full border border-zinc-300 p-2.5 rounded-lg focus:border-[#1877F2] focus:ring-1 focus:ring-[#1877F2] outline-none text-sm font-medium bg-white min-h-[80px] transition-all shadow-sm"
                    />
                  </div>
                </div>
                <button 
                  onClick={() => {
                    const newFaqs = (form.faqs || []).filter((_, i) => i !== index);
                    setForm({...form, faqs: newFaqs});
                  }}
                  className="shrink-0 self-start text-zinc-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors mt-6"
                  title="Remove FAQ"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
            {(!form.faqs || form.faqs.length === 0) && (
              <p className="text-center text-slate-500 text-sm py-4">No FAQs added yet.</p>
            )}
          </div>
        </div>

        {form.history && form.history.length > 0 && (
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-lg mb-4 text-slate-800 flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" /> Configuration History
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
              {form.history.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-blue-200 transition-colors">
                  <div className="flex-grow pr-4">
                    <p className="font-bold text-sm text-slate-800">{new Date(entry.timestamp).toLocaleString()}</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      Q: {entry.questions?.[0]?.text || (entry as any).question} {entry.questions?.length > 1 ? `(+${entry.questions.length - 1} more)` : ''}
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      if (confirm('Revert to this configuration? This will replace current unsaved questions and candidates.')) {
                        setForm(prev => ({
                          ...prev,
                          questions: entry.questions ? JSON.parse(JSON.stringify(entry.questions)) : [{ id: 'q1', text: (entry as any).question, candidates: JSON.parse(JSON.stringify((entry as any).candidates)) }]
                        }));
                      }
                    }}
                    className="shrink-0 px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-blue-600 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    Revert
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-10 pt-6 border-t border-slate-200 pb-10">
        <button 
          onClick={save}
          disabled={isSaving}
          className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white font-black uppercase tracking-widest py-4 rounded-xl flex justify-center items-center shadow-lg transition-colors"
        >
          {isSaving ? 'Saving Changes...' : 'Save & Publish Poll'}
        </button>
      </div>
    </div>
  )
}
