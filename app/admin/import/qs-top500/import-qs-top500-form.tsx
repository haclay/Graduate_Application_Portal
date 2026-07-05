"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

type PreviewRow = {
  aliases: string[];
  city: string | null;
  country: string;
  name: string;
  name_en: string | null;
  qs_rank_2027: number | null;
  qs_url: string | null;
  rank_display: string | null;
  website_url: string | null;
};

type PreviewResult = {
  errors: string[];
  previewRows: PreviewRow[];
  totalRows: number;
};

type ImportResult = {
  errors: string[];
  inactiveCount: number;
  insertedCount: number;
  matchedUpdatedCount: number;
  totalRows: number;
  unmatchedCount: number;
};

export function ImportQsTop500Form() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  async function submit(mode: "preview" | "import") {
    if (!file) {
      setError("请先选择 QS Top 500 CSV 文件。");
      return;
    }

    setIsLoading(true);
    setError(null);
    if (mode === "preview") {
      setPreview(null);
      setResult(null);
    }

    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("mode", mode);

      const response = await fetch("/api/admin/import/qs-top500", {
        body: formData,
        method: "POST",
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(typeof payload.error === "string" ? payload.error : "QS Top 500 导入失败。");
        return;
      }

      if (mode === "preview") {
        setPreview(payload as PreviewResult);
      } else {
        setResult(payload as ImportResult);
      }
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "QS Top 500 导入失败。");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-5 rounded-lg border bg-card p-5">
      <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        当前导入功能仅供开发阶段使用。请先使用模板准备 CSV，并确认不会上传项目申请要求、DDL、语言成绩、GRE 或学费数据。
      </div>

      <label className="grid gap-2 text-sm font-medium">
        QS 2027 Top 500 CSV
        <input
          accept=".csv,text/csv"
          className="rounded-md border bg-background px-3 py-2 text-sm"
          disabled={isLoading}
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null);
            setPreview(null);
            setResult(null);
            setError(null);
          }}
          type="file"
        />
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button disabled={isLoading || !file} onClick={() => submit("preview")} type="button" variant="outline">
          {isLoading ? "处理中..." : "解析并预览"}
        </Button>
        <Button disabled={isLoading || !file} onClick={() => submit("import")} type="button">
          {isLoading ? "同步中..." : "导入并同步 Top 500"}
        </Button>
        <a className="text-sm font-medium text-primary" href="/templates/qs_2027_top500_template.csv">
          下载 CSV 模板
        </a>
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {preview ? (
        <section className="rounded-lg border bg-background p-5">
          <h2 className="text-lg font-semibold">CSV 预览</h2>
          <p className="mt-2 text-sm text-muted-foreground">可导入行数：{preview.totalRows}</p>
          <PreviewTable rows={preview.previewRows} />
          <ErrorList errors={preview.errors} />
        </section>
      ) : null}

      {result ? (
        <section className="rounded-lg border bg-background p-5">
          <h2 className="text-lg font-semibold">同步结果</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Metric label="CSV 总行数" value={result.totalRows} />
            <Metric label="匹配更新数量" value={result.matchedUpdatedCount} />
            <Metric label="新增学校数量" value={result.insertedCount} />
            <Metric label="标记 inactive 数量" value={result.inactiveCount} />
            <Metric label="无法自动匹配数量" value={result.unmatchedCount} />
          </div>
          <ErrorList errors={result.errors} />
        </section>
      ) : null}
    </div>
  );
}

function PreviewTable({ rows }: { rows: PreviewRow[] }) {
  if (rows.length === 0) {
    return <p className="mt-4 text-sm text-muted-foreground">没有可预览的数据。</p>;
  }

  return (
    <div className="mt-4 overflow-x-auto rounded-md border">
      <table className="min-w-full divide-y text-sm">
        <thead className="bg-muted/60 text-left">
          <tr>
            <th className="px-3 py-2 font-medium">排名</th>
            <th className="px-3 py-2 font-medium">学校</th>
            <th className="px-3 py-2 font-medium">国家</th>
            <th className="px-3 py-2 font-medium">城市</th>
            <th className="px-3 py-2 font-medium">别名</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((row, index) => (
            <tr key={`${row.name}-${index}`}>
              <td className="px-3 py-2">{row.rank_display ?? row.qs_rank_2027 ?? "-"}</td>
              <td className="px-3 py-2">{row.name}</td>
              <td className="px-3 py-2">{row.country}</td>
              <td className="px-3 py-2">{row.city ?? "-"}</td>
              <td className="px-3 py-2">{row.aliases.join("; ") || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
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

function ErrorList({ errors }: { errors: string[] }) {
  if (errors.length === 0) {
    return null;
  }

  return (
    <div className="mt-5 rounded-md border border-destructive/20 bg-destructive/5 p-4 text-sm">
      <p className="font-medium text-destructive">错误列表</p>
      <ul className="mt-3 grid gap-2 text-muted-foreground">
        {errors.slice(0, 10).map((item, index) => (
          <li key={`${item}-${index}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}