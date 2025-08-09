import { NextRequest, NextResponse } from 'next/server';
import { verifyProject } from '@/lib/openai';
import { updateProjectStatus } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Starting project verification...');
    
    const { projectId, title, description, projectType, googleDriveLink, gumroadLink, deadline } = await request.json();

    console.log('📋 Verification request data:', {
      projectId,
      title,
      projectType,
      hasDescription: !!description,
      hasDriveLink: !!googleDriveLink,
      hasGumroadLink: !!gumroadLink,
      deadline,
    });

    if (!projectId || !title || !description || !projectType || (!googleDriveLink && !gumroadLink)) {
      console.error('❌ Missing required fields:', { projectId, title, description, projectType, googleDriveLink, gumroadLink });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check OpenAI configuration
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY not configured');
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    console.log('🤖 Calling OpenAI verification...');
    
    // Call OpenAI to verify the project
    const { result, error } = await verifyProject(title, description, projectType, googleDriveLink, gumroadLink, deadline);

    if (error) {
      console.error('❌ OpenAI verification failed:', error);
      return NextResponse.json({ error }, { status: 500 });
    }

    if (!result) {
      console.error('❌ No verification result from OpenAI');
      return NextResponse.json({ error: 'No verification result' }, { status: 500 });
    }

    console.log('✅ OpenAI verification result:', result);

    // If project is approved, update status FIRST, then trigger Gumroad publishing
    if (result.approved) {
      console.log('📝 Updating project status to approved FIRST...');
      const updateError = await updateProjectStatus(
        projectId,
        'approved',
        result.reason
      );

      if (updateError.error) {
        console.error('❌ Failed to update project status:', updateError.error);
        return NextResponse.json({ error: updateError.error }, { status: 500 });
      }
      
      console.log('🚀 Project approved, triggering Gumroad publishing...');
      try {
        const publishResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/gumroad/publish`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId }),
        });
        
        if (publishResponse.ok) {
          const publishResult = await publishResponse.json();
          console.log('✅ Gumroad publishing successful:', publishResult.message);
          
          // Update project with Gumroad URL
          if (publishResult.gumroadLink) {
            console.log('📝 Updating project with Gumroad URL...');
            const urlUpdateError = await updateProjectStatus(
              projectId,
              'approved',
              undefined,
              publishResult.gumroadLink
            );

            if (urlUpdateError.error) {
              console.error('❌ Failed to update project with Gumroad URL:', urlUpdateError.error);
            }
          }
          
          console.log('✅ Project verification completed successfully');
          return NextResponse.json({
            success: true,
            approved: result.approved,
            reason: result.reason,
            gumroadUrl: publishResult.gumroadLink,
          });
        } else {
          console.error('❌ Gumroad publishing failed');
          return NextResponse.json({ 
            error: 'Gumroad automation failed',
            approved: false,
            reason: 'Failed to create Gumroad product'
          }, { status: 500 });
        }
      } catch (publishError) {
        console.error('❌ Gumroad publishing error:', publishError);
        return NextResponse.json({ 
          error: 'Gumroad automation error',
          approved: false,
          reason: 'Gumroad automation failed'
        }, { status: 500 });
      }
    } else {
      // Project rejected by AI - save rejection status
      console.log('📝 Updating project status in Firestore...');
      const updateError = await updateProjectStatus(
        projectId,
        'rejected',
        result.reason
      );

      if (updateError.error) {
        console.error('❌ Failed to update project status:', updateError.error);
        return NextResponse.json({ error: updateError.error }, { status: 500 });
      }
      
      console.log('✅ Project verification completed successfully');
      return NextResponse.json({
        success: true,
        approved: result.approved,
        reason: result.reason,
      });
    }
  } catch (error) {
    console.error('❌ Verification API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}