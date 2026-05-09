import { db } from "../db.js";
import { mapTicketDTOResponse } from "../dto/mapDTO.js";
export const getAllTickets = async () => { const [r] = await db.query("SELECT * FROM tickets"); return r.map(mapTicketDTOResponse); };
export const getTicketById = async (id) => { const [r] = await db.query("SELECT * FROM tickets WHERE id = ?", [id]); return r[0] ? mapTicketDTOResponse(r[0]) : null; };
export const createTicket = async (data) => {
  const [result] = await db.query("INSERT INTO tickets (user_report, error_type, severity, fix_suggestion, status) VALUES (?, ?, ?, ?, ?)", [data.user_report, data.error_type, data.severity, data.fix_suggestion, data.status || "open"]);
  return mapTicketDTOResponse({ id: result.insertId, ...data });
};
export const updateTicket = async (id, data) => { const f = Object.keys(data).map(k => k + " = ?").join(", "); const [, r] = await db.query(`UPDATE tickets SET ${f} WHERE id = ?`, [...Object.values(data), id]); return r.affectedRows; };
export const deleteTicket = async (id) => { const [, r] = await db.query("DELETE FROM tickets WHERE id = ?", [id]); return r.affectedRows; };
