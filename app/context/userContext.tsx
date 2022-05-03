import { Dialog, Transition } from "@headlessui/react";
import React, { createContext, useContext, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { MetamaskIcon, WalletConnectIcon } from "~/components/Icons";
import { useIsMounted } from "~/hooks";

const Context = createContext<{
  openWalletModal: () => void;
  isConnected: boolean;
  isConnecting: boolean;
  disconnect: () => void;
  accountData: ReturnType<typeof useAccount>["data"];
} | null>(null);

export const useUser = () => {
  const context = useContext(Context);

  if (!context) {
    throw new Error("Must call `useUser` within a `UserProvider` component.");
  }

  return context;
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const isMounted = useIsMounted();
  const [isOpenWalletModal, setIsOpenWalletModal] = useState(false);
  const {
    connect,
    connectors,
    isConnecting: rawIsConnecting,
    activeConnector,
  } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: accountData } = useAccount();

  const openWalletModal = () => setIsOpenWalletModal(true);

  const isConnected = !!isMounted && !!activeConnector && !!accountData;
  const isConnecting = isMounted && rawIsConnecting;

  React.useEffect(() => {
    if (isConnected) {
      setIsOpenWalletModal(false);
    }
  }, [isConnected]);

  return (
    <Context.Provider
      value={{
        openWalletModal: openWalletModal,
        isConnected,
        isConnecting,
        disconnect,
        accountData,
      }}
    >
      {children}
      <Transition.Root show={isOpenWalletModal} as={React.Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-40 overflow-y-auto"
          onClose={() => setIsOpenWalletModal(false)}
        >
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
            </Transition.Child>

            <span
              className="hidden sm:inline-block sm:h-screen sm:align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div className="relative inline-block w-full transform overflow-hidden rounded-lg bg-gray-800 px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:max-w-xl sm:p-6 sm:align-middle">
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <div className="grid grid-cols-1 divide-y divide-gray-700 sm:grid-cols-2 sm:divide-y-0 sm:divide-x">
                    {connectors.map((x) => (
                      <div key={x.id} className="py-4 sm:px-4 sm:py-0">
                        <div className="relative flex flex-col items-center justify-center rounded-md p-3 hover:bg-slate-700">
                          <p className="mb-2 font-medium text-slate-300 sm:text-lg md:text-xl">
                            {x.name}
                          </p>
                          <p className="mb-8 text-xs font-bold text-slate-400 sm:text-sm">
                            Connect to {x.name}
                          </p>
                          {x.name === "MetaMask" ? (
                            <MetamaskIcon className="h-12 w-12" />
                          ) : (
                            <WalletConnectIcon className="h-12 w-12" />
                          )}
                          <button
                            className="absolute inset-0 h-full w-full"
                            onClick={() => connect(x)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </Context.Provider>
  );
};