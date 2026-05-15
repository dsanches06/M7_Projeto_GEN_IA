import { db } from "../db.js";
import { mapUserDTOResponse, mapUserStatsDTOResponse } from "../dto/mapDTO.js";

export const getAllUsers = async (search, sort) => {
  let q = "SELECT * FROM users"; const p = [];
  if (search) { q += " WHERE (name LIKE ? OR name LIKE ? OR email LIKE ?)"; p.push(`${search}%`, `% ${search}%`, `%${search}%`); }
  if (sort === "asc" || sort === "desc") q += ` ORDER BY name ${sort.toUpperCase()}`;
  const [r] = await db.query(q, p); return r.map(mapUserDTOResponse);
};
export const getUserById = async (id) => { const [r] = await db.query("SELECT * FROM users WHERE id = ?", [id]); return r[0] ? mapUserDTOResponse(r[0]) : null; };
export const createUser = async (data) => {
  const [result] = await db.query("INSERT INTO users (name, email, phone, gender) VALUES (?, ?, ?, ?)", [data.name, data.email, data.phone ?? "", data.gender ?? "Não informado"]);
  return mapUserDTOResponse({ id: result.insertId, ...data });
};
export const updateUser = async (userId, data) => {
  const fields = [], values = [], add = (c, v) => { fields.push(c + " = ?"); values.push(v); };
  if (data.name !== undefined) add("name", data.name);
  if (data.email !== undefined) add("email", data.email);
  if (data.phone !== undefined) add("phone", data.phone);
  if (!fields.length) return 0;
  values.push(userId);
  const [, r] = await db.query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values); return r.affectedRows;
};
export const deleteUser = async (id) => { const [, r] = await db.query("DELETE FROM users WHERE id = ?", [id]); return r.affectedRows; };
export const toggleUserActive = async (id, data) => { const [, r] = await db.query("UPDATE users SET active = ? WHERE id = ?", [data.active, id]); return r.affectedRows; };
export const emailExists = async (email, userId = null) => {
  let q = "SELECT * FROM users WHERE email = ?"; const p = [email];
  if (userId) { q += " AND id != ?"; p.push(userId); }
  const [r] = await db.query(q, p); return r.length > 0;
};
export const getUserStats = async () => {
  const [r1] = await db.query("SELECT COUNT(*) AS tu FROM users"); const total = parseInt(r1[0]?.tu ?? r1[0]?.count ?? 0);
  const [r2] = await db.query("SELECT COUNT(*) AS au FROM users WHERE active = 1"); const active = parseInt(r2[0]?.au ?? r2[0]?.count ?? 0);
  const [r3] = await db.query("SELECT COUNT(*) AS iu FROM users WHERE active = 0"); const inactive = parseInt(r3[0]?.iu ?? r3[0]?.count ?? 0);
  const ap = total > 0 ? ((active / total) * 100).toFixed(2) : "0.00";
  const ip = total > 0 ? ((inactive / total) * 100).toFixed(2) : "0.00";
  return mapUserStatsDTOResponse({ totalUsers: total, activeUsers: active, inactiveUsers: inactive, activePercentage: ap + "%", inactivePercentage: ip + "%" });
};
