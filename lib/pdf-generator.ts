import PDFDocument from 'pdfkit'

export interface PersonalityData {
  personalityType: string
  name?: string
  scores: Record<string, number>
  completedAt: Date
}

const personalityDescriptions: Record<string, { name: string; description: string; strengths: string[]; careers: string[] }> = {
  INTJ: {
    name: 'The Architect',
    description: 'Imaginative and strategic thinkers, with a plan for everything. INTJs are analytical problem-solvers, eager to improve systems and processes with their innovative ideas.',
    strengths: ['Strategic thinking', 'Independent', 'Determined', 'Innovative', 'High standards'],
    careers: ['Software Architect', 'Data Scientist', 'Strategic Planner', 'Engineer', 'Research Scientist']
  },
  INTP: {
    name: 'The Thinker',
    description: 'Innovative inventors with an unquenchable thirst for knowledge. INTPs are philosophical innovators, fascinated by logical analysis, systems, and design.',
    strengths: ['Analytical', 'Original', 'Open-minded', 'Curious', 'Objective'],
    careers: ['Software Developer', 'Mathematician', 'Philosopher', 'Researcher', 'Systems Analyst']
  },
  ENTJ: {
    name: 'The Commander',
    description: 'Bold, imaginative and strong-willed leaders, always finding a way or making one. ENTJs are strategic leaders, motivated to organize change.',
    strengths: ['Efficient', 'Energetic', 'Self-confident', 'Strategic', 'Strong-willed'],
    careers: ['CEO', 'Business Manager', 'Entrepreneur', 'Consultant', 'Executive']
  },
  ENTP: {
    name: 'The Debater',
    description: 'Smart and curious thinkers who cannot resist an intellectual challenge. ENTPs are inspired innovators, motivated to find new solutions.',
    strengths: ['Innovative', 'Enthusiastic', 'Strategic', 'Charismatic', 'Knowledgeable'],
    careers: ['Entrepreneur', 'Inventor', 'Lawyer', 'Marketing Professional', 'Consultant']
  },
  INFJ: {
    name: 'The Advocate',
    description: 'Quiet and mystical, yet very inspiring and tireless idealists. INFJs are creative nurturers with a strong sense of personal integrity.',
    strengths: ['Insightful', 'Principled', 'Passionate', 'Altruistic', 'Creative'],
    careers: ['Counselor', 'Psychologist', 'Writer', 'Teacher', 'Social Worker']
  },
  INFP: {
    name: 'The Mediator',
    description: 'Poetic, kind and altruistic people, always eager to help a good cause. INFPs are imaginative idealists, guided by their own core values.',
    strengths: ['Idealistic', 'Loyal', 'Empathetic', 'Open-minded', 'Creative'],
    careers: ['Writer', 'Graphic Designer', 'Counselor', 'Librarian', 'Psychologist']
  },
  ENFJ: {
    name: 'The Protagonist',
    description: 'Charismatic and inspiring leaders, able to mesmerize their listeners. ENFJs are idealist organizers, driven to implement their vision.',
    strengths: ['Charismatic', 'Altruistic', 'Natural leaders', 'Reliable', 'Tolerant'],
    careers: ['Teacher', 'Life Coach', 'HR Manager', 'Politician', 'Counselor']
  },
  ENFP: {
    name: 'The Campaigner',
    description: 'Enthusiastic, creative and sociable free spirits, who can always find a reason to smile. ENFPs are people-centered creators with a focus on possibilities.',
    strengths: ['Enthusiastic', 'Creative', 'Sociable', 'Optimistic', 'Energetic'],
    careers: ['Marketing Professional', 'Actor', 'Teacher', 'Journalist', 'Event Planner']
  },
  ISTJ: {
    name: 'The Logistician',
    description: 'Practical and fact-minded individuals, whose reliability cannot be doubted. ISTJs are responsible organizers, driven to create order.',
    strengths: ['Honest', 'Direct', 'Reliable', 'Practical', 'Organized'],
    careers: ['Accountant', 'Project Manager', 'Business Analyst', 'Auditor', 'Administrator']
  },
  ISFJ: {
    name: 'The Defender',
    description: 'Very dedicated and warm protectors, always ready to defend their loved ones. ISFJs are conscientious helpers, dedicated to their responsibilities.',
    strengths: ['Supportive', 'Reliable', 'Patient', 'Loyal', 'Hardworking'],
    careers: ['Nurse', 'Teacher', 'Administrator', 'Social Worker', 'Customer Service']
  },
  ESTJ: {
    name: 'The Executive',
    description: 'Excellent administrators, unsurpassed at managing things or people. ESTJs are hardworking traditionalists, eager to take charge.',
    strengths: ['Dedicated', 'Direct', 'Strong-willed', 'Honest', 'Loyal'],
    careers: ['Manager', 'Judge', 'Police Officer', 'Military Officer', 'Business Executive']
  },
  ESFJ: {
    name: 'The Consul',
    description: 'Extraordinarily caring, social and popular people, always eager to help. ESFJs are conscientious helpers, sensitive to the needs of others.',
    strengths: ['Loyal', 'Warm', 'Organized', 'Dutiful', 'Practical'],
    careers: ['Event Coordinator', 'Teacher', 'Nurse', 'HR Manager', 'Social Worker']
  },
  ISTP: {
    name: 'The Virtuoso',
    description: 'Bold and practical experimenters, masters of all kinds of tools. ISTPs are observant artisans with a natural understanding of mechanics.',
    strengths: ['Practical', 'Optimistic', 'Spontaneous', 'Rational', 'Energetic'],
    careers: ['Mechanic', 'Engineer', 'Pilot', 'Forensic Scientist', 'Athlete']
  },
  ISFP: {
    name: 'The Adventurer',
    description: 'Flexible and charming artists, always ready to explore and experience something new. ISFPs are gentle caretakers who live in the present.',
    strengths: ['Charming', 'Sensitive', 'Imaginative', 'Passionate', 'Curious'],
    careers: ['Artist', 'Designer', 'Musician', 'Chef', 'Veterinarian']
  },
  ESTP: {
    name: 'The Entrepreneur',
    description: 'Smart, energetic and very perceptive people, who truly enjoy living on the edge. ESTPs are energetic thrillseekers, living in the moment.',
    strengths: ['Bold', 'Rational', 'Direct', 'Sociable', 'Perceptive'],
    careers: ['Entrepreneur', 'Sales Representative', 'Marketing Professional', 'Paramedic', 'Detective']
  },
  ESFP: {
    name: 'The Entertainer',
    description: 'Spontaneous, energetic and enthusiastic people – life is never boring around them. ESFPs are vivacious entertainers who charm everyone.',
    strengths: ['Bold', 'Original', 'Practical', 'Observant', 'Excellent people skills'],
    careers: ['Entertainer', 'Event Planner', 'Sales Representative', 'Fashion Designer', 'Flight Attendant']
  }
}

