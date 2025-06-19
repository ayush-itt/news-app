import { NewsSourceType } from '@/database/entities/news-source.entity';

export const newsSourcesToAdd = [
  {
    name: 'NewsAPI',
    type: NewsSourceType.NEWSAPI,
    base_url: 'https://newsapi.org/v2',
    api_key_env: 'feaf9e95c14741249dfa2af46f26717a',
    is_active: true,
    last_fetch_at: null,
    last_error: null,
  },
  {
    name: 'The News API',
    type: NewsSourceType.THENEWSAPI,
    base_url: 'https://api.thenewsapi.com/v1',
    api_key_env: '',
    is_active: true,
    last_fetch_at: null,
    last_error: null,
  },
  {
    name: 'Firebase News Feed',
    type: NewsSourceType.FIREBASE,
    base_url: 'https://firebase.googleapis.com/v1',
    api_key_env: '',
    is_active: false,
    last_fetch_at: null,
    last_error: null,
  },
];
