export default async function handler(req, res) {
  const TG_TOKEN = process.env.TG_TOKEN;
  const TG_CHAT_IDS = (process.env.TG_CHAT_IDS  process.env.TG_CHAT_ID  '')
  .split(',')
  .map(id => id.trim())
  .filter(Boolean);

  if (!TG_TOKEN || TG_CHAT_IDS.length === 0) {
    return res.status(500).json({ ok: false, error: 'TG env missing' });
  }

  async function sendMessage(chatId, text, keyboard = null) {
    const body = {
      chat_id: chatId,
      text: text
    };

    if (keyboard) {
      body.reply_markup = keyboard;
    }

    const tgRes = await fetch('https://api.telegram.org/bot' + TG_TOKEN + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    return await tgRes.json();
  }

  async function sendToAll(text) {
    const results = [];

    for (const chatId of TG_CHAT_IDS) {
      const result = await sendMessage(chatId, text);
      results.push({ chatId, result });
    }

    return results;
  }

  if (req.method === 'GET') {
    const text = req.query.text || 'Уведомление';
    const data = await sendToAll(text);
    return res.status(200).json({ ok: true, sent: data.length, data });
  }

  if (req.method === 'POST') {
    const update = req.body;

    if (update.message && update.message.text === '/start') {
      const chatId = update.message.chat.id;

      const keyboard = {
        inline_keyboard: [
          [{ text: 'Статус', callback_data: 'status' }],
          [{ text: 'Тест команда', callback_data: 'test_command' }],
          [{ text: 'Последнее событие', callback_data: 'last_event' }]
        ]
      };

      const data = await sendMessage(chatId, 'Панель управления', keyboard);
      return res.status(200).json(data);
    }

    if (update.callback_query) {
      const chatId = update.callback_query.message.chat.id;
      const action = update.callback_query.data;

      if (action === 'status') {
        await sendMessage(chatId, 'Статус: работает');
      }

      if (action === 'test_command') {
        await sendMessage(chatId, 'Тест команда принята');
      }

      if (action === 'last_event') {
        await sendMessage(chatId, 'Последнее событие: пока нет данных');
      }

      return res.status(200).json({ ok: true });
    }

    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ ok: false });
}
