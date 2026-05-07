
// Função para formatar a data no formato esperado pelo banco de dados
export const formattedDate = (date) => date.replace("T", " ").replace("Z", "");
