// Supabase Edge Function: get-document-url
//
// Given a public share token + a document id, verifies the share link is
// active and the document belongs to that link's owner, then returns a
// signed URL valid for 60 seconds. Runs with the service role key, which
// never reaches the browser, so the "documents" storage bucket can stay
// private while still being downloadable from the public wallet page.
//
// Deploy with: supabase functions deploy get-document-url
// Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY as function secrets
// (Supabase sets SUPABASE_URL automatically; add the service role key with:
//   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-key)

import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { token, documentId } = await req.json()
    if (!token || !documentId) {
      return new Response(JSON.stringify({ error: 'Missing token or documentId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: link, error: linkError } = await supabase
      .from('share_links')
      .select('user_id, active')
      .eq('public_token', token)
      .eq('active', true)
      .single()

    if (linkError || !link) {
      return new Response(JSON.stringify({ error: 'Invalid or inactive share link' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: doc, error: docError } = await supabase
      .from('documents')
      .select('storage_path, user_id')
      .eq('id', documentId)
      .single()

    if (docError || !doc || doc.user_id !== link.user_id) {
      return new Response(JSON.stringify({ error: 'Document not found for this wallet' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: signed, error: signError } = await supabase.storage
      .from('documents')
      .createSignedUrl(doc.storage_path, 60)

    if (signError || !signed) {
      return new Response(JSON.stringify({ error: 'Could not sign URL' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ url: signed.signedUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
