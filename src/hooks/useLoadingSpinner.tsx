import { useDisclosure } from "@mantine/hooks";
import { Portal } from "@mantine/core";
import Loader from "~/Componenets/Loader/Loader";
import { atom, useAtom } from "jotai";
import { useEffect, useState } from "react";

const globalLoadingSpinnerAtom = atom(false);

export function LoadingSpinnerModal({ opened = true }: { opened?: boolean } = {}) {
  if (!opened) return null;
  return (
    <Portal>
      <Loader />
    </Portal>
  );
}

export default function useLoadingSpinner() {
  const [opened, { open, close, toggle }] = useDisclosure(false);

  const SpinningModal = () => <LoadingSpinnerModal opened={opened} />;

  return { LoadingSpinnerModal: SpinningModal, open, close, toggle, opened };
}

export function useGlobalLoadingSpinner() {
  const [isOpen, setIsOpen] = useAtom(globalLoadingSpinnerAtom);
  const SpinningModal = () => <LoadingSpinnerModal opened={isOpen} />;
  const open = () => {
    setIsOpen(true);
  };
  const close = () => {
    setIsOpen(false);
  };
  const toggle = () => {
    setIsOpen((prev) => !prev);
  };
  return { LoadingSpinnerModal: SpinningModal, open, close, toggle, opened: isOpen };
}
