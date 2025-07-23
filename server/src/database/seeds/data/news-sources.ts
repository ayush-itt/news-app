import { NewsSourceType } from '@/database/entities/news-source.entity';

export const newsSourcesToAdd = [
  {
    name: 'NewsAPI',
    type: NewsSourceType.NEWSAPI,
    baseUrl: 'https://newsapi.org/v2',
    apiKeyEnv: 'feaf9e95c14741249dfa2af46f26717a',
    isActive: true,
    lastFetchAt: null,
    lastError: null,
  },
  {
    name: 'The News API',
    type: NewsSourceType.THENEWSAPI,
    baseUrl: 'https://api.thenewsapi.com/v1',
    apiKeyEnv: '',
    isActive: true,
    lastFetchAt: null,
    lastError: null,
  },
  {
    name: 'Firebase News Feed',
    type: NewsSourceType.FIREBASE,
    baseUrl: 'https://firebase.googleapis.com/v1',
    apiKeyEnv: '',
    isActive: false,
    lastFetchAt: null,
    lastError: null,
  },
];
