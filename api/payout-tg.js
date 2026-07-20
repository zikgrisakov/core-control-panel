export default async function handler(request, response) {
    response.setHeader('Cache-Control', 'no-store');

    if (request.method !== 'GET') {
        return response.status(405).json({
            ok: false,
            error: 'Method not allowed'
        });
    }

    const text = String(request.query.text || '').trim();
    const key = String(request.query.key || '').trim();

    const botToken = process.env.TG_TOKEN;
    const chatId = process.env.TG_CHAT_ID;
    const relayKey = process.env.PAYOUT_RELAY_KEY;

    if (!relayKey || key !== relayKey) {
        return response.status(403).json({
            ok: false,
            error: 'Forbidden'
        });
    }

    if (!text) {
        return response.status(400).json({
            ok: false,
            error: 'Не указан текст сообщения'
        });
    }

    if (!botToken || !chatId) {
        return response.status(500).json({
            ok: false,
            error: 'TG_TOKEN или TG_CHAT_ID не настроены'
        });
    }

    try {
        const telegramResponse = await fetch(
            `https://api.telegram.org/bot${botToken}/sendMessage`,
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    chat_id: chatId,
                    text: '🖥 ПК-2 / ВЫПЛАТЫ\n\n' + text,
                    disable_web_page_preview: true
                })
            }
        );

        const telegramResult = await telegramResponse.json();

        if (
            !telegramResponse.ok ||
            telegramResult.ok !== true
        ) {
            return response.status(502).json({
                ok: false,
                error: 'Telegram error',
                telegram: telegramResult
            });
        }

        return response.status(200).json({
            ok: true,
            message: 'Telegram notification sent'
        });
    } catch (error) {
        return response.status(500).json({
            ok: false,
            error: String(error)
        });
    }
}
