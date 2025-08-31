import React, { useState, useCallback, useEffect } from 'react';
import { ChatMessage, ChatbotContext, QuickAction } from './chatbot.types';
import { ChatbotMessages } from './ChatbotMessages';
import { ChatbotInput } from './ChatbotInput';
import { QuickActions } from './QuickActions';

interface ChatbotSidebarProps {
  context?: ChatbotContext;
}

export const ChatbotSidebar: React.FC<ChatbotSidebarProps> = ({ context }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isQuickActionsCollapsed, setIsQuickActionsCollapsed] = useState(false);

  // Handle mode change notifications
  useEffect(() => {
    if (context?.modeChangeNotification) {
      const notification = context.modeChangeNotification;
      const newMessage: ChatMessage = {
        id: `mode-change-${Date.now()}`,
        content: notification.message,
        sender: 'assistant',
        timestamp: new Date(),
        type: 'mode-notification'
      };

      setMessages(prev => [...prev, newMessage]);

      // Clear the notification after processing (optional - depends on how you want to handle this)
      // You might want to clear this in the parent component instead
    }
  }, [context?.modeChangeNotification]);

  // Sample quick actions based on current context
  const getQuickActions = useCallback((): QuickAction[] => {
    const baseActions: QuickAction[] = [
      {
        id: 'implementation-modes',
        label: 'Choose Implementation Mode',
        message: 'What are the differences between Real-time Web, Real-time B2B, and EDI Batch modes?',
        icon: '🔄'
      },
      {
        id: 'isa-fields',
        label: 'ISA Field Explanations',
        message: 'Can you explain ISA segments and their purpose in X12 transactions?',
        icon: '📋'
      },
      {
        id: 'payer-info',
        label: 'Payer Name & ID Help',
        message: 'Help me understand payer name and payer ID requirements',
        icon: '🏢'
      },
      {
        id: 'character-sets',
        label: 'Character Set Options',
        message: 'Explain the character set and formatting requirements',
        icon: '🔤'
      },
      {
        id: 'best-practices',
        label: 'Best Practices',
        message: 'What are the recommended settings for a typical payer implementation?',
        icon: '⭐'
      }
    ];

    // Add context-specific actions
    if (context?.currentSection) {
      const sectionName = context.currentSection.toLowerCase();
      // Skip adding generic help for organization sections
      if (!sectionName.includes('organization')) {
        baseActions.unshift({
          id: 'current-section',
          label: `Help with ${context.currentSection}`,
          message: `I need help with the ${context.currentSection} section. Can you explain what this section is about and what I need to fill out?`,
          icon: '❓'
        });
      }

      // Add section-specific quick actions
      if (sectionName.includes('enveloping')) {
        baseActions.splice(1, 0, {
          id: 'enveloping-help',
          label: 'ISA/GS Fields',
          message: 'Explain the ISA and GS segment fields in the enveloping requirements',
          icon: '📋'
        });
      } else if (sectionName.includes('contact')) {
        baseActions.splice(1, 0, {
          id: 'contact-help',
          label: 'Contact Requirements',
          message: 'What contact information do I need to provide?',
          icon: '👥'
        });
      }
    }

    return baseActions;
  }, [context]);

  const handleSendMessage = async (messageContent: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: messageContent,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Add typing indicator
    const typingMessage: ChatMessage = {
      id: 'typing',
      sender: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true
    };

    setMessages(prev => [...prev, typingMessage]);

    try {
      // Simulate AI response (replace with actual API call later)
      await new Promise(resolve => setTimeout(resolve, 1500));

      const aiResponse = generateSampleResponse(messageContent, context);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      // Remove typing indicator and add real response
      setMessages(prev => prev.filter(msg => msg.id !== 'typing').concat(aiMessage));
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove typing indicator and show error
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    handleSendMessage(action.message);
  };

  return (
    <div className="w-80 h-screen sticky top-0 bg-white border-r border-gray-200 flex flex-col shadow-soft">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-availity-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-availity-500 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Assistant</h3>
            <p className="text-sm text-gray-600">X12 270/271 Help</p>
          </div>
        </div>
        
        {context?.currentSection && (
          <div className="mt-3 px-3 py-2 bg-white rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500">Current Section</p>
            <p className="text-sm font-medium text-gray-800">{context.currentSection}</p>
            {context.implementationMode && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-availity-100 text-availity-800">
                  {context.implementationMode === 'real_time_web' && 'Real-time Web'}
                  {context.implementationMode === 'real_time_b2b' && 'Real-time B2B'}
                  {context.implementationMode === 'edi_batch' && 'EDI Batch'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions - Collapsible */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => setIsQuickActionsCollapsed(!isQuickActionsCollapsed)}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-200"
        >
          <span className="text-sm font-medium text-gray-700">Quick Help</span>
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isQuickActionsCollapsed ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {!isQuickActionsCollapsed && (
          <QuickActions actions={getQuickActions()} onActionClick={handleQuickAction} />
        )}
      </div>

      {/* Messages */}
      <ChatbotMessages messages={messages} />

      {/* Input */}
      <ChatbotInput onSendMessage={handleSendMessage} disabled={isLoading} />
    </div>
  );
};

// Sample response generator (replace with actual AI integration)
function generateSampleResponse(message: string, context?: ChatbotContext): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('isa05')) {
    return `**ISA05 - Sender ID Qualifier** identifies the type of organization sending the transaction.

**Common Values:**
• **01** - DUNS (Data Universal Numbering System)
• **ZZ** - Mutually Defined

**Recommendation:** For most healthcare payers, choose "01" with Availity's standard configuration. This is the most widely supported option.

**Example:** If you're a health plan, select "01" and let Availity define the sender ID value.`;
  }

  if (lowerMessage.includes('isa06')) {
    return `**ISA06 - Sender ID** is your organization's unique identifier in X12 transactions.

**Options:**
• **Availity Defined** - Recommended for most implementations
• **Custom Value** - Use if you have a specific organizational identifier

**Best Practice:** Unless you have regulatory requirements for a specific ID, use Availity's standard value (030240928) for seamless integration.`;
  }

  if (lowerMessage.includes('isa08')) {
    return `**ISA08 - Receiver ID** identifies who will receive your X12 transactions.

**For 270 Requests:** Usually "Availity defined" since Availity routes to appropriate payers
**For 271 Responses:** Typically your organization's ID

**Tip:** This field works with ISA07 (Receiver ID Qualifier) to uniquely identify the receiving party.`;
  }

  if (lowerMessage.includes('gs02') || lowerMessage.includes('gs03')) {
    return `**GS02/GS03 - Application Sender/Receiver Codes** identify applications within your organization.

**GS02 (Application Sender):**
• Use "030240928" for standard Availity integration
• Or define custom value if required by your system

**GS03 (Application Receiver):**
• "Availity defines" for outbound transactions
• "030240928" for inbound responses

**Note:** These codes help route transactions to the correct application within your organization.`;
  }

  if (lowerMessage.includes('payer name') || lowerMessage.includes('nm103')) {
    return `**2100A NM103 - Payer Name** is how your organization appears in eligibility transactions.

**Requirements:**
• Maximum 35 characters
• Should match your official business name
• Used by providers to identify your organization

**Example:** "ACME HEALTH INSURANCE COMPANY"

**Tip:** Use a clear, recognizable name that providers will easily identify.`;
  }

  if (lowerMessage.includes('payer id') || lowerMessage.includes('nm109')) {
    return `**2100A NM109 - Payer ID** is your unique identifier for eligibility transactions.

**Requirements:**
• Maximum 80 characters
• Must be unique across all payers
• Used by providers to route eligibility requests

**Best Practice:** Use your NAIC number, federal tax ID, or other standard healthcare identifier.

**Note:** This ID will be published in Availity's Health Plan Partners directory unless you opt out.`;
  }

  if (lowerMessage.includes('uppercase') || lowerMessage.includes('character')) {
    return `**Character Set Requirements** ensure your system can process X12 data correctly.

**Uppercase Characters:** Availity's standard is uppercase. Most systems accept this.

**Spaces:** Part of X12 basic character set. Required for proper field formatting.

**Extended Characters:** Special characters beyond basic ASCII. Only enable if your system supports them.

**Recommendation:** Accept Availity's standards unless you have specific system limitations.`;
  }

  if (lowerMessage.includes('xml wrapper') || lowerMessage.includes('envelope')) {
    return `**XML Wrapper** adds an XML envelope around your X12 transactions.

**When to Use:**
• Your system requires XML formatting
• You need additional metadata
• Integration with XML-based systems

**Standard Option:** Most implementations don't need XML wrapper - raw X12 format works fine.

**If Yes:** You'll need to provide XML envelope specifications as an attachment.`;
  }

  if ((lowerMessage.includes('implementation') && lowerMessage.includes('mode')) ||
      (lowerMessage.includes('differences') && lowerMessage.includes('real-time') && lowerMessage.includes('modes')) ||
      (lowerMessage.includes('choose') && lowerMessage.includes('implementation') && lowerMessage.includes('mode'))) {
    const currentMode = context?.implementationMode;
    const modeStatus = currentMode ? `\n**Current Selection:** ${
      currentMode === 'real_time_web' ? '🌐 Real-time Web' :
      currentMode === 'real_time_b2b' ? '🔗 Real-time B2B' :
      currentMode === 'edi_batch' ? '📦 EDI Batch' : currentMode
    }` : '';

    return `**Implementation Modes** - Choose the transaction type that best fits your organization:

**🌐 Real-time Web Transaction**
Physicians and other healthcare professionals submit patient eligibility inquiries via Availity Essentials. Availity then formats the data into a valid HIPAA 270 request and routes it to the payer. The payer returns valid HIPAA 271 responses to Availity.

**Complete:** Standard sections (Trading partner documentation through Response) + Real-time web implementation sections.

**🔗 Real-time B2B Transaction**
Physicians and other healthcare professionals submit patient eligibility inquiry requests to Availity. Availity then routes the valid HIPAA 270 transaction to the assigned receiver. The receiver returns valid HIPAA 271 responses to Availity.

**Complete:** Standard sections (Trading partner documentation through Response) + Real-time B2B implementation sections.

**📦 EDI Batch Transaction**
Physicians and other healthcare professionals submit patient eligibility inquiry requests to Availity in batches. Availity then routes the valid HIPAA 270 transactions to the assigned receiver. The receiver returns valid HIPAA 271 responses to Availity.

**Complete:** Standard sections (Trading partner documentation through Response) + EDI batch implementation sections.${modeStatus}

${context?.currentSection ? `\n**Current Section:** ${context.currentSection}` : ''}

${currentMode ? 'Need help with your selected mode?' : 'Which mode fits your organization\'s technical capabilities?'}`;
  }

  if (lowerMessage.includes('isa') || lowerMessage.includes('segment')) {
    return `**ISA Segments** are the foundation of X12 transactions - they're like the "envelope" for your data.

**Key ISA Fields:**
• **ISA05/ISA06:** Who's sending (Sender ID Qualifier/ID)
• **ISA07/ISA08:** Who's receiving (Receiver ID Qualifier/ID)
• **ISA11:** Repetition separator (usually ^)
• **ISA16:** Component separator (usually :)

**Think of it like:** Addressing an envelope - you need sender, receiver, and formatting rules.

**Pro Tip:** Use Availity's standard values unless you have specific regulatory requirements.

Need help with a specific ISA field?`;
  }

  if (lowerMessage.includes('enveloping') || lowerMessage.includes('envelope')) {
    return `**Enveloping Requirements** define how your X12 transactions are packaged and transmitted.

**Components:**
• **ISA Envelope:** Interchange control (sender/receiver info)
• **GS Envelope:** Functional group (application routing)
• **Character Sets:** How text is formatted
• **Separators:** How data fields are divided

**Purpose:** Ensures your transactions are properly formatted and routable through Availity's network.

${context?.currentSection ? `**Current Section:** ${context.currentSection}` : ''}

Which specific enveloping field do you need help with?`;
  }

  // Section-specific help
  if (lowerMessage.includes('organization information') || (context?.currentSection?.toLowerCase().includes('organization') && lowerMessage.includes('help'))) {
    return `**Organization Information** section collects basic details about your company.

**Required Fields:**
• **Organization Name:** Your official business name
• **Email:** Primary contact email for implementation
• **Phone:** Main business phone number
• **Address:** Business mailing address

**Tips:**
• Use your legal business name exactly as it appears on official documents
• Provide a monitored email address for important updates
• This information will be used for Availity's records and provider communications

${context?.currentSection ? `**Current Section:** ${context.currentSection}` : ''}

Need help with any specific organization field?`;
  }

  if (lowerMessage.includes('contact information') || (context?.currentSection?.toLowerCase().includes('contact') && lowerMessage.includes('help'))) {
    return `**Contact Information** section identifies key people for your implementation.

**Contact Types Required:**
• **Trading Partner Technical Contact:** Your IT/technical lead
• **Availity Technical Contact:** Availity's assigned technical resource
• **Account/Program Managers:** Business relationship contacts
• **Escalation Contacts:** For urgent issues
• **Additional Contacts:** Other relevant team members

**For Each Contact:**
• Name (required)
• Phone number (required)
• Email address (required)

**Purpose:** Ensures smooth communication during implementation and ongoing support.

${context?.currentSection ? `**Current Section:** ${context.currentSection}` : ''}

Which contact type do you need help with?`;
  }

  // Default helpful response with real context
  const contextInfo = context?.currentSection ?
    `\n**Current Context:**
• Section: ${context.currentSection}
${context.implementationMode ? `• Mode: ${context.implementationMode.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}` : ''}
${context.sectionDescription ? `• About: ${context.sectionDescription}` : ''}` : '';

  return `I'm here to help with your X12 270/271 questionnaire!

**I can explain:**
• ISA/GS segment fields and their purposes
• Implementation mode differences
• Enveloping requirements
• Character set and formatting options
• Best practices for your configuration${contextInfo}

**Try asking:**
• "What is ISA05?"
• "Help me choose implementation mode"
• "Explain enveloping requirements"
• "What are the character set options?"
${context?.currentSection ? `• "Help with ${context.currentSection}"` : ''}

What specific topic would you like help with?`;
}
