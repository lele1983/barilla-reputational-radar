const OS_URL = process.env.OPENSEARCH_URL;
const OS_USER = process.env.OPENSEARCH_USER;
const OS_PASS = process.env.OPENSEARCH_PASS;
const OS_INDEX = process.env.OPENSEARCH_INDEX || 'channel_posts';

const auth = Buffer.from(`${OS_USER}:${OS_PASS}`).toString('base64');

export async function osQuery(body, endpoint = '_search') {
  const res = await fetch(`${OS_URL}/${OS_INDEX}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${auth}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenSearch ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

export async function osCount(query = { match_all: {} }) {
  const res = await fetch(`${OS_URL}/${OS_INDEX}/_count`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${auth}`,
    },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`OpenSearch count error: ${res.status}`);
  const data = await res.json();
  return data.count;
}
