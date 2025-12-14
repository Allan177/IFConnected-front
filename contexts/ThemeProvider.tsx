"use client";
import { ThemeProvider } from "next-themes";
import React from "react";

export default function NextThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // O Next-Themes cuida de salvar no LocalStorage e aplicar as classes
  return <ThemeProvider attribute="class">{children}</ThemeProvider>;
}
