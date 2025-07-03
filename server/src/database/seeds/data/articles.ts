import { Article } from '../../entities/article.entity';

// Type for seeding data - based on Article entity but with categoryIds for easier seeding
export type ArticleSeedData = Omit<Partial<Article>, 'categories'> & {
  categoryIds: number[];
};

export const articlesData: ArticleSeedData[] = [
  {
    title: 'AI Revolution: How Machine Learning is Transforming Healthcare',
    content:
      'Artificial intelligence and machine learning technologies are revolutionizing the healthcare industry. From diagnostic imaging to personalized treatment plans, AI is helping doctors make more accurate diagnoses and improving patient outcomes. Recent breakthroughs in deep learning have enabled computers to detect diseases earlier than ever before, potentially saving millions of lives worldwide.',
    author: 'Dr. Sarah Johnson',
    source: 'TechHealth Today',
    originalUrl: 'https://techhealthtoday.com/ai-healthcare-revolution',
    publishedAt: new Date('2024-01-15T08:30:00Z'),
    categoryIds: [2, 5], // Technology, Health
  },
  {
    title: 'Climate Change Summit: World Leaders Agree on New Carbon Targets',
    content:
      'At the latest international climate summit, world leaders have reached a consensus on ambitious new carbon reduction targets. The agreement aims to limit global warming to 1.5 degrees Celsius by implementing renewable energy initiatives and reducing fossil fuel dependency. Environmental scientists are calling this a historic moment in the fight against climate change.',
    author: 'Michael Chen',
    source: 'Global News Network',
    originalUrl: 'https://globalnews.com/climate-summit-agreement',
    publishedAt: new Date('2024-01-14T14:20:00Z'),
    categoryIds: [10, 8], // Environment, Politics
  },
  {
    title: 'Stock Market Soars as Tech Giants Report Record Profits',
    content:
      'Major technology companies have reported unprecedented quarterly profits, driving stock markets to new highs. Companies like Apple, Microsoft, and Google have exceeded analyst expectations, with strong performance in cloud computing and artificial intelligence sectors. Investors are optimistic about the continued growth in the tech industry.',
    author: 'Jennifer Williams',
    source: 'Financial Times Plus',
    originalUrl: 'https://financialtimes.com/tech-profits-surge',
    publishedAt: new Date('2024-01-13T10:45:00Z'),
    categoryIds: [3, 2], // Business, Technology
  },
  {
    title: 'Olympic Champion Announces Retirement After Stellar Career',
    content:
      "Olympic gold medalist Maria Rodriguez has announced her retirement from professional athletics after a remarkable 15-year career. The sprinter won multiple gold medals and set several world records during her time as one of the world's fastest athletes. She plans to focus on coaching young athletes and sports commentary.",
    author: 'David Thompson',
    source: 'Sports Central',
    originalUrl: 'https://sportscentral.com/rodriguez-retirement',
    publishedAt: new Date('2024-01-12T16:15:00Z'),
    categoryIds: [4], // Sports
  },
  {
    title: 'New Breakthrough in Quantum Computing Promises Faster Calculations',
    content:
      'Researchers at leading universities have achieved a significant breakthrough in quantum computing, developing a new algorithm that could solve complex problems exponentially faster than traditional computers. This advancement could revolutionize fields such as cryptography, drug discovery, and weather prediction.',
    author: 'Dr. Robert Kim',
    source: 'Science Daily',
    originalUrl: 'https://sciencedaily.com/quantum-breakthrough',
    publishedAt: new Date('2024-01-11T09:00:00Z'),
    categoryIds: [7, 2], // Science, Technology
  },
  {
    title: 'Hollywood Blockbuster Breaks Box Office Records Worldwide',
    content:
      'The latest superhero movie has shattered global box office records, earning over $500 million in its opening weekend. The film features cutting-edge visual effects and an all-star cast, drawing massive audiences across multiple continents. Industry experts predict it will become one of the highest-grossing films of all time.',
    author: 'Lisa Anderson',
    source: 'Entertainment Weekly',
    originalUrl: 'https://entertainmentweekly.com/blockbuster-records',
    publishedAt: new Date('2024-01-10T20:30:00Z'),
    categoryIds: [6], // Entertainment
  },
  {
    title: 'Space Mission Successfully Lands on Mars, Begins Sample Collection',
    content:
      'A groundbreaking space mission has successfully landed on Mars and begun collecting soil samples for eventual return to Earth. The robotic rover is equipped with advanced scientific instruments to analyze the Martian surface and search for signs of ancient life. This mission represents a major milestone in space exploration.',
    author: 'Captain Elena Vasquez',
    source: 'Space Exploration News',
    originalUrl: 'https://spaceexploration.com/mars-landing-success',
    publishedAt: new Date('2024-01-09T12:00:00Z'),
    categoryIds: [7, 2], // Science, Technology
  },
  {
    title: 'New Mental Health Initiative Launches to Support Remote Workers',
    content:
      'A comprehensive mental health program has been launched to address the growing concerns about remote worker well-being. The initiative includes virtual therapy sessions, wellness workshops, and stress management resources. Mental health professionals emphasize the importance of maintaining psychological well-being in the digital workplace.',
    author: 'Dr. Amanda Foster',
    source: 'Health & Wellness Today',
    originalUrl: 'https://healthwellness.com/remote-worker-mental-health',
    publishedAt: new Date('2024-01-08T11:30:00Z'),
    categoryIds: [5, 3], // Health, Business
  },
  {
    title: 'International Trade Agreement Boosts Economic Cooperation',
    content:
      'Multiple countries have signed a landmark trade agreement aimed at reducing tariffs and promoting economic cooperation. The deal is expected to increase trade volume by 25% over the next five years and create millions of jobs worldwide. Economists view this as a positive step toward global economic recovery.',
    author: 'James Rodriguez',
    source: 'World Economic Report',
    originalUrl: 'https://worldeconomic.com/trade-agreement-signed',
    publishedAt: new Date('2024-01-07T13:45:00Z'),
    categoryIds: [3, 8, 9], // Business, Politics, World
  },
  {
    title: 'Revolutionary Electric Vehicle Battery Extends Range to 1000 Miles',
    content:
      'Engineers have developed a revolutionary battery technology that could extend electric vehicle range to over 1000 miles on a single charge. The new solid-state battery design promises faster charging times and improved safety compared to current lithium-ion batteries. This breakthrough could accelerate the adoption of electric vehicles globally.',
    author: 'Dr. Mark Peterson',
    source: 'Green Technology Review',
    originalUrl: 'https://greentechreview.com/ev-battery-breakthrough',
    publishedAt: new Date('2024-01-06T15:20:00Z'),
    categoryIds: [2, 10], // Technology, Environment
  },
  {
    title: 'Music Festival Features Rising Stars and Legendary Artists',
    content:
      'The annual summer music festival showcased an incredible lineup of both emerging artists and legendary performers. Over 100,000 attendees enjoyed three days of diverse musical performances ranging from rock and pop to electronic and indie genres. The festival also featured local food vendors and sustainable practices.',
    author: 'Rachel Martinez',
    source: 'Music Scene Magazine',
    originalUrl: 'https://musicscene.com/summer-festival-highlights',
    publishedAt: new Date('2024-01-05T18:00:00Z'),
    categoryIds: [6], // Entertainment
  },
  {
    title:
      'Cybersecurity Threats Rise as Companies Increase Digital Operations',
    content:
      'Cybersecurity experts warn of increasing threats as more companies transition to digital-first operations. Recent data breaches have highlighted vulnerabilities in cloud infrastructure and remote work systems. Organizations are investing heavily in advanced security measures and employee training to protect sensitive information.',
    author: 'Alex Thompson',
    source: 'Cyber Security Weekly',
    originalUrl: 'https://cybersecurityweekly.com/digital-threats-rise',
    publishedAt: new Date('2024-01-04T07:15:00Z'),
    categoryIds: [2, 3], // Technology, Business
  },
  {
    title: 'Archaeological Discovery Reveals Ancient Civilization in Amazon',
    content:
      'Archaeologists have uncovered evidence of a previously unknown ancient civilization deep in the Amazon rainforest. The discovery includes sophisticated urban planning, advanced agricultural systems, and intricate artwork. This finding challenges previous assumptions about pre-Columbian societies in South America.',
    author: 'Dr. Isabella Santos',
    source: 'Archaeological Today',
    originalUrl:
      'https://archaeologicaltoday.com/amazon-civilization-discovery',
    publishedAt: new Date('2024-01-03T14:30:00Z'),
    categoryIds: [7, 9], // Science, World
  },
  {
    title: 'Renewable Energy Surpasses Coal in Global Power Generation',
    content:
      'For the first time in history, renewable energy sources have surpassed coal in global electricity generation. Solar and wind power led the charge, with significant contributions from hydroelectric and geothermal sources. This milestone marks a crucial turning point in the transition to clean energy.',
    author: 'Green Energy Reporter',
    source: 'Renewable Energy Today',
    originalUrl: 'https://renewableenergytoday.com/renewables-surpass-coal',
    publishedAt: new Date('2024-01-02T10:00:00Z'),
    categoryIds: [10, 7], // Environment, Science
  },
  {
    title: 'Championship Game Delivers Thrilling Overtime Victory',
    content:
      "Last night's championship game delivered one of the most exciting finishes in sports history, with the home team securing victory in double overtime. The match featured spectacular plays, incredible athleticism, and a record-breaking crowd of over 80,000 spectators. Both teams displayed exceptional skill throughout the intense competition.",
    author: 'Sports Reporter Mike Johnson',
    source: 'Championship Sports Network',
    originalUrl: 'https://championshipsports.com/overtime-thriller',
    publishedAt: new Date('2024-01-01T22:45:00Z'),
    categoryIds: [4], // Sports
  },
  {
    title: 'Vaccine Development Shows Promise Against Multiple Diseases',
    content:
      'Medical researchers have developed a promising universal vaccine platform that could protect against multiple diseases simultaneously. Early trials show strong immune responses against various viral and bacterial infections. This breakthrough could revolutionize preventive medicine and global health initiatives.',
    author: 'Dr. Patricia Lee',
    source: 'Medical Advances Journal',
    originalUrl: 'https://medicaladvances.com/universal-vaccine-development',
    publishedAt: new Date('2023-12-31T16:20:00Z'),
    categoryIds: [5, 7], // Health, Science
  },
  {
    title:
      'Documentary Film Wins International Recognition for Environmental Message',
    content:
      'An independent documentary about ocean conservation has won multiple international awards for its powerful environmental message. The film follows marine biologists as they document the impact of climate change on coral reefs and marine ecosystems. Critics praise its stunning cinematography and urgent call to action.',
    author: 'Film Critic Jane Adams',
    source: 'Independent Cinema Review',
    originalUrl: 'https://indiecinema.com/environmental-documentary-wins',
    publishedAt: new Date('2023-12-30T19:10:00Z'),
    categoryIds: [6, 10], // Entertainment, Environment
  },
  {
    title: 'Startup Develops AI-Powered Educational Platform for Students',
    content:
      'A innovative startup has launched an AI-powered educational platform that personalizes learning experiences for students of all ages. The system adapts to individual learning styles and provides real-time feedback to optimize educational outcomes. Early adoption in schools shows significant improvements in student engagement and performance.',
    author: 'Education Technology Reporter',
    source: 'EdTech Innovation',
    originalUrl: 'https://edtechinnovation.com/ai-learning-platform',
    publishedAt: new Date('2023-12-29T08:45:00Z'),
    categoryIds: [2, 3], // Technology, Business
  },
  {
    title: 'International Summit Addresses Global Food Security Challenges',
    content:
      'World leaders and agricultural experts gathered at an international summit to address growing concerns about global food security. Discussions focused on sustainable farming practices, climate-resilient crops, and equitable food distribution systems. The summit resulted in new commitments to combat hunger and malnutrition worldwide.',
    author: 'Global Affairs Correspondent',
    source: 'World Politics Today',
    originalUrl: 'https://worldpolitics.com/food-security-summit',
    publishedAt: new Date('2023-12-28T12:30:00Z'),
    categoryIds: [8, 9, 10], // Politics, World, Environment
  },
  {
    title: 'Breakthrough Gene Therapy Treatment Approved for Rare Disease',
    content:
      'Regulatory authorities have approved a groundbreaking gene therapy treatment for a rare genetic disorder that affects children. The treatment has shown remarkable success in clinical trials, offering hope to families affected by this previously untreatable condition. This approval marks a significant milestone in personalized medicine.',
    author: 'Dr. Medical Research Writer',
    source: 'Gene Therapy News',
    originalUrl: 'https://genetherapynews.com/rare-disease-treatment-approved',
    publishedAt: new Date('2023-12-27T14:15:00Z'),
    categoryIds: [5, 7], // Health, Science
  },
];
