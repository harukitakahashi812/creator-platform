import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, updateDoc, getDoc } from 'firebase/firestore'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { projectId } = await request.json()

    if (!projectId) {
      return NextResponse.json({ success: false, error: 'Project ID is required' }, { status: 400 })
    }

    // Get the project from Firestore
    const projectRef = doc(db, 'projects', projectId)
    const projectSnap = await getDoc(projectRef)

    if (!projectSnap.exists()) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
    }

    const project = projectSnap.data()

    // Check if project has files
    if (!project.hasFiles) {
      return NextResponse.json({ 
        success: false, 
        error: 'Project must have files uploaded before verification' 
      }, { status: 400 })
    }

    // AI verification prompt
    const verificationPrompt = `
    Please verify this project submission:
    
    Title: ${project.title}
    Description: ${project.description}
    Project Type: ${project.projectType}
    Price: $${project.price}
    ${project.deadline ? `Deadline: ${project.deadline}` : ''}
    ${project.googleDriveLink ? `Files: Google Drive link provided` : 'Files: Direct upload'}
    
    Please evaluate:
    1. Project completeness and quality
    2. Description clarity and detail
    3. Price appropriateness for the project type
    4. Deadline feasibility (if provided)
    5. Overall project viability
    
    Respond with:
    - APPROVED: if the project meets quality standards
    - REJECTED: if the project has significant issues
    - Brief reasoning for your decision
    
    Format: STATUS: [APPROVED/REJECTED] - [Reasoning]
    `

    // Call OpenAI for verification
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a project verification expert. Evaluate projects based on quality, completeness, and viability."
        },
        {
          role: "user",
          content: verificationPrompt
        }
      ],
      max_tokens: 300,
      temperature: 0.3,
    })

    const aiResponse = completion.choices[0]?.message?.content || ''
    
    // Parse AI response
    let status = 'pending'
    let rejectionReason = ''
    
    if (aiResponse.includes('APPROVED')) {
      status = 'approved'
    } else if (aiResponse.includes('REJECTED')) {
      status = 'rejected'
      rejectionReason = aiResponse.replace(/STATUS:\s*REJECTED\s*-\s*/i, '').trim()
    }

    // Update project status
    await updateDoc(projectRef, {
      status,
      rejectionReason: status === 'rejected' ? rejectionReason : '',
      verifiedAt: new Date(),
      aiVerificationResponse: aiResponse
    })

    return NextResponse.json({ 
      success: true, 
      status,
      rejectionReason,
      message: status === 'approved' 
        ? 'Project approved! You can now start earning through offers.' 
        : 'Project rejected. Please review and resubmit.'
    })

  } catch (error: any) {
    console.error('Project verification error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Verification failed' 
    }, { status: 500 })
  }
}
