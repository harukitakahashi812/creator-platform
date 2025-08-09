import { NextRequest, NextResponse } from 'next/server';
import { getProjectById, updateProjectStatus, getGumroadCredentials } from '@/lib/firebase';
import { createRealGumroadProduct, validateRealGumroadProduct } from '@/lib/gumroad-automation';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting Gumroad publishing process...');
    
    const { projectId } = await request.json();
    
    if (!projectId) {
      console.error('❌ Missing projectId');
      return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });
    }

    // Get project details from Firestore with retry for offline scenarios
    let project;
    let error;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await getProjectById(projectId);
        project = result.project;
        error = result.error;
        
        if (project && !error) {
          break; // Success, exit retry loop
        }
        
        if (attempt < maxRetries) {
          console.log(`⏳ Firestore read attempt ${attempt} failed, retrying in 1s...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (err) {
        error = err;
        if (attempt < maxRetries) {
          console.log(`⏳ Firestore read attempt ${attempt} threw error, retrying in 1s...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    if (error || !project) {
      console.error('❌ Project not found after retries:', error);
      return NextResponse.json({ 
        error: 'Project not found - Firestore may be offline. Please try again in a moment.' 
      }, { status: 404 });
    }

    if (project.status !== 'approved') {
      console.error('❌ Project not approved:', project.status);
      return NextResponse.json({ error: 'Project not approved for publishing' }, { status: 400 });
    }

    console.log('✅ Project found and approved:', {
      id: project.id,
      title: project.title,
      price: project.price,
      hasGumroadLink: !!project.gumroadLink
    });

    // If project already has a Gumroad link, it's already published
    if (project.gumroadLink) {
      console.log('✅ Project already has Gumroad link:', project.gumroadLink);
      return NextResponse.json({
        success: true,
        message: 'Project already published to Gumroad',
        gumroadLink: project.gumroadLink
      });
    }

    // Create REAL Gumroad product automatically
    console.log('🚀 Creating REAL Gumroad product automatically...');
    
    // Get Gumroad credentials for the project owner from Firestore with retry
    const ownerId = project.userId as string;
    let storedCreds;
    let credentials;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const { credentials: creds } = await getGumroadCredentials(ownerId);
        storedCreds = creds;
        credentials = storedCreds ? { email: storedCreds.email, password: storedCreds.password } : undefined;
        
        if (attempt === 1 || credentials) {
          break; // Success on first try, or we got credentials
        }
        
        if (attempt < maxRetries) {
          console.log(`⏳ Gumroad credentials read attempt ${attempt} failed, retrying in 1s...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (err) {
        console.log(`⏳ Gumroad credentials read attempt ${attempt} threw error:`, err);
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    const gumroadResult = await createRealGumroadProduct({
      name: project.title,
      description: project.description,
      price: project.price,
      category: project.projectType,
      fileUrl: project.googleDriveLink
    }, credentials);

    if (gumroadResult.success) {
      console.log('✅ Gumroad product creation successful:', gumroadResult.message);
      
      // If we have a product URL, update the project with retry
      if (gumroadResult.productUrl) {
        // Validate URL server-side to ensure it's real and accessible
        try {
          const isValid = await validateRealGumroadProduct(gumroadResult.productUrl);
          if (!isValid) {
            console.warn('⚠️ Captured Gumroad URL failed validation:', gumroadResult.productUrl);
            return NextResponse.json({
              success: false,
              message: 'Gumroad URL validation failed',
              error: 'Captured URL is not accessible'
            }, { status: 502 });
          }
        } catch (vErr) {
          console.warn('⚠️ Gumroad URL validation error:', vErr);
          return NextResponse.json({
            success: false,
            message: 'Gumroad URL validation error',
            error: 'Validation error'
          }, { status: 502 });
        }
        console.log('📝 Updating project with Gumroad link:', gumroadResult.productUrl);
        
        let updateSuccess = false;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            const updateResult = await updateProjectStatus(
              projectId,
              'approved',
              undefined,
              gumroadResult.productUrl
            );
            
            if (!updateResult.error) {
              console.log('✅ Project updated with Gumroad link successfully');
              updateSuccess = true;
              break;
            } else {
              console.warn(`⚠️ Failed to update project with Gumroad link (attempt ${attempt}):`, updateResult.error);
            }
            
            if (attempt < maxRetries) {
              console.log(`⏳ Retrying project update in 1s...`);
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          } catch (err) {
            console.warn(`⚠️ Project update attempt ${attempt} threw error:`, err);
            if (attempt < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        }
        
        if (!updateSuccess) {
          console.warn('⚠️ All attempts to update project with Gumroad link failed');
        }
      }
      
      return NextResponse.json({
        success: true,
        message: gumroadResult.message,
        gumroadLink: gumroadResult.productUrl,
        project: {
          id: project.id,
          title: project.title,
          description: project.description,
          price: project.price,
          projectType: project.projectType
        }
      });
    } else {
      console.error('❌ Gumroad product creation failed:', gumroadResult.error);
      return NextResponse.json({
        success: false,
        message: gumroadResult.message,
        error: gumroadResult.error
      }, { status: 500 });
    }
  } catch (error) {
    console.error('❌ Gumroad publishing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
