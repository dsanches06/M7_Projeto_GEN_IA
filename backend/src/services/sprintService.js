import { db } from "../db.js";
import { mapSprintDTOResponse, mapSprintStatsDTOResponse } from "../dto/mapDTO.js";

export const getAllSprints = async (search, sort) => {
  let [sprints] = await db.query("SELECT * FROM sprints");
  if (search) sprints = sprints.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()));
  if (sort === "asc" || sort === "desc") sprints.sort((a, b) => { const na = (a.name || "").toLowerCase(), nb = (b.name || "").toLowerCase(); return sort === "asc" ? na.localeCompare(nb) : nb.localeCompare(na); });
  return sprints.map(mapSprintDTOResponse);
};
export const getSprintById = async (id) => { const [r] = await db.query("SELECT * FROM sprints WHERE id = ?", [id]); return r[0] ? mapSprintDTOResponse(r[0]) : null; };
export const createSprint = async (data) => {
  const [result] = await db.query("INSERT INTO sprints (project_id, name, description, start_date, end_date, status_id) VALUES (?, ?, ?, ?, ?, ?)", [data.project_id, data.name, data.description, data.start_date, data.end_date, data.status_id]);
  return mapSprintDTOResponse({ id: result.insertId, ...data });
};
export const updateSprint = async (sprintId, data) => {
  const fields = [], values = [], add = (c, v) => { fields.push(c + " = ?"); values.push(v); };
  if (data.project_id !== undefined) add("project_id", data.project_id);
  if (data.name !== undefined) add("name", data.name);
  if (data.description !== undefined) add("description", data.description);
  if (data.start_date !== undefined) add("start_date", data.start_date);
  if (data.end_date !== undefined) add("end_date", data.end_date);
  if (data.status_id !== undefined) add("status_id", data.status_id);
  if (!fields.length) return 0;
  values.push(sprintId);
  const [, r] = await db.query(`UPDATE sprints SET ${fields.join(", ")} WHERE id = ?`, values); return r.affectedRows;
};
export const deleteSprint = async (id) => { const [, r] = await db.query("DELETE FROM sprints WHERE id = ?", [id]); return r.affectedRows; };
export const getSprintsStats = async () => { const [r] = await db.query("SELECT COUNT(*) AS ts FROM sprints"); return mapSprintStatsDTOResponse({ totalSprints: parseInt(r[0]?.ts ?? r[0]?.count ?? 0) }); };
export const getSprintStats = async (id) => { const [r] = await db.query("SELECT COUNT(*) AS tt FROM sprint_tasks WHERE sprint_id = ?", [id]); return mapSprintStatsDTOResponse({ totalSprints: parseInt(r[0]?.tt ?? 0) }); };
