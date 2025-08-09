import OpenAI from 'openai';

// Validate OpenAI configuration
if (!process.env.OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY. Please check your .env.local file.');
}

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

export interface VerificationResult {
  approved: boolean;
  reason: string;
  type: string;
}

export const verifyProject = async (
  title: string,
  description: string,
  projectType: string,
  googleDriveLink: string,
  gumroadLink: string,
  deadline?: string
): Promise<{ result: VerificationResult | null; error: string | null }> => {
  console.log('🤖 OpenAI verification started for:', { title, projectType });
  
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not configured');
    return { result: null, error: 'OpenAI API key not configured' };
  }

  if (!openai) {
    console.error('❌ OpenAI client not initialized');
    return { result: null, error: 'OpenAI not configured' };
  }
  
  try {
    const systemPrompt = `You are an AI assistant reviewing creative project submissions. You cannot access external links or files, but you can evaluate projects based on their metadata and descriptions.

Your job is to verify if the project submission appears to be:
- Complete and well-described (not a draft or placeholder)
- Of reasonable quality based on the description
- Professional and marketable
- Properly categorized
- Meeting any specified deadlines (if deadline is provided)

Evaluation criteria:
- Project title should be specific and descriptive
- Description should be detailed and professional
- Project type should match the description
- Overall impression should be of a completed, quality project
- If a deadline is provided, check if the current date is before or after the deadline

IMPORTANT: Respond ONLY with valid JSON in this exact format, no additional text or explanations:
{ "approved": true/false, "reason": "explanation", "type": "project_type" }`;

    let linksText = '';
    if (googleDriveLink) linksText += `Google Drive Link: ${googleDriveLink}\n`;
    if (gumroadLink) linksText += `Gumroad Link: ${gumroadLink}\n`;

    const userPrompt = `Please review this project submission based on the provided metadata:

Title: ${title}
Description: ${description}
Project Type: ${projectType}
${linksText}${deadline ? `\nDeadline: ${deadline}` : ''}
Current Date: ${new Date().toISOString().split('T')[0]}

Evaluate this project based on:
1. Is the title specific and descriptive?
2. Is the description detailed and professional?
3. Does the project type match the description?
4. Does this appear to be a complete, quality project worth $10?
${deadline ? '5. Is the current date before or after the deadline? If after deadline, this may affect approval.' : ''}

Note: You cannot access the actual files, so base your evaluation on the metadata quality and professionalism.`;

    console.log('📤 Sending request to OpenAI...');
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      console.error('❌ No response from OpenAI');
      return { result: null, error: 'No response from OpenAI' };
    }

    console.log('📥 OpenAI response received:', response);

    try {
      // Extract JSON from the response (handle cases where AI adds explanatory text)
      let jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('❌ No JSON found in response');
        return { result: null, error: 'No JSON found in OpenAI response' };
      }
      
      const jsonString = jsonMatch[0];
      console.log('🔍 Extracted JSON:', jsonString);
      
      const result = JSON.parse(jsonString) as VerificationResult;
      console.log('✅ Parsed verification result:', result);
      return { result, error: null };
    } catch (parseError) {
      console.error('❌ Failed to parse OpenAI response:', parseError);
      console.error('Raw response:', response);
      return { result: null, error: 'Failed to parse OpenAI response' };
    }
  } catch (error: any) {
    console.error('❌ OpenAI API error:', error);
    return { result: null, error: error.message };
  }
}; 