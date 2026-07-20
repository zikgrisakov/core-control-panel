export default async function handler(request, response) {
    /*
     * Не кэшируем ответы, иначе Vercel иногда начинает
     * слишком творчески относиться к повторным запросам.
     */
    response.setHeader('Cache-Control', 'no-store, max-age=0');

    /*
     * Разрешаем проверять адрес из браузера.
     */
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (request.method === 'OPTIONS') {
        return response.status(204).end();
    }

    if (request.method !== 'GET') {
        return response.status(405).json({
            ok: false,
            error: 'Method not allowed'
        });
    }

    const text = String(
        request.query.text || ''
    ).trim();

    const providedKey = String(
        request.query.key || ''
    ).trim();

    /*
     * Переменные второго бота.
     * Старые TG_TOKEN и TG_CHAT_ID здесь не используются.
     */
    const botToken =
        process.env.PAYOUT_TG_TOKEN;

    const chatId =
        process.env.PAYOUT_TG_CHAT_ID;

    const relayKey =
        process.env.PAYOUT_RELAY_KEY;

    /*
     * Проверяем секретный ключ вызова.
     */
    if (
        !relayKey ||
        providedKey !== relayKey
    ) {
        return response.status(403).json({
            ok: false,
            error: 'Forbidden'
        });
    }

    if (!text) {
        return response.status(400).json({
            ok: false,
            error: 'Не указан параметр text'
        });
    }

    if (!botToken) {
        return response.status(500).json({
            ok: false,
            error:
                'Переменная PAYOUT_TG_TOKEN не настроена в Vercel'
        });
    }

    if (!chatId) {
        return response.status(500).json({
            ok: false,
            error:
                'Переменная PAYOUT_TG_CHAT_ID не настроена в Vercel'
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

                    text: [
                        '🖥 ПК-2 / ВЫПЛАТЫ',
                        '',
                        text
                    ].join('\n'),

                    disable_web_page_preview: true
                })
            }
        );

        let telegramResult;

        try {
            telegramResult =
                await telegramResponse.json();
        } catch (error) {
            return response.status(502).json({
                ok: false,
                error:
                    'Telegram вернул неправильный ответ',
                httpStatus:
                    telegramResponse.status
            });
        }

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
            message:
                'Telegram notification sent'
        });
    } catch (error) {
        return response.status(500).json({
            ok: false,
            error: String(error)
        });
    }
}
