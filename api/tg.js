export default async function handler(req, res) {
  const text = req.query.text || 'Уведомление';

  const TG_TOKEN = process.env.TG_TOKEN;
  const TG_CHAT_ID = process.env.TG_CHAT_ID;

  if (!TG_TOKEN || !TG_CHAT_ID) {
    return res.status(500).json({
      ok: false,
      error: 'TG env missing',
      tokenExists: !!TG_TOKEN,
      chatExists: !!TG_CHAT_ID
    });
  }

  const url =
    'https://api.telegram.org/bot' +
    TG_TOKEN +
    '/sendMessage?chat_id=' +
    encodeURIComponent(TG_CHAT_ID) +
    '&text=' +
    encodeURIComponent(text);

  const tgRes = await fetch(url);
  const data = await tgRes.json();

  return res.status(200).json(data);
}