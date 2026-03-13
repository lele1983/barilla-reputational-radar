import { createClient } from '@libsql/client';

let client = null;

function getClient() {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return client;
}

export async function runSQL(query) {
  const db = getClient();
  const result = await db.execute(query);
  return result.rows;
}

export async function searchQuestions(keyword, limit = 20) {
  const db = getClient();
  const result = await db.execute({
    sql: `SELECT q.id, q.code, q.text, q.section, q.sample_size
          FROM questions q
          WHERE q.text LIKE ? OR q.code LIKE ?
          LIMIT ?`,
    args: [`%${keyword}%`, `%${keyword}%`, limit],
  });
  return result.rows;
}

export async function getQuestionResults(questionId, segmentCategory = null) {
  const db = getClient();
  let sql = `
    SELECT r.label as response, s.name as segment, c.name as category,
           res.percentage, res.weighted_count
    FROM results res
    JOIN responses r ON res.response_id = r.id
    JOIN segments s ON res.segment_id = s.id
    JOIN categories c ON s.category_id = c.id
    WHERE r.question_id = ?
  `;
  const args = [questionId];
  if (segmentCategory) {
    sql += ' AND c.name = ?';
    args.push(segmentCategory);
  }
  sql += ' ORDER BY r.display_order, s.display_order';
  const result = await db.execute({ sql, args });
  return result.rows;
}

export async function getCategories() {
  const db = getClient();
  const result = await db.execute(`
    SELECT c.name as category, s.name as segment
    FROM categories c
    JOIN segments s ON s.category_id = c.id
    ORDER BY c.display_order, s.display_order
  `);
  const categories = {};
  for (const row of result.rows) {
    if (!categories[row.category]) categories[row.category] = [];
    categories[row.category].push(row.segment);
  }
  return categories;
}
