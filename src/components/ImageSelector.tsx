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
    <div className="space-y-4">
      {/* Preview */}
      <div className="bg-gray-100 rounded-2xl p-6 flex items-center justify-center">
        <img
          src={value}
          alt="Preview"
          className="max-h-48 object-contain"
        />
      </div>

      {/* Seleção padrão */}
      <div>
        <p className="text-sm font-semibold mb-2">
          Imagens padrão
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {imagensPadrao.map((imagem) => (
            <button
              key={imagem.nome}
              type="button"
              onClick={() => onChange(imagem.path)}
              className={`
                border rounded-xl p-3 transition
                hover:border-blue-500
                hover:shadow-md
                ${
                  value === imagem.path
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200"
                }
              `}
            >
              <img
                src={imagem.path}
                alt={imagem.nome}
                className="h-20 mx-auto object-contain"
              />

              <p className="text-sm mt-2">
                {imagem.nome}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Upload */}
      <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center">
        <p className="font-semibold">
          Upload personalizado
        </p>

        <p className="text-sm text-gray-500 mt-1">
          Envie uma imagem da boia
        </p>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-4 bg-blue-700 text-white px-5 py-2 rounded-lg hover:bg-blue-800 transition"
        >
          Selecionar imagem
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