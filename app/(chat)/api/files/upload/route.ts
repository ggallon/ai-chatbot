import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

import { withAuth } from '@/lib/api/with-auth';
import { fileSchema } from '@/lib/db/validations/file';

export const POST = withAuth(async function POST(request) {
  if (request.body === null) {
    return NextResponse.json(
      { error: 'Request body is empty' },
      { status: 400 },
    );
  }

  try {
    const formData = await request.formData();
    const rawfile = formData.get('file') as File | null;
    if (!rawfile) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const validatedFile = await fileSchema.safeParseAsync({ file: rawfile });
    if (!validatedFile.success) {
      const errorMessage = validatedFile.error.errors
        .map((error) => error.message)
        .join(', ');

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    try {
      const { file } = validatedFile.data;
      const data = await put(
        `AIChat/${request.auth.user.id}/${file.name}`,
        file,
        {
          access: 'public',
        },
      );

      return NextResponse.json({ ...data, name: file.name });
    } catch (_error_) {
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
  } catch (_error_) {
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 },
    );
  }
});
