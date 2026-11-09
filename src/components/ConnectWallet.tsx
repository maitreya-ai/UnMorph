"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useAccount, useConnect, useDisconnect, useEnsName } from "wagmi";
import type { Connector } from "wagmi";
import { ExternalLink, Loader2, LogOut, Wallet, X } from "lucide-react";
import { cn, truncateMiddle } from "@/lib/utils";

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
        className={cn(
          "nb-press-sm inline-flex h-10 items-center justify-center gap-2 border-[3px] border-nb-black bg-nb-yellow px-4 font-heading text-[12.5px] font-bold uppercase tracking-wide text-nb-black",
          className,
        )}
      >
        <Wallet className="size-4" />
        <span>Connect Wallet</span>
      </button>
    );
  }

  if (displayConnected && displayAddress) {
    const displayName = ensName ?? truncateMiddle(displayAddress, 6, 4);

    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 border-[3px] border-nb-black bg-nb-green px-2.5 py-1.5 shadow-nb-sm",
          className,
        )}
      >
        <span className="flex size-2 border border-nb-black bg-nb-black" />
        <span className="font-mono text-[13px] font-bold text-nb-black" title={displayAddress}>
          {displayName}
        </span>
        {activeConnector?.name && (
          <span className="border-[2px] border-nb-black bg-nb-surface px-1.5 py-0.5 font-heading text-[10px] font-bold uppercase text-nb-black">
            {activeConnector.name}
          </span>
        )}
        <button
          type="button"
          onClick={() => disconnect()}
          title="Disconnect wallet"
          className="inline-flex items-center gap-1 border-[2px] border-nb-black bg-nb-surface px-2 py-1 font-heading text-[11px] font-bold uppercase text-nb-black transition-colors hover:bg-nb-pink"
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
        className={cn(
          "nb-press-sm inline-flex h-10 items-center justify-center gap-2 border-[3px] border-nb-black bg-nb-yellow px-4 font-heading text-[12.5px] font-bold uppercase tracking-wide text-nb-black disabled:cursor-wait disabled:opacity-80",
          className,
        )}
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            <span>Connecting…</span>
          </>
        ) : (
          <>
            <Wallet className="size-4" />
            <span>Connect Wallet</span>
          </>
        )}
      </button>

      {/* Wallet Selection Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-nb-black/50 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-sm border-[3px] border-nb-black bg-nb-surface p-5 shadow-nb-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b-[3px] border-nb-black pb-3">
              <div className="flex items-center gap-2">
                <Wallet className="size-5 text-nb-black" />
                <h3 className="font-display text-[16px] font-extrabold uppercase text-nb-black">
                  Connect a Wallet
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="border-[2px] border-nb-black bg-nb-surface p-1 text-nb-black transition hover:bg-nb-pink"
                title="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="mt-2.5 text-[12.5px] text-nb-muted">
              Choose your Ethereum wallet extension or browser provider to connect.
            </p>

            {connectError && (
              <div className="mt-3 border-[2px] border-nb-black bg-nb-pink p-2.5 text-[12px] font-medium text-nb-black">
                {connectError}
              </div>
            )}

            <div className="mt-4 space-y-2">
              {uniqueConnectors.length > 0 ? (
                uniqueConnectors.map((connector) => {
                  const isConnectingThis = isPending && pendingConnectorId === connector.id;

                  return (
                    <button
                      key={connector.uid || connector.id}
                      type="button"
                      onClick={() => handleSelectConnector(connector)}
                      disabled={isPending}
                      className="nb-press-sm flex w-full items-center justify-between gap-3 border-[2px] border-nb-black bg-nb-surface px-3.5 py-2.5 text-left text-[13.5px] font-bold text-nb-black transition hover:bg-nb-yellow disabled:opacity-60"
                    >
                      <div className="flex items-center gap-2.5">
                        {connector.icon ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={connector.icon}
                            alt=""
                            className="size-5 shrink-0 border border-nb-black object-contain"
                          />
                        ) : (
                          <div className="grid size-5 place-items-center border border-nb-black bg-nb-blue text-nb-black">
                            <Wallet className="size-3.5" />
                          </div>
                        )}
                        <span>{connector.name}</span>
                      </div>

                      {isConnectingThis ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <span className="text-[11px] font-normal text-nb-muted uppercase">
                          Connect
                        </span>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="border-[2px] border-dashed border-nb-black py-4 text-center text-[13px] text-nb-muted">
                  No Ethereum wallet extensions detected.
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t-[3px] border-nb-black pt-3 text-[11.5px] text-nb-muted">
              <span>Need a wallet?</span>
              <div className="flex items-center gap-2 font-bold text-nb-black">
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-0.5 hover:underline"
                >
                  MetaMask
                  <ExternalLink className="size-2.5" />
                </a>
                <span>·</span>
                <a
                  href="https://rabby.io/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-0.5 hover:underline"
                >
                  Rabby
                  <ExternalLink className="size-2.5" />
                </a>
                <span>·</span>
                <a
                  href="https://www.coinbase.com/wallet"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-0.5 hover:underline"
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
