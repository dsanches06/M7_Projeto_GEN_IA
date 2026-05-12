export const validateTaskData = (req, res, next) => {
  const {
    title,
    description,
    status_id,
    priority_id,
    estimated_hours,
    due_date,
    completed_at,
  } = req.body;

  const isUpdate = Boolean(req.params.id);

  if (isUpdate) {
    const fieldsToUpdate = [];

    if (title !== undefined) fieldsToUpdate.push("title");
    if (description !== undefined) fieldsToUpdate.push("description");
    if (status_id !== undefined) fieldsToUpdate.push("status_id");
    if (priority_id !== undefined) fieldsToUpdate.push("priority_id");
    if (estimated_hours !== undefined) fieldsToUpdate.push("estimated_hours");
    if (due_date !== undefined) fieldsToUpdate.push("due_date");
    if (completed_at !== undefined) fieldsToUpdate.push("completed_at");

    if (fieldsToUpdate.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    if (title !== undefined && title.toString().trim().length === 0) {
      return res.status(400).json({ error: "Title cannot be empty" });
    }

    if (description !== undefined && description.toString().trim().length === 0) {
      return res.status(400).json({ error: "Description cannot be empty" });
    }

    if (
      status_id !== undefined &&
      (status_id === null || status_id.toString().trim().length === 0)
    ) {
      return res.status(400).json({ error: "Task status ID must be valid" });
    }

    if (
      priority_id !== undefined &&
      (priority_id === null || priority_id.toString().trim().length === 0)
    ) {
      return res.status(400).json({ error: "Priority ID must be valid" });
    }

    if (
      estimated_hours !== undefined &&
      (estimated_hours === null || estimated_hours.toString().trim().length === 0)
    ) {
      return res.status(400).json({ error: "Estimated hours must be valid" });
    }
  } else {
    if (!title || title.toString().trim().length === 0) {
      return res.status(400).json({ error: "Title is required" });
    }

    if (!description || description.toString().trim().length === 0) {
      return res.status(400).json({ error: "Description is required" });
    }

    if (
      status_id === undefined ||
      status_id === null ||
      status_id.toString().trim().length === 0
    ) {
      return res.status(400).json({ error: "Task status ID is required" });
    }

    if (
      priority_id === undefined ||
      priority_id === null ||
      priority_id.toString().trim().length === 0
    ) {
      return res.status(400).json({ error: "Priority ID is required" });
    }
  }

  next();
};
