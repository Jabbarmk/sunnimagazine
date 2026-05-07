"use client";

interface Props {
  value: string | null;
  onChange: (val: string) => void;
}

function compressImage(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const MAX = 1000;
      let { width, height } = img;
      if (width > MAX) { height = Math.round((height * MAX) / width); width = MAX; }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.75));
    };
    img.src = dataUrl;
  });
}

export default function ImageUpload({ value, onChange }: Props) {
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const compressed = await compressImage(reader.result as string);
      onChange(compressed);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const isUploaded = value?.startsWith("data:") ?? false;

  return (
    <div className="space-y-2">
      {value && (
        <div className="relative w-full h-36 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
          <img src={value} alt="preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 bg-black/60 text-white text-[11px] px-2 py-0.5 rounded hover:bg-black/80"
          >
            Remove
          </button>
        </div>
      )}
      <div className="flex items-center gap-2">
        <label className="cursor-pointer">
          <span className="inline-block px-3 py-2 border border-gray-200 rounded-lg text-[13px] text-gray-600 hover:bg-gray-50 transition-colors">
            {value ? "Change image" : "Upload image"}
          </span>
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </label>
        {!isUploaded && <span className="text-[12px] text-gray-400">or paste a URL</span>}
      </div>
      {!isUploaded && (
        <input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400"
        />
      )}
    </div>
  );
}
