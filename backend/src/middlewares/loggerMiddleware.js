// Regista no terminal o método e URL de cada pedido recebido
export default function logger(req, res, next) {
  console.log(`${req.method} ${req.url}`);
  next();
}
