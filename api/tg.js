export default async function handler(req, res) {
  const TG_TOKEN = process.env.TG_TOKEN;
  const TG_CHAT_ID = process.env.TG_CHAT_ID;

  if (!TG_TOKEN || !TG_CHAT_ID) {
    return res.status(500).json({ ok: false, error: 'TG env missing' });
  }

  async function sendMessage(text, keyboard = null) {
    const body = {
      chat_id: TG_CHAT_ID,
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

  if (req.method === 'GET') {
    const text = req.query.text || 'Уведомление';
    const data = await sendMessage(text);
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const update = req.body;

    if (update.message && update.message.text === '/start') {
      const keyboard = {
        inline_keyboard: [
          [{ text: 'Статус', callback_data: 'status' }],
          [{ text: 'Тест команда', callback_data: 'test_command' }],
          [{ text: 'Последнее событие', callback_data: 'last_event' }]
        ]
      };

      const data = await sendMessage('Панель управления', keyboard);
      return res.status(200).json(data);
    }

    if (update.callback_query) {
      const action = update.callback_query.data;

      if (action === 'status') {
        await sendMessage('Статус: работает');
      }

      if (action === 'test_command') {
        await sendMessage('Тест команда принята');
      }

      if (action === 'last_event') {
        await sendMessage('Последнее событие: пока нет данных');
      }

      return res.status(200).json({ ok: true });
    }

    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ ok: false });
}