export default function handler(req, res) {
  const email = req.body?.event?.user?.email;

  if (!email) {
    return res.status(400).json({ error: "Missing email" });
  }

  // SOLO permitir cuentas corporativas
  if (!email.endsWith("@1punto618.com")) {
    return res.status(400).json({
      error: "Solo se permiten correos @1punto618.com",
    });
  }

  return res.status(200).json({ ok: true });
}
