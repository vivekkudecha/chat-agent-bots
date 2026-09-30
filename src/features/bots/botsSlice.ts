import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Bot, AttachedFile } from '@/types'

const initialOrgBots: Bot[] = [
  {
    id: 'bot-org-1',
    name: 'Customer Success Copilot',
    role: 'Enterprise SLA & Support Specialist',
    department: 'Customer Support',
    description:
      'Resolves complex customer inquiries, audits SLA breach tickets, and drafts empathetic executive resolution briefs.',
    systemInstruction:
      'You are a high-level Customer Success and Support Specialist for enterprise clients. Always provide polite, professional, and actionable resolutions.',
    avatar: 'Headphones',
    category: 'Enterprise',
    badge: 'Recommended',
    knowledgeFiles: [
      { id: 'f-1', name: 'enterprise_sla_guidelines_2026.pdf', size: 142000, type: 'application/pdf' },
      { id: 'f-2', name: 'tier3_escalation_matrix.json', size: 28000, type: 'application/json' },
    ],
    suggestedPrompts: [
      'Draft a high-priority SLA mitigation response for an outage',
      'Analyze customer churn risk for account ACME Corp',
      'Generate a Q3 customer satisfaction recap brief',
    ],
    isCustom: false,
    createdAt: '2026-01-15',
  },
  {
    id: 'bot-org-2',
    name: 'Cloud Architecture & Code Reviewer',
    role: 'Full-Stack Systems & Security Auditor',
    department: 'Engineering',
    description:
      'Analyzes microservice topologies, reviews pull requests, optimizes cloud latency, and enforces SOLID architecture.',
    systemInstruction:
      'You are a Principal Cloud Systems Architect. Provide idiomatic, clean, modular, and performant code recommendations.',
    avatar: 'Code2',
    category: 'Engineering',
    badge: 'Popular',
    knowledgeFiles: [
      { id: 'f-3', name: 'cloud_infra_security_standards.pdf', size: 310000, type: 'application/pdf' },
    ],
    suggestedPrompts: [
      'Review my Redux store architecture for race conditions',
      'Design an event-driven ingestion pipeline with retry DLQs',
      'Audit this Dockerfile for minimal attack surface',
    ],
    isCustom: false,
    createdAt: '2026-02-01',
  },
  {
    id: 'bot-org-3',
    name: 'Data Intelligence & Analytics Guru',
    role: 'BigQuery, SQL & BI Analytics Lead',
    department: 'Data & Analytics',
    description:
      'Transforms raw telemetry into executive KPI dashboards, constructs performant BigQuery models, and detects trends.',
    systemInstruction:
      'You are an expert Data Engineer and Analytics Specialist. Focus on query optimization, partition pruning, and executive data storytelling.',
    avatar: 'BarChart3',
    category: 'Operations',
    badge: 'Enterprise',
    knowledgeFiles: [
      { id: 'f-4', name: 'telemetry_data_dictionary.csv', size: 89000, type: 'text/csv' },
    ],
    suggestedPrompts: [
      'Write an optimized BigQuery SQL query to track monthly active churn',
      'Explain window functions for cohort retention',
      'Suggest schema partitioning for 10TB/day log streams',
    ],
    isCustom: false,
    createdAt: '2026-02-10',
  },
  {
    id: 'bot-org-4',
    name: 'Legal & Compliance Navigator',
    role: 'Contract Review & Regulatory Counsel',
    department: 'Legal & Compliance',
    description:
      'Screens Master Service Agreements, identifies non-standard indemnification clauses, and verifies GDPR/SOC2 adherence.',
    systemInstruction:
      'You are an Enterprise Legal and Compliance Specialist. Highlight potential contractual risks with precise clause references.',
    avatar: 'Scale',
    category: 'Finance & Legal',
    badge: 'Verified',
    knowledgeFiles: [
      { id: 'f-5', name: 'soc2_security_policies_v4.pdf', size: 520000, type: 'application/pdf' },
    ],
    suggestedPrompts: [
      'Highlight liability risks in a standard SaaS agreement',
      'Verify whether customer data storage violates GDPR transfer regulations',
      'Generate a standardized NDA agreement checklist',
    ],
    isCustom: false,
    createdAt: '2026-03-01',
  },
  {
    id: 'bot-org-5',
    name: 'Product Strategy & PRD Copilot',
    role: 'Principal Product Manager',
    department: 'Product Management',
    description:
      'Drafts crisp Product Requirement Documents (PRDs), writes acceptance criteria, and constructs roadmap prioritization matrices.',
    systemInstruction:
      'You are a seasoned Principal Product Manager. Structure requirements with user problem statements, non-functional requirements, and success metrics.',
    avatar: 'Layers',
    category: 'Enterprise',
    suggestedPrompts: [
      'Draft a PRD for an AI chat conversational bot builder',
      'Create user stories with Gherkin acceptance criteria for file upload',
      'Build a RICE prioritization score for 5 pending features',
    ],
    isCustom: false,
    createdAt: '2026-03-12',
  },
]

