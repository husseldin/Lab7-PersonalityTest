import { PrismaClient, Dimension, Direction } from '@prisma/client'

const prisma = new PrismaClient()

const questions = [
  // Extraversion (E) vs Introversion (I) - 15 questions
  { text: "I feel energized after spending time with a large group of people", dimension: "EI", direction: "POSITIVE", weight: 1.0 },
  { text: "I prefer one-on-one conversations over group discussions", dimension: "EI", direction: "NEGATIVE", weight: 1.0 },
  { text: "I enjoy being the center of attention at social events", dimension: "EI", direction: "POSITIVE", weight: 1.0 },
  { text: "I need time alone to recharge after social interactions", dimension: "EI", direction: "NEGATIVE", weight: 1.0 },
  { text: "I easily strike up conversations with strangers", dimension: "EI", direction: "POSITIVE", weight: 1.0 },
  { text: "I prefer to think things through before speaking", dimension: "EI", direction: "NEGATIVE", weight: 1.0 },
  { text: "I enjoy being part of a large social network", dimension: "EI", direction: "POSITIVE", weight: 1.0 },
  { text: "I prefer activities I can do alone or with one close friend", dimension: "EI", direction: "NEGATIVE", weight: 1.0 },
  { text: "I feel comfortable in new social situations", dimension: "EI", direction: "POSITIVE", weight: 1.0 },
  { text: "I prefer written communication over verbal", dimension: "EI", direction: "NEGATIVE", weight: 1.0 },
  { text: "I like to share my thoughts and feelings openly", dimension: "EI", direction: "POSITIVE", weight: 1.0 },
  { text: "I keep my personal life private", dimension: "EI", direction: "NEGATIVE", weight: 1.0 },
  { text: "I enjoy meeting new people frequently", dimension: "EI", direction: "POSITIVE", weight: 1.0 },
  { text: "I have a small circle of close friends", dimension: "EI", direction: "NEGATIVE", weight: 1.0 },
  { text: "I think out loud and process ideas through discussion", dimension: "EI", direction: "POSITIVE", weight: 1.0 },

  // Sensing (S) vs Intuition (N) - 15 questions
  { text: "I focus on concrete facts and details", dimension: "SN", direction: "POSITIVE", weight: 1.0 },
  { text: "I enjoy exploring abstract ideas and theories", dimension: "SN", direction: "NEGATIVE", weight: 1.0 },
  { text: "I prefer proven methods over experimental approaches", dimension: "SN", direction: "POSITIVE", weight: 1.0 },
  { text: "I am drawn to innovative and creative solutions", dimension: "SN", direction: "NEGATIVE", weight: 1.0 },
  { text: "I pay attention to what is actually happening around me", dimension: "SN", direction: "POSITIVE", weight: 1.0 },
  { text: "I often imagine future possibilities", dimension: "SN", direction: "NEGATIVE", weight: 1.0 },
  { text: "I trust direct experience and observation", dimension: "SN", direction: "POSITIVE", weight: 1.0 },
  { text: "I trust my intuition and gut feelings", dimension: "SN", direction: "NEGATIVE", weight: 1.0 },
  { text: "I prefer step-by-step instructions", dimension: "SN", direction: "POSITIVE", weight: 1.0 },
  { text: "I enjoy figuring things out on my own", dimension: "SN", direction: "NEGATIVE", weight: 1.0 },
  { text: "I focus on present realities", dimension: "SN", direction: "POSITIVE", weight: 1.0 },
  { text: "I think about future implications", dimension: "SN", direction: "NEGATIVE", weight: 1.0 },
  { text: "I value practical skills and common sense", dimension: "SN", direction: "POSITIVE", weight: 1.0 },
  { text: "I value imagination and creativity", dimension: "SN", direction: "NEGATIVE", weight: 1.0 },
  { text: "I like concrete examples over theoretical concepts", dimension: "SN", direction: "POSITIVE", weight: 1.0 },

  // Thinking (T) vs Feeling (F) - 15 questions
  { text: "I make decisions based on logical analysis", dimension: "TF", direction: "POSITIVE", weight: 1.0 },
  { text: "I make decisions based on personal values and feelings", dimension: "TF", direction: "NEGATIVE", weight: 1.0 },
  { text: "I value objective truth over harmony", dimension: "TF", direction: "POSITIVE", weight: 1.0 },
  { text: "I prioritize maintaining harmony in relationships", dimension: "TF", direction: "NEGATIVE", weight: 1.0 },
  { text: "I prefer to critique and analyze ideas", dimension: "TF", direction: "POSITIVE", weight: 1.0 },
  { text: "I am naturally empathetic and supportive", dimension: "TF", direction: "NEGATIVE", weight: 1.0 },
  { text: "I value competence and efficiency", dimension: "TF", direction: "POSITIVE", weight: 1.0 },
  { text: "I value compassion and understanding", dimension: "TF", direction: "NEGATIVE", weight: 1.0 },
  { text: "I give direct and honest feedback", dimension: "TF", direction: "POSITIVE", weight: 1.0 },
  { text: "I consider how my words will affect others' feelings", dimension: "TF", direction: "NEGATIVE", weight: 1.0 },
  { text: "I believe in justice and fairness above all", dimension: "TF", direction: "POSITIVE", weight: 1.0 },
  { text: "I believe in mercy and compassion", dimension: "TF", direction: "NEGATIVE", weight: 1.0 },
  { text: "I remain objective in emotionally charged situations", dimension: "TF", direction: "POSITIVE", weight: 1.0 },
  { text: "I am sensitive to others' emotional needs", dimension: "TF", direction: "NEGATIVE", weight: 1.0 },
  { text: "I value reason over sentiment", dimension: "TF", direction: "POSITIVE", weight: 1.0 },

  // Judging (J) vs Perceiving (P) - 15 questions
  { text: "I like to have a clear plan before starting a project", dimension: "JP", direction: "POSITIVE", weight: 1.0 },
  { text: "I prefer to keep my options open and be spontaneous", dimension: "JP", direction: "NEGATIVE", weight: 1.0 },
  { text: "I feel satisfied when I complete tasks ahead of schedule", dimension: "JP", direction: "POSITIVE", weight: 1.0 },
  { text: "I often work best under pressure close to deadlines", dimension: "JP", direction: "NEGATIVE", weight: 1.0 },
  { text: "I maintain an organized and tidy workspace", dimension: "JP", direction: "POSITIVE", weight: 1.0 },
  { text: "I don't mind a bit of clutter and disorganization", dimension: "JP", direction: "NEGATIVE", weight: 1.0 },
  { text: "I like to make decisions quickly and stick to them", dimension: "JP", direction: "POSITIVE", weight: 1.0 },
  { text: "I like to gather more information before deciding", dimension: "JP", direction: "NEGATIVE", weight: 1.0 },
  { text: "I follow schedules and to-do lists", dimension: "JP", direction: "POSITIVE", weight: 1.0 },
  { text: "I prefer to go with the flow and adapt as needed", dimension: "JP", direction: "NEGATIVE", weight: 1.0 },
  { text: "I value structure and predictability", dimension: "JP", direction: "POSITIVE", weight: 1.0 },
  { text: "I value flexibility and freedom", dimension: "JP", direction: "NEGATIVE", weight: 1.0 },
  { text: "I like to settle things and reach closure", dimension: "JP", direction: "POSITIVE", weight: 1.0 },
  { text: "I like to keep exploring possibilities", dimension: "JP", direction: "NEGATIVE", weight: 1.0 },
  { text: "I prepare thoroughly in advance", dimension: "JP", direction: "POSITIVE", weight: 1.0 },
]

async function main() {
  console.log('Starting seed...')

  // Create or update question version
  const version = await prisma.questionVersion.upsert({
    where: { versionName: 'v1' },
    update: {},
    create: {
      versionName: 'v1',
      description: 'Initial 60-question MBTI assessment',
      isActive: true,
    },
  })

  console.log(`Created question version: ${version.id}`)

  // Create questions
  let orderIndex = 1
  for (const q of questions) {
    await prisma.question.upsert({
      where: {
        versionId_orderIndex: {
          versionId: version.id,
          orderIndex,
        },
      },
      update: {},
      create: {
        versionId: version.id,
        orderIndex,
        text: q.text,
        dimension: q.dimension as Dimension,
        direction: q.direction as Direction,
        weight: q.weight,
      },
    })
    orderIndex++
  }

  console.log(`Created ${questions.length} questions`)
  console.log('Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
