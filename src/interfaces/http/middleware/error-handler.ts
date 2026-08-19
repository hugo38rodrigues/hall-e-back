export function errorHandler(err, req, res, next) { 
  console.error(err);   // log pour toi, côté serveur

  if (err instanceof MatchNotFoundError) {
    return res.status(404).json({ error: err.message });
  }
	
  if (err instanceof ValidationError) {
    return res.status(400).json({ error: err.message });
  }

  return res.status(500).json({ error: "internal error" });
}