import mysql from "mysql2/promise";

export default async (req) => {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 4000),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true },
  });

  try {
    try {
      await db.execute("ALTER TABLE notes ADD COLUMN message TEXT");
    } catch (_) {
      // Ustun allaqachon mavjud bo'lsa xato bermay o'tib ketadi
    }

    if (req.method === "POST") {
      const { name, message } = await req.json();
      const cleanName = String(name ?? "").trim().slice(0, 60);
      const cleanMessage = String(message ?? "").trim().slice(0, 400);
      if (cleanName && cleanMessage) {
        await db.execute(
          "INSERT INTO notes (name, message) VALUES (?, ?)",
          [cleanName, cleanMessage]
        );
      }
    }

    const [rows] = await db.execute(
      "SELECT name, message, created_at FROM notes ORDER BY id DESC LIMIT 50"
    );
    return Response.json(rows);
  } catch (err) {
    return Response.json({ error: "Server xatosi" }, { status: 500 });
  } finally {
    await db.end();
  }
};
