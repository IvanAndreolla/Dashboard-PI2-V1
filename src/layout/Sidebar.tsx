import {
  Home,
  Database,
  AlertTriangle,
  History,
  Settings,
  Map,
  Eye,
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
        "flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all text-left",
        "hover:bg-white/10",
        active
          ? "bg-white text-blue-900 shadow-md font-semibold"
          : "text-blue-100"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export function Sidebar({ page, setPage }: Props) {
  return (
    <aside className="w-72 h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white flex flex-col">
      <div className="w-full h-60 overflow-hidden">
        <img
          src="/assets/hydra.png"
          alt="Hydra"
          className="w-full h-full object-cover object-center"
        />
      </div>

      <div className="px-4 py-4 text-center border-b border-blue-700/40">
        <h1 className="text-lg font-bold">HYDRA</h1>
        <p className="text-xs text-blue-200">Projeto Águas Vivas</p>

        <div className="mt-3 flex justify-center">
          <img
            src="/assets/logoifscvertical.jpeg"
            alt="IFSC"
            className="w-20 object-contain"
          />
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <NavItem
          icon={<Home size={20} />}
          label="Dashboard"
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
          icon={<Database size={20} />}
          label="Boias"
          active={page === "boias" || page === "boiaDetalhe"}
          onClick={() => setPage("boias")}
        />

        <NavItem
          icon={<Map size={20} />}
          label="Mapa"
          active={page === "mapa"}
          onClick={() => setPage("mapa")}
        />

        <NavItem
          icon={<AlertTriangle size={20} />}
          label="Alertas"
          active={page === "alertas"}
          onClick={() => setPage("alertas")}
        />

        <NavItem
          icon={<History size={20} />}
          label="Histórico"
          active={page === "historico"}
          onClick={() => setPage("historico")}
        />

        <NavItem
          icon={<Settings size={20} />}
          label="Admin"
          active={page === "admin"}
          onClick={() => setPage("admin")}
        />
      </nav>

      <div className="p-4 text-center text-xs text-blue-200 border-t border-blue-700/40">
        Sistema de Monitoramento Ambiental
      </div>
    </aside>
  );
}