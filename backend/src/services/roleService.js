import { db } from "../db.js";

export const getAllRoles = async () => {
  const [roles] = await db.query("SELECT * FROM roles ORDER BY flow_order, id");
  return roles;
};

export const getRoleById = async (roleId) => {
  const [roles] = await db.query("SELECT * FROM roles WHERE id = ?", [roleId]);
  return roles.length > 0 ? roles[0] : null;
};

export const roleNameExists = async (name, excludeId = null) => {
  const query = excludeId
    ? "SELECT 1 FROM roles WHERE name = ? AND id <> ? LIMIT 1"
    : "SELECT 1 FROM roles WHERE name = ? LIMIT 1";
  const params = excludeId ? [name, excludeId] : [name];
  const [rows] = await db.query(query, params);
  return rows.length > 0;
};

export const createRole = async (data) => {
  const [result] = await db.query(
    "INSERT INTO roles (name, flow_order) VALUES (?, ?)",
    [data.name, data.flow_order ?? 0],
  );
  return { id: result.insertId, name: data.name, flow_order: data.flow_order ?? 0 };
};

export const updateRole = async (id, data) => {
  const fields = [];
  const values = [];
  if (data.name !== undefined) {
    fields.push("name = ?");
    values.push(data.name);
  }
  if (data.flow_order !== undefined) {
    fields.push("flow_order = ?");
    values.push(data.flow_order);
  }
  if (!fields.length) return 0;
  values.push(id);
  const [, result] = await db.query(`UPDATE roles SET ${fields.join(", ")} WHERE id = ?`, values);
  return result.affectedRows ? { id, ...data } : null;
};

export const deleteRole = async (id) => {
  const [, result] = await db.query("DELETE FROM roles WHERE id = ?", [id]);
  return result.affectedRows;
};
