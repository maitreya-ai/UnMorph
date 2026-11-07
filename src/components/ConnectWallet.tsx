"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useAccount, useConnect, useDisconnect, useEnsName } from "wagmi";
import type { Connector } from "wagmi";
import { ExternalLink, Loader2, LogOut, Wallet, X } from "lucide-react";
import { truncateMiddle } from "@/lib/utils";

const subscribeNoop = () => () => {};

export function ConnectWallet({ className = "" }: { className?: string }) {
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  const { address, isConnected, connector: activeConnector } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const [modalOpen, setModalOpen] = useState(false);
  const [pendingConnectorId, setPendingConnectorId] = useState<string | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);

  const displayConnected = mounted && isConnected;
  const displayAddress = mounted ? address : undefined;
  const { data: ensName } = useEnsName({ address: displayAddress });

  // Close modal on Escape key
  useEffect(() => {
    if (!modalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalOpen]);

  // Deduplicate connectors by name to avoid duplicate list items
  const uniqueConnectors = connectors.filter(
    (c, index, self) => index === self.findIndex((item) => item.name === c.name),
  );

  const handleSelectConnector = (connector: Connector) => {
    setPendingConnectorId(connector.id);
    setConnectError(null);
    connect(
      { connector },
      {
        onSuccess: () => {
          setModalOpen(false);
          setPendingConnectorId(null);
        },
        onError: (err) => {
          setPendingConnectorId(null);
          setConnectError(err.message || "Failed to connect to wallet");
        },
      },
    );
  };

  // Prevent SSR hydration mismatch
  if (!mounted) {
    return (
      <button
        type="button"
        className={`inline-flex h-10 nb-press-sm items-center justify-center gap-2 border-[3px] border-nb-black bg-nb-black px-4 font-heading text-[14px] font-bold whitespace-nowrap text-nb-white ${className}`}
      >
        <Wallet className="size-4 text-nb-yellow" />
        <span>Connect Wallet</span>
      </button>
    );
  }

  if (displayConnected && displayAddress) {
    const displayName = ensName ?? truncateMiddle(displayAddress, 6, 4);

    return (
      <div
        className={`inline-flex items-center gap-2 border-[3px] border-nb-black bg-nb-green-light py-1 pr-1 pl-2.5 shadow-nb-sm ${className}`}
      >
        <span className="size-2.5 shrink-0 border-2 border-nb-black bg-nb-green" />
        <span className="font-mono text-[13px] font-bold text-nb-black" title={displayAddress}>
          {displayName}
        </span>
        {activeConnector?.name && (
          <span className="hidden border-2 border-nb-black bg-nb-surface px-1.5 font-mono text-[10px] text-nb-black uppercase md:inline">
            {activeConnector.name}
          </span>
        )}
        <button
          type="button"
          onClick={() => disconnect()}
          title="Disconnect wallet"
          className="inline-flex items-center gap-1 border-2 border-nb-black bg-nb-surface px-2 py-1 font-heading text-[12px] font-bold text-nb-black transition-colors hover:bg-nb-pink"
        >
          <LogOut className="size-3.5" />
          <span>Disconnect</span>
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setConnectError(null);
          setModalOpen(true);
        }}
        disabled={isPending}
        className={`inline-flex h-10 nb-press-sm items-center justify-center gap-2 border-[3px] border-nb-black bg-nb-black px-4 font-heading text-[14px] font-bold whitespace-nowrap text-nb-white disabled:cursor-wait disabled:opacity-80 ${className}`}
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin text-nb-yellow" />
            <span>Connecting…</span>
          </>
        ) : (
          <>
            <Wallet className="size-4 text-nb-yellow" />
            <span>Connect Wallet</span>
          </>
        )}
      </button>

      {/* Wallet Selection Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-nb-black/70 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-sm border-4 border-nb-black bg-nb-surface shadow-nb-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b-[3px] border-nb-black bg-nb-yellow px-5 py-3">
              <div className="flex items-center gap-2">
                <Wallet className="size-5" strokeWidth={2.25} />
                <h3 className="text-[18px] text-nb-black">Connect a Wallet</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="grid size-8 place-items-center border-2 border-nb-black bg-nb-surface text-nb-black transition-colors hover:bg-nb-pink"
                title="Close"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-5">
              <p className="text-[14px] text-nb-black/80">
                Choose your Ethereum wallet extension or browser provider to connect.
              </p>

              {connectError && (
                <div className="mt-3 border-[3px] border-l-[10px] border-nb-black bg-nb-pink-light p-2.5 text-[13px] text-nb-black">
                  {connectError}
                </div>
              )}

              <div className="mt-4 space-y-3">
                {uniqueConnectors.length > 0 ? (
                  uniqueConnectors.map((connector) => {
                    const isConnectingThis = isPending && pendingConnectorId === connector.id;

                    return (
                      <button
                        key={connector.uid || connector.id}
                        type="button"
                        onClick={() => handleSelectConnector(connector)}
                        disabled={isPending}
                        className="flex w-full nb-press-sm items-center justify-between gap-3 border-[3px] border-nb-black bg-nb-surface px-3.5 py-2.5 text-left font-heading text-[15px] font-bold text-nb-black hover:bg-nb-yellow-light disabled:opacity-60"
                      >
                        <div className="flex items-center gap-2.5">
                          {connector.icon ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={connector.icon}
                              alt=""
                              className="size-6 shrink-0 object-contain"
                            />
                          ) : (
                            <div className="grid size-6 place-items-center border-2 border-nb-black bg-nb-yellow text-nb-black">
                              <Wallet className="size-3.5" />
                            </div>
                          )}
                          <span>{connector.name}</span>
                        </div>

                        {isConnectingThis ? (
                          <Loader2 className="size-4 animate-spin text-nb-black" />
                        ) : (
                          <span className="font-mono text-[11px] font-normal text-nb-muted uppercase">
                            Connect
                          </span>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="border-[3px] border-dashed border-nb-black bg-nb-bg-warm py-4 text-center text-[13px] text-nb-black">
                    No Ethereum wallet extensions detected.
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between border-t-[3px] border-nb-black bg-nb-bg-warm px-5 py-3 text-[12px]">
              <span className="font-mono text-[11px] text-nb-muted uppercase">Need a wallet?</span>
              <div className="flex items-center gap-2 font-bold text-nb-black">
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-0.5 underline decoration-2 underline-offset-2 hover:bg-nb-yellow"
                >
                  MetaMask
                  <ExternalLink className="size-2.5" />
                </a>
                <span>·</span>
                <a
                  href="https://rabby.io/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-0.5 underline decoration-2 underline-offset-2 hover:bg-nb-yellow"
                >
                  Rabby
                  <ExternalLink className="size-2.5" />
                </a>
                <span>·</span>
                <a
                  href="https://www.coinbase.com/wallet"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-0.5 underline decoration-2 underline-offset-2 hover:bg-nb-yellow"
                >
                  Coinbase
                  <ExternalLink className="size-2.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
