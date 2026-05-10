import { useTheme } from "@/context/ThemeContext";

export default function TrophySpin({ message = "Aguarde por favor" }) {
  const { theme } = useTheme();
  const loaderColor = theme === "dark" ? "#5a8aff" : "#4a78e0";
  const textColor = theme === "dark" ? "#e8eaed" : "#111827";

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
      <div
        className="relative flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5"
        style={{ boxShadow: "0 16px 48px rgba(0,0,0,0.18)" }}
      >
        <div
          className="absolute inset-0 rounded-full animate-spin"
          style={{
            border: `4px solid ${loaderColor}`,
            opacity: 0.24,
          }}
        />
        <span className="text-4xl" style={{ color: loaderColor }}>
          🏆
        </span>
      </div>
      <div className="text-lg font-semibold" style={{ color: textColor }}>
        {message}
      </div>
      <p className="max-w-md text-sm text-muted">
        Aguarde enquanto carregamos os componentes importantes do aplicativo.
      </p>
    </div>
  );
}
