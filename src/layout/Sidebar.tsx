import {
  Home,
  Database,
  AlertTriangle,
  History,
  Settings,
  Map,
  Eye,
  Waves,
} from "lucide-react";
import clsx from "clsx";

type Page =
  | "dashboard"
  | "boias"
  | "alertas"
  | "historico"
  | "boiaDetalhe"
  | "admin"
  | "mapa"
  | "publico";

interface Props {
  page: Page;
  setPage: (p: Page) => void;
}

function NavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex items-center gap-3 w-full px-4 py-3 rounded-2xl transition-all duration-300 group",
        active
          ? "bg-white text-blue-600 shadow-lg font-bold translate-x-2"
          : "text-blue-50 hover:bg-white/10 hover:translate-x-1"
      )}
    >
      <div className={clsx(
        "p-2 rounded-xl transition-colors",
        active ? "bg-blue-50 text-blue-600" : "text-blue-100 group-hover:text-white"
      )}>
        {icon}
      </div>
      <span className="tracking-tight">{label}</span>
    </button>
  );
}

export function Sidebar({ page, setPage }: Props) {
  return (
    <aside className="w-72 min-h-screen bg-gradient-to-b from-blue-700 to-sky-800 text-white flex flex-col sticky top-0 self-start shadow-2xl">
      {/* BRANDING */}
      <div className="relative p-2 flex flex-col items-center group border-b border-white/10">
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative z-10 w-full flex flex-col items-center">
          <div className="w-full px-1 mb-4 drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)] transform group-hover:scale-105 transition-transform duration-700">
             <img src="/assets/hydra.png" alt="Hydra Logo" className="w-full h-auto object-contain" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white drop-shadow-lg">
            HYDRA
          </h1>
          <p className="text-[11px] font-black uppercase tracking-[0.5em] text-blue-100 mt-2 opacity-80 text-center">
            Águas Vivas
          </p>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-4 space-y-2 py-4">
        <div className="text-[10px] font-black uppercase tracking-widest text-blue-200/50 px-4 mb-4">Monitoramento</div>
        <NavItem
          icon={<Home size={20} />}
          label="Visão Geral"
          active={page === "dashboard"}
          onClick={() => setPage("dashboard")}
        />

        <NavItem
          icon={<Eye size={20} />}
          label="Visão Pública"
          active={page === "publico"}
          onClick={() => setPage("publico")}
        />

        <NavItem
          icon={<Map size={20} />}
          label="Mapa Interativo"
          active={page === "mapa"}
          onClick={() => setPage("mapa")}
        />

        <div className="text-[10px] font-black uppercase tracking-widest text-blue-200/50 px-4 mb-4 mt-8">Dados</div>
        <NavItem
          icon={<Database size={20} />}
          label="Boias"
          active={page === "boias" || page === "boiaDetalhe"}
          onClick={() => setPage("boias")}
        />

        <NavItem
          icon={<AlertTriangle size={20} />}
          label="Painel Alertas"
          active={page === "alertas"}
          onClick={() => setPage("alertas")}
        />

        <NavItem
          icon={<History size={20} />}
          label="Histórico"
          active={page === "historico"}
          onClick={() => setPage("historico")}
        />

        <div className="text-[10px] font-black uppercase tracking-widest text-blue-200/50 px-4 mb-4 mt-8">Sistema</div>
        <NavItem
          icon={<Settings size={20} />}
          label="Administração"
          active={page === "admin"}
          onClick={() => setPage("admin")}
        />
      </nav>

      {/* FOOTER */}
      <div className="p-6">
        <div className="bg-white rounded-3xl p-5 shadow-inner flex flex-col items-center">
           <img
             src="/assets/logoifscvertical.jpeg"
             alt="IFSC"
             className="w-16 mb-3"
           />
           <p className="text-[10px] font-black text-blue-900 uppercase tracking-wider text-center leading-tight">
             Engenharia Eletrônica<br/>IFSC - PI2
           </p>
        </div>
      </div>
    </aside>
  );
}
