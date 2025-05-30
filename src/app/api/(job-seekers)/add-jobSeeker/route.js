// app/api/upload/route.ts
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { currentUser, User } from '@clerk/nextjs/server'
import { supabase } from '@/utils/supabase/supabaseClient'

export async function POST(request) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file')
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }
  const ext = file.name.split('.').pop()
  const fileName = `user-${user.id}/resume.${ext}`
  const { data, error } = await supabase.storage
    .from('resumes')
    .upload(fileName, file, { upsert: true })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  const { data: urlData } = supabase.storage
    .from('resumes')
    .getPublicUrl(data.path)

  return NextResponse.json({ url: urlData.publicUrl })
}