export function generatePDF(data: PersonalityData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 })
      const chunks: Buffer[] = []

      doc.on('data', (chunk) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      const personality = personalityDescriptions[data.personalityType]

      // Header
      doc.fontSize(28).fillColor('#2563eb').text('Personality Assessment Report', { align: 'center' })
      doc.moveDown(0.5)
      doc.fontSize(12).fillColor('#6b7280').text(new Date(data.completedAt).toLocaleDateString(), { align: 'center' })

      if (data.name) {
        doc.text(`Prepared for: ${data.name}`, { align: 'center' })
      }

      doc.moveDown(2)

      // Personality Type
      doc.fontSize(40).fillColor('#2563eb').text(data.personalityType, { align: 'center' })
      doc.moveDown(0.3)
      doc.fontSize(20).fillColor('#374151').text(personality.name, { align: 'center' })
      doc.moveDown(1.5)

      // Description
      doc.fontSize(14).fillColor('#4b5563').text(personality.description, { align: 'justify' })
      doc.moveDown(2)

      // Dimension Scores
      doc.fontSize(18).fillColor('#1f2937').text('Your Dimension Scores')
      doc.moveDown(0.5)

      const dimensions = [
        { label: 'Extraversion (E) vs Introversion (I)', e: data.scores.E || 0, i: data.scores.I || 0 },
        { label: 'Sensing (S) vs Intuition (N)', e: data.scores.S || 0, i: data.scores.N || 0 },
        { label: 'Thinking (T) vs Feeling (F)', e: data.scores.T || 0, i: data.scores.F || 0 },
        { label: 'Judging (J) vs Perceiving (P)', e: data.scores.J || 0, i: data.scores.P || 0 }
      ]

      dimensions.forEach(dim => {
        const total = dim.e + dim.i
        const percentage = total > 0 ? Math.round((dim.e / total) * 100) : 50

        doc.fontSize(12).fillColor('#374151').text(dim.label)
        doc.moveDown(0.2)

        // Draw progress bar
        const barWidth = 400
        const barHeight = 20
        const currentY = doc.y

        // Background bar
        doc.rect(doc.x, currentY, barWidth, barHeight).fillAndStroke('#e5e7eb', '#d1d5db')

        // Filled bar
        doc.rect(doc.x, currentY, (barWidth * percentage) / 100, barHeight).fillAndStroke('#2563eb', '#2563eb')

        // Percentage text
        doc.fillColor('#1f2937').fontSize(10).text(`${percentage}%`, doc.x + barWidth + 10, currentY + 5)

        doc.moveDown(2)
      })

      doc.moveDown(1)

      // Strengths
      doc.addPage()
      doc.fontSize(18).fillColor('#1f2937').text('Key Strengths')
      doc.moveDown(0.5)

      personality.strengths.forEach((strength, index) => {
        doc.fontSize(12).fillColor('#374151').text(`${index + 1}. ${strength}`)
        doc.moveDown(0.3)
      })

      doc.moveDown(2)

      // Career Paths
      doc.fontSize(18).fillColor('#1f2937').text('Recommended Career Paths')
      doc.moveDown(0.5)

      personality.careers.forEach((career, index) => {
        doc.fontSize(12).fillColor('#374151').text(`${index + 1}. ${career}`)
        doc.moveDown(0.3)
      })

      doc.moveDown(2)

      // Footer
      doc.fontSize(10).fillColor('#9ca3af').text(
        'This assessment is for educational and entertainment purposes only. It should not be used as a substitute for professional psychological evaluation.',
        { align: 'center' }
      )

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}
