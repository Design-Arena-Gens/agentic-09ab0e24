import { google, youtube_v3 } from 'googleapis';
import { Readable } from 'stream';
import type { SeoPackage } from './seo';

const CATEGORY_MAP: Record<string, string> = {
  tech: '28',
  vlog: '22',
  shorts: '24',
  gaming: '20',
  tutorial: '27'
};

type UploadOptions = {
  seo: SeoPackage;
  language: string;
  category: string;
  monetization: string;
  scheduleTime?: Date | null;
  mediaBody: Readable;
  mediaLength?: number;
};

type UploadResult = {
  youtubeId: string;
  youtubeUrl: string;
  scheduledPublishAt?: string | null;
};

function getOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  const refreshToken = process.env.YOUTUBE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !redirectUri || !refreshToken) {
    throw new Error('Missing Google API credentials in environment variables.');
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return oauth2Client;
}

function resolvePrivacyStatus(monetization: string, scheduleTime?: Date | null): youtube_v3.Schema$VideoStatus {
  const baseStatus: youtube_v3.Schema$VideoStatus = {
    selfDeclaredMadeForKids: monetization === 'disabled',
    privacyStatus: 'public',
    madeForKids: monetization === 'disabled'
  };

  if (scheduleTime) {
    baseStatus.privacyStatus = 'private';
    baseStatus.publishAt = scheduleTime.toISOString();
  } else if (monetization === 'limited') {
    baseStatus.privacyStatus = 'unlisted';
  }

  return baseStatus;
}

export async function uploadToYouTube(options: UploadOptions): Promise<UploadResult> {
  const oauth2Client = getOAuthClient();
  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  const { seo, language, category, monetization, scheduleTime, mediaBody, mediaLength } = options;

  const status = resolvePrivacyStatus(monetization, scheduleTime);
  const categoryId = CATEGORY_MAP[category] ?? CATEGORY_MAP.tech;

  const response = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title: seo.title,
        description: seo.description,
        tags: [...seo.tags, ...seo.hashtags],
        categoryId,
        defaultLanguage: language,
        defaultAudioLanguage: language
      },
      status
    },
    media: {
      body: mediaBody
    }
  });

  const video = response.data;
  const youtubeId = video.id;

  if (!youtubeId) {
    throw new Error('YouTube upload failed: missing video ID.');
  }

  return {
    youtubeId,
    youtubeUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
    scheduledPublishAt: status.publishAt ?? null
  };
}
