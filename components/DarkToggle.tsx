"use client";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

export default function DarkToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="btn text-sm">
        Theme
      </button>
    );
  }
  
  return (
    <button 
      className="btn text-sm" 
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? "Light" : "Dark"} mode
    </button>
  );
}