interface BotsState {
  organizationBots: Bot[]
  customBots: Bot[]
  selectedBotId: string | null
  activeCategory: string
  searchQuery: string
}

const initialState: BotsState = {
  organizationBots: initialOrgBots,
  customBots: [
    {
      id: 'bot-custom-1',
      name: 'Internal TataTel FAQ Helper',
      role: 'Company Policies & IT Helpdesk',
      department: 'IT & HR',
      description: 'Custom trained bot on company IT handbook and internal knowledge base.',
      systemInstruction: 'Answer queries accurately based only on the uploaded IT handbook.',
      avatar: 'Cpu',
      category: 'Custom',
      badge: 'Custom Bot',
      knowledgeFiles: [
        { id: 'f-custom-1', name: 'tatatel_employee_handbook.pdf', size: 215000, type: 'application/pdf' },
      ],
      suggestedPrompts: [
        'What is the VPN setup procedure for new employees?',
        'How do I request hardware upgrade budget approval?',
      ],
      isCustom: true,
      createdAt: '2026-03-25',
    },
  ],
  selectedBotId: null,
  activeCategory: 'All',
  searchQuery: '',
}

export const botsSlice = createSlice({
  name: 'bots',
  initialState,
  reducers: {
    createCustomBot: (
      state,
      action: PayloadAction<{
        name: string
        role: string
        description: string
        systemInstruction: string
        avatar?: string
        files?: AttachedFile[]
      }>
    ) => {
      const newBot: Bot = {
        id: `bot-custom-${Date.now()}`,
        name: action.payload.name,
        role: action.payload.role || 'Custom Specialist',
        description: action.payload.description || 'Custom tailored AI Assistant',
        systemInstruction: action.payload.systemInstruction,
        avatar: action.payload.avatar || action.payload.name.slice(0, 2).toUpperCase(),
        category: 'Custom',
        badge: 'Custom Bot',
        knowledgeFiles: action.payload.files || [],
        suggestedPrompts: [
          `Summarize what knowledge you have in your files`,
          `Help me with a task based on your instructions`,
        ],
        isCustom: true,
        createdAt: new Date().toISOString().split('T')[0],
      }
      state.customBots.unshift(newBot)
      state.selectedBotId = newBot.id
    },
    deleteCustomBot: (state, action: PayloadAction<string>) => {
      state.customBots = state.customBots.filter((bot) => bot.id !== action.payload)
      if (state.selectedBotId === action.payload) {
        state.selectedBotId = null
      }
    },
    setSelectedBot: (state, action: PayloadAction<string | null>) => {
      state.selectedBotId = action.payload
    },
    setActiveCategory: (state, action: PayloadAction<string>) => {
      state.activeCategory = action.payload
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
  },
})

export const {
  createCustomBot,
  deleteCustomBot,
  setSelectedBot,
  setActiveCategory,
  setSearchQuery,
} = botsSlice.actions

export default botsSlice.reducer
