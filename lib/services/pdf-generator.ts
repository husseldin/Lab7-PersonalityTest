import PDFDocument from 'pdfkit'
import { Readable } from 'stream'

interface TestResults {
  personalityType: string
  scores: {
    EI: { E: number; I: number }
    SN: { S: number; N: number }
    TF: { T: number; F: number }
    JP: { J: number; P: number }
  }
}

interface UserInfo {
  fullName: string
  email: string
}

interface PdfOptions {
  isPremium: boolean
  completedAt: Date
}

// MBTI Type descriptions
const typeDescriptions: Record<string, { title: string; description: string }> = {
  INTJ: {
    title: 'The Architect',
    description: 'Strategic, analytical, and independent thinkers who value knowledge and competence.'
  },
  INTP: {
    title: 'The Logician',
    description: 'Innovative and curious thinkers who love exploring theoretical and abstract concepts.'
  },
  ENTJ: {
    title: 'The Commander',
    description: 'Bold, strategic leaders who excel at organizing people and resources to achieve goals.'
  },
  ENTP: {
    title: 'The Debater',
    description: 'Quick-witted and clever people who love intellectual challenges and debates.'
  },
  INFJ: {
    title: 'The Advocate',
    description: 'Idealistic and principled individuals who seek meaning and connection in relationships.'
  },
  INFP: {
    title: 'The Mediator',
    description: 'Empathetic and creative individuals who are guided by their values and ideals.'
  },
  ENFJ: {
    title: 'The Protagonist',
    description: 'Charismatic and inspiring leaders who are passionate about helping others grow.'
  },
  ENFP: {
    title: 'The Campaigner',
    description: 'Enthusiastic and creative free spirits who value possibilities and connections.'
  },
  ISTJ: {
    title: 'The Logistician',
    description: 'Practical and fact-minded individuals who value order, structure, and tradition.'
  },
  ISFJ: {
    title: 'The Defender',
    description: 'Dedicated and warm protectors who are committed to supporting and caring for others.'
  },
  ESTJ: {
    title: 'The Executive',
    description: 'Organized and results-oriented leaders who excel at managing and directing.'
  },
  ESFJ: {
    title: 'The Consul',
    description: 'Caring and social individuals who thrive on helping others and creating harmony.'
  },
  ISTP: {
    title: 'The Virtuoso',
    description: 'Bold and practical experimenters who are skilled at understanding how things work.'
  },
  ISFP: {
    title: 'The Adventurer',
    description: 'Flexible and charming artists who are always ready to explore new experiences.'
  },
  ESTP: {
    title: 'The Entrepreneur',
    description: 'Energetic and perceptive individuals who live in the moment and love taking action.'
  },
  ESFP: {
    title: 'The Entertainer',
    description: 'Spontaneous and enthusiastic performers who love life and entertaining others.'
  }
}

// Premium content: Career recommendations
const careerRecommendations: Record<string, string[]> = {
  INTJ: ['Scientist', 'Engineer', 'Architect', 'Strategic Planner', 'Systems Analyst'],
  INTP: ['Software Developer', 'Research Scientist', 'Mathematician', 'Philosopher', 'Analyst'],
  ENTJ: ['CEO', 'Executive', 'Business Consultant', 'Lawyer', 'Project Manager'],
  ENTP: ['Entrepreneur', 'Innovation Consultant', 'Marketing Strategist', 'Inventor'],
  INFJ: ['Counselor', 'Psychologist', 'Writer', 'Human Resources', 'Social Worker'],
  INFP: ['Writer', 'Artist', 'Therapist', 'Designer', 'Non-profit Worker'],
  ENFJ: ['Teacher', 'HR Manager', 'Coach', 'Sales Manager', 'Public Relations'],
  ENFP: ['Journalist', 'Consultant', 'Event Planner', 'Marketing', 'Recruiter'],
  ISTJ: ['Accountant', 'Administrator', 'Military Officer', 'Auditor', 'Project Manager'],
  ISFJ: ['Nurse', 'Teacher', 'Librarian', 'Social Worker', 'Administrative Assistant'],
  ESTJ: ['Manager', 'Police Officer', 'Judge', 'Financial Officer', 'Coach'],
  ESFJ: ['Healthcare Administrator', 'Teacher', 'Sales Representative', 'Event Coordinator'],
  ISTP: ['Mechanic', 'Engineer', 'Pilot', 'Craftsperson', 'Forensic Scientist'],
  ISFP: ['Artist', 'Designer', 'Musician', 'Chef', 'Veterinarian'],
  ESTP: ['Sales', 'Paramedic', 'Entrepreneur', 'Real Estate Agent', 'Athletic Trainer'],
  ESFP: ['Performer', 'Event Planner', 'Teacher', 'Sales', 'Tourism Professional']
}

