import Table from 'cli-table3';
import chalk from 'chalk';

export function renderTable(headers: string[], rows: (string | number)[][]): void {
  const table = new Table({
    head: headers.map((h) => chalk.cyan(h)),
    style: { border: ['grey'] },
  });
  rows.forEach((row) => table.push(row.map(String)));
  console.log(table.toString());
}

export function renderDetail(data: Record<string, string | number | null | undefined>): void {
  const table = new Table({ style: { border: ['grey'] } });
  for (const [key, val] of Object.entries(data)) {
    table.push({ [chalk.cyan(key)]: String(val ?? '') });
  }
  console.log(table.toString());
}
