import { db } from "../db.js";

export const getRankingMoreHours = async () => {
  const [ranking] = await db.query("SELECT u.name AS utilizador, SUM(rt.hours) AS total_horas_reais FROM time_logs rt JOIN users u ON rt.user_id = u.id GROUP BY rt.user_id, u.name ORDER BY total_horas_reais DESC LIMIT 3");
  return ranking.map(row => ({ projeto: "Todos Projetos", utilizador: row.utilizador, total_horas_reais: row.total_horas_reais, ranking: 0 }));
};
export const getRankingIncreasedHours = async () => {
  const [ranking] = await db.query("SELECT u.name AS utilizador, DATE(rt.logged_at) AS data_dia, SUM(rt.hours) AS horas_dia FROM time_logs rt JOIN users u ON rt.user_id = u.id GROUP BY rt.user_id, u.name, DATE(rt.logged_at) ORDER BY horas_dia DESC LIMIT 10");
  return ranking;
};
export const getRankingAboveAverage = async () => {
  const [average] = await db.query("SELECT p.name AS projeto, SUM(rt.hours) AS total_horas_projeto FROM time_logs rt JOIN task t ON rt.task_id = t.id JOIN project p ON t.project_id = p.id GROUP BY p.id, p.name HAVING SUM(rt.hours) > (SELECT AVG(sub.total) FROM (SELECT SUM(hours) AS total FROM time_logs GROUP BY task_id) AS sub)");
  return average;
};
