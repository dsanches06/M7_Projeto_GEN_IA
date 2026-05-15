// Modal de confirmação com overlay para acções destrutivas (ex: apagar)
export default function ModalConfirm({ title, message, cancel, confirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 animate-fadeIn">
      <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-2xl border border-surface-2 animate-fadeInUp">
        <h3 className="text-lg font-semibold text-main mb-2">{title}</h3>
        <p className="text-sm text-muted mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          {/* Botão para cancelar e fechar o modal */}
          <button
            type="button"
            className="rounded-lg border border-surface bg-surface px-4 py-2 text-sm text-main transition hover:bg-surface-2"
            onClick={cancel}
          >
            Cancelar
          </button>
          {/* Botão de confirmação destrutiva */}
          <button
            type="button"
            className="rounded-lg bg-[#A32D2D] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#92292a]"
            onClick={confirm}
          >
            Apagar
          </button>
        </div>
      </div>
    </div>
  );
}
