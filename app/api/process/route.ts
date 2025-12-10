import { NextResponse } from 'next/server';
import { Readable } from 'stream';
import { bufferToStream, webStreamToNode } from '@/lib/streams';
import { generateSeoPackage } from '@/lib/seo';
import { uploadSchema } from '@/lib/validation';
import { parseSchedule, formatReadable } from '@/lib/datetime';
import { uploadToYouTube } from '@/lib/youtube';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const category = String(formData.get('category') ?? 'tech');
    const language = String(formData.get('language') ?? 'en');
    const monetization = String(formData.get('monetization') ?? 'enabled');
    const scheduleRaw = formData.get('scheduleTime');

    const parseResult = uploadSchema.safeParse({
      category,
      language,
      monetization,
      scheduleTime: typeof scheduleRaw === 'string' ? scheduleRaw : undefined
    });

    if (!parseResult.success) {
      const message = parseResult.error.errors.map((issue) => issue.message).join(', ');
      return NextResponse.json({ success: false, message }, { status: 400 });
    }

    const scheduleTime = parseSchedule(parseResult.data.scheduleTime ?? null);

    const file = formData.get('videoFile');
    const url = formData.get('videoUrl');

    if (file && url) {
      return NextResponse.json(
        { success: false, message: 'Provide only one video source: upload OR URL.' },
        { status: 400 }
      );
    }

    if (!file && !url) {
      return NextResponse.json(
        { success: false, message: 'A video file or direct video URL is required.' },
        { status: 400 }
      );
    }

    let stream: Readable;
    let mediaLength: number | undefined;
    let sourceLabel: string;

    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      stream = bufferToStream(buffer);
      mediaLength = buffer.byteLength;
      sourceLabel = file.name;
    } else if (typeof url === 'string' && url) {
      const response = await fetch(url);
      if (!response.ok || !response.body) {
        return NextResponse.json(
          { success: false, message: 'Failed to fetch the video from the provided URL.' },
          { status: 400 }
        );
      }
      stream = await webStreamToNode(response.body);
      mediaLength = Number(response.headers.get('content-length') ?? undefined);
      sourceLabel = url;
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid video input.' },
        { status: 400 }
      );
    }

    const seo = generateSeoPackage({
      sourceLabel,
      category,
      language,
      monetization
    });

    const upload = await uploadToYouTube({
      seo,
      language,
      category,
      monetization,
      scheduleTime,
      mediaBody: stream,
      mediaLength
    });

    return NextResponse.json({
      success: true,
      summary: {
        title: seo.title,
        description: seo.description,
        tags: seo.tags,
        hashtags: seo.hashtags,
        thumbnailPrompt: seo.thumbnailPrompt,
        scheduledPublishAt: formatReadable(scheduleTime),
        youtubeId: upload.youtubeId,
        youtubeUrl: upload.youtubeUrl
      }
    });
  } catch (error) {
    console.error('Upload error', error);
    const message = error instanceof Error ? error.message : 'Unexpected server error.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
