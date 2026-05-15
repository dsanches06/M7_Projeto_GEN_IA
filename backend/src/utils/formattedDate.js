// Converte data ISO 8601 para o formato aceite pelo MySQL ("YYYY-MM-DD HH:MM:SS")
export const formattedDate = (date) => date.replace("T", " ").replace("Z", "");
