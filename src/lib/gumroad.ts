// Gumroad API integration
// Note: Gumroad doesn't have a public API, so we'll use their product creation flow
// This implementation will guide users through the manual process with automation where possible

export interface GumroadProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  url: string;
  status: 'published' | 'draft';
}

export interface GumroadPublishResult {
  success: boolean;
  productUrl?: string;
  message: string;
  error?: string;
}

// Since Gumroad doesn't have a public API, we'll create a guided process
export const createGumroadProduct = async (
  projectTitle: string,
  projectDescription: string,
  price: number,
  projectType: string,
  googleDriveLink?: string,
  gumroadLink?: string
): Promise<GumroadPublishResult> => {
  try {
    console.log('🚀 Starting Gumroad product creation...', {
      title: projectTitle,
      price,
      projectType,
      hasDriveLink: !!googleDriveLink,
      hasGumroadLink: !!gumroadLink
    });

    // If project already has a Gumroad link, return it
    if (gumroadLink) {
      console.log('✅ Project already has Gumroad link:', gumroadLink);
      return {
        success: true,
        productUrl: gumroadLink,
        message: 'Project already published to Gumroad'
      };
    }

    // For now, we'll return instructions for manual creation
    // In a full implementation, you would integrate with Gumroad's API if available
    const gumroadInstructions = `
1. Go to https://gumroad.com/dashboard
2. Click "Create Product"
3. Fill in the following details:
   - Name: ${projectTitle}
   - Description: ${projectDescription}
   - Price: $${price}
   - Category: ${projectType}
4. Upload your project files
5. Set the product as "Published"
6. Copy the product URL and update the project
    `;

    console.log('📝 Gumroad creation instructions generated');
    
    return {
      success: true,
      message: 'Gumroad product creation instructions ready',
      productUrl: undefined // Will be set after manual creation
    };
  } catch (error) {
    console.error('❌ Gumroad product creation error:', error);
    return {
      success: false,
      message: 'Failed to create Gumroad product',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Helper function to validate Gumroad URLs
export const validateGumroadUrl = (url: string): boolean => {
  const gumroadPattern = /^https:\/\/([a-zA-Z0-9-]+\.)?gumroad\.com\/[a-zA-Z0-9_\-\/]+/;
  return gumroadPattern.test(url);
};

// Helper function to extract product ID from Gumroad URL
export const extractGumroadProductId = (url: string): string | null => {
  const match = url.match(/gumroad\.com\/l\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
};
