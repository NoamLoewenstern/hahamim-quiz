import { atom, useAtom } from "jotai";
import { useEffect } from "react";

const titleAtom = atom("חזלון");
const subtitleAtom = atom("שעשועון על חכמי ישראל");

export default function useTitle() {
  const [title, setTitle] = useAtom(titleAtom);
  const [subtitle, setSubtitle] = useAtom(subtitleAtom);

  useEffect(() => {
    if (title) {
      document.title = title;
    }
  }, [title]);
  return { title, setTitle, subtitle, setSubtitle };
}
