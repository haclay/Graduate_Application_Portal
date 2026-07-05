"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { UNIVERSITY_IMPORT_COUNTRIES } from "@/lib/import/universities";

type ImportResult = {
  country: string;
  errorCount: number;
  insertedCount: number;
  skippedDuplicateCount: number;
  sourceUrl: string;
  totalCount: number;
};

export function ImportUniversitiesForm() {
  const [country, setCountry] = useState<(typeof UNIVERSITY_IMPORT_COUNTRIES)[number]>("United States");
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleImport() {
    setIsImporting(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/import/universities", {
        body: JSON.stringify({ country }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      const payload = (await response.json()) as ImportResult | { error?: string };

      if (!response.ok) {
        setError("error" in payload && payload.error ? payload.error : "导入失败，请稍后重试。");
        return;
      }

      setResult(payload as ImportResult);
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "导入失败，请稍后重试。");
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <div className="grid gap-5 rounded-lg border bg-card p-5">
      <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        当前导入功能仅供开发阶段使用，正式上线前需要管理员权限控制。导入内容仅包含学校基础信息，不导入项目申请要求、DDL、语言成绩、GRE 或学费信息。
      </div>

      <label className="grid gap-2 text-sm font-medium">
        选择国家
        <select
          className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          disabled={isImporting}
          onChange={(event) => setCountry(event.target.value as (typeof UNIVERSITY_IMPORT_COUNTRIES)[number])}
          value={country}
        >
          {UNIVERSITY_IMPORT_COUNTRIES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button disabled={isImporting} onClick={handleImport} type="button">
          {isImporting ? "导入中..." : "导入学校基础数据"}
        </Button>
        <p className="text-sm text-muted-foreground">
          数据源：Hipo Labs University Domains List
        </p>
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {result ? (
        <section className="rounded-lg border bg-background p-5">
          <h2 className="text-lg font-semibold">导入结果</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="总数" value={result.totalCount} />
            <Metric label="新增数量" value={result.insertedCount} />
            <Metric label="跳过重复数量" value={result.skippedDuplicateCount} />
            <Metric label="错误数量" value={result.errorCount} />
          </div>
          <p className="mt-4 break-all text-xs text-muted-foreground">
            Source URL: {result.sourceUrl}
          </p>
        </section>
      ) : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
