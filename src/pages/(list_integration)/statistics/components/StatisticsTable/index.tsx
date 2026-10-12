import {
  Avatar,
  PageLoader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeadCell,
  TableRow,
} from "@senler/ui";
import { Check, Minus } from "lucide-react";

import xpStarUrl from "../../../sprints/slug/assets/xp-star.svg";
import type { StatisticsRow, StatisticsTab } from "../../types";

interface StatisticsTableProps {
  tab: StatisticsTab;
  rows: StatisticsRow[];
  isLoading?: boolean;
  error?: string;
}

function StatusIcon({ status }: { status: StatisticsRow["ambassadorStatus"] }) {
  if (!status) return null;

  return status === "joined" ? (
    <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-[#00b956] text-[#00b956]">
      <Check className="size-3" strokeWidth={2} aria-hidden />
      <span className="sr-only">Присоединился</span>
    </span>
  ) : (
    <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-[#ff0000] text-[#ff0000]">
      <Minus className="size-3" strokeWidth={2} aria-hidden />
      <span className="sr-only">Вышел</span>
    </span>
  );
}

function EmptyRow({ columnCount, text }: { columnCount: number; text: string }) {
  return (
    <TableRow>
      <TableCell colSpan={columnCount} className="h-24 px-4 text-center text-[13px] text-[#797979]">
        {text}
      </TableCell>
    </TableRow>
  );
}

export function StatisticsTable({ tab, rows, isLoading = false, error }: StatisticsTableProps) {
  const isAmbassadors = tab === "ambassadors";
  const isPromoCodes = tab === "promo-codes";
  const showsXp = tab === "tasks" || tab === "xp";
  const columnCount = isAmbassadors ? 2 : showsXp ? 5 : 4;

  return (
    <TableContainer className="w-full overflow-x-auto border-t border-[#e4e4e4] bg-white">
      <Table className={isAmbassadors ? "min-w-[520px]" : "min-w-[760px]"}>
        <TableHead>
          <TableRow className="h-8 text-[12px] font-normal leading-4 text-[#797979]">
            <TableHeadCell className="w-[22%] px-4 py-1.5">Амбассадор</TableHeadCell>
            {isAmbassadors ? (
              <TableHeadCell className="px-4 py-1.5">Дата</TableHeadCell>
            ) : (
              <>
                <TableHeadCell className="w-[22%] px-4 py-1.5">Вид ивента</TableHeadCell>
                <TableHeadCell className="w-[22%] px-4 py-1.5">
                  {isPromoCodes ? "Промокод" : "Задание"}
                </TableHeadCell>
                <TableHeadCell className="w-[19%] px-4 py-1.5">Дата</TableHeadCell>
                {showsXp ? <TableHeadCell className="w-[15%] px-4 py-1.5" aria-label="XP" /> : null}
              </>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={columnCount} className="h-24 px-4">
                <div className="flex justify-center">
                  <PageLoader label="Загрузка…" />
                </div>
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={columnCount} className="h-24 px-4 text-center text-[13px] text-destructive" role="alert">
                {error}
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <EmptyRow columnCount={columnCount} text="Нет данных за выбранный период" />
          ) : (
            rows.map((row) => (
              <TableRow key={row.id} className="h-12 text-[13px] font-medium leading-4 tracking-[-0.0325px] text-black">
                <TableCell className="px-4 py-1.5">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <StatusIcon status={row.ambassadorStatus} />
                    <Avatar
                      src={row.avatarUrl}
                      name={row.ambassadorName}
                      size="sm"
                      shape="rounded"
                      className="size-6 rounded-lg border border-[#e4e4e4]"
                    />
                    <span className="truncate" title={row.ambassadorName}>
                      {row.ambassadorName}
                    </span>
                  </div>
                </TableCell>
                {isAmbassadors ? (
                  <TableCell className="px-4 py-1.5">{row.date}</TableCell>
                ) : (
                  <>
                    <TableCell className="px-4 py-1.5">
                      <div className="min-w-0">
                        <p className="truncate" title={row.sourceName}>{row.sourceName}</p>
                        <p className="truncate text-[12px] font-normal text-[#797979]" title={row.sourceType}>
                          {row.sourceType}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className={`truncate px-4 py-1.5 ${isPromoCodes ? "" : "text-[#2563eb]"}`} title={isPromoCodes ? row.promoCode : row.taskName}>
                      {isPromoCodes ? row.promoCode : row.taskName}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-4 py-1.5">{row.date}</TableCell>
                    {showsXp ? (
                      <TableCell className="px-4 py-1.5">
                        {row.xp != null ? (
                          <span className="flex items-center justify-end gap-1 whitespace-nowrap">
                            <span className="text-[#797979]">+</span>
                            <img src={xpStarUrl} alt="" className="size-3.5" aria-hidden />
                            {row.xp.toLocaleString("ru-RU")} XP
                          </span>
                        ) : null}
                      </TableCell>
                    ) : null}
                  </>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
