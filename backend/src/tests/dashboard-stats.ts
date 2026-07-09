import assert from 'node:assert/strict';
import { connectDatabase, getDbInstance } from '../config/database';

async function main() {
  await connectDatabase();
  const stats = await getDbInstance().getDashboardStats();

  assert.ok(stats.totalEmployees > 0, 'Total karyawan kosong');
  assert.ok(stats.totalComputers > 0, 'Total komputer kosong');
  assert.ok(stats.totalWorkOrders > 0, 'Total work order kosong');
  assert.equal(stats.activeComputers + stats.inactiveComputers, stats.totalComputers, 'Status komputer tidak konsisten');
  assert.equal(stats.openWorkOrders + stats.closedWorkOrders, stats.totalWorkOrders, 'Status WO tidak konsisten');
  assert.ok(stats.computersByType.length > 0, 'Kategori komputer kosong');
  assert.ok(stats.assetsByDepartment.length > 0, 'Distribusi aset kosong');
  assert.ok(stats.woByPic.length > 0, 'Performa PIC kosong');
  assert.ok(stats.woMonthlyTrend.length > 0, 'Tren WO kosong');

  console.log(JSON.stringify({
    employees: stats.totalEmployees,
    computers: stats.totalComputers,
    activeComputers: stats.activeComputers,
    workOrders: stats.totalWorkOrders,
    openWorkOrders: stats.openWorkOrders,
    completionRate: stats.completionRate,
    averageDowntime: stats.averageDowntime,
    monthlyPoints: stats.woMonthlyTrend.length,
    departments: stats.assetsByDepartment.length,
    picCount: stats.woByPic.length,
  }, null, 2));
  console.log('HASIL DASHBOARD: seluruh kontrak statistik lulus.');
  process.exit(0);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
