// create context for title

import React, { createContext, useState } from "react";

type TitleContextType = {
  title: string;
  setTitle: (title: string) => void;
};

export const TitleContext = createContext({});

export const TitleProvider = ({ children }: { children: React.ReactNode }) => {
  const [title, setTitle] = useState("");

  return <TitleContext.Provider value={{ title, setTitle }}>{children}</TitleContext.Provider>;
};
