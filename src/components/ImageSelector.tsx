import { useRef } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const imagensPadrao = [
  {
    nome: "Medusa",
    path: "/assets/boias/medusa.png",
  },
  {
    nome: "Netuno",
    path: "/assets/boias/netuno.png",
  },
  {
    nome: "Hipocampo",
    path: "/assets/boias/hipocampo.png",
  },
  {
    nome: "Nautilus",
    path: "/assets/boias/nautilus.png",
  },
  {
    nome: "Kraken",
    path: "/assets/boias/kraken.png",
  },
  {
    nome: "Ostradamus",
    path: "/assets/boias/ostradamus.png",
  },
];

export function ImageSelector({
  value,
  onChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const arquivo = event.target.files?.[0];

    if (!arquivo) return;

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        onChange(reader.result);
      }
    };

    reader.readAsDataURL(arquivo);
  };

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="bg-slate-100 dark:bg-black rounded-[2rem] p-8 flex items-center justify-center border border-slate-200 dark:border-gold-500/20 shadow-inner">
        <img
          src={value}
          alt="Preview"
          className="max-h-56 object-contain drop-shadow-2xl"
        />
      </div>

      {/* Seleção padrão */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gold-500/50 mb-4">
          Frota Hydra (Padrão)
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {imagensPadrao.map((imagem) => (
            <button
              key={imagem.nome}
              type="button"
              onClick={() => onChange(imagem.path)}
              className={`
                border rounded-2xl p-4 transition-all duration-300 group
                ${
                  value === imagem.path
                    ? "border-blue-600 bg-blue-50 dark:border-gold-500 dark:bg-gold-500/10 shadow-lg dark:shadow-gold-500/10"
                    : "border-slate-200 dark:border-gold-500/10 dark:bg-gold-500/5 hover:border-slate-300 dark:hover:border-gold-500/30"
                }
              `}
            >
              <img
                src={imagem.path}
                alt={imagem.nome}
                className="h-20 mx-auto object-contain group-hover:scale-110 transition-transform duration-500"
              />

              <p className="text-[10px] font-black uppercase tracking-widest mt-3 text-slate-600 dark:text-gold-500">
                {imagem.nome}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Upload */}
      <div className="border-2 border-dashed border-slate-300 dark:border-gold-500/20 rounded-[2rem] p-8 text-center bg-slate-50/50 dark:bg-gold-500/5">
        <p className="font-black uppercase text-xs tracking-widest text-slate-700 dark:text-gold-500">
          Upload Personalizado
        </p>

        <p className="text-[10px] font-bold text-slate-400 dark:text-gold-500/40 uppercase tracking-widest mt-2">
          Integração de hardware externo
        </p>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-6 bg-slate-900 dark:bg-gold-500 text-white dark:text-black px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-xl dark:shadow-gold-500/10"
        >
          Anexar Imagem
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />
      </div>
    </div>
  );
}