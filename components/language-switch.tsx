"use client";

export function LanguageSwitch() {
  return (
    <div className="flex items-center rounded-md border bg-background px-2 py-1 text-sm text-muted-foreground">
      <span className="font-medium text-foreground">中文</span>
      <span className="mx-2 text-border">|</span>
      <button
        className="font-medium transition-colors hover:text-foreground"
        onClick={() => window.alert("English version coming soon")}
        type="button"
      >
        EN
      </button>
    </div>
  );
}
