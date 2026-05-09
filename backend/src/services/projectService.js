import { db } from "../db.js";
import { mapProjectDTOResponse, mapProjectStatsDTOResponse } from "../dto/mapDTO.js";

export const getAllProjects = async (search, sort) => {
  let q = "SELECT * FROM project"; const p = [];
  if (search) { q += " WHERE (name LIKE ? OR description LIKE ?)"; p.push(`%${search}%`, `%${search}%`); }
  if (sort === "asc" || sort === "desc") q += ` ORDER BY name ${sort.toUpperCase()}`;
  const [rows] = await db.query(q, p); return rows.map(mapProjectDTOResponse);
};
export const getProjectById = async (id) => { const [r] = await db.query("SELECT * FROM project WHERE id = ?", [id]); return r[0] ? mapProjectDTOResponse(r[0]) : null; };
export const createProject = async (data) => {
  const [result] = await db.query("INSERT INTO project (name, description, start_date, end_date_expected) VALUES (?, ?, ?, ?)", [data.name, data.description, data.start_date ?? null, data.end_date_expected ?? null]);
  return mapProjectDTOResponse({ id: result.insertId, ...data });
};
export const updateProject = async (projectId, data) => {
  const fields = [], values = [], add = (c, v) => { fields.push(c + " = ?"); values.push(v); };
  if (data.name !== undefined) add("name", data.name);
  if (data.description !== undefined) add("description", data.description);
  if (data.project_status_id !== undefined) add("project_status_id", data.project_status_id);
  if (data.start_date !== undefined) add("start_date", data.start_date);
  if (data.end_date_expected !== undefined) add("end_date_expected", data.end_date_expected);
  if (!fields.length) return 0;
  values.push(projectId);
  const [, r] = await db.query(`UPDATE project SET ${fields.join(", ")} WHERE id = ?`, values); return r.affectedRows;
};
export const deleteProject = async (id) => { const [, r] = await db.query("DELETE FROM project WHERE id = ?", [id]); return r.affectedRows; };
export const getProjectsStats = async () => {
  const [r] = await db.query("SELECT COUNT(*) AS tp, COALESCE(SUM(CASE WHEN project_status_id=1 THEN 1 ELSE 0 END),0) AS ap, COALESCE(SUM(CASE WHEN project_status_id=3 THEN 1 ELSE 0 END),0) AS fp, COALESCE(SUM(CASE WHEN project_status_id=2 THEN 1 ELSE 0 END),0) AS dp FROM project");
  const s = r[0], total = parseInt(s.tp ?? 0) || 1;
  return mapProjectStatsDTOResponse({ totalProjects: parseInt(s.tp ?? 0), activeProjects: parseInt(s.ap ?? 0), finishedProjects: parseInt(s.fp ?? 0), inDevelopmentProjects: parseInt(s.dp ?? 0), activePercentage: ((parseInt(s.ap ?? 0) / total) * 100).toFixed(2) + "%", finishedPercentage: ((parseInt(s.fp ?? 0) / total) * 100).toFixed(2) + "%" });
};
export const getProjectStats = async (projectId) => {
  const [r] = await db.query("SELECT COUNT(*) AS tt, COALESCE(SUM(CASE WHEN status_id=5 THEN 1 ELSE 0 END),0) AS ct, COALESCE(SUM(CASE WHEN status_id!=5 THEN 1 ELSE 0 END),0) AS pt FROM task WHERE project_id = ?", [projectId]);
  const s = r[0], total = parseInt(s.tt ?? 0) || 1;
  return mapProjectStatsDTOResponse({ totalProjects: parseInt(s.tt ?? 0), activeProjects: parseInt(s.pt ?? 0), finishedProjects: parseInt(s.ct ?? 0), inDevelopmentProjects: 0, activePercentage: ((parseInt(s.pt ?? 0) / total) * 100).toFixed(2) + "%", finishedPercentage: ((parseInt(s.ct ?? 0) / total) * 100).toFixed(2) + "%" });
};