export async function generatePDF(
  results: TestResults,
  userInfo: UserInfo,
  options: PdfOptions
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      })

      const chunks: Buffer[] = []
      doc.on('data', (chunk) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      // Header
      doc.fontSize(24)
        .fillColor('#0369a1')
        .text('Personality Test Results', { align: 'center' })
        .moveDown(0.5)

      doc.fontSize(12)
        .fillColor('#666666')
        .text(`${userInfo.fullName} (${userInfo.email})`, { align: 'center' })
        .text(`Completed: ${options.completedAt.toLocaleDateString()}`, { align: 'center' })
        .moveDown(1.5)

      // Personality Type
      const typeInfo = typeDescriptions[results.personalityType] || {
        title: 'Unknown Type',
        description: 'No description available'
      }

      doc.fontSize(20)
        .fillColor('#0284c7')
        .text(`Your Personality Type: ${results.personalityType}`, { align: 'center' })
        .moveDown(0.3)

      doc.fontSize(16)
        .fillColor('#0369a1')
        .text(typeInfo.title, { align: 'center' })
        .moveDown(0.5)

      doc.fontSize(11)
        .fillColor('#333333')
        .text(typeInfo.description, { align: 'justify' })
        .moveDown(1.5)

      // Dimension Scores
      doc.fontSize(16)
        .fillColor('#0369a1')
        .text('Your Dimension Scores', { underline: true })
        .moveDown(0.5)

      const dimensions = [
        { name: 'Extraversion (E) vs Introversion (I)', scores: results.scores.EI },
        { name: 'Sensing (S) vs Intuition (N)', scores: results.scores.SN },
        { name: 'Thinking (T) vs Feeling (F)', scores: results.scores.TF },
        { name: 'Judging (J) vs Perceiving (P)', scores: results.scores.JP }
      ]

      doc.fontSize(11).fillColor('#333333')
      dimensions.forEach(dim => {
        const keys = Object.keys(dim.scores) as [string, string]
        const values = Object.values(dim.scores) as [number, number]

        doc.text(dim.name, { continued: false })
          .fontSize(10)
          .fillColor('#666666')
          .text(`  ${keys[0]}: ${values[0]}  |  ${keys[1]}: ${values[1]}`, { indent: 20 })
          .moveDown(0.3)
          .fontSize(11)
          .fillColor('#333333')
      })

      doc.moveDown(1)

      if (options.isPremium) {
        // Premium content
        doc.addPage()

        // Career Recommendations
        doc.fontSize(18)
          .fillColor('#0369a1')
          .text('Career Recommendations', { underline: true })
          .moveDown(0.5)

        const careers = careerRecommendations[results.personalityType] || []

        doc.fontSize(11)
          .fillColor('#333333')
          .text('Based on your personality type, you may excel in the following careers:')
          .moveDown(0.5)

        careers.forEach(career => {
          doc.fontSize(10)
            .fillColor('#0284c7')
            .text(`• ${career}`, { indent: 20 })
        })

        doc.moveDown(1.5)

        // Growth Insights
        doc.fontSize(18)
          .fillColor('#0369a1')
          .text('Personal Growth Insights', { underline: true })
          .moveDown(0.5)

        doc.fontSize(11)
          .fillColor('#333333')
          .text('Areas for Development:', { underline: true })
          .moveDown(0.3)

        // Identify weaker dimensions for growth suggestions
        const weakerDimensions = []
        if (results.scores.EI.E < results.scores.EI.I && results.scores.EI.I < 5) {
          weakerDimensions.push('Consider practicing more social interactions to balance your introverted tendencies.')
        }
        if (results.scores.EI.I < results.scores.EI.E && results.scores.EI.E < 5) {
          weakerDimensions.push('Practice taking time for self-reflection and recharging alone.')
        }
        if (results.scores.TF.F < results.scores.TF.T) {
          weakerDimensions.push('Work on developing empathy and considering emotional perspectives in decision-making.')
        }
        if (results.scores.TF.T < results.scores.TF.F) {
          weakerDimensions.push('Practice objective analysis and logical reasoning in complex situations.')
        }

        if (weakerDimensions.length > 0) {
          weakerDimensions.forEach(insight => {
            doc.fontSize(10)
              .text(`• ${insight}`, { indent: 20, align: 'justify' })
              .moveDown(0.2)
          })
        } else {
          doc.fontSize(10)
            .text('Your personality shows balanced development across all dimensions.', { indent: 20 })
        }

      } else {
        // Free version - Upgrade prompt
        doc.moveDown(2)
        doc.rect(doc.x - 10, doc.y, doc.page.width - 100, 80)
          .fillAndStroke('#f0f9ff', '#0ea5e9')

        doc.fontSize(14)
          .fillColor('#0369a1')
          .text('Unlock Your Full Report', doc.x, doc.y + 15, { align: 'center' })
          .moveDown(0.3)

        doc.fontSize(10)
          .fillColor('#075985')
          .text('Get career recommendations, growth insights, and detailed analysis', { align: 'center' })
          .text('for only $9.90', { align: 'center' })
      }

      // Footer
      doc.fontSize(8)
        .fillColor('#999999')
        .text(
          `Generated by Personality Test Platform | ${new Date().toLocaleDateString()}`,
          50,
          doc.page.height - 50,
          { align: 'center' }
        )

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}
