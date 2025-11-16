/**
 * AI-Powered X12 Code Lookup Service
 * 
 * This service is SEPARATE from the existing chatbot functionality.
 * It uses OpenAI to intelligently fetch and explain X12 codes from x12.org
 */

import OpenAI from 'openai';
import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';

// Initialize OpenAI client with SSL workaround for corporate networks
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  httpAgent: new https.Agent({
    rejectUnauthorized: false // Workaround for SSL certificate issues
  })
});

// Map of code types to their X12.org URLs
const CODE_LIST_URLS: Record<string, string> = {
  'claim-adjustment-group': 'https://x12.org/codes/claim-adjustment-group-codes',
  'claim-adjustment-reason': 'https://x12.org/codes/claim-adjustment-reason-codes',
  'claim-status-category': 'https://x12.org/codes/claim-status-category-codes',
  'claim-status': 'https://x12.org/codes/claim-status-codes',
  'error-reason': 'https://x12.org/codes/error-reason-codes',
  'industry-specific-remark': 'https://x12.org/codes/industry-specific-remark-codes',
  'insurance-business-process-error': 'https://x12.org/codes/insurance-business-process-application-error-codes',
  'insurance-descriptor': 'https://x12.org/codes/insurance-descriptor-codes',
  'payment-type': 'https://x12.org/codes/payment-type-codes',
  'provider-adjustment-reason': 'https://x12.org/codes/provider-adjustment-reason-codes',
  'provider-taxonomy': 'https://x12.org/codes/provider-taxonomy-codes',
  'remittance-advice-remark': 'https://x12.org/codes/remittance-advice-remark-codes',
  'report-type': 'https://x12.org/codes/report-type-codes',
  'service-review-decision-reason': 'https://x12.org/codes/service-review-decision-reason-codes',
  'service-type': 'https://x12.org/codes/service-type-codes',
  'service-type-descriptor': 'https://x12.org/codes/service-type-descriptor-codes'
};

/**
 * Fetch and parse X12 code page from x12.org
 * Extracts the actual code table data
 */
async function fetchX12CodePage(codeType: string): Promise<string> {
  const url = CODE_LIST_URLS[codeType];

  if (!url) {
    return `Code type "${codeType}" not found. Available types: ${Object.keys(CODE_LIST_URLS).join(', ')}`;
  }

  try {
    console.log(`[X12 Code Lookup] Fetching: ${url}`);

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; APOC-Bot/1.0)'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);

    // Extract code table data
    const codes: Array<{code: string, description: string}> = [];

    // Find all table rows with code data
    $('tr[class*="prod-set"]').each((index, element) => {
      const $row = $(element);
      const codeCell = $row.find('td[class="code"]');
      const descriptionCell = $row.find('td[class="description"]');

      const code = codeCell.text().trim();

      // Get the main description (first line before <br>)
      const descriptionHtml = descriptionCell.html() || '';
      const descriptionParts = descriptionHtml.split('<br>');
      const mainDescription = descriptionParts[0].replace(/<[^>]*>/g, '').trim();

      // Get the detailed description if available (in span with font-weight:normal)
      let detailedDescription = '';
      if (descriptionParts.length > 1) {
        const detailText = descriptionParts[1].replace(/<span[^>]*>/g, '').replace(/<\/span>/g, '').trim();
        detailedDescription = detailText;
      }

      if (code && mainDescription) {
        const fullDescription = detailedDescription
          ? `${mainDescription} - ${detailedDescription}`
          : mainDescription;
        codes.push({ code, description: fullDescription });
      }
    });

    // Format the codes as a structured list
    let formattedCodes = `X12 Code List: ${codeType}\n\n`;
    formattedCodes += `Total codes found: ${codes.length}\n\n`;
    formattedCodes += 'CODE | DESCRIPTION\n';
    formattedCodes += '------|-------------\n';

    codes.forEach(({ code, description }) => {
      formattedCodes += `${code} | ${description}\n`;
    });

    // Limit to avoid token limits (keep first 10000 chars to get more codes)
    const limitedText = formattedCodes.substring(0, 10000);

    console.log(`[X12 Code Lookup] Extracted ${codes.length} codes from ${url}`);

    return limitedText;
  } catch (error) {
    console.error('[X12 Code Lookup] Error fetching code page:', error);
    return `Unable to fetch code information from ${url}. Please try again later or visit the page directly.`;
  }
}

/**
 * Main AI-powered X12 code lookup function
 * Uses OpenAI function calling to intelligently fetch and explain codes
 */
export async function lookupX12Code(
  userQuery: string, 
  context?: string
): Promise<string> {
  
  try {
    console.log(`[X12 Code Lookup] Processing query: "${userQuery}"`);
    
    const tools: OpenAI.Chat.ChatCompletionTool[] = [
      {
        type: "function",
        function: {
          name: "fetch_x12_code_list",
          description: "Fetch X12 code information from x12.org. Use this when user asks about specific X12 codes like service type codes, claim status codes, etc.",
          parameters: {
            type: "object",
            properties: {
              code_type: {
                type: "string",
                description: "The type of X12 code list to fetch",
                enum: Object.keys(CODE_LIST_URLS)
              }
            },
            required: ["code_type"]
          }
        }
      }
    ];

    const systemPrompt = `You are an expert assistant for X12 270/271 EDI transactions helping users fill out an implementation questionnaire.

When users ask about X12 codes, use the fetch_x12_code_list function to get real-time information from x12.org.

Available code types:
${Object.keys(CODE_LIST_URLS).map(key => `- ${key}`).join('\n')}

Format your responses clearly with:
- Code value and description
- When/how to use it in the questionnaire context
- Related codes if relevant
- Always cite x12.org as the source with a clickable link

Context: ${context || 'User is filling out an X12 270/271 implementation questionnaire.'}`;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: userQuery
      }
    ];

    // First API call - let OpenAI decide if it needs to fetch codes
    let response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: messages,
      tools: tools,
      tool_choice: "auto",
      temperature: 0.3
    });

    const toolCalls = response.choices[0].message.tool_calls;

    if (toolCalls && toolCalls.length > 0) {
      // OpenAI wants to fetch code information
      const functionCall = toolCalls[0].function;
      const args = JSON.parse(functionCall.arguments);

      console.log(`[X12 Code Lookup] OpenAI requesting code type: ${args.code_type}`);

      // Fetch the code page content
      const codeContent = await fetchX12CodePage(args.code_type);

      // Add function result to conversation
      messages.push(response.choices[0].message);
      messages.push({
        role: "tool",
        tool_call_id: toolCalls[0].id,
        content: codeContent
      });

      // Second API call - get final formatted response
      response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: messages,
        temperature: 0.3
      });
    }

    const finalResponse = response.choices[0].message.content ||
      "I couldn't find information about that code. Please try rephrasing your question.";

    console.log(`[X12 Code Lookup] Response generated successfully`);

    return finalResponse;

  } catch (error) {
    console.error('[X12 Code Lookup] Error:', error);
    return "I'm having trouble looking up that code right now. Please try again later or visit https://x12.org/codes directly.";
  }
}

