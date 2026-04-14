import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_key';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      telegram_id,
      username,
      first_name,
      last_name,
      full_name,
      phone_number,
    } = data;

    if (!telegram_id || !full_name || !phone_number) {
      return Response.json(
        { error: 'Majburiy maydonlar: telegram_id, full_name, phone_number' },
        { status: 400 }
      );
    }

    // Insert or update user in telegram_users table
    const { error: upsertError, data: result } = await supabase
      .from('telegram_users')
      .upsert(
        [
          {
            telegram_id,
            username: username || null,
            full_name,
            phone_number,
            telegram_first_name: first_name || null,
            telegram_last_name: last_name || null,
            updated_at: new Date().toISOString(),
          },
        ],
        { onConflict: 'telegram_id' }
      )
      .select();

    if (upsertError) {
      console.error('[API] Supabase upsert error:', upsertError);
      return Response.json(
        { error: 'Ro\'yxatdan o\'tishda xatolik' },
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        message: 'Ro\'yxatdan o\'tdingiz',
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API] Error:', error);
    return Response.json(
      { error: 'Serverda xatolik' },
      { status: 500 }
    );
  }
}
