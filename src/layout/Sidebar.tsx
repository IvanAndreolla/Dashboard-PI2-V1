import {
  Home,
  Database,
  AlertTriangle,
  History,
  Settings,
  Map,
  Eye,
  Waves,
  Sun,
  Moon,
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
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
}

function NavItem({
  icon,
  label,
  active,
  onClick,
  theme,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  theme: "light" | "dark";
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex items-center gap-3 w-full px-4 py-3 rounded-2xl transition-all duration-300 group",
        active
          ? theme === "dark"
            ? "bg-gold-500 text-black shadow-[0_0_20px_rgba(212,175,55,0.4)] font-bold translate-x-2"
            : "bg-white text-blue-600 shadow-lg font-bold translate-x-2"
          : theme === "dark"
            ? "text-gold-200 hover:bg-gold-500/10 hover:translate-x-1"
            : "text-blue-50 hover:bg-white/10 hover:translate-x-1"
      )}
    >
      <div className={clsx(
        "p-2 rounded-xl transition-colors",
        active 
          ? theme === "dark" ? "bg-black text-gold-500" : "bg-blue-50 text-blue-600"
          : theme === "dark" ? "text-gold-500 group-hover:text-gold-300" : "text-blue-100 group-hover:text-white"
      )}>
        {icon}
      </div>
      <span className="tracking-tight">{label}</span>
    </button>
  );
}

export function Sidebar({ page, setPage, theme, setTheme }: Props) {
  return (
    <aside className={clsx(
      "w-72 min-h-screen flex flex-col sticky top-0 self-start shadow-2xl transition-all duration-500 z-30",
      theme === "dark" 
        ? "bg-black border-r border-gold-500/20 text-gold-500" 
        : "bg-gradient-to-b from-blue-700 to-sky-800 text-white"
    )}>
      {/* BRANDING */}
      <div className="relative p-2 flex flex-col items-center group border-b border-white/10 dark:border-gold-500/20">
        <div className="absolute inset-0 bg-white/5 dark:bg-gold-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative z-10 w-full flex flex-col items-center">
          <div className="w-full px-1 mb-4 drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)] transform group-hover:scale-105 transition-transform duration-700">
             <img src="/assets/hydra.png" alt="Hydra Logo" className="w-full h-auto object-contain" />
          </div>
          <h1 className={clsx(
            "text-4xl font-black tracking-tighter drop-shadow-lg",
            theme === "dark" ? "text-gold-500" : "text-white"
          )}>
            HYDRA
          </h1>
          <p className={clsx(
            "text-[11px] font-black uppercase tracking-[0.5em] mt-2 opacity-80 text-center",
            theme === "dark" ? "text-gold-400" : "text-blue-100"
          )}>
            Águas Vivas
          </p>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-4 space-y-2 py-4">
        <div className={clsx(
          "text-[10px] font-black uppercase tracking-widest px-4 mb-4",
          theme === "dark" ? "text-gold-500/40" : "text-blue-200/50"
        )}>Monitoramento</div>
        <NavItem
          icon={<Home size={20} />}
          label="Visão Geral"
          active={page === "dashboard"}
          onClick={() => setPage("dashboard")}
          theme={theme}
        />

        <NavItem
          icon={<Eye size={20} />}
          label="Visão Pública"
          active={page === "publico"}
          onClick={() => setPage("publico")}
          theme={theme}
        />

        <NavItem
          icon={<Map size={20} />}
          label="Mapa Interativo"
          active={page === "mapa"}
          onClick={() => setPage("mapa")}
          theme={theme}
        />

        <div className={clsx(
          "text-[10px] font-black uppercase tracking-widest px-4 mb-4 mt-8",
          theme === "dark" ? "text-gold-500/40" : "text-blue-200/50"
        )}>Dados</div>
        <NavItem
          icon={<Database size={20} />}
          label="Boias"
          active={page === "boias" || page === "boiaDetalhe"}
          onClick={() => setPage("boias")}
          theme={theme}
        />

        <NavItem
          icon={<AlertTriangle size={20} />}
          label="Painel Alertas"
          active={page === "alertas"}
          onClick={() => setPage("alertas")}
          theme={theme}
        />

        <NavItem
          icon={<History size={20} />}
          label="Histórico"
          active={page === "historico"}
          onClick={() => setPage("historico")}
          theme={theme}
        />

        <div className={clsx(
          "text-[10px] font-black uppercase tracking-widest px-4 mb-4 mt-8",
          theme === "dark" ? "text-gold-500/40" : "text-blue-200/50"
        )}>Sistema</div>
        <NavItem
          icon={<Settings size={20} />}
          label="Administração"
          active={page === "admin"}
          onClick={() => setPage("admin")}
          theme={theme}
        />
      </nav>

      {/* THEME TOGGLE */}
      <div className="px-6 py-4">
        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className={clsx(
            "w-full flex items-center justify-between px-5 py-3 rounded-2xl transition-all duration-300",
            theme === "dark" 
              ? "bg-gold-500/10 text-gold-500 border border-gold-500/30 hover:bg-gold-500/20"
              : "bg-white/10 text-white hover:bg-white/20"
          )}
        >
          <span className="text-[10px] font-black uppercase tracking-widest">Tema {theme === "light" ? "Escuro" : "Claro"}</span>
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>

      {/* FOOTER */}
      <div className="p-6">
        <div className={clsx(
          "rounded-3xl p-5 shadow-inner flex flex-col items-center",
          theme === "dark" ? "bg-gold-500/5 border border-gold-500/20" : "bg-white"
        )}>
           <img
             src="/assets/logoifscvertical.jpeg"
             alt="IFSC"
             className="w-16 mb-3"
           />
           <p className={clsx(
             "text-[10px] font-black uppercase tracking-wider text-center leading-tight",
             theme === "dark" ? "text-gold-500" : "text-blue-900"
           )}>
             Engenharia Eletrônica<br/>IFSC - Florianópolis
           </p>
        </div>
      </div>
    </aside>
  );
}
